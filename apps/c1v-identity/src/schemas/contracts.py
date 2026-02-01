"""
Consent contract schemas.
"""
from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


class ContractStatus(str, Enum):
    """Contract lifecycle status."""

    PROPOSED = "proposed"
    ACTIVE = "active"
    REVOKED = "revoked"
    EXPIRED = "expired"


class ContractTerms(BaseModel):
    """Terms of a consent contract."""

    data_types: list[str] = Field(..., description="Allowed data types (e.g., pii.email)")
    allowed_actions: list[str] = Field(..., description="Allowed actions (e.g., read, write)")
    purpose: str = Field(..., description="Purpose of data access")
    retention_days: int = Field(..., ge=1, description="Data retention period")


class ContractParty(BaseModel):
    """A party to a consent contract."""

    agent_id: str = Field(..., description="Agent identifier")
    organization_id: Optional[str] = Field(None, description="Organization identifier")
    public_key: Optional[str] = Field(None, description="Ed25519 public key (PEM)")


class ContractSignature(BaseModel):
    """Cryptographic signature on a contract."""

    party_id: str = Field(..., description="Signing party's agent ID")
    signature: str = Field(..., description="Ed25519 signature (base64)")
    signed_at: datetime = Field(..., description="Signature timestamp")


class CreateContractRequest(BaseModel):
    """Request to create a consent contract."""

    counterparty: ContractParty = Field(..., description="The other party to the contract")
    terms: ContractTerms = Field(..., description="Contract terms")
    expires_at: Optional[datetime] = Field(None, description="Contract expiration")


class SignContractRequest(BaseModel):
    """Request to sign a consent contract."""

    signature: str = Field(..., description="Ed25519 signature (base64)")
    public_key_pem: str = Field(..., description="Ed25519 public key (PEM format)")


class RevokeContractRequest(BaseModel):
    """Request to revoke a consent contract."""

    reason: str = Field(..., description="Reason for revocation", min_length=1, max_length=500)


class Contract(BaseModel):
    """A consent contract between two parties."""

    id: UUID = Field(..., description="Contract identifier")
    status: ContractStatus = Field(..., description="Current status")
    proposer: ContractParty = Field(..., description="Party who proposed the contract")
    counterparty: ContractParty = Field(..., description="Other party")
    terms: ContractTerms = Field(..., description="Contract terms")
    signatures: list[ContractSignature] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    expires_at: Optional[datetime] = None


class ContractResponse(BaseModel):
    """Response containing a contract."""

    contract: Contract
