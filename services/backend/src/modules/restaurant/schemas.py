"""
The ssrone – Restaurant Pydantic Schemas
Nested request/response models for categories, items, variants, addons, and tags.
"""
from datetime import datetime
from typing import Any
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
            if "isDefault" in data and "is_default" not in data:
                data["is_default"] = data["isDefault"]
            if "isAvailable" in data and "is_available" not in data:
                data["is_available"] = data["isAvailable"]
            if "sortOrder" in data and "sort_order" not in data:
                data["sort_order"] = data["sortOrder"]
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

    @model_validator(mode="before")
    @classmethod
    def camel_case_fallbacks(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "minSelection" in data and "min_selection" not in data:
                data["min_selection"] = data["minSelection"]
            if "maxSelection" in data and "max_selection" not in data:
                data["max_selection"] = data["maxSelection"]
            if "isRequired" in data and "is_required" not in data:
                data["is_required"] = data["isRequired"]
            if "sortOrder" in data and "sort_order" not in data:
                data["sort_order"] = data["sortOrder"]
        return data


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

    @model_validator(mode="before")
    @classmethod
    def camel_case_fallbacks(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "variantPrices" in data and "variant_prices" not in data:
                data["variant_prices"] = data["variantPrices"]
            if "isAvailable" in data and "is_available" not in data:
                data["is_available"] = data["isAvailable"]
            if "sortOrder" in data and "sort_order" not in data:
                data["sort_order"] = data["sortOrder"]
        return data


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

    @model_validator(mode="before")
    @classmethod
    def camel_case_fallbacks(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "minSelection" in data and "min_selection" not in data:
                data["min_selection"] = data["minSelection"]
            if "maxSelection" in data and "max_selection" not in data:
                data["max_selection"] = data["maxSelection"]
            if "sortOrder" in data and "sort_order" not in data:
                data["sort_order"] = data["sortOrder"]
        return data


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
    color: str | None = None
    slug: str | None = None
    parent_id: int | None = None
    level: int = 1
    sort_order: int = 1
    company_id: int | None = None
    branch_id: int | None = None


class CategoryResponseSchema(BaseModel):
    id: int
    name: str
    icon: str | None = "🍛"
    color: str | None = None
    slug: str | None = None
    parent_id: int | None = None
    level: int = 1
    sort_order: int = 1
    company_id: int | None = None
    branch_id: int | None = None
    tenant_id: int = 1
    model_config = {"from_attributes": True}


# ─── Menu Item Schemas ────────────────────────────────────────

class MenuItemCreateSchema(BaseModel):
    category_id: int
    name: str = Field(min_length=1, max_length=150)
    item_code: str | None = None
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
    packaging_charge: float = 0.0
    sort_order: int = 1
    tag_ids: list[int] = Field(default_factory=list)
    variant_groups: list[MenuVariantGroupCreate] = Field(default_factory=list)
    addon_groups: list[MenuAddonGroupCreate] = Field(default_factory=list)
    branch_id: int | None = None
    company_id: int | None = None

    @model_validator(mode="before")
    @classmethod
    def camel_case_fallbacks(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "categoryId" in data and "category_id" not in data:
                data["category_id"] = data["categoryId"]
            if "itemCode" in data and "item_code" not in data:
                data["item_code"] = data["itemCode"]
            if "shortDescription" in data and "short_description" not in data:
                data["short_description"] = data["shortDescription"]
            bp = data.get("base_price", data.get("basePrice", data.get("selling_price", data.get("sellingPrice", data.get("price")))))
            if bp is not None:
                data["base_price"] = float(bp)
            pc = data.get("packaging_charge", data.get("packagingCharge"))
            if pc is not None:
                data["packaging_charge"] = float(pc)
            if "imageUrl" in data and "image_url" not in data:
                data["image_url"] = data["imageUrl"]
            if "productId" in data and "product_id" not in data:
                data["product_id"] = data["productId"]
            if "kdsStation" in data and "kds_station" not in data:
                data["kds_station"] = data["kdsStation"]
            if "isVeg" in data and "is_veg" not in data:
                data["is_veg"] = data["isVeg"]
            if "isPopular" in data and "is_popular" not in data:
                data["is_popular"] = data["isPopular"]
            if "isAvailable" in data and "is_available" not in data:
                data["is_available"] = data["isAvailable"]
            if "gstPercent" in data and "gst_percent" not in data:
                data["gst_percent"] = data["gstPercent"]
            if "sortOrder" in data and "sort_order" not in data:
                data["sort_order"] = data["sortOrder"]
            if "variantGroups" in data and "variant_groups" not in data:
                data["variant_groups"] = data["variantGroups"]
            if "addonGroups" in data and "addon_groups" not in data:
                data["addon_groups"] = data["addonGroups"]
            if "branchId" in data and "branch_id" not in data:
                data["branch_id"] = data["branchId"]
            if "companyId" in data and "company_id" not in data:
                data["company_id"] = data["companyId"]
        return data


class MenuItemResponseSchema(BaseModel):
    id: int
    category_id: int | None = 1
    name: str = "Unnamed Dish"
    item_code: str | None = None
    description: str | None = None
    short_description: str | None = None
    base_price: float = 0.0
    selling_price: float = 0.0
    image_url: str | None = None
    images: list[str] = Field(default_factory=list)
    product_id: int | None = None
    kds_station: str | None = "Main Kitchen"
    allergens: list[str] = Field(default_factory=list)
    nutrition: dict = Field(default_factory=dict)
    is_veg: bool = True
    is_popular: bool = False
    is_available: bool = True
    gst_percent: float = 5.0
    packaging_charge: float = 0.0
    sort_order: int = 1
    branch_id: int | None = 1
    tenant_id: int = 1
    tags: list[str] = Field(default_factory=list)
    variant_groups: list[MenuVariantGroupResponse] = Field(default_factory=list)
    addon_groups: list[MenuAddonGroupResponse] = Field(default_factory=list)
    model_config = {"from_attributes": True}


# ─── Table Schemas ───────────────────────────────────────────

class TableCreateSchema(BaseModel):
    table_number: str = Field(min_length=1, max_length=50)
    capacity: int = 4
    section: str | None = None
    floor: str | None = None
    branch_id: int | None = 1
    sort_order: int = 0

    @model_validator(mode="before")
    @classmethod
    def camel_case_fallbacks(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "tableNumber" in data and "table_number" not in data:
                data["table_number"] = data["tableNumber"]
            if "branchId" in data and "branch_id" not in data:
                data["branch_id"] = data["branchId"]
            if "sortOrder" in data and "sort_order" not in data:
                data["sort_order"] = data["sortOrder"]
        return data


class TableResponseSchema(BaseModel):
    id: int
    table_number: str
    capacity: int = 4
    section: str | None = None
    floor: str | None = None
    status: str = "free"
    is_active: bool = True
    branch_id: int | None = 1
    tenant_id: int = 1
    model_config = {"from_attributes": True}


# ─── Kitchen Station Schemas ──────────────────────────────────

class KitchenStationCreateSchema(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    code: str = Field(min_length=1, max_length=30)
    printer_name: str | None = "192.168.1.101"
    station_type: str = "main"
    categories: list[Any] = Field(default_factory=list)
    is_active: bool = True
    sort_order: int = 0
    branch_id: int | None = 1

    @model_validator(mode="before")
    @classmethod
    def camel_case_fallbacks(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "printerName" in data and "printer_name" not in data:
                data["printer_name"] = data["printerName"]
            if "printerIp" in data and "printer_name" not in data:
                data["printer_name"] = data["printerIp"]
            if "stationType" in data and "station_type" not in data:
                data["station_type"] = data["stationType"]
            if "isActive" in data and "is_active" not in data:
                data["is_active"] = data["isActive"]
            if "sortOrder" in data and "sort_order" not in data:
                data["sort_order"] = data["sortOrder"]
            if "branchId" in data and "branch_id" not in data:
                data["branch_id"] = data["branchId"]
        return data


class KitchenStationResponseSchema(BaseModel):
    id: int
    name: str
    code: str
    printer_name: str | None = "192.168.1.101"
    station_type: str = "main"
    categories: list[Any] = Field(default_factory=list)
    is_active: bool = True
    sort_order: int = 0
    branch_id: int | None = 1
    tenant_id: int = 1
    model_config = {"from_attributes": True}


# ─── Payment Mode Schemas ─────────────────────────────────────

class PaymentModeCreateSchema(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    code: str = Field(min_length=1, max_length=30)
    icon: str | None = "💳"
    payment_type: str = "cash"
    qr_code_url: str | None = None
    is_active: bool = True
    sort_order: int = 0
    branch_id: int | None = 1

    @model_validator(mode="before")
    @classmethod
    def camel_case_fallbacks(cls, data: Any) -> Any:
        if isinstance(data, dict):
            if "paymentType" in data and "payment_type" not in data:
                data["payment_type"] = data["paymentType"]
            if "qrCodeUrl" in data and "qr_code_url" not in data:
                data["qr_code_url"] = data["qrCodeUrl"]
            if "isActive" in data and "is_active" not in data:
                data["is_active"] = data["isActive"]
            if "sortOrder" in data and "sort_order" not in data:
                data["sort_order"] = data["sortOrder"]
            if "branchId" in data and "branch_id" not in data:
                data["branch_id"] = data["branchId"]
        return data


class PaymentModeResponseSchema(BaseModel):
    id: int
    name: str
    code: str
    icon: str | None = "💳"
    payment_type: str = "cash"
    qr_code_url: str | None = None
    is_active: bool = True
    sort_order: int = 0
    branch_id: int | None = 1
    tenant_id: int = 1
    model_config = {"from_attributes": True}


# ─── POS Shift & Cash Drawer Schemas ──────────────────────────

class PosShiftOpenSchema(BaseModel):
    opening_cash: float = 0.0
    notes: str | None = None
    cashier_name: str | None = "Baithak Admin"


class PosShiftCloseSchema(BaseModel):
    closing_cash: float = 0.0
    notes: str | None = None


class PosShiftPayInOutSchema(BaseModel):
    type: str = Field(description="PAY_IN or PAY_OUT")
    amount: float = Field(gt=0, description="Amount to add or deduct from drawer")
    reason: str = Field(min_length=1, description="Reason for pay-in/pay-out")
    performed_by: str | None = "Baithak Admin"


class PosShiftTransactionResponseSchema(BaseModel):
    id: int
    shift_id: int
    type: str
    amount: float
    payment_mode: str = "CASH"
    reason: str | None = None
    performed_by: str = "Baithak Admin"
    created_at: datetime | None = None
    model_config = {"from_attributes": True}


class PosShiftResponseSchema(BaseModel):
    id: int
    shift_number: str
    cashier_name: str
    status: str
    opening_cash: float
    closing_cash: float | None = None
    expected_cash: float = 0.0
    cash_sales: float = 0.0
    upi_sales: float = 0.0
    card_sales: float = 0.0
    total_sales: float = 0.0
    pay_ins: float = 0.0
    pay_outs: float = 0.0
    variance: float | None = None
    opened_at: datetime
    closed_at: datetime | None = None
    notes: str | None = None
    transactions: list[PosShiftTransactionResponseSchema] = Field(default_factory=list)
    model_config = {"from_attributes": True}




