"""
FastAPI Router for Marketing Lead Inquiries & Superadmin Follow-Up Management.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, desc

from src.core.database.engine import get_db_session as get_db
from src.modules.marketing.models import LeadInquiry
from src.modules.marketing.schemas import (
    LeadInquiryCreate,
    LeadStatusUpdate,
    LeadInquiryResponse
)

router = APIRouter(prefix="/marketing", tags=["Marketing & Leads"])

@router.post("/leads", response_model=LeadInquiryResponse, status_code=status.HTTP_201_CREATED)
async def create_lead_inquiry(
    payload: LeadInquiryCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Public Endpoint: Submit a new Lead Inquiry or Live Demo Request from Marketing Web.
    Saves prospect information directly into PostgreSQL lead_inquiries table.
    """
    try:
        from datetime import datetime, timezone
        
        # Check if a lead with the same phone number already exists
        stmt = select(LeadInquiry).where(LeadInquiry.phone == payload.phone)
        result = await db.execute(stmt)
        existing_lead = result.scalar_one_or_none()

        if existing_lead:
            # Update existing lead request with new date, vertical, notes & reset status to NEW
            existing_lead.full_name = payload.full_name.strip()
            existing_lead.company_name = payload.company_name.strip()
            existing_lead.email = payload.email.strip()
            existing_lead.vertical = payload.vertical or existing_lead.vertical
            existing_lead.outlet_count = payload.outlet_count or existing_lead.outlet_count
            if payload.preferred_date:
                existing_lead.preferred_date = payload.preferred_date
            if payload.preferred_time:
                existing_lead.preferred_time = payload.preferred_time
            if payload.notes:
                existing_lead.notes = payload.notes
            existing_lead.inquiry_type = payload.inquiry_type or existing_lead.inquiry_type
            existing_lead.status = "NEW"
            existing_lead.updated_at = datetime.now(timezone.utc)

            await db.commit()
            await db.refresh(existing_lead)
            return existing_lead

        new_lead = LeadInquiry(
            full_name=payload.full_name.strip(),
            company_name=payload.company_name.strip(),
            phone=payload.phone.strip(),
            email=payload.email.strip(),
            vertical=payload.vertical or "restaurant",
            outlet_count=payload.outlet_count or "1-3 Outlets",
            preferred_date=payload.preferred_date,
            preferred_time=payload.preferred_time,
            inquiry_type=payload.inquiry_type or "DEMO_REQUEST",
            status="NEW",
            notes=payload.notes,
            source=payload.source or "MARKETING_WEB"
        )
        db.add(new_lead)
        await db.commit()
        await db.refresh(new_lead)
        return new_lead
    except Exception as exc:
        await db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database lead insert error: {str(exc)}"
        )

@router.get("/leads", response_model=List[LeadInquiryResponse])
async def list_lead_inquiries(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    vertical: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    Platform Admin Endpoint: Retrieve all submitted lead inquiries with status & search filtering.
    """
    try:
        stmt = select(LeadInquiry).order_by(desc(LeadInquiry.created_at))
        
        if status_filter and status_filter.upper() != "ALL":
            stmt = stmt.where(LeadInquiry.status == status_filter.upper())
            
        if vertical and vertical.lower() != "all":
            stmt = stmt.where(LeadInquiry.vertical == vertical.lower())
            
        result = await db.execute(stmt)
        leads = result.scalars().all()
        
        # Apply optional in-memory text search across name, company, email, phone
        if search and search.strip():
            query_str = search.strip().lower()
            leads = [
                lead for lead in leads
                if query_str in lead.full_name.lower() or
                   query_str in lead.company_name.lower() or
                   query_str in lead.email.lower() or
                   query_str in lead.phone.lower()
            ]
            
        return leads
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch lead inquiries: {str(exc)}"
        )

@router.patch("/leads/{lead_id}/status", response_model=LeadInquiryResponse)
async def update_lead_status(
    lead_id: int,
    payload: LeadStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Platform Admin Endpoint: Update lead follow-up status & operator notes.
    """
    try:
        stmt = select(LeadInquiry).where(LeadInquiry.id == lead_id)
        result = await db.execute(stmt)
        lead = result.scalar_one_or_none()
        
        if not lead:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Lead inquiry with ID {lead_id} not found."
            )
            
        lead.status = payload.status.upper()
        if payload.operator_notes is not None:
            lead.operator_notes = payload.operator_notes
            
        await db.commit()
        await db.refresh(lead)
        return lead
    except HTTPException:
        raise
    except Exception as exc:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update lead status: {str(exc)}"
        )
