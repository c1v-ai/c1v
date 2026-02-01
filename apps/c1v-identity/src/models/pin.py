"""
SQLAlchemy model for agent_pins table.

Matches SCHEMA.sql definition for short-lived authorization tokens.
"""
from uuid import uuid4

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from src.core.database import Base


class AgentPinModel(Base):
    """
    Short-lived authorization tokens for agent operations.

    Issued against an active consent contract with narrowed scope.
    Default TTL: 60 seconds (configurable at issuance).
    """

    __tablename__ = "agent_pins"

    # Primary identifier
    pin_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Parent contract (must be active)
    contract_id = Column(
        UUID(as_uuid=True),
        ForeignKey("consent_contracts.contract_id", ondelete="RESTRICT"),
        nullable=False,
    )

    # Agent receiving authorization
    agent_id = Column(Text, nullable=False)

    # Narrowed scope (must be subset of contract scope)
    # Example: {"actions": ["read"], "data_types": ["appointment"]}
    scope = Column(JSONB, nullable=False, default=dict)

    # C1V cryptographic signature proving PIN validity
    signature = Column(Text, nullable=False)

    # Timestamps (default 60 second TTL)
    issued_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    expires_at = Column(DateTime(timezone=True), nullable=False)

    # Usage tracking
    used_at = Column(DateTime(timezone=True), nullable=True)  # NULL = unused

    # Single-use flag
    single_use = Column(Boolean, nullable=False, default=False)

    # Revocation
    revoked = Column(Boolean, nullable=False, default=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    revocation_reason = Column(Text, nullable=True)

    # Relationship to contract
    contract = relationship("ConsentContractModel", back_populates="pins")

    # Table-level constraints matching SCHEMA.sql
    __table_args__ = (
        CheckConstraint(
            "expires_at > issued_at",
            name="agent_pins_expiry_after_issue",
        ),
        CheckConstraint(
            "(revoked = TRUE AND revoked_at IS NOT NULL) OR (revoked = FALSE AND revoked_at IS NULL)",
            name="agent_pins_revocation_consistency",
        ),
        CheckConstraint(
            "used_at IS NULL OR used_at >= issued_at",
            name="agent_pins_usage_timing",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<AgentPin(pin_id={self.pin_id}, "
            f"contract_id={self.contract_id}, agent_id={self.agent_id}, "
            f"revoked={self.revoked})>"
        )
