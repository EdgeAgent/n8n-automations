"""JARVIS multi-agent orchestration engine.

This module deliberately separates reasoning from side effects. It can propose an
n8n/MCP action, but it never sends messages, alters calendars, or invokes external
workflows itself. The caller must enforce confirmation before executing proposals.
"""

from __future__ import annotations

import json
from typing import TypeVar

from openai import OpenAI
from pydantic import BaseModel

from .config import Settings, settings
from .models import (
    ActionProposal,
    AgentResult,
    ChatRequest,
    ChatResponse,
    Department,
    DelegatedTask,
    RouteDecision,
    TaskRisk,
)
from .prompts import JARVIS_IDENTITY, ROUTER_PROMPT, SUBAGENT_PROMPTS, manager_prompt, valid_subagents


ModelT = TypeVar("ModelT", bound=BaseModel)


class JARVIS:
    """Routes a request, calls bounded specialists, then lets a manager synthesize it."""

    def __init__(self, runtime_settings: Settings = settings) -> None:
        self.settings = runtime_settings
        self.client: OpenAI | None = None
        if not self.settings.offline_mode:
            if not self.settings.api_key:
                raise RuntimeError(
                    "OPENAI_API_KEY is required unless JARVIS_OFFLINE_MODE=true. "
                    "Keep keys in the host environment, never in source code."
                )
            self.client = OpenAI(
                api_key=self.settings.api_key,
                base_url=self.settings.api_base,
            )

    def handle(self, request: ChatRequest) -> ChatResponse:
        route = self._route(request)
        if route.needs_clarification:
            question = route.clarification_question or "What outcome would you like me to focus on?"
            return ChatResponse(
                session_id=request.session_id,
                department=route.department,
                route_rationale=route.rationale,
                response_text=question,
                voice_response=question,
                action_proposals=[],
                needs_confirmation=False,
                needs_clarification=True,
                follow_up_question=question,
            )

        subagent_notes = self._run_subagents(route, request)
        result = self._run_manager(route, request, subagent_notes)
        proposals = self._normalize_proposals(result.action_proposals)
        return ChatResponse(
            session_id=request.session_id,
            department=route.department,
            route_rationale=route.rationale,
            response_text=result.user_response,
            voice_response=result.voice_response,
            action_proposals=proposals,
            needs_confirmation=any(item.requires_confirmation for item in proposals),
            needs_clarification=bool(result.follow_up_question),
            follow_up_question=result.follow_up_question,
        )

    def _route(self, request: ChatRequest) -> RouteDecision:
        if self.settings.offline_mode:
            return self._offline_route(request.chat_input)
        content = self._request_context(request)
        return self._structured_completion(RouteDecision, ROUTER_PROMPT, content)

    def _run_subagents(self, route: RouteDecision, request: ChatRequest) -> list[dict[str, str]]:
        notes: list[dict[str, str]] = []
        allowed = valid_subagents(route.department)
        for task in route.tasks[:4]:
            if task.subagent not in allowed:
                notes.append(
                    {
                        "subagent": task.subagent,
                        "result": "Task was rejected because the requested sub-agent is outside this department.",
                    }
                )
                continue
            if self.settings.offline_mode:
                notes.append({"subagent": task.subagent, "result": self._offline_subagent_note(task)})
                continue
            prompt = (
                f"{JARVIS_IDENTITY}\n\n"
                f"You are the {task.subagent} sub-agent.\n"
                f"{SUBAGENT_PROMPTS[task.subagent]}\n\n"
                "Complete only the bounded task below. Do not claim external actions ran. "
                "Return concise plain text for your department manager.\n\n"
                f"Objective: {task.objective}\n"
                f"Required context: {', '.join(task.required_context) or 'none'}\n"
                f"User request: {request.chat_input}"
            )
            notes.append({"subagent": task.subagent, "result": self._text_completion(prompt)})
        return notes

    def _run_manager(
        self,
        route: RouteDecision,
        request: ChatRequest,
        subagent_notes: list[dict[str, str]],
    ) -> AgentResult:
        if self.settings.offline_mode:
            return self._offline_manager_result(route, request, subagent_notes)
        context = {
            "user_request": request.chat_input,
            "reply_mode": request.reply_mode,
            "history": [message.model_dump() for message in request.history],
            "route": route.model_dump(),
            "subagent_notes": subagent_notes,
        }
        instruction = (
            f"{manager_prompt(route.department)}\n\n"
            "Return only JSON matching the supplied schema. The user_response may use Markdown "
            "because it is text. The voice_response must be natural speech with no Markdown. "
            "Do not include an external-write action unless it has requires_confirmation=true. "
            "If an action cannot be executed by the current data, explain it instead of claiming success.\n\n"
            f"Context:\n{json.dumps(context, ensure_ascii=False)}"
        )
        return self._structured_completion(AgentResult, instruction, "Synthesize the manager response now.")

    def _structured_completion(self, model_type: type[ModelT], system_prompt: str, user_prompt: str) -> ModelT:
        if self.client is None:
            raise RuntimeError("The LLM client is unavailable in online mode.")
        schema = model_type.model_json_schema()
        response = self.client.chat.completions.create(
            model=self.settings.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={
                "type": "json_schema",
                "json_schema": {
                    "name": model_type.__name__.lower(),
                    "strict": True,
                    "schema": schema,
                },
            },
        )
        content = response.choices[0].message.content
        if not content:
            raise RuntimeError("The model returned no structured output.")
        return model_type.model_validate_json(content)

    def _text_completion(self, prompt: str) -> str:
        if self.client is None:
            raise RuntimeError("The LLM client is unavailable in online mode.")
        response = self.client.chat.completions.create(
            model=self.settings.model,
            messages=[{"role": "system", "content": prompt}],
        )
        return response.choices[0].message.content or "No specialist note was returned."

    @staticmethod
    def _request_context(request: ChatRequest) -> str:
        return json.dumps(
            {
                "session_id": request.session_id,
                "source": request.source,
                "reply_mode": request.reply_mode,
                "chat_input": request.chat_input,
                "image_url": request.image_url,
                "history": [message.model_dump() for message in request.history],
            },
            ensure_ascii=False,
        )

    @staticmethod
    def _normalize_proposals(proposals: list[ActionProposal]) -> list[ActionProposal]:
        safe: list[ActionProposal] = []
        for proposal in proposals:
            if proposal.kind == "none":
                continue
            if proposal.risk in {TaskRisk.EXTERNAL_WRITE, TaskRisk.SENSITIVE}:
                proposal.requires_confirmation = True
            safe.append(proposal)
        return safe

    @staticmethod
    def _offline_route(text: str) -> RouteDecision:
        lower = text.lower()
        if any(word in lower for word in ("lead", "prospect", "outreach", "pipeline", "discovery call", "sales", "agency", "client")):
            department = Department.GROWTH
            task = DelegatedTask(subagent="lead_strategist", objective="Define an ethical growth strategy and qualification criteria.")
        elif any(word in lower for word in ("news", "youtube channel", "headlines", "current events")):
            department = Department.RESEARCH
            task = DelegatedTask(subagent="news_monitor", objective="Define the news-monitoring scope, time window, and evidence needed.")
        elif any(word in lower for word in ("research", "compare", "find", "fact", "analyze")):
            department = Department.RESEARCH
            task = DelegatedTask(subagent="researcher", objective="Define the research scope and evidence needed.")
        elif any(word in lower for word in ("email", "calendar", "document", "file", "write a message")):
            department = Department.WORKSPACE
            task = DelegatedTask(subagent="communications_specialist", objective="Prepare a safe draft response.", risk=TaskRisk.DRAFT)
        elif any(word in lower for word in ("n8n", "workflow", "automation", "telegram", "integrat", "deploy")):
            department = Department.OPERATIONS
            task = DelegatedTask(subagent="automation_engineer", objective="Define the required automation design.")
        elif any(word in lower for word in ("remember", "memory", "preference", "history")):
            department = Department.MEMORY
            task = DelegatedTask(subagent="memory_retriever", objective="Identify relevant context to retrieve.")
        else:
            department = Department.EXECUTIVE
            task = DelegatedTask(subagent="planner", objective="Frame the request as a practical next-step plan.")
        return RouteDecision(
            department=department,
            rationale="Offline keyword routing selected the closest department.",
            needs_memory=False,
            tasks=[task],
        )

    @staticmethod
    def _offline_subagent_note(task: DelegatedTask) -> str:
        return (
            f"Offline mode: {task.subagent} received the objective '{task.objective}'. "
            "Enable an LLM provider for a generated specialist analysis."
        )

    @staticmethod
    def _offline_manager_result(
        route: RouteDecision,
        request: ChatRequest,
        subagent_notes: list[dict[str, str]],
    ) -> AgentResult:
        manager_label = route.department.value.replace("_", " ").title()
        response = (
            f"I’ve sent this to the {manager_label} department. "
            "The local JARVIS service is running in offline mode, so I can map the work "
            "and keep it ready for execution once an LLM is connected."
        )
        if subagent_notes:
            response += f" The assigned specialist is {subagent_notes[0]['subagent'].replace('_', ' ')}."
        return AgentResult(
            summary=response,
            user_response=response,
            voice_response=response,
            key_facts=["No external action was taken."],
            action_proposals=[],
        )
