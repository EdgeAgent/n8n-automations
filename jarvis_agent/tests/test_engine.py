from jarvis_agent.config import Settings
from jarvis_agent.engine import JARVIS
from jarvis_agent.models import ChatRequest, Department


def offline_jarvis() -> JARVIS:
    return JARVIS(
        Settings(
            model="test-model",
            api_key=None,
            api_base=None,
            offline_mode=True,
            webhook_shared_secret="test-secret",
            service_name="JARVIS",
        )
    )


def test_routes_automation_to_operations() -> None:
    response = offline_jarvis().handle(
        ChatRequest(sessionId="session-1", chatInput="Help me design an n8n Telegram automation.")
    )
    assert response.department is Department.OPERATIONS
    assert response.needs_confirmation is False
    assert response.action_proposals == []
    assert "offline mode" in response.response_text.lower()


def test_routes_calendar_request_to_workspace() -> None:
    response = offline_jarvis().handle(
        ChatRequest(sessionId="session-2", chatInput="Draft an email and calendar agenda for tomorrow.")
    )
    assert response.department is Department.WORKSPACE
    assert response.voice_response


def test_routes_memory_request_to_memory_department() -> None:
    response = offline_jarvis().handle(
        ChatRequest(sessionId="session-3", chatInput="Remember that I prefer short answers.")
    )
    assert response.department is Department.MEMORY


def test_routes_lead_strategy_to_growth_department() -> None:
    response = offline_jarvis().handle(
        ChatRequest(sessionId="session-4", chatInput="Build an ethical prospecting plan for my automation agency.")
    )
    assert response.department is Department.GROWTH
    assert "lead strategist" in response.response_text.lower()


def test_routes_news_brief_to_research_department() -> None:
    response = offline_jarvis().handle(
        ChatRequest(sessionId="session-5", chatInput="Give me a current news brief from this YouTube channel.")
    )
    assert response.department is Department.RESEARCH
    assert "news monitor" in response.response_text.lower()
