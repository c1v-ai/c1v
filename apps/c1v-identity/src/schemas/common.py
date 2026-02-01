"""
Common schemas used across the API.
"""
from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
from enum import Enum


class ErrorDetail(BaseModel):
    """Standard error response detail."""

    code: str = Field(..., description="Error code")
    message: str = Field(..., description="Human-readable error message")
    details: Optional[dict[str, Any]] = Field(None, description="Additional error context")
    request_id: Optional[str] = Field(None, description="Request ID for tracing")
    documentation_url: Optional[str] = Field(None, description="Link to error documentation")


class ErrorResponse(BaseModel):
    """Standard error response wrapper."""

    error: ErrorDetail


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = Field(..., description="Service status")
    version: str = Field(..., description="API version")
    timestamp: datetime = Field(default_factory=lambda: datetime.utcnow())


class VersionResponse(BaseModel):
    """Version information response."""

    name: str = Field(..., description="Service name")
    version: str = Field(..., description="API version")
    build: Optional[str] = Field(None, description="Build identifier")
    environment: str = Field(..., description="Environment (dev/staging/prod)")
