"""
FastAPI Application Entry Point
Defines the main app instance with all middleware, routes, and event handlers.
Production-ready following FastAPI best practices.

USAGE:
    python -m uvicorn app.main:app --reload
"""

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import config
from app.core.db import init_db
from app.core.logging import configure_logging, get_logger

# Import models so they're registered with Base before init_db() is called
from app.models import BlogPost, ClientProject, Lead, Project, TeamMember  # noqa: F401
from app.routes import api_router

# Where the Docker build drops the compiled React app. Absent in local dev.
FRONTEND_DIR = (Path(__file__).resolve().parent.parent / "static").resolve()
SPA_INDEX = FRONTEND_DIR / "index.html"

# Refuse to boot a production deployment that still holds development secrets.
config.validate()

configure_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    """
    Startup and shutdown, replacing the deprecated @app.on_event hooks.

    A database that is unreachable at boot is logged but not fatal: the
    platform health check should be able to report the service as up so the
    failure is visible, rather than the container dying before it can be.
    """
    try:
        init_db()
        logger.info("Database initialized")
    except Exception as exc:  # noqa: BLE001 - startup must not be fatal here
        logger.error("Database unavailable at startup: %s", exc)

    yield

    logger.info("Application shutting down")


# Create FastAPI application
app = FastAPI(
    title=config.PROJECT_NAME,
    version=config.PROJECT_VERSION,
    description="Auronix Technologies - Portfolio & Services API",
    lifespan=lifespan,
)

# ==================== ERROR HANDLING ====================


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler to capture all unhandled errors.

    Starlette runs ServerErrorMiddleware *outside* CORSMiddleware, so responses
    produced here never pass through the CORS layer. Without the headers below
    the browser reports an opaque CORS failure and the client never sees the
    status or body. They are therefore attached by hand.
    """
    error_detail = str(exc)
    # Always log server-side with a traceback; only expose the text in debug.
    logger.exception("Unhandled error on %s", request.url.path)

    headers = {}
    origin = request.headers.get("origin")
    if origin and origin in config.ALLOWED_ORIGINS:
        headers["Access-Control-Allow-Origin"] = origin
        headers["Access-Control-Allow-Credentials"] = "true"
        headers["Vary"] = "Origin"

    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal Server Error",
            "message": error_detail if config.DEBUG else "A database or server error occurred.",
            "path": request.url.path,
        },
        headers=headers,
    )


# ==================== MIDDLEWARE ====================

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== STATIC FILES ====================

# Create uploads directory if it doesn't exist
upload_path = Path(config.UPLOAD_FOLDER)
upload_path.mkdir(parents=True, exist_ok=True)

# Mount uploads directory as static files
try:
    app.mount("/uploads", StaticFiles(directory=config.UPLOAD_FOLDER), name="uploads")
except Exception as exc:  # noqa: BLE001
    logger.warning("Could not mount uploads directory: %s", exc)

# ==================== ROUTES ====================

# Include API routes with /api/v1 prefix
app.include_router(api_router)

# ==================== ENDPOINTS ====================


@app.get("/", tags=["root"])
async def root():
    """
    Serve the built frontend when it is bundled into the image, otherwise
    return API information (the backend-only local dev setup).
    """
    if SPA_INDEX.is_file():
        return FileResponse(SPA_INDEX)

    return {
        "message": "Welcome to Auronix Technologies API",
        "version": config.PROJECT_VERSION,
        "environment": config.ENVIRONMENT,
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc",
        },
        "endpoints": {
            "team": "/api/v1/team",
            "projects": "/api/v1/projects",
            "client_projects": "/api/v1/client-projects",
            "contact": "/api/v1/contact",
        },
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "service": config.PROJECT_NAME,
        "environment": config.ENVIRONMENT,
    }


# ==================== SINGLE-PAGE APP ====================
#
# The Docker image builds the React app and copies it to backend/static, so
# one container serves both the API and the site. Nothing here runs during
# local development, where Vite serves the frontend on its own port.
#
# This block must stay at the very bottom of the file: the catch-all route
# matches everything, and FastAPI resolves routes in registration order, so
# anything declared after it would be unreachable.

if SPA_INDEX.is_file():
    assets_dir = FRONTEND_DIR / "assets"
    if assets_dir.is_dir():
        app.mount("/assets", StaticFiles(directory=assets_dir), name="spa-assets")

    # Paths owned by the backend. A request for a missing API route must 404 as
    # JSON rather than silently returning the HTML shell, which would otherwise
    # surface as a confusing "Unexpected token '<'" parse error in the client.
    _RESERVED_PREFIXES = ("api/", "uploads/", "assets/")
    _RESERVED_EXACT = ("docs", "redoc", "openapi.json", "health")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        if full_path.startswith(_RESERVED_PREFIXES) or full_path in _RESERVED_EXACT:
            raise HTTPException(status_code=404, detail="Not Found")

        # Serve a real file when one exists (favicon, images in public/, ...).
        if full_path:
            candidate = (FRONTEND_DIR / full_path).resolve()
            # Confirm the resolved path is still inside the build directory,
            # so "../" segments cannot escape it.
            if candidate.is_file() and candidate.is_relative_to(FRONTEND_DIR):
                return FileResponse(candidate)

        # Otherwise hand back the shell and let the client router take over.
        return FileResponse(SPA_INDEX)
