"""
Pydantic Schemas for Lead Inquiries.
"""
import re
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator

class LeadInquiryCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255, description="Full Name of prospect")
    company_name: str = Field(..., min_length=1, max_length=255, description="Business / Company Name")
    phone: str = Field(..., description="10-digit mobile number")
    email: str = Field(..., max_length=255, description="Email Address")
    vertical: Optional[str] = Field(default="restaurant", description="Business Vertical (restaurant, hotel, pg, retail)")
    outlet_count: Optional[str] = Field(default="1-3 Outlets", description="Estimated outlet / location count")
    preferred_date: Optional[str] = Field(default=None, description="Preferred Demo Date")
    preferred_time: Optional[str] = Field(default=None, description="Preferred Demo Time")
    inquiry_type: Optional[str] = Field(default="DEMO_REQUEST", description="DEMO_REQUEST or SALES_INQUIRY")
    notes: Optional[str] = Field(default=None, description="Additional customer notes or message")
    source: Optional[str] = Field(default="MARKETING_WEB", description="Lead acquisition source")

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        clean_phone = re.sub(r"\D", "", v or "")
        if len(clean_phone) > 10 and clean_phone.startswith("91"):
            clean_phone = clean_phone[2:]
        if len(clean_phone) != 10:
            raise ValueError("Mobile number must be exactly 10 digits (e.g. 9876543210)")
        return clean_phone

class LeadStatusUpdate(BaseModel):
    status: str = Field(..., description="NEW, CONTACTED, DEMO_SCHEDULED, CONVERTED, ARCHIVED")
    operator_notes: Optional[str] = Field(default=None, description="Superadmin follow-up notes")

class LeadInquiryResponse(BaseModel):
    id: int
    full_name: str
    company_name: str
    phone: str
    email: str
    vertical: str
    outlet_count: Optional[str] = None
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    inquiry_type: str
    status: str
    notes: Optional[str] = None
    operator_notes: Optional[str] = None
    source: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
