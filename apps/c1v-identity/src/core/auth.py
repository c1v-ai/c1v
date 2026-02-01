"""
API Key authentication middleware for the consent protocol.
"""
from fastapi import HTTPException, Security, Depends
from fastapi.security import APIKeyHeader
from sqlalchemy.orm import Session
from typing import Optional
import hashlib
from datetime import datetime, timezone

from .config import get_settings
from .database import get_db

settings = get_settings()

# API Key header
api_key_header = APIKeyHeader(name="Authorization", auto_error=False)
agent_id_header = APIKeyHeader(name="X-Agent-ID", auto_error=False)


class AuthenticatedAgent:
    """Represents an authenticated agent."""

    def __init__(
        self,
        agent_id: str,
        api_key_id: str,
        scopes: list[str],
        organization_id: Optional[str] = None,
    ):
        self.agent_id = agent_id
        self.api_key_id = api_key_id
        self.scopes = scopes
        self.organization_id = organization_id


def hash_api_key(key: str) -> str:
    """Hash an API key for storage/comparison."""
    return hashlib.sha256(key.encode()).hexdigest()


def parse_bearer_token(auth_header: Optional[str]) -> Optional[str]:
    """Extract token from Bearer header."""
    if not auth_header:
        return None
    if auth_header.startswith("Bearer "):
        return auth_header[7:]
    return auth_header


async def get_current_agent(
    auth_header: Optional[str] = Security(api_key_header),
    agent_id: Optional[str] = Security(agent_id_header),
    db: Session = Depends(get_db),
) -> AuthenticatedAgent:
    """
    Validate API key and return authenticated agent.

    Raises HTTPException 401 if authentication fails.
    """
    # Extract token
    token = parse_bearer_token(auth_header)
    if not token:
        raise HTTPException(
            status_code=401,
            detail={
                "error": {
                    "code": "MISSING_API_KEY",
                    "message": "Authorization header required",
                }
            },
        )

    if not agent_id:
        raise HTTPException(
            status_code=401,
            detail={
                "error": {
                    "code": "MISSING_AGENT_ID",
                    "message": "X-Agent-ID header required",
                }
            },
        )

    # Hash the provided key for comparison
    key_hash = hash_api_key(token)

    # Look up the API key in database
    # NOTE: This will be replaced with actual database query
    # For now, allow a test key for development
    if settings.debug and token == "c1v_test_key":
        return AuthenticatedAgent(
            agent_id=agent_id,
            api_key_id="test_key",
            scopes=["*"],
            organization_id="test_org",
        )

    # TODO: Implement actual database lookup
    # query = db.query(ApiKey).filter(
    #     ApiKey.key_hash == key_hash,
    #     ApiKey.is_active == True,
    #     (ApiKey.expires_at == None) | (ApiKey.expires_at > datetime.now(timezone.utc))
    # ).first()

    raise HTTPException(
        status_code=401,
        detail={
            "error": {
                "code": "INVALID_API_KEY",
                "message": "Invalid or expired API key",
            }
        },
    )


def require_scope(required_scope: str):
    """
    Dependency factory to check if agent has required scope.

    Usage:
        @app.get("/endpoint")
        async def endpoint(agent: AuthenticatedAgent = Depends(require_scope("contracts:read"))):
            ...
    """

    async def check_scope(
        agent: AuthenticatedAgent = Depends(get_current_agent),
    ) -> AuthenticatedAgent:
        if "*" in agent.scopes:
            return agent
        if required_scope not in agent.scopes:
            raise HTTPException(
                status_code=403,
                detail={
                    "error": {
                        "code": "INSUFFICIENT_SCOPE",
                        "message": f"Required scope: {required_scope}",
                    }
                },
            )
        return agent

    return check_scope
