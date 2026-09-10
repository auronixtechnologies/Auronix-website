"""
API routes for portfolio projects.
Endpoints: GET /projects, GET /projects/{id}, POST /projects, PUT /projects/{id}, DELETE /projects/{id}
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import require_admin
from app.media.images import build_image_response
from app.schemas import ProjectCreate, ProjectResponse, ProjectUpdate
from app.services import ProjectService

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[ProjectResponse])
def get_projects(
    domain: str | None = Query(None, description="Filter by domain (Web, ML, LLM, MCP)"),
    category: str | None = Query(
        None,
        description="Filter by category (Client Projects, Student Projects, Auronix's Arsenal)",
    ),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """
    Get portfolio projects with optional domain and category filtering.
    """
    return ProjectService.get_projects(db, domain=domain, category=category, skip=skip, limit=limit)


@router.get("/featured", response_model=list[ProjectResponse])
def get_featured_projects(db: Session = Depends(get_db)):
    """Get featured portfolio projects."""
    return ProjectService.get_featured_projects(db, limit=6)


@router.get("/{project_id}/image")
def get_project_image(project_id: int, request: Request, db: Session = Depends(get_db)):
    """
    Serve a project's image.

    Cached indefinitely; clients bust the cache with ?v=<updated_at>. Declared
    before /{project_id} so the literal "image" segment is not swallowed by
    the dynamic route.
    """
    record = ProjectService.get_project_image(db, project_id)
    return build_image_response(record, "project_image_data", "project_image_type", request)


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(project_id: int, db: Session = Depends(get_db)):
    """Get a specific project by ID."""
    project = ProjectService.get_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("", response_model=ProjectResponse, status_code=201)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """
    Create a new portfolio project.

    ADMIN ENDPOINT: Requires valid Bearer token.
    """
    return ProjectService.create_project(db, project)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project: ProjectUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """
    Update an existing project.

    ADMIN ENDPOINT: Requires valid Bearer token.
    """
    updated_project = ProjectService.update_project(db, project_id, project)
    if not updated_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return updated_project


@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """
    Delete a project.

    ADMIN ENDPOINT: Requires valid Bearer token.
    """
    success = ProjectService.delete_project(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Project not found")
    return None
