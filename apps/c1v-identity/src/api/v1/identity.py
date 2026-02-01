"""
Identity resolution endpoints.

Provides:
- POST /resolve - Resolve identity from partial data
- POST /match - Match two identity records
- GET /golden/{uid} - Retrieve golden record by UID

Note: These endpoints are mounted at /api/v1/identity by the v1 router,
so full paths are /api/v1/identity/resolve, /api/v1/identity/match, etc.
"""
from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session

from src.core.auth import get_current_agent, AuthenticatedAgent
from src.core.database import get_db
from src.services.identity_service import IdentityService
from src.schemas.identity import (
    ResolveRequest,
    ResolveResponse,
    MatchRequest,
    MatchResponse,
    GoldenRecord,
)

router = APIRouter()


def get_identity_service(db: Session = Depends(get_db)) -> IdentityService:
    """Dependency injection for IdentityService."""
    return IdentityService(db)


@router.post(
    "/resolve",
    response_model=ResolveResponse,
    summary="Resolve identity from partial data",
    description="""
    Resolve an identity from partial data (email, phone, name).

    If a matching golden record exists, returns it.
    If no match and `create_if_missing=true` (default), creates a new golden record.
    If no match and `create_if_missing=false`, returns 404.

    At least one identity field (email, phone, or name) must be provided.
    """,
    responses={
        200: {"description": "Identity resolved successfully"},
        400: {"description": "Missing identity data"},
        401: {"description": "Authentication failed"},
        404: {"description": "No matching record found (when create_if_missing=false)"},
    },
)
async def resolve_identity(
    request: ResolveRequest,
    agent: AuthenticatedAgent = Depends(get_current_agent),
    service: IdentityService = Depends(get_identity_service),
) -> ResolveResponse:
    """Resolve identity from partial data, optionally creating golden record."""
    return service.resolve(request.data, request.create_if_missing)


@router.post(
    "/match",
    response_model=MatchResponse,
    summary="Match two identity records",
    description="""
    Compare two identity records and return a similarity score.

    Uses weighted multi-field matching:
    - Email exact match: 0.9 weight
    - Phone exact match: 0.7 weight
    - Name + address match: 0.5 weight
    - Postal area match: 0.2 weight

    Returns `match=true` if score >= 0.70 (configurable threshold).
    """,
    responses={
        200: {"description": "Match comparison complete"},
        401: {"description": "Authentication failed"},
    },
)
async def match_records(
    request: MatchRequest,
    agent: AuthenticatedAgent = Depends(get_current_agent),
    service: IdentityService = Depends(get_identity_service),
) -> MatchResponse:
    """Compare two identity records and return similarity score."""
    return service.match(request.record1, request.record2)


@router.get(
    "/golden/{uid}",
    response_model=GoldenRecord,
    summary="Retrieve golden record by UID",
    description="""
    Retrieve a golden record by its unique identifier (UID).

    Returns 404 if the record does not exist.
    """,
    responses={
        200: {"description": "Golden record found"},
        401: {"description": "Authentication failed"},
        404: {"description": "Golden record not found"},
    },
)
async def get_golden_record(
    uid: str = Path(..., description="Golden record unique identifier"),
    agent: AuthenticatedAgent = Depends(get_current_agent),
    service: IdentityService = Depends(get_identity_service),
) -> GoldenRecord:
    """Retrieve a golden record by UID."""
    return service.get_golden_record(uid)
