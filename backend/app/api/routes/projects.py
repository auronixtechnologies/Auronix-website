"""
API routes for portfolio projects.
Endpoints: GET /projects, GET /projects/{id}, POST /projects, PUT /projects/{id}, DELETE /projects/{id}
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db import get_db
from app.schemas import ProjectCreate, ProjectUpdate, ProjectResponse
from app.services import ProjectService
from app.auth import require_admin

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=List[ProjectResponse])
def get_projects(
    domain: Optional[str] = Query(None, description="Filter by domain (Web, ML, LLM, MCP)"),
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Get portfolio projects with optional filtering.
    
    Query Parameters:
    - domain: Filter by project domain (optional)
    - skip: Number of records to skip (default: 0)
    - limit: Number of records to return (default: 10, max: 100)
    
    Example: GET /projects?domain=ML&limit=5
    """
    return ProjectService.get_projects(db, domain=domain, skip=skip, limit=limit)


@router.get("/featured", response_model=List[ProjectResponse])
def get_featured_projects(db: Session = Depends(get_db)):
    """Get featured portfolio projects."""
    return ProjectService.get_featured_projects(db, limit=6)


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
