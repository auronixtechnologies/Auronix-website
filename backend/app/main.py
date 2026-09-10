"""
FastAPI Application Entry Point
Defines the main app instance with all middleware, routes, and event handlers.
Production-ready following FastAPI best practices.

USAGE:
    python -m uvicorn app.main:app --reload
"""

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import traceback

from app.config import config
from app.db import init_db
from app.api import api_router

# Refuse to boot a production deployment that still holds development secrets.
config.validate()
# Import models so they're registered with Base before init_db() is called
from app.models import TeamMember, Project, ClientProject, Lead, BlogPost  # noqa: F401

# Create FastAPI application
app = FastAPI(
    title=config.PROJECT_NAME,
    version=config.PROJECT_VERSION,
    description="Auronix Technologies - Portfolio & Services API",
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
    # Always log server-side; only expose the text to the client in debug.
    print(f"ERROR: {error_detail}")
    traceback.print_exc()

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
            "path": request.url.path
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
except Exception as e:
    print(f"⚠️ Warning: Could not mount uploads directory: {e}")

# ==================== ROUTES ====================

# Include API routes with /api/v1 prefix
app.include_router(api_router)

# ==================== STARTUP/SHUTDOWN ====================

@app.on_event("startup")
async def startup_event():
    """Initialize database on application startup (non-blocking)."""
    try:
        init_db()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Database connection unavailable: {str(e)[:100]}")
        print("   The app will start anyway. Database tables will be created on first API request.")
        # App continues to start even if DB fails
        pass

@app.on_event("shutdown")
async def shutdown_event():
    """Clean up on application shutdown."""
    print("Application shutting down...")

# ==================== ENDPOINTS ====================

@app.get("/", tags=["root"])
async def root():
    """Welcome endpoint with API information."""
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
        }
    }

@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "service": config.PROJECT_NAME,
        "environment": config.ENVIRONMENT,
    }
