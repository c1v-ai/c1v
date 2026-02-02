"""
Audit logging endpoints.

Provides:
- POST / - Submit an audit log entry
- GET / - Query audit logs with filters
- GET /verify/{agent_id} - Verify hash chain integrity

Note: These endpoints are mounted at /api/v1/audit by the v1 router.
"""
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from src.core.auth import AuthenticatedAgent, get_current_agent
from src.core.database import get_db
from src.schemas.audit import (
    AuditAction,
    AuditLogListResponse,
    AuditLogQuery,
    AuditLogResponse,
    AuditStatus,
    CreateAuditLogRequest,
)
from src.services.audit_service import AuditService

router = APIRouter()


def get_audit_service(db: Session = Depends(get_db)) -> AuditService:
    """Dependency injection for AuditService."""
    return AuditService(db)


@router.post(
    "/",
    response_model=AuditLogResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit an audit log entry",
    description="""
    Create an immutable audit log entry for the authenticated agent.

    This enables dual-sided logging where both parties to a transaction
    independently submit their perspective. Each entry is hash-chained
    to the agent's previous entry for tamper detection.

    The hash chain (prev_hash, entry_hash) is computed server-side and
    cannot be provided by the client. This ensures cryptographic integrity.

    Key points:
    - Append-only: entries cannot be modified or deleted
    - Per-agent chains: each agent maintains an independent hash chain
    - Hash verification: chain integrity can be audited via /verify/{agent_id}
    """,
    responses={
        201: {"description": "Audit log entry created successfully"},
        401: {"description": "Authentication failed"},
    },
)
async def create_audit_log(
    request: CreateAuditLogRequest,
    agent: AuthenticatedAgent = Depends(get_current_agent),
    service: AuditService = Depends(get_audit_service),
) -> AuditLogResponse:
    """Create an immutable audit log entry."""
    return service.create_log(agent.agent_id, request)


@router.get(
    "/",
    response_model=AuditLogListResponse,
    summary="Query audit logs",
    description="""
    Query audit logs with optional filters and pagination.

    Filters:
    - contract_id: Filter by associated consent contract
    - agent_id: Filter by the agent who created the log
    - action: Filter by action type (request, response, error, validation, revocation)
    - status: Filter by outcome status (sent, received, denied, error, expired)
    - start_time/end_time: Filter by time range

    Pagination:
    - limit: Maximum entries to return (1-1000, default 100)
    - offset: Number of entries to skip (default 0)

    Results are ordered by timestamp descending (newest first).
    """,
    responses={
        200: {"description": "Audit logs retrieved successfully"},
        401: {"description": "Authentication failed"},
    },
)
async def query_audit_logs(
    contract_id: Optional[UUID] = Query(
        None, description="Filter by consent contract UUID"
    ),
    agent_id: Optional[str] = Query(
        None, description="Filter by agent who created the log"
    ),
    action: Optional[AuditAction] = Query(None, description="Filter by action type"),
    status: Optional[AuditStatus] = Query(
        None, description="Filter by outcome status"
    ),
    start_time: Optional[datetime] = Query(
        None, description="Filter logs after this time (inclusive)"
    ),
    end_time: Optional[datetime] = Query(
        None, description="Filter logs before this time (inclusive)"
    ),
    limit: int = Query(100, ge=1, le=1000, description="Maximum entries to return"),
    offset: int = Query(0, ge=0, description="Number of entries to skip"),
    agent: AuthenticatedAgent = Depends(get_current_agent),
    service: AuditService = Depends(get_audit_service),
) -> AuditLogListResponse:
    """Query audit logs with filters and pagination."""
    query = AuditLogQuery(
        contract_id=contract_id,
        agent_id=agent_id,
        action=action,
        status=status,
        start_time=start_time,
        end_time=end_time,
        limit=limit,
        offset=offset,
    )
    return service.get_logs(query)


@router.get(
    "/verify/{agent_id}",
    summary="Verify hash chain integrity",
    description="""
    Verify the cryptographic integrity of an agent's audit log chain.

    This endpoint checks that:
    1. Each entry's prev_hash matches the previous entry's entry_hash
    2. Each entry's entry_hash correctly recomputes from its content

    A broken chain indicates either:
    - Missing entries (gaps in the chain)
    - Tampered entries (modified content)
    - Database corruption

    Use this for compliance audits to prove log integrity.

    Optional time range filters limit verification to a specific period.
    """,
    responses={
        200: {"description": "Chain verification result"},
        401: {"description": "Authentication failed"},
    },
)
async def verify_audit_chain(
    agent_id: str,
    start_time: Optional[datetime] = Query(
        None, description="Verify only logs after this time"
    ),
    end_time: Optional[datetime] = Query(
        None, description="Verify only logs before this time"
    ),
    agent: AuthenticatedAgent = Depends(get_current_agent),
    service: AuditService = Depends(get_audit_service),
) -> dict:
    """Verify hash chain integrity for an agent's audit logs."""
    valid, error = service.verify_chain(agent_id, start_time, end_time)
    return {
        "valid": valid,
        "agent_id": agent_id,
        "error": error,
    }
