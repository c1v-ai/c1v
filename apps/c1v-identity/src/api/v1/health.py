"""
Health and version endpoints.
"""
from fastapi import APIRouter, Depends
from datetime import datetime, timezone
import os

from src.core.config import get_settings, Settings
from src.schemas.common import HealthResponse, VersionResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Returns service health status. Use for liveness probes.",
)
async def health_check(settings: Settings = Depends(get_settings)) -> HealthResponse:
    """Service health check endpoint."""
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
        timestamp=datetime.now(timezone.utc),
    )


@router.get(
    "/version",
    response_model=VersionResponse,
    summary="Version information",
    description="Returns detailed version and build information.",
)
async def version_info(settings: Settings = Depends(get_settings)) -> VersionResponse:
    """Service version information endpoint."""
    return VersionResponse(
        name=settings.app_name,
        version=settings.app_version,
        build=os.environ.get("BUILD_ID"),
        environment="development" if settings.debug else "production",
    )


@router.get(
    "/ready",
    summary="Readiness check",
    description="Returns 200 when service is ready to accept traffic.",
)
async def readiness_check() -> dict:
    """
    Readiness probe - checks if service can handle requests.

    TODO: Add database connectivity check
    """
    # TODO: Check database connection
    # TODO: Check external dependencies
    return {"ready": True}
