"""
The Baithak – Restaurant Pydantic Schemas
Nested request/response models for categories, items, variants, addons, and tags.
"""
from typing import Any
from datetime import datetime
from pydantic import BaseModel, Field, model_validator


# ─── Variant Schemas ──────────────────────────────────────────

class MenuVariantOptionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    selling_price: float = 0.0
    price: float = 0.0
    is_default: bool = False
    is_available: bool = True
    sort_order: int = 1

    @model_validator(mode="before")
    @classmethod
    def fallback_selling_price(cls, data: Any) -> Any:
        if isinstance(data, dict):
            sp = data.get("selling_price", data.get("sellingPrice"))
            p = data.get("price")
            pa = data.get("price_adjustment", data.get("priceAdjustment"))
            r = data.get("rate")
            
            resolved = 0.0
            if sp is not None and float(sp) != 0.0:
                resolved = float(sp)
            elif p is not None and float(p) != 0.0:
                resolved = float(p)
            elif pa is not None and float(pa) != 0.0:
                resolved = float(pa)
            elif r is not None and float(r) != 0.0:
                resolved = float(r)
            
            data["selling_price"] = resolved
            data["price"] = resolved
        return data


class MenuVariantOptionResponse(BaseModel):
    id: int | str
    group_id: int | str = 0
    name: str
    selling_price: float = 0.0
    price: float = 0.0
    is_default: bool = False
    is_available: bool = True
    sort_order: int = 1
    model_config = {"from_attributes": True}


class MenuVariantGroupCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    min_selection: int = 1
    max_selection: int = 1
    is_required: bool = True
    sort_order: int = 1
    options: list[MenuVariantOptionCreate] = Field(default_factory=list)


class MenuVariantGroupResponse(BaseModel):
    id: int | str
    item_id: int | str = 0
    name: str
    min_selection: int = 1
    max_selection: int = 1
    is_required: bool = True
    sort_order: int = 1
    options: list[MenuVariantOptionResponse] = Field(default_factory=list)
    model_config = {"from_attributes": True}


# ─── Addon Schemas ────────────────────────────────────────────

class MenuAddonOptionCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    price: float = 0.0
    variant_prices: dict = Field(default_factory=dict)
    is_available: bool = True
    sort_order: int = 1


class MenuAddonOptionResponse(BaseModel):
    id: int | str
    group_id: int | str = 0
    name: str
    price: float = 0.0
    variant_prices: dict = Field(default_factory=dict)
    is_available: bool = True
    sort_order: int = 1
    model_config = {"from_attributes": True}


class MenuAddonGroupCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    min_selection: int = 0
    max_selection: int = 5
    sort_order: int = 1
    options: list[MenuAddonOptionCreate] = Field(default_factory=list)


class MenuAddonGroupResponse(BaseModel):
    id: int | str
    item_id: int | str = 0
    name: str
    min_selection: int = 0
    max_selection: int = 5
    sort_order: int = 1
    options: list[MenuAddonOptionResponse] = Field(default_factory=list)
    model_config = {"from_attributes": True}



# ─── Tag Schemas ──────────────────────────────────────────────

class MenuTagCreate(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    color: str | None = "#ef4444"
    icon: str | None = None


class MenuTagResponse(BaseModel):
    id: int
    name: str
    color: str | None
    icon: str | None
    model_config = {"from_attributes": True}


# ─── Category Schemas ─────────────────────────────────────────

class CategoryCreateSchema(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    icon: str | None = None
    slug: str | None = None
    parent_id: int | None = None
    level: int = 1
    sort_order: int = 1
    branch_id: int | None = None


class CategoryResponseSchema(BaseModel):
    id: int
    name: str
    icon: str | None = None
    slug: str | None = None
    parent_id: int | None = None
    level: int = 1
    sort_order: int = 1
    branch_id: int | None = None
    tenant_id: int
    model_config = {"from_attributes": True}



# ─── Menu Item Schemas ────────────────────────────────────────

class MenuItemCreateSchema(BaseModel):
    category_id: int
    name: str = Field(min_length=1, max_length=150)
    description: str | None = None
    short_description: str | None = None
    base_price: float = 0.0
    image_url: str | None = None
    images: list[str] = Field(default_factory=list)
    product_id: int | None = None
    kds_station: str | None = "Main"
    allergens: list[str] = Field(default_factory=list)
    nutrition: dict = Field(default_factory=dict)
    is_veg: bool = True
    is_popular: bool = False
    is_available: bool = True
    gst_percent: float = 5.0
    sort_order: int = 1
    tag_ids: list[int] = Field(default_factory=list)
    variant_groups: list[MenuVariantGroupCreate] = Field(default_factory=list)
    addon_groups: list[MenuAddonGroupCreate] = Field(default_factory=list)
    branch_id: int | None = None


class MenuItemResponseSchema(BaseModel):
    id: int
    category_id: int
    name: str
    description: str | None
    short_description: str | None = None
    base_price: float
    image_url: str | None
    images: list[str] = Field(default_factory=list)
    product_id: int | None = None
    kds_station: str | None = None
    allergens: list[str] = Field(default_factory=list)
    nutrition: dict = Field(default_factory=dict)
    is_veg: bool
    is_popular: bool
    is_available: bool
    gst_percent: float
    sort_order: int = 1
    branch_id: int | None
    tenant_id: int
    tags: list[str] = Field(default_factory=list)
    variant_groups: list[MenuVariantGroupResponse] = Field(default_factory=list)
    addon_groups: list[MenuAddonGroupResponse] = Field(default_factory=list)
    model_config = {"from_attributes": True}
