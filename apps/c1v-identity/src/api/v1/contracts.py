"""
Consent contract endpoints.

Provides:
- POST / - Create a contract proposal
- POST /{contract_id}/sign - Sign a contract
- GET /{contract_id} - Get contract details
- DELETE /{contract_id} - Revoke a contract

Note: These endpoints are mounted at /api/v1/contracts by the v1 router,
so full paths are /api/v1/contracts, /api/v1/contracts/{id}/sign, etc.
"""
from fastapi import APIRouter, Depends, Path, status
from sqlalchemy.orm import Session

from src.core.auth import get_current_agent, AuthenticatedAgent
from src.core.database import get_db
from src.services.contracts_service import ContractService
from src.services.crypto_service import CryptoService
from src.schemas.contracts import (
    CreateContractRequest,
    SignContractRequest,
    RevokeContractRequest,
    ContractResponse,
)

router = APIRouter()


def get_contract_service(db: Session = Depends(get_db)) -> ContractService:
    """Dependency injection for ContractService."""
    return ContractService(db, CryptoService())


@router.post(
    "/",
    response_model=ContractResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a consent contract proposal",
    description="""
    Create a new consent contract between the authenticated agent (proposer)
    and a specified counterparty.

    The contract is created in PROPOSED status. Both parties must sign
    for the contract to become ACTIVE.

    Terms specify:
    - data_types: What data can be accessed (e.g., pii.email, pii.phone)
    - allowed_actions: What can be done (e.g., read, write, delete)
    - purpose: Why the data is being accessed
    - retention_days: How long data can be retained
    """,
    responses={
        201: {"description": "Contract created successfully"},
        401: {"description": "Authentication failed"},
    },
)
async def create_contract(
    request: CreateContractRequest,
    agent: AuthenticatedAgent = Depends(get_current_agent),
    service: ContractService = Depends(get_contract_service),
) -> ContractResponse:
    """Create a new consent contract proposal."""
    return service.create_contract(agent.agent_id, request)


@router.post(
    "/{contract_id}/sign",
    response_model=ContractResponse,
    summary="Sign a consent contract",
    description="""
    Submit an Ed25519 signature for a proposed contract.

    The signature is verified against the provided public key and the
    contract's content hash. Contract becomes ACTIVE when both parties
    have signed.

    Signing party must be either party_a (proposer) or party_b (counterparty).
    """,
    responses={
        200: {"description": "Contract signed successfully"},
        400: {"description": "Invalid signature or contract not signable"},
        403: {"description": "Agent is not a party to this contract"},
        404: {"description": "Contract not found"},
        409: {"description": "Party has already signed"},
    },
)
async def sign_contract(
    contract_id: str = Path(..., description="Contract UUID"),
    request: SignContractRequest = ...,
    agent: AuthenticatedAgent = Depends(get_current_agent),
    service: ContractService = Depends(get_contract_service),
) -> ContractResponse:
    """Sign a consent contract with Ed25519 signature."""
    return service.sign_contract(
        contract_id, agent.agent_id, request.signature, request.public_key_pem
    )


@router.get(
    "/{contract_id}",
    response_model=ContractResponse,
    summary="Get contract details",
    description="""
    Retrieve a consent contract by its UUID.

    Returns full contract details including terms, signatures, and status.
    """,
    responses={
        200: {"description": "Contract found"},
        401: {"description": "Authentication failed"},
        404: {"description": "Contract not found"},
    },
)
async def get_contract(
    contract_id: str = Path(..., description="Contract UUID"),
    agent: AuthenticatedAgent = Depends(get_current_agent),
    service: ContractService = Depends(get_contract_service),
) -> ContractResponse:
    """Retrieve a consent contract by ID."""
    return service.get_contract(contract_id)


@router.delete(
    "/{contract_id}",
    response_model=ContractResponse,
    summary="Revoke a consent contract",
    description="""
    Revoke an active consent contract.

    Either party can revoke an active contract at any time. Once revoked,
    the contract cannot be reactivated. A new contract must be created.

    Revocation reason is required and recorded for audit purposes.
    """,
    responses={
        200: {"description": "Contract revoked successfully"},
        400: {"description": "Contract is not active"},
        403: {"description": "Agent is not a party to this contract"},
        404: {"description": "Contract not found"},
    },
)
async def revoke_contract(
    contract_id: str = Path(..., description="Contract UUID"),
    request: RevokeContractRequest = ...,
    agent: AuthenticatedAgent = Depends(get_current_agent),
    service: ContractService = Depends(get_contract_service),
) -> ContractResponse:
    """Revoke an active consent contract."""
    return service.revoke_contract(contract_id, agent.agent_id, request.reason)
