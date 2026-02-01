"""
API v1 router - aggregates all v1 endpoints.
"""
from fastapi import APIRouter

from .health import router as health_router
from .identity import router as identity_router
# Future imports:
# from .contracts import router as contracts_router
# from .pins import router as pins_router
# from .audit import router as audit_router

router = APIRouter(prefix="/api/v1")

# Include sub-routers
router.include_router(health_router, tags=["health"])
router.include_router(identity_router, prefix="/identity", tags=["identity"])
# router.include_router(contracts_router, prefix="/contracts", tags=["contracts"])
# router.include_router(pins_router, prefix="/pins", tags=["pins"])
# router.include_router(audit_router, prefix="/audit", tags=["audit"])
