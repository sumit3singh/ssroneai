"""
The Baithak – Restaurant Module
Table management, KDS (Kitchen Display System), fast-billing POS.
WebSocket broadcasts order events to kitchen screens in real-time.
"""
from datetime import datetime, timezone
from enum import StrEnum

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from sqlalchemy import BigInteger, Boolean, ForeignKey, Integer, String, select
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database.engine import get_db_session
from src.core.database.models import TenantBaseModel
from src.core.event_bus.bus import event_bus
from src.modules.auth.dependencies import get_current_user, get_optional_user
from src.modules.auth.models import User
from src.shared.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/restaurant", tags=["Restaurant"])


# ─── Models ──────────────────────────────────────────────────

class TableStatus(StrEnum):
    FREE = "free"
    OCCUPIED = "occupied"
    RESERVED = "reserved"
    BILLING = "billing"
    CLEANING = "cleaning"


class RestaurantTable(TenantBaseModel):
    __tablename__ = "restaurant_tables"
    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    table_number: Mapped[str] = mapped_column(String(20), nullable=False)
    capacity: Mapped[int] = mapped_column(Integer, default=4)
    section: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default=TableStatus.FREE)
    current_order_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    position_x: Mapped[int] = mapped_column(Integer, default=0)
    position_y: Mapped[int] = mapped_column(Integer, default=0)
    attributes: Mapped[dict] = mapped_column(JSONB, default=dict)


