"""FastAPI entry point for the JARVIS service."""

from __future__ import annotations

from fastapi import FastAPI, Header, HTTPException, status

from .config import settings
from .engine import JARVIS
from .models import ChatRequest, ChatResponse, HealthResponse

app = FastAPI(
    title="JARVIS Department Agent Service",
    version="0.1.0",
    description="A guarded router for JARVIS, department managers, and sub-agents.",
)
jarvis = JARVIS()


def _validate_shared_secret(value: str | None) -> None:
    """Reject unauthenticated inbound requests when a secret is configured."""
    expected = settings.webhook_shared_secret
    if expected and value != expected:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid JARVIS webhook credential.",
        )


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(status="ok", model=settings.model, offline_mode=settings.offline_mode)


@app.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    x_jarvis_key: str | None = Header(default=None),
) -> ChatResponse:
    """Process one conversation turn; no external action is executed here."""
    _validate_shared_secret(x_jarvis_key)
    try:
        return jarvis.handle(request)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc)) from exc
