"""
The Baithak – Restaurant & Menu Models
Enterprise, multi-tenant, normalized relational database models for Categories, Items, Variants, Addons, and Tags.
"""
from typing import Any
from sqlalchemy import String, Integer, BigInteger, Boolean, Float, ForeignKey
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

    company_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True, index=True)

    def to_dict(self) -> dict[str, Any]:
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}


class MenuCategory(BigIntTenantBaseModel):
    """
    Menu Categories (e.g. Starters, Breads, Indian Main Course)
    Tenant-wise and Branch-wise isolated.
    """
    __tablename__ = "menu_categories"

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
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    short_description: Mapped[str | None] = mapped_column(String(200), nullable=True)
    base_price: Mapped[float] = mapped_column(Float, default=0.0)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    images: Mapped[list] = mapped_column(JSONB, default=list)
    product_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    kds_station: Mapped[str | None] = mapped_column(String(50), nullable=True)  # e.g. Tandoor, Chinese, Main, Beverages
    allergens: Mapped[list] = mapped_column(JSONB, default=list)
    nutrition: Mapped[dict] = mapped_column(JSONB, default=dict)
    is_veg: Mapped[bool] = mapped_column(Boolean, default=True)
    is_popular: Mapped[bool] = mapped_column(Boolean, default=False)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True)
    gst_percent: Mapped[float] = mapped_column(Float, default=5.0)
    sort_order: Mapped[int] = mapped_column(Integer, default=1)

    # Legacy JSONB fallback columns
    tags: Mapped[list] = mapped_column(JSONB, default=list)
    variant_groups: Mapped[list] = mapped_column(JSONB, default=list)
    addon_groups: Mapped[list] = mapped_column(JSONB, default=list)

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

