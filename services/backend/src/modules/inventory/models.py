"""
The ssrone – Inventory Module
Product catalog, stock management, transfers, adjustments, low-stock alerts.
"""
from datetime import date
from decimal import Decimal
from enum import StrEnum

from sqlalchemy import BigInteger, Boolean, Date, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.core.database.models import TenantBaseModel


class StockMovementType(StrEnum):
    PURCHASE = "purchase"
    SALE = "sale"
    TRANSFER_IN = "transfer_in"
    TRANSFER_OUT = "transfer_out"
    ADJUSTMENT = "adjustment"
    WASTE = "waste"
    PRODUCTION = "production"
    OPENING = "opening"
    RETURN = "return"


class ProductCategory(TenantBaseModel):
    """Hierarchical product category."""
    __tablename__ = "product_categories"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    parent_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("product_categories.id"), nullable=True
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    products: Mapped[list["Product"]] = relationship("Product", back_populates="category")


class Product(TenantBaseModel):
    """Universal product model — food, room, service, or physical item."""
    __tablename__ = "products"

    name: Mapped[str] = mapped_column(String(300), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(100), nullable=False)
    barcode: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    short_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    category_id: Mapped[int | None] = mapped_column(
        BigInteger, ForeignKey("product_categories.id"), nullable=True
    )
    product_type: Mapped[str] = mapped_column(String(30), default="physical")
    # physical, food, room, service, combo, addon, gift_card, membership

    # Pricing
    mrp: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    cost_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    selling_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    online_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    wholesale_price: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)

    # Units
    unit_of_measure: Mapped[str] = mapped_column(String(20), default="pcs")
    secondary_unit: Mapped[str | None] = mapped_column(String(20), nullable=True)
    conversion_factor: Mapped[Decimal] = mapped_column(Numeric(10, 4), default=1)

    # Tax
    tax_group_id: Mapped[str | None] = mapped_column(String(50), nullable=True)
    hsn_code: Mapped[str | None] = mapped_column(String(10), nullable=True)

    # Inventory
    track_inventory: Mapped[bool] = mapped_column(Boolean, default=True)
    reorder_level: Mapped[Decimal | None] = mapped_column(Numeric(10, 3), nullable=True)
    reorder_quantity: Mapped[Decimal | None] = mapped_column(Numeric(10, 3), nullable=True)
    min_stock_level: Mapped[Decimal | None] = mapped_column(Numeric(10, 3), nullable=True)

    # Attributes
    images: Mapped[list] = mapped_column(JSONB, default=list)
    tags: Mapped[list] = mapped_column(JSONB, default=list)
    attributes: Mapped[dict] = mapped_column(JSONB, default=dict)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    is_available_online: Mapped[bool] = mapped_column(Boolean, default=True)
    is_available_pos: Mapped[bool] = mapped_column(Boolean, default=True)

    # Food-specific
    is_vegetarian: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    allergens: Mapped[list] = mapped_column(JSONB, default=list)
    preparation_time_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)

    category: Mapped["ProductCategory | None"] = relationship(
        "ProductCategory", back_populates="products"
    )
    stock_entries: Mapped[list["StockEntry"]] = relationship(
        "StockEntry", back_populates="product"
    )


class StockEntry(TenantBaseModel):
    """Current stock level per product per branch/warehouse."""
    __tablename__ = "stock_entries"

    product_id: Mapped[int] = mapped_column(
        BigInteger, ForeignKey("products.id"), nullable=False
    )
    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    quantity_on_hand: Mapped[Decimal] = mapped_column(Numeric(12, 3), default=0)
    quantity_reserved: Mapped[Decimal] = mapped_column(Numeric(12, 3), default=0)
    quantity_available: Mapped[Decimal] = mapped_column(Numeric(12, 3), default=0)
    average_cost: Mapped[Decimal] = mapped_column(Numeric(12, 4), default=0)

    product: Mapped["Product"] = relationship("Product", back_populates="stock_entries")


class StockMovement(TenantBaseModel):
    """Immutable record of every stock change."""
    __tablename__ = "stock_movements"

    product_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False, index=True)
    movement_type: Mapped[str] = mapped_column(String(30), nullable=False)
    quantity: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)
    unit_cost: Mapped[Decimal | None] = mapped_column(Numeric(12, 4), nullable=True)
    balance_after: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)
    reference_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    reference_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    batch_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    expiry_date: Mapped[str | None] = mapped_column(String(20), nullable=True)


class ProductionBatch(TenantBaseModel):
    """Daily Production Batch Logs for Inventory & Production FEFO Tracking."""
    __tablename__ = "production_batches"
    __table_args__ = (
        UniqueConstraint("tenant_id", "batch_number", name="uq_tenant_prod_batch"),
        {"extend_existing": True},
    )

    batch_number: Mapped[str] = mapped_column(String(50), nullable=False)
    item_type: Mapped[str] = mapped_column(String(50), default="FOOD", nullable=False)  # FOOD, SWEET, BAKERY, INGREDIENT
    item_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    quantity_produced: Mapped[Decimal] = mapped_column(Numeric(12, 3), nullable=False)
    unit: Mapped[str] = mapped_column(String(20), default="KG", nullable=False)
    production_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    chef_name: Mapped[str | None] = mapped_column(String(150), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="COMPLETED", nullable=False)

