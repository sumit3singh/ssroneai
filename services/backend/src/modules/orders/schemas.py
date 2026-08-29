"""
The ssrone – Orders & KOT Pydantic Schemas
"""
from datetime import datetime
from decimal import Decimal
from typing import Any
from pydantic import BaseModel, Field


# ─── Dining Table Schemas ─────────────────────────────────────

class DiningTableSchema(BaseModel):
    id: int
    branch_id: int
    table_number: str
    name: str | None = None
    capacity: int = 4
    status: str = "free"
    floor: str | None = None
    sort_order: int = 0
    is_active: bool = True
    model_config = {"from_attributes": True}


# ─── Kitchen Station Schemas ──────────────────────────────────

class KitchenStationSchema(BaseModel):
    id: int
    branch_id: int
    name: str
    code: str
    printer_name: str | None = None
    is_active: bool = True
    sort_order: int = 0
    model_config = {"from_attributes": True}


# ─── KOT Schemas ──────────────────────────────────────────────

class KOTItemResponseSchema(BaseModel):
    id: int
    kot_id: int
    order_item_id: int
    quantity: Decimal
    status: str
    notes: str | None = None
    model_config = {"from_attributes": True}


class KOTResponseSchema(BaseModel):
    id: int
    branch_id: int
    order_id: int
    kot_number: str
    station_id: int | None = None
    station_name: str | None = None
    status: str
    printed_at: datetime | None = None
    items: list[KOTItemResponseSchema] = Field(default_factory=list)
    created_at: datetime
    model_config = {"from_attributes": True}


# ─── Action Request Schemas ───────────────────────────────────

class HoldOrderSchema(BaseModel):
    reason: str | None = "Customer requested hold"


class VoidOrderSchema(BaseModel):
    item_id: int | None = Field(default=None, description="Optional specific order item ID to void; if null, voids entire order")
    reason: str = Field(min_length=3, description="Mandatory reason for voiding")


class SplitOrderItemInput(BaseModel):
    order_item_id: int
    quantity: Decimal = Field(gt=0)


class SplitOrderSchema(BaseModel):
    items: list[SplitOrderItemInput] = Field(min_length=1, description="Items to split into new child sub-order")
    reason: str | None = "Split bill requested"


class OrderStatusLogSchema(BaseModel):
    id: int
    order_id: int
    old_status: str | None = None
    new_status: str
    changed_by: int | None = None
    notes: str | None = None
    created_at: datetime
    model_config = {"from_attributes": True}
