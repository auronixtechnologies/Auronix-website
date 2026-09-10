"""
API router initialization.
Combines all route modules into a single router.
"""

from fastapi import APIRouter

from app.routes.auth import router as auth_router
from app.routes.blog import router as blog_router
from app.routes.contact import router as contact_router
from app.routes.leads import router as leads_router
from app.routes.projects import router as projects_router
from app.routes.team import router as team_router

# Create the API router with v1 prefix
api_router = APIRouter(prefix="/api/v1")

# Include all route modules
api_router.include_router(auth_router)
api_router.include_router(team_router)
api_router.include_router(projects_router)
api_router.include_router(contact_router)
api_router.include_router(leads_router)
api_router.include_router(blog_router)
