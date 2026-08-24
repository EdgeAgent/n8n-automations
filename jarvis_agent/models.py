"""Data contracts for the JARVIS orchestration service."""

from __future__ import annotations

from enum import Enum
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field


class StrictModel(BaseModel):
    """Shared model behavior for reliable strict LLM JSON schemas."""

    model_config = ConfigDict(extra="forbid")


class Department(str, Enum):
    """The manager-level departments JARVIS can delegate to."""

    EXECUTIVE = "executive"
    RESEARCH = "research"
    WORKSPACE = "workspace"
    OPERATIONS = "operations"
    MEMORY = "memory"
    GROWTH = "growth"


class TaskRisk(str, Enum):
    """Action risk determines whether an action must wait for confirmation."""

    READ_ONLY = "read_only"
    DRAFT = "draft"
    EXTERNAL_WRITE = "external_write"
    SENSITIVE = "sensitive"


class Message(StrictModel):
    role: Literal["user", "assistant"]
    content: str = Field(min_length=1, max_length=12_000)


class ChatRequest(StrictModel):
    """Payload accepted from n8n or another client."""

    session_id: str = Field(min_length=1, max_length=200, alias="sessionId")
    chat_input: str = Field(min_length=1, max_length=12_000, alias="chatInput")
    image_url: str | None = Field(default=None, max_length=2_000)
    source: Literal["telegram", "web", "n8n", "api"] = "n8n"
    reply_mode: Literal["text", "voice", "both"] = "text"
    history: list[Message] = Field(default_factory=list, max_length=20)

    model_config = ConfigDict(populate_by_name=True, extra="forbid")


class DelegatedTask(StrictModel):
    """A manager assigns one bounded task to a sub-agent."""

    subagent: str
    objective: str
    required_context: list[str] = Field(default_factory=list)
    risk: TaskRisk = TaskRisk.READ_ONLY
    requires_confirmation: bool = False


class RouteDecision(StrictModel):
    """Strict router output produced before any department work begins."""

    department: Department
    rationale: str
    needs_memory: bool = False
    needs_clarification: bool = False
    clarification_question: str | None = None
    tasks: list[DelegatedTask] = Field(default_factory=list, max_length=4)


class ActionProposal(StrictModel):
    """A proposed integration action; it is never executed by this service."""

    kind: Literal["n8n_webhook", "mcp_tool", "none"]
    target: str
    payload: dict[str, Any] = Field(default_factory=dict)
    risk: TaskRisk = TaskRisk.READ_ONLY
    requires_confirmation: bool = True
    explanation: str


class AgentResult(StrictModel):
    """Result returned by a department manager or sub-agent."""

    summary: str
    voice_response: str
    user_response: str
    key_facts: list[str] = Field(default_factory=list, max_length=8)
    action_proposals: list[ActionProposal] = Field(default_factory=list, max_length=5)
    follow_up_question: str | None = None


class ChatResponse(StrictModel):
    """Normalized response for n8n, Telegram, and voice synthesis."""

    session_id: str = Field(alias="sessionId")
    department: Department
    route_rationale: str
    response_text: str = Field(alias="responseText")
    voice_response: str = Field(alias="voiceResponse")
    action_proposals: list[ActionProposal] = Field(default_factory=list, alias="actionProposals")
    needs_confirmation: bool = Field(alias="needsConfirmation")
    needs_clarification: bool = Field(alias="needsClarification")
    follow_up_question: str | None = Field(default=None, alias="followUpQuestion")

    model_config = ConfigDict(populate_by_name=True, extra="forbid")


class HealthResponse(StrictModel):
    status: Literal["ok"]
    model: str
    offline_mode: bool = Field(alias="offlineMode")

    model_config = ConfigDict(populate_by_name=True, extra="forbid")
