"""
Agent PIN schemas.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


class PinScope(BaseModel):
    """Scope of a PIN's authorization."""

    data_types: list[str] = Field(..., description="Allowed data types")
    actions: list[str] = Field(..., description="Allowed actions")


class CreatePinRequest(BaseModel):
    """Request to create an agent PIN."""

    contract_id: UUID = Field(..., description="Contract authorizing this PIN")
    scope: PinScope = Field(..., description="PIN scope (must be subset of contract)")
    single_use: bool = Field(False, description="Invalidate after first use")


class Pin(BaseModel):
    """An agent authorization PIN."""

    id: UUID = Field(..., description="PIN identifier")
    pin: str = Field(..., description="The PIN value (only shown once)")
    contract_id: UUID = Field(..., description="Associated contract")
    scope: PinScope = Field(..., description="Authorization scope")
    single_use: bool = Field(..., description="Whether single-use")
    created_at: datetime
    expires_at: datetime
    used_at: Optional[datetime] = None


class CreatePinResponse(BaseModel):
    """Response from PIN creation."""

    pin: Pin
    ttl_seconds: int = Field(..., description="Time to live in seconds")


class ValidatePinRequest(BaseModel):
    """Request to validate a PIN."""

    pin: str = Field(..., description="PIN value to validate")
    requested_scope: PinScope = Field(..., description="Scope being requested")


class ValidatePinResponse(BaseModel):
    """Response from PIN validation."""

    valid: bool = Field(..., description="Whether PIN is valid")
    contract_id: Optional[UUID] = Field(None, description="Associated contract if valid")
    error_code: Optional[str] = Field(None, description="Error code if invalid")
    error_message: Optional[str] = Field(None, description="Error message if invalid")
