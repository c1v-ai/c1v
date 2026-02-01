"""
id.c1v.ai - Machine-to-Machine Consent Protocol

Main FastAPI application entry point.
"""
from fastapi import FastAPI, Request
from fastapi.responses import ORJSONResponse
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import time
import uuid

from src.core.config import get_settings
from src.api.v1 import router as v1_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    print(f"Starting {settings.app_name} v{settings.app_version}")
    # TODO: Initialize database connection pool
    # TODO: Warm up any caches
    yield
    # Shutdown
    print(f"Shutting down {settings.app_name}")
    # TODO: Close database connections
    # TODO: Cleanup resources


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="""
## Machine-to-Machine Consent Protocol

The id.c1v.ai API provides a bilateral consent protocol for AI agent data access:

- **Consent Contracts**: Cryptographically signed agreements between parties
- **Agent PINs**: Short-lived (60s) authorization tokens
- **Dual Audit Logging**: Both parties independently log all interactions

### Authentication

All endpoints require:
- `Authorization: Bearer <api_key>` header
- `X-Agent-ID: <agent_id>` header

### Rate Limiting

Default limits:
- Identity Resolution: 100 req/min
- Contract Operations: 30 req/min
- PIN Validation: 500 req/min
- Audit Logs: 200 req/min
    """,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    default_response_class=ORJSONResponse,
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.debug else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def add_request_metadata(request: Request, call_next):
    """Add request ID and timing to all requests."""
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    start_time = time.time()

    response = await call_next(request)

    # Add response headers
    process_time = time.time() - start_time
    response.headers["X-Request-ID"] = request_id
    response.headers["X-Process-Time"] = f"{process_time:.4f}"

    return response


# Include API v1 router
app.include_router(v1_router)

# Legacy health endpoint (for backwards compatibility)
@app.get("/healthz", include_in_schema=False)
async def legacy_health():
    """Legacy health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )
