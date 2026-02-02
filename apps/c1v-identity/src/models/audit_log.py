"""
SQLAlchemy model for audit_logs table.

Matches SCHEMA.sql definition for immutable audit logging with hash-chain integrity.
"""
from enum import Enum
from uuid import uuid4

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import INET, JSONB, UUID
from sqlalchemy import Enum as SQLEnum

from src.core.database import Base


class AuditActionEnum(str, Enum):
    """Audit action types matching SCHEMA.sql audit_action enum."""

    REQUEST = "request"
    RESPONSE = "response"
    ERROR = "error"
    VALIDATION = "validation"
    REVOCATION = "revocation"


class AuditStatusEnum(str, Enum):
    """Audit status types matching SCHEMA.sql audit_status enum."""

    SENT = "sent"
    RECEIVED = "received"
    DENIED = "denied"
    ERROR = "error"
    EXPIRED = "expired"


class AuditLogModel(Base):
    """
    Immutable audit log entries with hash-chain linkage.

    Captures all consent operations for compliance and tamper detection.
    Append-only: UPDATE/DELETE/TRUNCATE blocked by database triggers.
    """

    __tablename__ = "audit_logs"

    # Primary identifier
    log_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Event timestamp (server time)
    timestamp = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    # Related entities (nullable - not all events have all references)
    contract_id = Column(
        UUID(as_uuid=True),
        ForeignKey("consent_contracts.contract_id", ondelete="SET NULL"),
        nullable=True,
    )
    pin_id = Column(
        UUID(as_uuid=True),
        ForeignKey("agent_pins.pin_id", ondelete="SET NULL"),
        nullable=True,
    )
    agent_id = Column(Text, nullable=True)

    # Event classification
    action = Column(
        SQLEnum(
            AuditActionEnum,
            name="audit_action",
            create_type=False,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
    )
    status = Column(
        SQLEnum(
            AuditStatusEnum,
            name="audit_status",
            create_type=False,
            values_callable=lambda x: [e.value for e in x],
        ),
        nullable=False,
    )

    # Target of operation
    target_system = Column(Text, nullable=True)

    # Scope and metadata (JSONB)
    scope = Column(JSONB, nullable=False, default=dict)
    # Note: 'metadata' is a reserved SQLAlchemy attribute, so we use 'log_metadata'
    # as the Python attribute name but map to 'metadata' column in the database
    log_metadata = Column("metadata", JSONB, nullable=False, default=dict)

    # Source of log entry (who created this)
    source = Column(Text, nullable=False)

    # Request tracing (for correlating dual-sided entries)
    request_id = Column(Text, nullable=True)

    # IP and geographic info (for compliance)
    source_ip = Column(INET, nullable=True)
    geo_location = Column(Text, nullable=True)

    # Hash-chain fields for tamper detection
    prev_hash = Column(Text, nullable=True)  # NULL only for genesis entry
    entry_hash = Column(Text, nullable=False)  # SHA256 of canonical content

    def __repr__(self) -> str:
        return (
            f"<AuditLog(log_id={self.log_id}, "
            f"agent_id={self.agent_id}, action={self.action}, "
            f"status={self.status})>"
        )
