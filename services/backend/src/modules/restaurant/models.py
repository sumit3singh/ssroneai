"""
The ssrone – Restaurant & Menu Models
Enterprise, multi-tenant, normalized relational database models for Categories, Items, Variants, Addons, and Tags.
"""
from datetime import datetime
from typing import Any
from sqlalchemy import String, Integer, BigInteger, Boolean, Float, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import JSONB
from src.core.database.engine import Base
from src.core.database.models import TenantMixin, AuditMixin, SoftDeleteMixin


class BigIntMixin:
    """Primary key using auto-incrementing BigInteger."""
    id: Mapped[int] = mapped_column(
        BigInteger,
        primary_key=True,
        autoincrement=True,
        index=True,
    )


class BigIntTenantBaseModel(BigIntMixin, TenantMixin, AuditMixin, SoftDeleteMixin, Base):
    """
    Abstract base for tenant-scoped models with BigInteger primary keys.
    """
    __abstract__ = True
    __table_args__ = {"extend_existing": True}

    company_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)

    def to_dict(self) -> dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class MenuCategory(BigIntTenantBaseModel):
    """
    Menu Categories (e.g. Starters, Breads, Indian Main Course)
    Tenant-wise and Branch-wise isolated.
    """
    __tablename__ = "menu_categories"

    company_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    branch_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)

    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)
    slug: Mapped[str | None] = mapped_column(String(100), nullable=True)
    parent_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("menu_categories.id", ondelete="SET NULL"), nullable=True)
    level: Mapped[int] = mapped_column(Integer, default=1)
    sort_order: Mapped[int] = mapped_column(Integer, default=1)

    items: Mapped[list["MenuItem"]] = relationship("MenuItem", back_populates="category", cascade="all, delete-orphan")


class MenuTag(BigIntTenantBaseModel):
    """
    Menu Tags (e.g. Spicy, Bestseller, Chef Special, Jain)
    """
    __tablename__ = "menu_tags"

    branch_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    color: Mapped[str | None] = mapped_column(String(20), default="#ef4444")
    icon: Mapped[str | None] = mapped_column(String(50), nullable=True)


class MenuItemTag(Base):
    """Junction table linking MenuItem and MenuTag."""
    __tablename__ = "menu_item_tags"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    tenant_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    company_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    branch_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    item_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("menu_items.id", ondelete="CASCADE"), nullable=False, index=True)
    tag_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("menu_tags.id", ondelete="CASCADE"), nullable=False, index=True)

    tag: Mapped[MenuTag] = relationship("MenuTag", lazy="selectin")


class MenuItem(BigIntTenantBaseModel):
    """
    Menu Items (e.g. Kurkure Momos, Paneer Butter Masala)
    Tenant-wise and Branch-wise isolated.
    """
    __tablename__ = "menu_items"

    branch_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    category_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("menu_categories.id", ondelete="CASCADE"), nullable=False)
    item_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    short_description: Mapped[str | None] = mapped_column(String(200), nullable=True)
    
    price: Mapped[float | None] = mapped_column("price", Float, default=0.0, nullable=True)
    cost_price: Mapped[float | None] = mapped_column("cost_price", Float, default=0.0, nullable=True)
    tax_rate: Mapped[float | None] = mapped_column("tax_rate", Float, default=5.0, nullable=True)
    
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    images: Mapped[list] = mapped_column(JSONB, default=list, nullable=True)
    product_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("products.id", ondelete="SET NULL"), nullable=True, index=True)
    kds_station: Mapped[str | None] = mapped_column(String(50), nullable=True)  # e.g. Tandoor, Chinese, Main, Beverages
    allergens: Mapped[list] = mapped_column(JSONB, default=list, nullable=True)
    nutrition: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=True)
    is_veg: Mapped[bool] = mapped_column(Boolean, default=True, nullable=True)
    is_popular: Mapped[bool] = mapped_column(Boolean, default=False, nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=True)
    packaging_charge: Mapped[float] = mapped_column(Float, default=0.0, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=1, nullable=True)

    @property
    def base_price(self) -> float:
        return float(self.price or 0.0)

    @base_price.setter
    def base_price(self, val: float):
        self.price = float(val) if val is not None else 0.0

    @property
    def gst_percent(self) -> float:
        return float(self.tax_rate or 5.0)

    @gst_percent.setter
    def gst_percent(self, val: float):
        self.tax_rate = float(val) if val is not None else 5.0

    # Relationships
    category: Mapped[MenuCategory] = relationship("MenuCategory", back_populates="items")
    variant_groups_rel: Mapped[list["MenuVariantGroup"]] = relationship(
        "MenuVariantGroup",
        back_populates="item",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="MenuVariantGroup.sort_order"
    )
    addon_groups_rel: Mapped[list["MenuAddonGroup"]] = relationship(
        "MenuAddonGroup",
        back_populates="item",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="MenuAddonGroup.sort_order"
    )
    item_tags_rel: Mapped[list[MenuItemTag]] = relationship(
        "MenuItemTag",
        cascade="all, delete-orphan",
        lazy="selectin"
    )


