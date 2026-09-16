"""
SQLAlchemy ORM Models for Lead Inquiries & Demo Requests.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, BigInteger, String, Text, DateTime
from src.core.database.models import Base

class LeadInquiry(Base):
    __tablename__ = "lead_inquiries"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    full_name = Column(String(255), nullable=False)
    company_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    vertical = Column(String(50), nullable=False, default="restaurant")
    outlet_count = Column(String(50), nullable=True, default="1-3 Outlets")
    preferred_date = Column(String(50), nullable=True)
    preferred_time = Column(String(50), nullable=True)
    inquiry_type = Column(String(50), nullable=False, default="DEMO_REQUEST") # 'DEMO_REQUEST' | 'SALES_INQUIRY'
    status = Column(String(50), nullable=False, default="NEW", index=True) # 'NEW' | 'CONTACTED' | 'DEMO_SCHEDULED' | 'CONVERTED' | 'ARCHIVED'
    notes = Column(Text, nullable=True)
    operator_notes = Column(Text, nullable=True)
    source = Column(String(100), nullable=True, default="MARKETING_WEB")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "company_name": self.company_name,
            "phone": self.phone,
            "email": self.email,
            "vertical": self.vertical,
            "outlet_count": self.outlet_count,
            "preferred_date": self.preferred_date,
            "preferred_time": self.preferred_time,
            "inquiry_type": self.inquiry_type,
            "status": self.status,
            "notes": self.notes,
            "operator_notes": self.operator_notes,
            "source": self.source,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
