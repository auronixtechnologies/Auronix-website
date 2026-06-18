"""
API routes for team members.
Endpoints: GET /team, GET /team/{id}, POST /team (admin), PUT /team/{id}, DELETE /team/{id}
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.schemas import TeamMemberCreate, TeamMemberUpdate, TeamMemberResponse
from app.services import TeamMemberService
from app.auth import require_admin

router = APIRouter(prefix="/team", tags=["team"])


@router.get("", response_model=List[TeamMemberResponse])
def get_team_members(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Get all team members with pagination.
    
    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Number of records to return (default: 10, max: 100)
    """
    return TeamMemberService.get_team_members(db, skip=skip, limit=limit)


@router.get("/{member_id}", response_model=TeamMemberResponse)
def get_team_member(member_id: int, db: Session = Depends(get_db)):
    """Get a specific team member by ID."""
    member = TeamMemberService.get_team_member_by_id(db, member_id)
    if not member:
        raise HTTPException(status_code=404, detail="Team member not found")
    return member


@router.post("", response_model=TeamMemberResponse, status_code=201)
def create_team_member(
    team_member: TeamMemberCreate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """
    Create a new team member.

    ADMIN ENDPOINT: Requires valid Bearer token.
    """
    return TeamMemberService.create_team_member(db, team_member)


@router.put("/{member_id}", response_model=TeamMemberResponse)
def update_team_member(
    member_id: int,
    team_member: TeamMemberUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """
    Update an existing team member.

    ADMIN ENDPOINT: Requires valid Bearer token.
    """
    updated_member = TeamMemberService.update_team_member(db, member_id, team_member)
    if not updated_member:
        raise HTTPException(status_code=404, detail="Team member not found")
    return updated_member


@router.delete("/{member_id}", status_code=204)
def delete_team_member(
    member_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """
    Delete a team member.

    ADMIN ENDPOINT: Requires valid Bearer token.
    """
    success = TeamMemberService.delete_team_member(db, member_id)
    if not success:
        raise HTTPException(status_code=404, detail="Team member not found")
    return None
