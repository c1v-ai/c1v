"""
Identity resolution schemas.
"""
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Any
from datetime import datetime
from uuid import UUID


class IdentityData(BaseModel):
    """Partial identity data for resolution."""

    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    metadata: Optional[dict[str, Any]] = Field(default_factory=dict)


class ResolveRequest(BaseModel):
    """Request to resolve identity from partial data."""

    data: IdentityData = Field(..., description="Partial identity data")
    create_if_missing: bool = Field(True, description="Create golden record if not found")


class GoldenRecord(BaseModel):
    """Merged identity record."""

    uid: UUID = Field(..., description="Unique identifier")
    email: Optional[str] = None
    phone: Optional[str] = None
    name: Optional[str] = None
    source_count: int = Field(..., description="Number of merged sources")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score")
    metadata: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime


class ResolveResponse(BaseModel):
    """Response from identity resolution."""

    golden_record: GoldenRecord
    is_new: bool = Field(..., description="Whether record was newly created")
    match_confidence: float = Field(..., ge=0, le=1)


class MatchRequest(BaseModel):
    """Request to match two identity records."""

    record1: dict[str, Any] = Field(..., description="First record")
    record2: dict[str, Any] = Field(..., description="Second record")


class MatchResponse(BaseModel):
    """Response from identity matching."""

    match: bool = Field(..., description="Whether records match")
    confidence: float = Field(..., ge=0, le=1, description="Match confidence")
    reason: str = Field(..., description="Matching algorithm used")
