"""
The ssrone – CRM Module
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

    company_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    branch_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    email: Mapped[str | None] = mapped_column(String(150), nullable=True)
    hashed_password: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address: Mapped[dict] = mapped_column(JSONB, default=dict)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    pincode: Mapped[str | None] = mapped_column(String(20), nullable=True)
    loyalty_points: Mapped[int] = mapped_column(Integer, default=0)

    @property
    def first_name(self) -> str:
        return self.name.split(" ")[0] if self.name else ""

    @property
    def last_name(self) -> str:
        parts = self.name.split(" ") if self.name else []
        return " ".join(parts[1:]) if len(parts) > 1 else ""

    loyalty_transactions: Mapped[list["LoyaltyTransaction"]] = relationship(
        "LoyaltyTransaction",
        primaryjoin="Customer.id == LoyaltyTransaction.customer_id",
        back_populates="customer",
    )
    interactions: Mapped[list["CustomerInteraction"]] = relationship(
        "CustomerInteraction",
        primaryjoin="Customer.id == CustomerInteraction.customer_id",
        back_populates="customer",
    )
    customer_addresses: Mapped[list["CustomerAddress"]] = relationship(
        "CustomerAddress",
        primaryjoin="Customer.id == CustomerAddress.customer_id",
        back_populates="customer",
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
    customer: Mapped["Customer"] = relationship(
        "Customer",
        primaryjoin="LoyaltyTransaction.customer_id == Customer.id",
        back_populates="loyalty_transactions",
    )


class CustomerAddress(TenantBaseModel):
    __tablename__ = "customer_addresses"

    customer_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("customers.id"), nullable=False, index=True
    )
    label: Mapped[str] = mapped_column(String(50), default="Home")
    flat_no: Mapped[str | None] = mapped_column(String(100), nullable=True)
    area_street: Mapped[str] = mapped_column(Text, nullable=False)
    landmark: Mapped[str | None] = mapped_column(String(150), nullable=True)
    city: Mapped[str] = mapped_column(String(100), default="Mahendragarh")
    state: Mapped[str | None] = mapped_column(String(100), default="Haryana")
    pincode: Mapped[str | None] = mapped_column(String(20), nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    customer: Mapped["Customer"] = relationship(
        "Customer",
        primaryjoin="CustomerAddress.customer_id == Customer.id",
        back_populates="customer_addresses",
    )


class CustomerInteraction(TenantBaseModel):
    __tablename__ = "customer_interactions"

    customer_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("customers.id"), nullable=False, index=True
    )
    interaction_type: Mapped[str] = mapped_column(String(50), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    customer: Mapped["Customer"] = relationship(
        "Customer",
        primaryjoin="CustomerInteraction.customer_id == Customer.id",
        back_populates="interactions",
    )


class Campaign(TenantBaseModel):
    __tablename__ = "campaigns"

    company_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    branch_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    channel: Mapped[str] = mapped_column(String(50), nullable=False)  # SMS, EMAIL, WHATSAPP, PUSH
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE")

