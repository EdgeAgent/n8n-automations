from fastapi.testclient import TestClient

from jarvis_agent.app import app


client = TestClient(app)


def test_health_contract() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
    assert response.json()["offlineMode"] is True


def test_chat_contract() -> None:
    response = client.post(
        "/chat",
        json={
            "sessionId": "http-test-session",
            "chatInput": "Build an ethical outreach plan for my automation agency.",
            "source": "telegram",
            "reply_mode": "voice",
        },
    )
    body = response.json()
    assert response.status_code == 200
    assert body["department"] == "growth"
    assert body["voiceResponse"]
    assert body["needsConfirmation"] is False
    assert body["actionProposals"] == []
