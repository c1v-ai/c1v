"""
SQLAlchemy model for consent_contracts table.

Matches SCHEMA.sql definition for bilateral consent agreements between systems/agents.
"""
from enum import Enum
from uuid import uuid4

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy import Enum as SQLEnum

from src.core.database import Base


class ContractStatusEnum(str, Enum):
    """Contract lifecycle status enum matching SCHEMA.sql contract_status."""

    PROPOSED = "proposed"  # Initial state, awaiting signatures
    ACTIVE = "active"  # Both parties signed, contract is enforceable
    REVOKED = "revoked"  # Manually terminated by either party
    EXPIRED = "expired"  # Past expires_at timestamp


class ConsentContractModel(Base):
    """
    Bilateral consent agreements between systems/agents.

    Defines what data can be shared, for what purpose, under what constraints.
    Requires both signatures for activation.
    """

    __tablename__ = "consent_contracts"

    # Primary identifier
    contract_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)

    # Contracting parties (system/agent identifiers)
    # Example: "system:acme-healthcare" or "agent:appointment-scheduler"
    party_a = Column(Text, nullable=False)
    party_b = Column(Text, nullable=False)

    # What data types are covered
    # Example: ["patient_record", "appointment", "billing"]
    data_types = Column(JSONB, nullable=False, default=list)

    # What actions are permitted
    # Example: ["read", "update", "delete"]
    actions = Column(JSONB, nullable=False, default=list)

    # Business purpose for consent (required for GDPR compliance)
    purpose = Column(Text, nullable=False)

    # Data retention constraint (days, NULL = indefinite)
    retention_days = Column(Integer, nullable=True)

    # Geographic constraints (ISO 3166 codes)
    # Example: ["US", "CA", "EU"]
    geographic_scope = Column(JSONB, nullable=False, default=list)

    # Cryptographic signatures (Ed25519, base64 encoded)
    # NULL until signed by respective party
    party_a_signature = Column(Text, nullable=True)
    party_b_signature = Column(Text, nullable=True)

    # Contract lifecycle status
    status = Column(
        SQLEnum(ContractStatusEnum, name="contract_status", create_type=False),
        nullable=False,
        default=ContractStatusEnum.PROPOSED,
    )

    # SHA256 hash of canonical contract content for signature verification
    content_hash = Column(String(64), nullable=False)

    # Timestamps
    created_at = Column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
    signed_at = Column(DateTime(timezone=True), nullable=True)  # When both signatures received
    expires_at = Column(DateTime(timezone=True), nullable=True)  # NULL = no expiration
    revoked_at = Column(DateTime(timezone=True), nullable=True)  # Set when status -> revoked
    revoked_by = Column(Text, nullable=True)  # Which party initiated revocation
    revocation_reason = Column(Text, nullable=True)  # Optional explanation

    # Table-level constraints matching SCHEMA.sql
    __table_args__ = (
        CheckConstraint("party_a != party_b", name="consent_contracts_parties_different"),
        CheckConstraint(
            "(retention_days IS NULL OR retention_days > 0)",
            name="consent_contracts_retention_check",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<ConsentContract(contract_id={self.contract_id}, "
            f"party_a={self.party_a}, party_b={self.party_b}, status={self.status})>"
        )
