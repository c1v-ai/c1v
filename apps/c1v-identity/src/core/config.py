"""
Application configuration using Pydantic Settings.
"""
from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App
    app_name: str = "id.c1v.ai"
    app_version: str = "1.0.0"
    debug: bool = False

    # Database
    database_url: str = "postgresql://localhost:5432/c1v_identity"

    # Auth
    api_key_header: str = "Authorization"
    agent_id_header: str = "X-Agent-ID"

    # Rate Limiting
    rate_limit_enabled: bool = True
    rate_limit_requests: int = 100
    rate_limit_window: int = 60  # seconds

    # PIN settings
    pin_ttl_seconds: int = 60
    pin_signing_key: str = Field(
        default="dev-pin-signing-key-change-in-production",
        description="Secret key for HMAC-SHA256 PIN signing (minimum 32 bytes)",
    )

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "extra": "ignore",  # Ignore extra environment variables
    }


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
