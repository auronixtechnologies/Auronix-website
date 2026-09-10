"""
API routes for contact/leads.
Endpoints: POST /contact, GET /contact (admin)
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import require_admin
from app.schemas import LeadCreate, LeadResponse
from app.services import LeadService

router = APIRouter(tags=["contact"])


@router.post("/contact", response_model=LeadResponse, status_code=201)
def submit_contact(
    lead: LeadCreate,
    db: Session = Depends(get_db),
):
    """
    Submit a contact form inquiry.

    This creates a lead in the database for follow-up by the team.
    In production, consider adding email notifications.
    """
    return LeadService.create_lead(db, lead)


@router.get("/admin/leads", response_model=list[LeadResponse])
def get_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """
    Get all leads/contact inquiries.

    ADMIN ENDPOINT: Requires valid Bearer token.
    """
    return LeadService.get_leads(db, skip=skip, limit=limit)


@router.get("/admin/leads/{lead_id}", response_model=LeadResponse)
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """
    Get a specific lead by ID.

    ADMIN ENDPOINT: Requires valid Bearer token.
    """
    lead = LeadService.get_lead_by_id(db, lead_id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead


@router.delete("/admin/leads/{lead_id}", status_code=204)
def delete_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_admin),
):
    """
    Delete a lead.

    ADMIN ENDPOINT: Requires valid Bearer token.
    """
    success = LeadService.delete_lead(db, lead_id)
    if not success:
        raise HTTPException(status_code=404, detail="Lead not found")
    return None