class KDSStation(TenantBaseModel):
    """Kitchen Display System station — each station shows specific categories."""
    __tablename__ = "kds_stations"
    branch_id: Mapped[int] = mapped_column(BigInteger, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    station_type: Mapped[str] = mapped_column(String(50), default="main")
    categories: Mapped[list] = mapped_column(JSONB, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


# ─── WebSocket KDS Manager ────────────────────────────────────

class KDSConnectionManager:
    """Manages WebSocket connections for all KDS screens."""

    def __init__(self):
        # branch_id -> list of WebSocket connections
        self.connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, branch_id: str):
        await websocket.accept()
        self.connections.setdefault(branch_id, []).append(websocket)
        logger.info("KDS connected", branch_id=branch_id, total=len(self.connections[branch_id]))

    def disconnect(self, websocket: WebSocket, branch_id: str):
        if branch_id in self.connections:
            self.connections[branch_id] = [
                ws for ws in self.connections[branch_id] if ws != websocket
            ]

    async def broadcast_to_branch(self, branch_id: str, message: dict):
        """Send a message to all KDS screens in a branch (< 1 second per blueprint SLA)."""
        import json
        connections = self.connections.get(branch_id, [])
        disconnected = []
        for ws in connections:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                disconnected.append(ws)
        for ws in disconnected:
            self.disconnect(ws, branch_id)


kds_manager = KDSConnectionManager()


# ─── Schemas ─────────────────────────────────────────────────

class TableResponse(BaseModel):
    id: int
    table_number: str
    capacity: int
    section: str | None
    status: str
    is_active: bool
    model_config = {"from_attributes": True}


class UpdateTableStatusSchema(BaseModel):
    status: str
    current_order_id: int | None = None


# ─── Routes ──────────────────────────────────────────────────

@router.get("/tables", response_model=list[TableResponse])
async def list_tables(
    branch_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[TableResponse]:
    query = select(RestaurantTable).where(
        RestaurantTable.tenant_id == current_user.tenant_id,
        RestaurantTable.is_deleted == False,
        RestaurantTable.is_active == True,
    )
    if branch_id:
        query = query.where(RestaurantTable.branch_id == branch_id)
    result = await db.execute(query)
    return [TableResponse.model_validate(t) for t in result.scalars().all()]


class WaiterResponse(BaseModel):
    id: int
    name: str
    code: str
    is_active: bool = True


@router.get("/waiters", response_model=list[WaiterResponse])
async def list_waiters(
    branch_id: int | None = None,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[WaiterResponse]:
    tenant_id = current_user.tenant_id if current_user else 1
    stmt = select(User).where(
        User.tenant_id == tenant_id,
        User.is_active == True
    )
    res = await db.execute(stmt)
    users = res.scalars().all()
    if users and len(users) > 0:
        return [
            WaiterResponse(
                id=u.id,
                name=u.display_name or f"{u.first_name} {u.last_name}".strip(),
                code=f"W{u.id}",
                is_active=u.is_active
            )
            for u in users
        ]
    return [
        WaiterResponse(id=1, name="Suman Lata", code="W1", is_active=True),
        WaiterResponse(id=2, name="Vijay Singh", code="W2", is_active=True),
        WaiterResponse(id=3, name="Ramesh Kumar", code="W3", is_active=True),
    ]


@router.patch("/tables/{table_id}/status")
async def update_table_status(
    table_id: int,
    body: UpdateTableStatusSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    result = await db.execute(
        select(RestaurantTable).where(
            RestaurantTable.id == table_id,
            RestaurantTable.tenant_id == current_user.tenant_id,
        )
    )
    table = result.scalar_one_or_none()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    table.status = body.status
    table.current_order_id = body.current_order_id
    table.updated_by = current_user.id
    return {"message": "Table status updated", "status": body.status}


@router.post("/tables", status_code=201)
async def create_table(
    branch_id: int,
    table_number: str,
    capacity: int = 4,
    section: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    table = RestaurantTable(
        tenant_id=current_user.tenant_id,
        branch_id=branch_id,
        table_number=table_number,
        capacity=capacity,
        section=section,
        status=TableStatus.FREE,
        created_by=current_user.id,
    )
    db.add(table)
    await db.flush()
    return {"id": str(table.id), "table_number": table_number}


# ─── KDS WebSocket ────────────────────────────────────────────

@router.websocket("/kds/{branch_id}")
async def kds_websocket(websocket: WebSocket, branch_id: str):
    """
    WebSocket endpoint for Kitchen Display System screens.
    Receives real-time order events dispatched via Event Bus.
    Target: < 1 second dispatch (per blueprint SLA).
    """
    await kds_manager.connect(websocket, branch_id)
    try:
        # Send connection confirmation
        await websocket.send_json({
            "type": "connected",
            "branch_id": branch_id,
            "message": "KDS connected — awaiting orders",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        while True:
            # Keep connection alive; client can send ping
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        kds_manager.disconnect(websocket, branch_id)
        logger.info("KDS disconnected", branch_id=branch_id)


# ─── Menu Categories, Items & Tags CRUD ─────────────────────────
from src.modules.restaurant.models import (
    MenuCategory,
    MenuItem,
    MenuVariantGroup,
    MenuVariantOption,
    MenuAddonGroup,
    MenuAddonOption,
    MenuTag,
    MenuItemTag,
)
from src.modules.restaurant.schemas import (
    CategoryCreateSchema,
    CategoryResponseSchema,
    MenuItemCreateSchema,
    MenuItemResponseSchema,
    MenuTagCreate,
    MenuTagResponse,
)


def _build_menu_item_response(item: MenuItem) -> dict:
    """Build dictionary matching MenuItemResponseSchema from relational ORM structure or legacy JSONB fallback."""
    # Variant groups
    vg_list = []
    if isinstance(getattr(item, "variant_groups_rel", None), list) and item.variant_groups_rel:
        for vg in item.variant_groups_rel:
            if not getattr(vg, "is_deleted", False):
                vg_list.append({
                    "id": vg.id,
                    "item_id": vg.item_id,
                    "name": vg.name,
                    "min_selection": vg.min_selection,
                    "max_selection": vg.max_selection,
                    "is_required": vg.is_required,
                    "sort_order": vg.sort_order,
                    "options": [
                        {
                            "id": opt.id,
                            "group_id": opt.group_id,
                            "name": opt.name,
                            "selling_price": getattr(opt, "selling_price", 0.0) or getattr(opt, "price", 0.0),
                            "price": getattr(opt, "selling_price", 0.0) or getattr(opt, "price", 0.0),
                            "is_default": opt.is_default,
                            "is_available": opt.is_available,
                            "sort_order": opt.sort_order,
                        }
                        for opt in (vg.options or []) if not getattr(opt, "is_deleted", False)
                    ],
                })
    elif item.variant_groups:
        for vg in item.variant_groups:
            if isinstance(vg, dict):
                opts = []
                for opt in vg.get("options", []):
                    if isinstance(opt, dict):
                        sp = float(opt.get("selling_price", opt.get("sellingPrice", opt.get("price", opt.get("price_adjustment", opt.get("rate", 0.0))))) or 0.0)
                        opts.append({
                            "id": opt.get("id", 1),
                            "group_id": opt.get("group_id", opt.get("groupId", 1)),
                            "name": opt.get("name", ""),
                            "selling_price": sp,
                            "price": sp,
                            "is_default": bool(opt.get("is_default", opt.get("isDefault", False))),
                            "is_available": bool(opt.get("is_available", opt.get("isAvailable", True))),
                            "sort_order": int(opt.get("sort_order", opt.get("sortOrder", 1)) or 1),
                        })
                vg_list.append({
                    "id": vg.get("id", 1),
                    "item_id": vg.get("item_id", vg.get("itemId", item.id)),
                    "name": vg.get("name", ""),
                    "min_selection": int(vg.get("min_selection", vg.get("minSelection", 1)) or 1),
                    "max_selection": int(vg.get("max_selection", vg.get("maxSelection", 1)) or 1),
                    "is_required": bool(vg.get("is_required", vg.get("isRequired", True))),
                    "sort_order": int(vg.get("sort_order", vg.get("sortOrder", 1)) or 1),
                    "options": opts,
                })

    # Addon groups
    ag_list = []
    if isinstance(getattr(item, "addon_groups_rel", None), list) and item.addon_groups_rel:
        for ag in item.addon_groups_rel:
            if not getattr(ag, "is_deleted", False):
                ag_list.append({
                    "id": ag.id,
                    "item_id": ag.item_id,
                    "name": ag.name,
                    "min_selection": ag.min_selection,
                    "max_selection": ag.max_selection,
                    "sort_order": ag.sort_order,
                    "options": [
                        {
                            "id": opt.id,
                            "group_id": opt.group_id,
                            "name": opt.name,
                            "price": opt.price,
                            "variant_prices": getattr(opt, "variant_prices", {}) or {},
                            "is_available": opt.is_available,
                            "sort_order": opt.sort_order,
                        }
                        for opt in (ag.options or []) if not getattr(opt, "is_deleted", False)
                    ],
                })
    elif item.addon_groups:
        for ag in item.addon_groups:
            if isinstance(ag, dict):
                opts = []
                for opt in ag.get("options", []):
                    if isinstance(opt, dict):
                        opts.append({
                            "id": opt.get("id", 1),
                            "group_id": opt.get("group_id", opt.get("groupId", 1)),
                            "name": opt.get("name", ""),
                            "price": float(opt.get("price", 0.0) or 0.0),
                            "variant_prices": opt.get("variant_prices", opt.get("variantPrices", {})) or {},
                            "is_available": bool(opt.get("is_available", opt.get("isAvailable", True))),
                            "sort_order": int(opt.get("sort_order", opt.get("sortOrder", 1)) or 1),
                        })
                ag_list.append({
                    "id": ag.get("id", 1),
                    "item_id": ag.get("item_id", ag.get("itemId", item.id)),
                    "name": ag.get("name", ""),
                    "min_selection": int(ag.get("min_selection", ag.get("minSelection", 0)) or 0),
                    "max_selection": int(ag.get("max_selection", ag.get("maxSelection", 5)) or 5),
                    "sort_order": int(ag.get("sort_order", ag.get("sortOrder", 1)) or 1),
                    "options": opts,
                })


    # Tags
    tag_names = []
    if isinstance(getattr(item, "item_tags_rel", None), list) and item.item_tags_rel:
        tag_names = [it.tag.name for it in item.item_tags_rel if getattr(it, "tag", None) and not getattr(it.tag, "is_deleted", False)]
    elif item.tags:
        tag_names = [t if isinstance(t, str) else t.get("name", "") for t in item.tags]


    return {
        "id": item.id,
        "category_id": item.category_id,
        "name": item.name,
        "description": item.description,
        "short_description": item.short_description,
        "base_price": item.base_price,
        "image_url": item.image_url,
        "images": item.images or [],
        "product_id": item.product_id,
        "kds_station": item.kds_station or "Main",
        "allergens": item.allergens or [],
        "nutrition": item.nutrition or {},
        "is_veg": item.is_veg,
        "is_popular": item.is_popular,
        "is_available": item.is_available,
        "gst_percent": item.gst_percent,
        "sort_order": getattr(item, "sort_order", 1) or 1,
        "branch_id": item.branch_id,


        "tenant_id": item.tenant_id,
        "tags": tag_names,
        "variant_groups": vg_list,
        "addon_groups": ag_list,
    }


# ─── Category Routes ──────────────────────────────────────────

@router.get("/categories", response_model=list[CategoryResponseSchema])
async def list_categories(
    branch_id: int | None = None,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[CategoryResponseSchema]:
    query = select(MenuCategory).where(
        MenuCategory.is_deleted == False
    )
    if current_user:
        query = query.where((MenuCategory.tenant_id == current_user.tenant_id) | (MenuCategory.tenant_id == 1))
    else:
        query = query.where(MenuCategory.tenant_id == 1)

    if branch_id:
        query = query.where((MenuCategory.branch_id == branch_id) | (MenuCategory.branch_id.is_(None)))

    query = query.order_by(MenuCategory.sort_order.asc(), MenuCategory.id.asc())
    result = await db.execute(query)
    return [CategoryResponseSchema.model_validate(c) for c in result.scalars().all()]


@router.post("/categories", response_model=CategoryResponseSchema, status_code=201)
async def create_category(
    body: CategoryCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> CategoryResponseSchema:
    category = MenuCategory(
        tenant_id=current_user.tenant_id if current_user else 1,
        branch_id=body.branch_id,
        name=body.name,
        icon=body.icon,
        slug=body.slug or body.name.lower().replace(" ", "-"),
        parent_id=body.parent_id,
        level=body.level,
        sort_order=body.sort_order,
        created_by=current_user.id if current_user else 1
    )
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return CategoryResponseSchema.model_validate(category)


@router.put("/categories/{category_id}", response_model=CategoryResponseSchema)
async def update_category(
    category_id: int,
    body: CategoryCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> CategoryResponseSchema:
    result = await db.execute(
        select(MenuCategory).where(
            MenuCategory.id == category_id,
            MenuCategory.is_deleted == False
        )
    )
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category.name = body.name
    category.icon = body.icon
    if body.slug:
        category.slug = body.slug
    category.parent_id = body.parent_id
    category.level = body.level
    category.sort_order = body.sort_order
    if body.branch_id is not None:
        category.branch_id = body.branch_id
    category.updated_by = current_user.id if current_user else 1

    await db.commit()
    await db.refresh(category)
    return CategoryResponseSchema.model_validate(category)


@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    result = await db.execute(
        select(MenuCategory).where(
            MenuCategory.id == category_id,
            MenuCategory.is_deleted == False
        )
    )
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category.is_deleted = True
    category.deleted_by = current_user.id if current_user else 1
    await db.commit()
    return {"message": "Category deleted successfully", "id": category_id}


# ─── Tag Routes ───────────────────────────────────────────────

@router.get("/tags", response_model=list[MenuTagResponse])
async def list_tags(
    branch_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[MenuTagResponse]:
    query = select(MenuTag).where(
        MenuTag.tenant_id == current_user.tenant_id,
        MenuTag.is_deleted == False
    )
    if branch_id:
        query = query.where(MenuTag.branch_id == branch_id)
    result = await db.execute(query)
    return [MenuTagResponse.model_validate(t) for t in result.scalars().all()]


@router.post("/tags", response_model=MenuTagResponse, status_code=201)
async def create_tag(
    body: MenuTagCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> MenuTagResponse:
    tag = MenuTag(
        tenant_id=current_user.tenant_id,
        name=body.name,
        color=body.color,
        icon=body.icon,
        created_by=current_user.id
    )
    db.add(tag)
    await db.commit()
    await db.refresh(tag)
    return MenuTagResponse.model_validate(tag)


# ─── Menu Item Routes ─────────────────────────────────────────

@router.get("/menu-items", response_model=list[MenuItemResponseSchema])
async def list_menu_items(
    category_id: int | None = None,
    branch_id: int | None = None,
    is_veg: bool | None = None,
    is_available: bool | None = None,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[MenuItemResponseSchema]:
    tenant_id = current_user.tenant_id if current_user else 1
    query = select(MenuItem).where(
        MenuItem.tenant_id == tenant_id,
        MenuItem.is_deleted == False
    )
    if category_id:
        query = query.where(MenuItem.category_id == category_id)
    if branch_id:
        query = query.where((MenuItem.branch_id == branch_id) | (MenuItem.branch_id.is_(None)))
    if is_veg is not None:
        query = query.where(MenuItem.is_veg == is_veg)
    if is_available is not None:
        query = query.where(MenuItem.is_available == is_available)
        
    query = query.order_by(MenuItem.sort_order.asc(), MenuItem.name.asc())
    result = await db.execute(query)
    items = result.scalars().all()
    
    response_items = []
    for item in items:
        data_dict = _build_menu_item_response(item)
        response_items.append(MenuItemResponseSchema.model_validate(data_dict))
        
    return response_items


@router.post("/menu-items", response_model=MenuItemResponseSchema, status_code=201)
async def create_menu_item(
    body: MenuItemCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> MenuItemResponseSchema:
    item = MenuItem(
        tenant_id=current_user.tenant_id,
        branch_id=body.branch_id,
        category_id=body.category_id,
        name=body.name,
        description=body.description,
        short_description=body.short_description,
        base_price=body.base_price,
        image_url=body.image_url,
        images=body.images,
        product_id=body.product_id,
        kds_station=body.kds_station,
        allergens=body.allergens,
        nutrition=body.nutrition,
        is_veg=body.is_veg,
        is_popular=body.is_popular,
        is_available=body.is_available,
        gst_percent=body.gst_percent,
        sort_order=body.sort_order,
        created_by=current_user.id
    )
    db.add(item)
    await db.flush()

    # Process nested variant groups
    for vg_dto in body.variant_groups:
        vg = MenuVariantGroup(
            tenant_id=current_user.tenant_id,
            branch_id=body.branch_id,
            item_id=item.id,
            name=vg_dto.name,
            min_selection=vg_dto.min_selection,
            max_selection=vg_dto.max_selection,
            is_required=vg_dto.is_required,
            sort_order=vg_dto.sort_order,
            created_by=current_user.id,
        )
        db.add(vg)
        await db.flush()

        for opt_dto in vg_dto.options:
            opt_sp = opt_dto.selling_price or opt_dto.price or 0.0
            opt = MenuVariantOption(
                tenant_id=current_user.tenant_id,
                branch_id=body.branch_id,
                group_id=vg.id,
                name=opt_dto.name,
                selling_price=opt_sp,
                price=opt_sp,
                is_default=opt_dto.is_default,
                is_available=opt_dto.is_available,
                sort_order=opt_dto.sort_order,
                created_by=current_user.id,
            )
            db.add(opt)

    # Process nested addon groups
    for ag_dto in body.addon_groups:
        ag = MenuAddonGroup(
            tenant_id=current_user.tenant_id,
            branch_id=body.branch_id,
            item_id=item.id,
            name=ag_dto.name,
            min_selection=ag_dto.min_selection,
            max_selection=ag_dto.max_selection,
            sort_order=ag_dto.sort_order,
            created_by=current_user.id,
        )
        db.add(ag)
        await db.flush()

        for opt_dto in ag_dto.options:
            opt = MenuAddonOption(
                tenant_id=current_user.tenant_id,
                branch_id=body.branch_id,
                group_id=ag.id,
                name=opt_dto.name,
                price=opt_dto.price,
                variant_prices=opt_dto.variant_prices,
                is_available=opt_dto.is_available,
                sort_order=opt_dto.sort_order,
                created_by=current_user.id,
            )

            db.add(opt)

    # Process tag associations
    for tag_id in body.tag_ids:
        it_tag = MenuItemTag(
            tenant_id=current_user.tenant_id,
            branch_id=body.branch_id,
            item_id=item.id,
            tag_id=tag_id,
        )
        db.add(it_tag)

    await db.commit()

    # Re-fetch item to populate selectin relationships
    refreshed_stmt = select(MenuItem).where(MenuItem.id == item.id)
    refreshed_res = await db.execute(refreshed_stmt)
    refreshed_item = refreshed_res.scalar_one()

    return MenuItemResponseSchema.model_validate(_build_menu_item_response(refreshed_item))


@router.put("/menu-items/{item_id}", response_model=MenuItemResponseSchema)
async def update_menu_item(
    item_id: int,
    body: MenuItemCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> MenuItemResponseSchema:
    result = await db.execute(
        select(MenuItem).where(
            MenuItem.id == item_id,
            MenuItem.tenant_id == current_user.tenant_id,
            MenuItem.is_deleted == False
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    item.category_id = body.category_id
    item.name = body.name
    item.description = body.description
    item.short_description = body.short_description
    item.base_price = body.base_price
    item.image_url = body.image_url
    item.images = body.images
    item.product_id = body.product_id
    item.kds_station = body.kds_station
    item.allergens = body.allergens
    item.nutrition = body.nutrition
    item.is_veg = body.is_veg
    item.is_popular = body.is_popular
    item.is_available = body.is_available
    item.gst_percent = body.gst_percent
    item.sort_order = body.sort_order
    item.branch_id = body.branch_id
    item.updated_by = current_user.id

    # Refresh variant groups
    if body.variant_groups:
        from sqlalchemy import delete
        await db.execute(delete(MenuVariantGroup).where(MenuVariantGroup.item_id == item.id))
        await db.flush()
        for vg_dto in body.variant_groups:
            vg = MenuVariantGroup(
                tenant_id=current_user.tenant_id,
                branch_id=body.branch_id,
                item_id=item.id,
                name=vg_dto.name,
                min_selection=vg_dto.min_selection,
                max_selection=vg_dto.max_selection,
                is_required=vg_dto.is_required,
                sort_order=vg_dto.sort_order,
                created_by=current_user.id,
            )
            db.add(vg)
            await db.flush()
            for opt_dto in vg_dto.options:
                opt_sp = opt_dto.selling_price or opt_dto.price or 0.0
                opt = MenuVariantOption(
                    tenant_id=current_user.tenant_id,
                    branch_id=body.branch_id,
                    group_id=vg.id,
                    name=opt_dto.name,
                    selling_price=opt_sp,
                    price=opt_sp,
                    is_default=opt_dto.is_default,
                    is_available=opt_dto.is_available,
                    sort_order=opt_dto.sort_order,
                    created_by=current_user.id,
                )
                db.add(opt)

    # Refresh addon groups with size-based variant_prices
    if body.addon_groups:
        from sqlalchemy import delete
        await db.execute(delete(MenuAddonGroup).where(MenuAddonGroup.item_id == item.id))
        await db.flush()
        for ag_dto in body.addon_groups:
            ag = MenuAddonGroup(
                tenant_id=current_user.tenant_id,
                branch_id=body.branch_id,
                item_id=item.id,
                name=ag_dto.name,
                min_selection=ag_dto.min_selection,
                max_selection=ag_dto.max_selection,
                sort_order=ag_dto.sort_order,
                created_by=current_user.id,
            )
            db.add(ag)
            await db.flush()
            for opt_dto in ag_dto.options:
                opt = MenuAddonOption(
                    tenant_id=current_user.tenant_id,
                    branch_id=body.branch_id,
                    group_id=ag.id,
                    name=opt_dto.name,
                    price=opt_dto.price,
                    variant_prices=opt_dto.variant_prices,
                    is_available=opt_dto.is_available,
                    sort_order=opt_dto.sort_order,
                    created_by=current_user.id,
                )
                db.add(opt)

    await db.commit()

    
    # Re-fetch item
    refreshed_stmt = select(MenuItem).where(MenuItem.id == item.id)
    refreshed_res = await db.execute(refreshed_stmt)
    refreshed_item = refreshed_res.scalar_one()

    return MenuItemResponseSchema.model_validate(_build_menu_item_response(refreshed_item))


@router.delete("/menu-items/{item_id}")
async def delete_menu_item(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    result = await db.execute(
        select(MenuItem).where(
            MenuItem.id == item_id,
            MenuItem.tenant_id == current_user.tenant_id,
            MenuItem.is_deleted == False
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    item.is_deleted = True
    item.deleted_by = current_user.id
    await db.commit()
    return {"message": "Menu item deleted successfully"}

