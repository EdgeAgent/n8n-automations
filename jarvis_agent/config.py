"""Environment-driven settings for JARVIS."""

from __future__ import annotations

import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    """Runtime settings. Keep all secrets in the environment, never in Git."""

    model: str
    api_key: str | None
    api_base: str | None
    offline_mode: bool
    webhook_shared_secret: str | None
    service_name: str

    @classmethod
    def from_environment(cls) -> "Settings":
        offline_flag = os.getenv("JARVIS_OFFLINE_MODE", "false").strip().lower()
        return cls(
            model=os.getenv("JARVIS_MODEL", "gpt-5-mini"),
            api_key=os.getenv("OPENAI_API_KEY"),
            api_base=os.getenv("OPENAI_API_BASE"),
            offline_mode=offline_flag in {"1", "true", "yes"},
            webhook_shared_secret=os.getenv("JARVIS_WEBHOOK_SHARED_SECRET"),
            service_name=os.getenv("JARVIS_SERVICE_NAME", "JARVIS"),
        )


settings = Settings.from_environment()
