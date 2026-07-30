"""
The Baithak – CRM Module
Customer profiles, loyalty wallet, tiers, campaigns, interaction history.
"""
from datetime import date, datetime
from decimal import Decimal
from enum import StrEnum

from sqlalchemy import BigInteger, Boolean, Date, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database.models import TenantBaseModel


class CustomerTier(StrEnum):
    STANDARD = "standard"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"
    VIP = "vip"


class Customer(TenantBaseModel):
    __tablename__ = "customers"

    branch_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(20), nullable=True, index=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    anniversary_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(10), nullable=True)
    gstin: Mapped[str | None] = mapped_column(String(15), nullable=True)
    address: Mapped[dict] = mapped_column(JSONB, default=dict)
    tags: Mapped[list] = mapped_column(JSONB, default=list)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    preferences: Mapped[dict] = mapped_column(JSONB, default=dict)

    # Loyalty
    loyalty_tier: Mapped[str] = mapped_column(String(20), default=CustomerTier.STANDARD)
    loyalty_points: Mapped[int] = mapped_column(Integer, default=0)
    wallet_balance: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0)
    lifetime_spent: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)
    total_visits: Mapped[int] = mapped_column(Integer, default=0)
    last_visit_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    referral_code: Mapped[str | None] = mapped_column(String(20), nullable=True, unique=True)
    referred_by_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Consent (GDPR / DPDP)
    marketing_consent: Mapped[bool] = mapped_column(Boolean, default=False)
    sms_consent: Mapped[bool] = mapped_column(Boolean, default=False)
    whatsapp_consent: Mapped[bool] = mapped_column(Boolean, default=False)

    loyalty_transactions: Mapped[list["LoyaltyTransaction"]] = relationship(
        "LoyaltyTransaction", back_populates="customer"
    )
    interactions: Mapped[list["CustomerInteraction"]] = relationship(
        "CustomerInteraction", back_populates="customer"
    )


class LoyaltyTransaction(TenantBaseModel):
    __tablename__ = "loyalty_transactions"

    customer_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("customers.id"), nullable=False, index=True
    )
    transaction_type: Mapped[str] = mapped_column(String(20), nullable=False)
    # earn, redeem, expire, adjust, bonus
    points: Mapped[int] = mapped_column(Integer, nullable=False)
    points_balance: Mapped[int] = mapped_column(Integer, nullable=False)
    reference_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    reference_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str | None] = mapped_column(String(300), nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    customer: Mapped["Customer"] = relationship("Customer", back_populates="loyalty_transactions")


class CustomerInteraction(TenantBaseModel):
    __tablename__ = "customer_interactions"

    customer_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("customers.id"), nullable=False, index=True
    )
    interaction_type: Mapped[str] = mapped_column(String(30), nullable=False)
    # visit, call, email, complaint, feedback, enquiry
    channel: Mapped[str | None] = mapped_column(String(30), nullable=True)
    subject: Mapped[str | None] = mapped_column(String(300), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    sentiment: Mapped[str | None] = mapped_column(String(20), nullable=True)  # positive, neutral, negative
    follow_up_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    is_resolved: Mapped[bool] = mapped_column(Boolean, default=False)
    handled_by: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    customer: Mapped["Customer"] = relationship("Customer", back_populates="interactions")


class Campaign(TenantBaseModel):
    __tablename__ = "campaigns"

    branch_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    campaign_type: Mapped[str] = mapped_column(String(30), nullable=False)
    # sms, email, whatsapp, push, in_app
    status: Mapped[str] = mapped_column(String(20), default="draft")
    target_segment: Mapped[dict] = mapped_column(JSONB, default=dict)
    content: Mapped[dict] = mapped_column(JSONB, default=dict)
    scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    total_recipients: Mapped[int] = mapped_column(Integer, default=0)
    delivered_count: Mapped[int] = mapped_column(Integer, default=0)
    opened_count: Mapped[int] = mapped_column(Integer, default=0)
    clicked_count: Mapped[int] = mapped_column(Integer, default=0)
    budget: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    actual_cost: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
