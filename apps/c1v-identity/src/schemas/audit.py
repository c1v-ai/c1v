"""
Audit logging schemas.
"""
from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


class AuditAction(str, Enum):
    """Type of audited action."""

    REQUEST = "request"
    RESPONSE = "response"
    ERROR = "error"
    VALIDATION = "validation"
    REVOCATION = "revocation"


class AuditStatus(str, Enum):
    """Outcome status of audited action."""

    SENT = "sent"
    RECEIVED = "received"
    DENIED = "denied"
    ERROR = "error"
    EXPIRED = "expired"


class AuditParty(BaseModel):
    """A party in an audit log entry."""

    agent_id: str = Field(..., description="Agent identifier")
    role: str = Field(..., description="Role in transaction (requester/provider)")


class CreateAuditLogRequest(BaseModel):
    """Request to create an audit log entry."""

    transaction_id: UUID = Field(..., description="Unique transaction identifier")
    contract_id: Optional[UUID] = Field(None, description="Associated contract")
    pin_id: Optional[UUID] = Field(None, description="Associated PIN")
    action: AuditAction = Field(..., description="Action type")
    status: AuditStatus = Field(..., description="Outcome status")
    counterparty: AuditParty = Field(..., description="Other party in transaction")
    data_types: list[str] = Field(default_factory=list, description="Data types accessed")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Additional context")


class AuditLog(BaseModel):
    """An audit log entry."""

    id: UUID = Field(..., description="Log entry identifier")
    transaction_id: UUID = Field(..., description="Transaction identifier")
    contract_id: Optional[UUID] = None
    pin_id: Optional[UUID] = None
    reporter: AuditParty = Field(..., description="Party creating this log")
    counterparty: AuditParty = Field(..., description="Other party")
    action: AuditAction
    status: AuditStatus
    data_types: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)
    prev_hash: Optional[str] = Field(None, description="Hash of previous entry (chain)")
    entry_hash: str = Field(..., description="Hash of this entry")
    created_at: datetime


class AuditLogResponse(BaseModel):
    """Response containing an audit log entry."""

    log: AuditLog


class AuditLogQuery(BaseModel):
    """Query parameters for audit log search."""

    contract_id: Optional[UUID] = None
    agent_id: Optional[str] = None
    action: Optional[AuditAction] = None
    status: Optional[AuditStatus] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    limit: int = Field(100, ge=1, le=1000)
    offset: int = Field(0, ge=0)


class AuditLogListResponse(BaseModel):
    """Response containing list of audit logs."""

    logs: list[AuditLog]
    total: int
    limit: int
    offset: int