class MenuVariantGroup(BigIntTenantBaseModel):
    """
    Variant Group for a Menu Item (e.g., Portion Size, Crust Type)
    """
    __tablename__ = "menu_variant_groups"

    branch_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    item_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("menu_items.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    min_selection: Mapped[int] = mapped_column(Integer, default=1)
    max_selection: Mapped[int] = mapped_column(Integer, default=1)
    is_required: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=1)

    item: Mapped[MenuItem] = relationship("MenuItem", back_populates="variant_groups_rel")
    options: Mapped[list["MenuVariantOption"]] = relationship(
        "MenuVariantOption",
        back_populates="group",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="MenuVariantOption.sort_order"
    )


class MenuVariantOption(BigIntTenantBaseModel):
    """
    Specific option within a Variant Group using absolute selling price (e.g., Small = 200, Medium = 250, Large = 300)
    """
    __tablename__ = "menu_variant_options"

    branch_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    group_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("menu_variant_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    selling_price: Mapped[float] = mapped_column(Float, default=0.0)
    price: Mapped[float] = mapped_column(Float, default=0.0)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=1)

    group: Mapped[MenuVariantGroup] = relationship("MenuVariantGroup", back_populates="options")


class MenuAddonGroup(BigIntTenantBaseModel):
    """
    Addon Group for a Menu Item (e.g., Extra Dips, Beverage Upgrade)
    """
    __tablename__ = "menu_addon_groups"

    branch_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    item_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("menu_items.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    min_selection: Mapped[int] = mapped_column(Integer, default=0)
    max_selection: Mapped[int] = mapped_column(Integer, default=5)
    sort_order: Mapped[int] = mapped_column(Integer, default=1)

    item: Mapped[MenuItem] = relationship("MenuItem", back_populates="addon_groups_rel")
    options: Mapped[list["MenuAddonOption"]] = relationship(
        "MenuAddonOption",
        back_populates="group",
        cascade="all, delete-orphan",
        lazy="selectin",
        order_by="MenuAddonOption.sort_order"
    )


class MenuAddonOption(BigIntTenantBaseModel):
    """
    Specific option within an Addon Group (e.g., Cheese Dip (+30), Mint Sauce (+20))
    """
    __tablename__ = "menu_addon_options"

    branch_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    group_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("menu_addon_groups.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    price: Mapped[float] = mapped_column(Float, default=0.0)
    variant_prices: Mapped[dict] = mapped_column(JSONB, default=dict)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=1)

    group: Mapped[MenuAddonGroup] = relationship("MenuAddonGroup", back_populates="options")


class PaymentMode(BigIntTenantBaseModel):
    """
    Payment Settlement Modes (e.g. Cash, UPI / QR, Credit Card, Pay Later)
    """
    __tablename__ = "payment_modes"

    branch_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    code: Mapped[str] = mapped_column(String(30), nullable=False)
    icon: Mapped[str | None] = mapped_column(String(50), default="💳")
    payment_type: Mapped[str] = mapped_column(String(50), default="cash")
    qr_code_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class PosShift(BigIntTenantBaseModel):
    """
    POS Cash Drawer & Shift Management.
    """
    __tablename__ = "pos_shifts"

    branch_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)
    shift_number: Mapped[str] = mapped_column(String(50), nullable=False)
    cashier_name: Mapped[str] = mapped_column(String(100), nullable=False, default="Cashier Admin")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="open")  # open, closed
    opening_cash: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    closing_cash: Mapped[float | None] = mapped_column(Float, nullable=True)
    expected_cash: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    cash_sales: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    upi_sales: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    card_sales: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    total_sales: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    pay_ins: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    pay_outs: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    variance: Mapped[float | None] = mapped_column(Float, nullable=True)
    opened_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    transactions: Mapped[list["PosShiftTransaction"]] = relationship("PosShiftTransaction", back_populates="shift", cascade="all, delete-orphan")


class PosShiftTransaction(BigIntTenantBaseModel):
    """
    Drawer audit log for Pay-In, Pay-Out, and Cash Sales.
    """
    __tablename__ = "pos_shift_transactions"

    shift_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("pos_shifts.id", ondelete="CASCADE"), nullable=False, index=True)
    type: Mapped[str] = mapped_column(String(30), nullable=False)  # OPENING, CASH_SALE, PAY_IN, PAY_OUT, SHIFT_CLOSE
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    payment_mode: Mapped[str] = mapped_column(String(30), default="CASH")
    reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    performed_by: Mapped[str] = mapped_column(String(100), default="Cashier Admin")

    shift: Mapped[PosShift] = relationship("PosShift", back_populates="transactions")



