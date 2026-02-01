"""
Agent PIN endpoints.

Provides:
- POST / - Create a new PIN
- POST /{pin_id}/validate - Validate a PIN

Note: These endpoints are mounted at /api/v1/pins by the v1 router.
"""
from uuid import UUID
from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.orm import Session

from src.core.auth import get_current_agent, AuthenticatedAgent
from src.core.database import get_db
from src.services.pins_service import PinsService
from src.schemas.pins import (
    CreatePinRequest,
    CreatePinResponse,
    ValidatePinRequest,
    ValidatePinResponse,
)

router = APIRouter()


def get_pins_service(db: Session = Depends(get_db)) -> PinsService:
    """Dependency injection for PinsService."""
    return PinsService(db)


@router.post(
    "/",
    response_model=CreatePinResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create an agent PIN",
    description="""
    Create a new short-lived authorization PIN for the authenticated agent.

    The PIN has a 60-second TTL and is scoped to specific data types and actions.
    The full PIN value is only returned once - store it securely.

    Requirements:
    - Contract must be active
    - Agent must be a party to the contract
    - Requested scope must be subset of contract scope
    """,
    responses={
        201: {"description": "PIN created successfully"},
        400: {"description": "Contract not active or scope exceeds contract"},
        401: {"description": "Authentication failed"},
        403: {"description": "Agent is not a party to the contract"},
    },
)
async def create_pin(
    request: CreatePinRequest,
    agent: AuthenticatedAgent = Depends(get_current_agent),
    service: PinsService = Depends(get_pins_service),
) -> CreatePinResponse:
    """Create a new agent PIN scoped to a contract."""
    return service.create_pin(agent.agent_id, request)


@router.post(
    "/{pin_id}/validate",
    response_model=ValidatePinResponse,
    summary="Validate an agent PIN",
    description="""
    Validate a PIN for a specific scope.

    Checks:
    - PIN exists and is not revoked
    - PIN has not expired (60-second TTL)
    - PIN signature is valid
    - Requested scope is subset of PIN scope
    - Parent contract is still active
    - Single-use PIN has not been used

    For single-use PINs, successful validation marks the PIN as used.
    """,
    responses={
        200: {"description": "Validation result returned"},
        401: {"description": "Authentication failed"},
    },
)
async def validate_pin(
    pin_id: UUID = Path(..., description="PIN identifier (UUID)"),
    request: ValidatePinRequest = ...,
    agent: AuthenticatedAgent = Depends(get_current_agent),
    service: PinsService = Depends(get_pins_service),
) -> ValidatePinResponse:
    """Validate a PIN and optionally mark as used."""
    return service.validate_pin(pin_id, request)
