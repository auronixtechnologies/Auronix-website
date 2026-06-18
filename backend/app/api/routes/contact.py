"""
API routes for client projects and case studies.
Endpoints: GET /client-projects, GET /client-projects/{id}, POST /client-projects
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.schemas import ClientProjectCreate, ClientProjectUpdate, ClientProjectResponse
from app.services import ClientProjectService
from app.auth import require_admin

router = APIRouter(prefix="/client-projects", tags=["client_projects"])


@router.get("", response_model=List[ClientProjectResponse])
def get_client_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Get all client projects/case studies with pagination.
    
    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Number of records to return (default: 10, max: 100)
    """
    return ClientProjectService.get_client_projects(db, skip=skip, limit=limit)


@router.get("/{project_id}", response_model=ClientProjectResponse)
def get_client_project(project_id: int, db: Session = Depends(get_db)):
    """Get a specific client project by ID."""
    project = ClientProjectService.get_client_project_by_id(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Client project not found")
    return project


@router.post("", response_model=ClientProjectResponse, status_code=201)
def create_client_project(
    client_project: ClientProjectCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """
    Create a new client project/case study.

    ADMIN ENDPOINT: Requires valid Bearer token.
    """
    return ClientProjectService.create_client_project(db, client_project)


@router.put("/{project_id}", response_model=ClientProjectResponse)
def update_client_project(
    project_id: int,
    client_project: ClientProjectUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """
    Update an existing client project.

    ADMIN ENDPOINT: Requires valid Bearer token.
    """
    updated_project = ClientProjectService.update_client_project(
        db, project_id, client_project
    )
    if not updated_project:
        raise HTTPException(status_code=404, detail="Client project not found")
    return updated_project


@router.delete("/{project_id}", status_code=204)
def delete_client_project(
    project_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """
    Delete a client project.

    ADMIN ENDPOINT: Requires valid Bearer token.
    """
    success = ClientProjectService.delete_client_project(db, project_id)
    if not success:
        raise HTTPException(status_code=404, detail="Client project not found")
    return None
