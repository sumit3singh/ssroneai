"""
The ssrone – Restaurant Module
Table management, KDS (Kitchen Display System), fast-billing POS.
WebSocket broadcasts order events to kitchen screens in real-time.
"""
from datetime import datetime, timezone
from enum import StrEnum
from typing import Any

from fastapi import APIRouter, Depends, Request, WebSocket, WebSocketDisconnect, HTTPException
from pydantic import BaseModel
from sqlalchemy import BigInteger, Boolean, ForeignKey, Integer, String, select
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column

from src.core.database.engine import get_db_session, engine
from src.core.database.models import TenantBaseModel
from src.core.event_bus.bus import event_bus
from src.modules.auth.dependencies import get_current_user, get_optional_user
from src.modules.auth.models import User, Tenant
from src.shared.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/restaurant", tags=["Restaurant"])


async def _get_active_tenant_id(current_user: User | None, db: AsyncSession) -> int:
    """Dynamically resolve active tenant ID from JWT or PostgreSQL database."""
    if current_user and getattr(current_user, "tenant_id", None):
        return current_user.tenant_id
    try:
        res = await db.execute(select(Tenant.id).where(Tenant.is_active.is_(True)).limit(1))
        tid = res.scalar_one_or_none()
        if tid is not None:
            return tid
    except Exception:
        pass
    return 1

# Trigger background schema migration to ensure all PostgreSQL columns exist
try:
    import scratch_alter_postgres
    asyncio.create_task(scratch_alter_postgres.run_alter())
except Exception as _schema_err:
    pass


# ─── Models ──────────────────────────────────────────────────

class TableStatus(StrEnum):
    FREE = "free"
    OCCUPIED = "occupied"
    RESERVED = "reserved"
    BILLING = "billing"
    CLEANING = "cleaning"


from src.modules.orders.models import DiningTable as RestaurantTable  # Canonical Dining Table Consolidation


from src.modules.orders.models import KitchenStation as KDSStation  # Canonical Kitchen Station Consolidation


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
    capacity: int = 4
    section: str | None = "Main Dining"
    status: str = "free"
    is_active: bool = True
    model_config = {"from_attributes": True}


def _parse_int_id(val: Any) -> int | None:
    if val is None:
        return None
    try:
        return int(val)
    except (ValueError, TypeError):
        return None


async def _resolve_branch_id(branch_id: int | str | None, current_user: User | None, db: AsyncSession) -> int | None:
    """Dynamically resolve branch ID from numeric int, string branch code (e.g. 'BAITHAK-CUH'), or current user context."""
    if branch_id is not None and str(branch_id).strip() not in ("", "undefined", "null", "none"):
        try:
            return int(branch_id)
        except (ValueError, TypeError):
            pass

        if isinstance(branch_id, str):
            code_str = branch_id.strip()
            from src.modules.auth.models import Branch
            res = await db.execute(
                select(Branch.id).where(
                    (Branch.code == code_str) | (Branch.code.ilike(code_str)) | (Branch.name.ilike(code_str)),
                    Branch.is_deleted == False
                )
            )
            found_id = res.scalar_one_or_none()
            if found_id is not None:
                return found_id

    if current_user and getattr(current_user, "branch_id", None):
        return current_user.branch_id

    return None


class UpdateTableStatusSchema(BaseModel):
    status: str
    current_order_id: int | None = None


# ─── Routes ──────────────────────────────────────────────────

from src.modules.restaurant.schemas import TableCreateSchema, TableResponseSchema
from src.modules.orders.models import DiningTable


@router.get("/tables", response_model=list[TableResponseSchema])
async def list_tables(
    branch_id: int | str | None = None,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[TableResponseSchema]:
    tenant_id = await _get_active_tenant_id(current_user, db)
    query = select(DiningTable).where(
        (DiningTable.is_deleted == False) | (DiningTable.is_deleted.is_(None)),
    )

    parsed_branch_id = await _resolve_branch_id(branch_id, current_user, db)
    if parsed_branch_id is not None:
        query = query.where(DiningTable.branch_id == parsed_branch_id)

    query = query.order_by(DiningTable.sort_order.asc(), DiningTable.id.asc())

    result = await db.execute(query)
    tables = result.scalars().all()

    valid_tables = []
    for t in tables:
        try:
            valid_tables.append(TableResponseSchema.model_validate(t))
        except Exception:
            valid_tables.append(
                TableResponseSchema(
                    id=t.id,
                    table_number=getattr(t, "table_number", None) or f"T-{t.id:02d}",
                    capacity=getattr(t, "capacity", 4) or 4,
                    section=getattr(t, "section", "Main Dining") or "Main Dining",
                    floor=getattr(t, "floor", "Ground Floor") or "Ground Floor",
                    status=getattr(t, "status", "free") or "free",
                    is_active=getattr(t, "is_active", True) if getattr(t, "is_active", None) is not None else True,
                    branch_id=getattr(t, "branch_id", 1) or 1,
                    tenant_id=getattr(t, "tenant_id", tenant_id) or tenant_id
                )
            )
    return valid_tables


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
    return []


@router.patch("/tables/{table_id}/status")
async def update_table_status(
    table_id: int,
    body: UpdateTableStatusSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id if current_user else 1
    result = await db.execute(
        select(RestaurantTable).where(
            RestaurantTable.id == table_id,
            RestaurantTable.tenant_id == tenant_id,
        )
    )
    table = result.scalar_one_or_none()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    table.status = body.status
    table.current_order_id = body.current_order_id
    if current_user:
        table.updated_by = current_user.id
    await db.commit()
    return {"message": "Table status updated", "status": body.status}


@router.post("/tables", response_model=TableResponseSchema, status_code=201)
async def create_table(
    body: TableCreateSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> TableResponseSchema:
    try:
        tenant_id = current_user.tenant_id if current_user else 1
        user_id = current_user.id if current_user else 1
        target_branch_id = body.branch_id or 1

        # Ensure section column exists in PostgreSQL & drop restrictive legacy status check constraint
        try:
            async with engine.begin() as conn:
                await conn.execute(text("ALTER TABLE IF EXISTS dining_tables ADD COLUMN IF NOT EXISTS section VARCHAR(50);"))
                await conn.execute(text("ALTER TABLE IF EXISTS dining_tables DROP CONSTRAINT IF EXISTS dining_tables_status_check;"))
        except Exception:
            pass

        # Check duplicate table_number
        dup_stmt = select(RestaurantTable).where(
            RestaurantTable.tenant_id == tenant_id,
            RestaurantTable.branch_id == target_branch_id,
            RestaurantTable.table_number == body.table_number,
            (RestaurantTable.is_deleted == False) | (RestaurantTable.is_deleted.is_(None))
        )
        dup_res = await db.execute(dup_stmt)
        if dup_res.scalar_one_or_none():
            raise HTTPException(
                status_code=400,
                detail=f"Table '{body.table_number}' already exists in this branch. Please choose a different table number."
            )

        table = RestaurantTable(
            tenant_id=tenant_id,
            branch_id=target_branch_id,
            table_number=body.table_number,
            capacity=body.capacity or 4,
            section=body.section or "Main Dining",
            floor=body.floor,
            sort_order=body.sort_order or 0,
            status="free",
            created_by=user_id,
            updated_by=user_id,
        )
        db.add(table)
        await db.commit()
        await db.refresh(table)
        return TableResponseSchema.model_validate(table)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to create dining table", error=str(exc))
        raise HTTPException(status_code=500, detail=f"Failed to create dining table: {str(exc)}")


@router.put("/tables/{table_id}", response_model=TableResponseSchema)
async def update_table(
    table_id: int,
    body: TableCreateSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> TableResponseSchema:
    try:
        tenant_id = current_user.tenant_id if current_user else 1
        user_id = current_user.id if current_user else 1
        result = await db.execute(
            select(RestaurantTable).where(
                RestaurantTable.id == table_id,
                RestaurantTable.tenant_id == tenant_id,
            )
        )
        table = result.scalar_one_or_none()
        if not table:
            raise HTTPException(status_code=404, detail="Table not found")

        table.table_number = body.table_number
        table.capacity = body.capacity
        if body.section is not None:
            table.section = body.section
        if body.floor is not None:
            table.floor = body.floor
        if body.branch_id is not None:
            table.branch_id = body.branch_id
        table.updated_by = user_id
        await db.commit()
        await db.refresh(table)
        return TableResponseSchema.model_validate(table)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to update dining table", error=str(exc))
        raise HTTPException(status_code=500, detail=f"Failed to update dining table: {str(exc)}")


@router.delete("/tables/{table_id}", status_code=200)
async def delete_table(
    table_id: int,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id if current_user else 1
    result = await db.execute(
        select(RestaurantTable).where(
            RestaurantTable.id == table_id,
            RestaurantTable.tenant_id == tenant_id,
        )
    )
    table = result.scalar_one_or_none()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    table.is_deleted = True
    await db.commit()
    return {"message": "Table deleted successfully", "id": table_id}


# ─── Kitchen Stations CRUD Endpoints ──────────────────────────

from src.modules.restaurant.schemas import KitchenStationCreateSchema, KitchenStationResponseSchema


@router.get("/kitchen-stations", response_model=list[KitchenStationResponseSchema])
async def list_kitchen_stations(
    branch_id: int | str | None = None,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[KitchenStationResponseSchema]:
    try:
        tenant_id = current_user.tenant_id if current_user else 1
        parsed_branch_id = await _resolve_branch_id(branch_id, current_user, db) or 1

        query = select(KDSStation).where(
            (KDSStation.tenant_id == tenant_id) | (KDSStation.tenant_id.is_(None)),
            (KDSStation.branch_id == parsed_branch_id) | (KDSStation.branch_id.is_(None))
        )
        result = await db.execute(query)
        stations = result.scalars().all()

        res_items = []
        for s in stations:
            try:
                res_items.append(KitchenStationResponseSchema.model_validate(s))
            except Exception as val_err:
                logger.error("Skipping kitchen station schema validation", station_id=getattr(s, "id", None), error=str(val_err))
        return res_items
    except Exception as err:
        logger.error("Failed to list kitchen stations from database", error=str(err))
        return []


@router.post("/kitchen-stations", response_model=KitchenStationResponseSchema, status_code=201)
async def create_kitchen_station(
    body: KitchenStationCreateSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> KitchenStationResponseSchema:
    try:
        tenant_id = current_user.tenant_id if current_user else 1
        st = KDSStation(
            tenant_id=tenant_id,
            branch_id=body.branch_id or 1,
            name=body.name,
            code=body.code.upper(),
            printer_name=body.printer_name or "192.168.1.101",
            station_type=body.station_type or "main",
            categories=body.categories or [],
            is_active=body.is_active,
            sort_order=body.sort_order or 0,
        )
        db.add(st)
        await db.commit()
        await db.refresh(st)
        return KitchenStationResponseSchema.model_validate(st)
    except Exception as exc:
        logger.error("Failed to create kitchen station", error=str(exc))
        raise HTTPException(status_code=500, detail=f"Failed to create kitchen station: {str(exc)}")


@router.put("/kitchen-stations/{station_id}", response_model=KitchenStationResponseSchema)
async def update_kitchen_station(
    station_id: int,
    body: KitchenStationCreateSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> KitchenStationResponseSchema:
    try:
        tenant_id = current_user.tenant_id if current_user else 1
        res = await db.execute(
            select(KDSStation).where(
                KDSStation.id == station_id,
                KDSStation.tenant_id == tenant_id,
            )
        )
        st = res.scalar_one_or_none()
        if not st:
            raise HTTPException(status_code=404, detail="Kitchen station not found")

        st.name = body.name
        st.code = body.code.upper()
        st.printer_name = body.printer_name
        st.station_type = body.station_type
        st.is_active = body.is_active
        if body.categories is not None:
            st.categories = body.categories
        if body.branch_id is not None:
            st.branch_id = body.branch_id

        await db.commit()
        await db.refresh(st)
        return KitchenStationResponseSchema.model_validate(st)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to update kitchen station", error=str(exc))
        raise HTTPException(status_code=500, detail=f"Failed to update kitchen station: {str(exc)}")


@router.delete("/kitchen-stations/{station_id}", status_code=200)
async def delete_kitchen_station(
    station_id: int,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id if current_user else 1
    res = await db.execute(
        select(KDSStation).where(
            KDSStation.id == station_id,
            KDSStation.tenant_id == tenant_id,
        )
    )
    st = res.scalar_one_or_none()
    if not st:
        raise HTTPException(status_code=404, detail="Kitchen station not found")

    await db.delete(st)
    await db.commit()
    return {"message": "Kitchen station deleted successfully", "id": station_id}


# ─── Payment Modes CRUD Endpoints ─────────────────────────────

from src.modules.restaurant.models import PaymentMode
from src.modules.restaurant.schemas import PaymentModeCreateSchema, PaymentModeResponseSchema


@router.get("/payment-modes", response_model=list[PaymentModeResponseSchema])
async def list_payment_modes(
    branch_id: int | str | None = None,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[PaymentModeResponseSchema]:
    tenant_id = current_user.tenant_id if current_user else 1
    parsed_branch_id = await _resolve_branch_id(branch_id, current_user, db) or 1

    query = select(PaymentMode).where(
        PaymentMode.tenant_id == tenant_id,
        (PaymentMode.is_deleted == False) | (PaymentMode.is_deleted.is_(None))
    ).order_by(PaymentMode.sort_order)
    result = await db.execute(query)
    modes = result.scalars().all()

    return [PaymentModeResponseSchema.model_validate(m) for m in modes]


@router.post("/payment-modes", response_model=PaymentModeResponseSchema, status_code=201)
async def create_payment_mode(
    body: PaymentModeCreateSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> PaymentModeResponseSchema:
    try:
        tenant_id = current_user.tenant_id if current_user else 1
        pm = PaymentMode(
            tenant_id=tenant_id,
            branch_id=body.branch_id or 1,
            name=body.name,
            code=body.code.upper(),
            icon=body.icon or "💳",
            payment_type=body.payment_type or "cash",
            qr_code_url=body.qr_code_url,
            is_active=body.is_active,
            sort_order=body.sort_order or 0,
        )
        db.add(pm)
        await db.commit()
        await db.refresh(pm)
        return PaymentModeResponseSchema.model_validate(pm)
    except Exception as exc:
        logger.error("Failed to create payment mode", error=str(exc))
        raise HTTPException(status_code=500, detail=f"Failed to create payment mode: {str(exc)}")


@router.put("/payment-modes/{mode_id}", response_model=PaymentModeResponseSchema)
async def update_payment_mode(
    mode_id: int,
    body: PaymentModeCreateSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> PaymentModeResponseSchema:
    try:
        tenant_id = current_user.tenant_id if current_user else 1
        res = await db.execute(
            select(PaymentMode).where(
                PaymentMode.id == mode_id,
                PaymentMode.tenant_id == tenant_id,
            )
        )
        pm = res.scalar_one_or_none()
        if not pm:
            raise HTTPException(status_code=404, detail="Payment mode not found")

        pm.name = body.name
        pm.code = body.code.upper()
        pm.icon = body.icon
        pm.payment_type = body.payment_type
        pm.qr_code_url = body.qr_code_url
        pm.is_active = body.is_active
        if body.branch_id is not None:
            pm.branch_id = body.branch_id

        await db.commit()
        await db.refresh(pm)
        return PaymentModeResponseSchema.model_validate(pm)
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Failed to update payment mode", error=str(exc))
        raise HTTPException(status_code=500, detail=f"Failed to update payment mode: {str(exc)}")


@router.delete("/payment-modes/{mode_id}", status_code=200)
async def delete_payment_mode(
    mode_id: int,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id if current_user else 1
    res = await db.execute(
        select(PaymentMode).where(
            PaymentMode.id == mode_id,
            PaymentMode.tenant_id == tenant_id,
        )
    )
    pm = res.scalar_one_or_none()
    if not pm:
        raise HTTPException(status_code=404, detail="Payment mode not found")

    pm.is_deleted = True
    await db.commit()
    return {"message": "Payment mode deleted successfully", "id": mode_id}


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
    item_dict = getattr(item, "__dict__", {}) if hasattr(item, "__dict__") else (item if isinstance(item, dict) else {})

    # Variant groups
    vg_list = []
    rel_vgs = item_dict.get("variant_groups_rel")
    if rel_vgs and isinstance(rel_vgs, (list, tuple)):
        for vg in rel_vgs:
            try:
                if not getattr(vg, "is_deleted", False):
                    vg_dict = getattr(vg, "__dict__", {})
                    opts = []
                    rel_opts = vg_dict.get("options") or []
                    if isinstance(rel_opts, (list, tuple)):
                        for opt in rel_opts:
                            if not getattr(opt, "is_deleted", False):
                                sp = float(getattr(opt, "selling_price", 0.0) or getattr(opt, "price", 0.0) or 0.0)
                                opts.append({
                                    "id": getattr(opt, "id", 1),
                                    "group_id": getattr(opt, "group_id", 1),
                                    "name": getattr(opt, "name", ""),
                                    "selling_price": sp,
                                    "price": sp,
                                    "is_default": bool(getattr(opt, "is_default", False)),
                                    "is_available": bool(getattr(opt, "is_available", True)),
                                    "sort_order": int(getattr(opt, "sort_order", 1) or 1),
                                })
                    vg_list.append({
                        "id": getattr(vg, "id", 1),
                        "item_id": getattr(vg, "item_id", getattr(item, "id", 1)),
                        "name": getattr(vg, "name", ""),
                        "min_selection": getattr(vg, "min_selection", 1),
                        "max_selection": getattr(vg, "max_selection", 1),
                        "is_required": getattr(vg, "is_required", True),
                        "sort_order": getattr(vg, "sort_order", 1),
                        "options": opts,
                    })
            except Exception:
                pass
    else:
        raw_vgs = item_dict.get("variant_groups")
        if raw_vgs and isinstance(raw_vgs, (list, tuple)):
            for vg in raw_vgs:
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
                        "item_id": vg.get("item_id", vg.get("itemId", getattr(item, "id", 1))),
                        "name": vg.get("name", ""),
                        "min_selection": int(vg.get("min_selection", vg.get("minSelection", 1)) or 1),
                        "max_selection": int(vg.get("max_selection", vg.get("maxSelection", 1)) or 1),
                        "is_required": bool(vg.get("is_required", vg.get("isRequired", True))),
                        "sort_order": int(vg.get("sort_order", vg.get("sortOrder", 1)) or 1),
                        "options": opts,
                    })

    # Addon groups
    ag_list = []
    rel_ags = item_dict.get("addon_groups_rel")
    if rel_ags and isinstance(rel_ags, (list, tuple)):
        for ag in rel_ags:
            try:
                if not getattr(ag, "is_deleted", False):
                    ag_dict = getattr(ag, "__dict__", {})
                    opts = []
                    rel_opts = ag_dict.get("options") or []
                    if isinstance(rel_opts, (list, tuple)):
                        for opt in rel_opts:
                            if not getattr(opt, "is_deleted", False):
                                opts.append({
                                    "id": getattr(opt, "id", 1),
                                    "group_id": getattr(opt, "group_id", 1),
                                    "name": getattr(opt, "name", ""),
                                    "price": float(getattr(opt, "price", 0.0) or 0.0),
                                    "variant_prices": getattr(opt, "variant_prices", {}) or {},
                                    "is_available": bool(getattr(opt, "is_available", True)),
                                    "sort_order": int(getattr(opt, "sort_order", 1) or 1),
                                })
                    ag_list.append({
                        "id": getattr(ag, "id", 1),
                        "item_id": getattr(ag, "item_id", getattr(item, "id", 1)),
                        "name": getattr(ag, "name", ""),
                        "min_selection": getattr(ag, "min_selection", 0),
                        "max_selection": getattr(ag, "max_selection", 5),
                        "sort_order": getattr(ag, "sort_order", 1),
                        "options": opts,
                    })
            except Exception:
                pass
    else:
        raw_ags = item_dict.get("addon_groups")
        if raw_ags and isinstance(raw_ags, (list, tuple)):
            for ag in raw_ags:
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
                        "item_id": ag.get("item_id", ag.get("itemId", getattr(item, "id", 1))),
                        "name": ag.get("name", ""),
                        "min_selection": int(ag.get("min_selection", ag.get("minSelection", 0)) or 0),
                        "max_selection": int(ag.get("max_selection", ag.get("maxSelection", 5)) or 5),
                        "sort_order": int(ag.get("sort_order", ag.get("sortOrder", 1)) or 1),
                        "options": opts,
                    })

    # Tags
    tag_names = []
    rel_tags = item_dict.get("item_tags_rel")
    if rel_tags and isinstance(rel_tags, (list, tuple)):
        for it in rel_tags:
            try:
                tag_dict = getattr(it, "__dict__", {})
                tag_obj = tag_dict.get("tag")
                if tag_obj and not getattr(tag_obj, "is_deleted", False):
                    tag_names.append(getattr(tag_obj, "name", ""))
            except Exception:
                pass
    else:
        raw_tags = item_dict.get("tags")
        if raw_tags and isinstance(raw_tags, (list, tuple)):
            tag_names = [t if isinstance(t, str) else (t.get("name", "") if isinstance(t, dict) else "") for t in raw_tags]

    base_p = float(item_dict.get("price") or item_dict.get("base_price") or 0.0)
    selling_p = float(item_dict.get("selling_price") or base_p)

    return {
        "id": item_dict.get("id", getattr(item, "id", 1)),
        "category_id": item_dict.get("category_id"),
        "name": item_dict.get("name", "Unnamed Dish"),
        "description": item_dict.get("description"),
        "short_description": item_dict.get("short_description"),
        "base_price": base_p,
        "selling_price": selling_p,
        "image_url": item_dict.get("image_url"),
        "images": item_dict.get("images") or [],
        "product_id": item_dict.get("product_id"),
        "kds_station": item_dict.get("kds_station") or "Main Kitchen",
        "allergens": item_dict.get("allergens") or [],
        "nutrition": item_dict.get("nutrition") or {},
        "is_veg": bool(item_dict.get("is_veg")) if item_dict.get("is_veg") is not None else True,
        "is_popular": bool(item_dict.get("is_popular")) if item_dict.get("is_popular") is not None else False,
        "is_available": bool(item_dict.get("is_available")) if item_dict.get("is_available") is not None else True,
        "gst_percent": float(item_dict.get("gst_percent") or item_dict.get("tax_rate") or 5.0),
        "packaging_charge": float(item_dict.get("packaging_charge") or 0.0),
        "sort_order": int(item_dict.get("sort_order") or 1),
        "branch_id": item_dict.get("branch_id"),
        "tenant_id": item_dict.get("tenant_id") or 1,
        "tags": tag_names,
        "variant_groups": vg_list,
        "addon_groups": ag_list,
    }


# ─── Category Routes ──────────────────────────────────────────


@router.get("/categories", response_model=list[CategoryResponseSchema])
async def list_categories(
    request: Request,
    branch_id: int | str | None = None,
    company_id: int | str | None = None,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[CategoryResponseSchema]:
    try:
        tenant_id = await _get_active_tenant_id(current_user, db)
        query = select(MenuCategory).where(
            (MenuCategory.is_deleted == False) | (MenuCategory.is_deleted.is_(None))
        )

        header_branch = request.headers.get("x-branch-id") or request.headers.get("X-Branch-ID")
        target_branch = branch_id or header_branch
        parsed_branch_id = await _resolve_branch_id(target_branch, current_user, db)
        if parsed_branch_id is not None:
            query = query.where(MenuCategory.branch_id == parsed_branch_id)

        parsed_company_id = _parse_int_id(company_id)
        if parsed_company_id is not None:
            query = query.where(MenuCategory.company_id == parsed_company_id)

        if tenant_id:
            query = query.where((MenuCategory.tenant_id == tenant_id) | (MenuCategory.tenant_id.is_(None)))

        query = query.order_by(MenuCategory.sort_order.asc(), MenuCategory.id.asc())

        result = await db.execute(query)
        categories = result.scalars().all()

        valid_items = []
        for c in categories:
            try:
                valid_items.append(CategoryResponseSchema.model_validate(c))
            except Exception:
                valid_items.append(
                    CategoryResponseSchema(
                        id=c.id,
                        name=c.name,
                        icon=getattr(c, "icon", "🍛") or "🍛",
                        slug=getattr(c, "slug", "") or "",
                        tenant_id=getattr(c, "tenant_id", tenant_id) or tenant_id,
                        branch_id=getattr(c, "branch_id", 1) or 1
                    )
                )
        return valid_items
    except Exception as err:
        logger.error("Failed to list categories from database", error=str(err))
        raise HTTPException(status_code=500, detail=f"Database query error: {str(err)}")


@router.post("/categories", response_model=CategoryResponseSchema, status_code=201)
async def create_category(
    body: CategoryCreateSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> CategoryResponseSchema:
    tenant_id = await _get_active_tenant_id(current_user, db)
    category = MenuCategory(
        tenant_id=tenant_id,
        company_id=body.company_id or 1,
        branch_id=body.branch_id or 1,
        name=body.name,
        icon=body.icon or "🍛",
        slug=body.slug or body.name.lower().replace(" ", "-"),
        parent_id=body.parent_id,
        level=body.level or 1,
        sort_order=body.sort_order or 1,
        created_by=current_user.id if current_user else 1
    )
    db.add(category)
    try:
        await db.commit()
        await db.refresh(category)
        return CategoryResponseSchema.model_validate(category)
    except Exception as exc:
        await db.rollback()
        logger.error("Failed to create category", error=str(exc))
        raise HTTPException(status_code=500, detail="Failed to create category")


@router.put("/categories/{category_id}", response_model=CategoryResponseSchema)
async def update_category(
    category_id: int,
    body: CategoryCreateSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> CategoryResponseSchema:
    result = await db.execute(
        select(MenuCategory).where(
            MenuCategory.id == category_id
        )
    )
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category.name = body.name
    category.icon = body.icon or "🍛"
    if body.slug:
        category.slug = body.slug
    category.parent_id = body.parent_id
    category.level = body.level or 1
    category.sort_order = body.sort_order or 1
    if body.company_id is not None:
        category.company_id = body.company_id
    if body.branch_id is not None:
        category.branch_id = body.branch_id
    if hasattr(category, "updated_by") and current_user:
        category.updated_by = current_user.id

    try:
        await db.commit()
        await db.refresh(category)
        return CategoryResponseSchema.model_validate(category)
    except Exception as exc:
        await db.rollback()
        logger.error("Failed to update category", error=str(exc))
        raise HTTPException(status_code=500, detail="Failed to update category")


@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: int,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    result = await db.execute(
        select(MenuCategory).where(
            MenuCategory.id == category_id
        )
    )
    category = result.scalar_one_or_none()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category.is_deleted = True
    if hasattr(category, "updated_by") and current_user:
        category.updated_by = current_user.id
    try:
        await db.commit()
        return {"message": "Category deleted successfully", "id": category_id}
    except Exception as exc:
        await db.rollback()
        logger.error("Failed to delete category", error=str(exc))
        raise HTTPException(status_code=500, detail="Failed to delete category")


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

from sqlalchemy import text

@router.get("/menu-items", response_model=list[MenuItemResponseSchema])
async def list_menu_items(
    request: Request,
    category_id: int | str | None = None,
    branch_id: int | str | None = None,
    is_veg: bool | None = None,
    is_available: bool | None = None,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[MenuItemResponseSchema]:
    try:
        alter_stmts = [
            # --- menu_categories ---
            "ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS company_id BIGINT;",
            "ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS branch_id BIGINT;",
            "ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS tenant_id BIGINT DEFAULT 1;",
            "ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS icon VARCHAR(50);",
            "ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS slug VARCHAR(100);",
            "ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS parent_id BIGINT;",
            "ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS level INT DEFAULT 1;",
            "ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 1;",
            "ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS created_by BIGINT;",
            "ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS updated_by BIGINT;",
            "ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;",

            # --- menu_tags ---
            "ALTER TABLE menu_tags ADD COLUMN IF NOT EXISTS company_id BIGINT;",
            "ALTER TABLE menu_tags ADD COLUMN IF NOT EXISTS branch_id BIGINT;",
            "ALTER TABLE menu_tags ADD COLUMN IF NOT EXISTS tenant_id BIGINT DEFAULT 1;",
            "ALTER TABLE menu_tags ADD COLUMN IF NOT EXISTS color VARCHAR(20) DEFAULT '#ef4444';",
            "ALTER TABLE menu_tags ADD COLUMN IF NOT EXISTS icon VARCHAR(50);",
            "ALTER TABLE menu_tags ADD COLUMN IF NOT EXISTS created_by BIGINT;",
            "ALTER TABLE menu_tags ADD COLUMN IF NOT EXISTS updated_by BIGINT;",
            "ALTER TABLE menu_tags ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;",

            # --- menu_item_tags ---
            "ALTER TABLE menu_item_tags ADD COLUMN IF NOT EXISTS tenant_id BIGINT DEFAULT 1;",
            "ALTER TABLE menu_item_tags ADD COLUMN IF NOT EXISTS company_id BIGINT;",
            "ALTER TABLE menu_item_tags ADD COLUMN IF NOT EXISTS branch_id BIGINT;",

            # --- menu_items ---
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS branch_id BIGINT;",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS company_id BIGINT;",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS tenant_id BIGINT DEFAULT 1;",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS item_code VARCHAR(50);",
            "ALTER TABLE menu_items ALTER COLUMN item_code DROP NOT NULL;",
            "ALTER TABLE menu_items ALTER COLUMN item_code SET DEFAULT '';",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS description VARCHAR(500);",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS short_description VARCHAR(200);",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS price FLOAT DEFAULT 0.0;",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS cost_price FLOAT DEFAULT 0.0;",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS tax_rate FLOAT DEFAULT 5.0;",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS product_id BIGINT;",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS kds_station VARCHAR(50);",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS allergens JSONB DEFAULT '[]'::jsonb;",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS nutrition JSONB DEFAULT '{}'::jsonb;",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_veg BOOLEAN DEFAULT TRUE;",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS packaging_charge FLOAT DEFAULT 0.0;",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 1;",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS created_by BIGINT;",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS updated_by BIGINT;",
            "ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;",

            # --- menu_variant_groups ---
            "ALTER TABLE menu_variant_groups ADD COLUMN IF NOT EXISTS branch_id BIGINT;",
            "ALTER TABLE menu_variant_groups ADD COLUMN IF NOT EXISTS company_id BIGINT;",
            "ALTER TABLE menu_variant_groups ADD COLUMN IF NOT EXISTS tenant_id BIGINT DEFAULT 1;",
            "ALTER TABLE menu_variant_groups ADD COLUMN IF NOT EXISTS min_selection INT DEFAULT 1;",
            "ALTER TABLE menu_variant_groups ADD COLUMN IF NOT EXISTS max_selection INT DEFAULT 1;",
            "ALTER TABLE menu_variant_groups ADD COLUMN IF NOT EXISTS is_required BOOLEAN DEFAULT TRUE;",
            "ALTER TABLE menu_variant_groups ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 1;",
            "ALTER TABLE menu_variant_groups ADD COLUMN IF NOT EXISTS created_by BIGINT;",
            "ALTER TABLE menu_variant_groups ADD COLUMN IF NOT EXISTS updated_by BIGINT;",
            "ALTER TABLE menu_variant_groups ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;",

            # --- menu_variant_options ---
            "ALTER TABLE menu_variant_options ADD COLUMN IF NOT EXISTS branch_id BIGINT;",
            "ALTER TABLE menu_variant_options ADD COLUMN IF NOT EXISTS company_id BIGINT;",
            "ALTER TABLE menu_variant_options ADD COLUMN IF NOT EXISTS tenant_id BIGINT DEFAULT 1;",
            "ALTER TABLE menu_variant_options ADD COLUMN IF NOT EXISTS selling_price FLOAT DEFAULT 0.0;",
            "ALTER TABLE menu_variant_options ADD COLUMN IF NOT EXISTS price FLOAT DEFAULT 0.0;",
            "ALTER TABLE menu_variant_options ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT FALSE;",
            "ALTER TABLE menu_variant_options ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;",
            "ALTER TABLE menu_variant_options ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 1;",
            "ALTER TABLE menu_variant_options ADD COLUMN IF NOT EXISTS created_by BIGINT;",
            "ALTER TABLE menu_variant_options ADD COLUMN IF NOT EXISTS updated_by BIGINT;",
            "ALTER TABLE menu_variant_options ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;",

            # --- menu_addon_groups ---
            "ALTER TABLE menu_addon_groups ADD COLUMN IF NOT EXISTS branch_id BIGINT;",
            "ALTER TABLE menu_addon_groups ADD COLUMN IF NOT EXISTS company_id BIGINT;",
            "ALTER TABLE menu_addon_groups ADD COLUMN IF NOT EXISTS tenant_id BIGINT DEFAULT 1;",
            "ALTER TABLE menu_addon_groups ADD COLUMN IF NOT EXISTS min_selection INT DEFAULT 0;",
            "ALTER TABLE menu_addon_groups ADD COLUMN IF NOT EXISTS max_selection INT DEFAULT 5;",
            "ALTER TABLE menu_addon_groups ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 1;",
            "ALTER TABLE menu_addon_groups ADD COLUMN IF NOT EXISTS created_by BIGINT;",
            "ALTER TABLE menu_addon_groups ADD COLUMN IF NOT EXISTS updated_by BIGINT;",
            "ALTER TABLE menu_addon_groups ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;",

            # --- menu_addon_options ---
            "ALTER TABLE menu_addon_options ADD COLUMN IF NOT EXISTS branch_id BIGINT;",
            "ALTER TABLE menu_addon_options ADD COLUMN IF NOT EXISTS company_id BIGINT;",
            "ALTER TABLE menu_addon_options ADD COLUMN IF NOT EXISTS tenant_id BIGINT DEFAULT 1;",
            "ALTER TABLE menu_addon_options ADD COLUMN IF NOT EXISTS price FLOAT DEFAULT 0.0;",
            "ALTER TABLE menu_addon_options ADD COLUMN IF NOT EXISTS variant_prices JSONB DEFAULT '{}'::jsonb;",
            "ALTER TABLE menu_addon_options ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;",
            "ALTER TABLE menu_addon_options ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 1;",
            "ALTER TABLE menu_addon_options ADD COLUMN IF NOT EXISTS created_by BIGINT;",
            "ALTER TABLE menu_addon_options ADD COLUMN IF NOT EXISTS updated_by BIGINT;",
            "ALTER TABLE menu_addon_options ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;",

            # --- dining_tables ---
            "ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS branch_id BIGINT;",
            "ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS company_id BIGINT;",
            "ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS tenant_id BIGINT DEFAULT 1;",
            "ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS capacity INT DEFAULT 4;",
            "ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'free';",
            "ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS floor VARCHAR(50);",
            "ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS section VARCHAR(50);",
            "ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;",
            "ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS position_x INT DEFAULT 0;",
            "ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS position_y INT DEFAULT 0;",
            "ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS current_order_id BIGINT;",
            "ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;",
            "ALTER TABLE dining_tables ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;",

            # --- kitchen_stations ---
            "ALTER TABLE kitchen_stations ADD COLUMN IF NOT EXISTS branch_id BIGINT;",
            "ALTER TABLE kitchen_stations ADD COLUMN IF NOT EXISTS company_id BIGINT;",
            "ALTER TABLE kitchen_stations ADD COLUMN IF NOT EXISTS tenant_id BIGINT DEFAULT 1;",
            "ALTER TABLE kitchen_stations ADD COLUMN IF NOT EXISTS code VARCHAR(30);",
            "ALTER TABLE kitchen_stations ADD COLUMN IF NOT EXISTS printer_name VARCHAR(100);",
            "ALTER TABLE kitchen_stations ADD COLUMN IF NOT EXISTS station_type VARCHAR(50) DEFAULT 'main';",
            "ALTER TABLE kitchen_stations ADD COLUMN IF NOT EXISTS categories JSONB DEFAULT '[]'::jsonb;",
            "ALTER TABLE kitchen_stations ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;",
            "ALTER TABLE kitchen_stations ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;",
            "ALTER TABLE kitchen_stations ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE;",
        ]
        try:
            async with engine.begin() as conn:
                for stmt in alter_stmts:
                    try:
                        await conn.execute(text(stmt))
                    except Exception:
                        pass
        except Exception:
            pass

        # Auto-sync branch_id from menu_categories to menu_items if missing
        try:
            await db.execute(text("""
                UPDATE menu_items mi
                SET branch_id = mc.branch_id
                FROM menu_categories mc
                WHERE mi.category_id = mc.id
                  AND mi.branch_id IS NULL
                  AND mc.branch_id IS NOT NULL;
            """))
            await db.commit()
        except Exception:
            pass

        tenant_id = await _get_active_tenant_id(current_user, db)
        query = select(MenuItem).outerjoin(MenuCategory, MenuItem.category_id == MenuCategory.id).where(
            (MenuItem.is_deleted == False) | (MenuItem.is_deleted.is_(None))
        )
        if tenant_id:
            query = query.where((MenuItem.tenant_id == tenant_id) | (MenuItem.tenant_id.is_(None)))

        parsed_cat_id = _parse_int_id(category_id)
        if parsed_cat_id is not None:
            query = query.where(MenuItem.category_id == parsed_cat_id)
            
        header_branch = request.headers.get("x-branch-id") or request.headers.get("X-Branch-ID")
        target_branch = branch_id or header_branch
        parsed_branch_id = await _resolve_branch_id(target_branch, current_user, db)
        if parsed_branch_id is not None:
            query = query.where((MenuItem.branch_id == parsed_branch_id) | (MenuItem.branch_id.is_(None)))

        if is_veg is not None:
            query = query.where(MenuItem.is_veg == is_veg)
        if is_available is not None:
            query = query.where(MenuItem.is_available == is_available)
            
        query = query.order_by(MenuItem.sort_order.asc(), MenuItem.id.asc())
        result = await db.execute(query)
        items = result.scalars().all()

        response_items = []
        for item in items:
            try:
                data_dict = _build_menu_item_response(item)
                response_items.append(MenuItemResponseSchema.model_validate(data_dict))
            except Exception as val_err:
                logger.error("Skipping menu item validation failure", item_id=getattr(item, "id", None), error=str(val_err))
            
        return response_items
    except Exception as err:
        import traceback
        tb_str = traceback.format_exc()
        logger.error("Failed to list menu items from database", error=str(err), traceback=tb_str)
        raise HTTPException(status_code=500, detail=f"Database query error: {str(err)} | TRACEBACK: {tb_str}")


@router.post("/menu-items", response_model=MenuItemResponseSchema, status_code=201)
async def create_menu_item(
    body: MenuItemCreateSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> MenuItemResponseSchema:
    tenant_id = current_user.tenant_id if current_user and current_user.tenant_id else 2
    user_id = current_user.id if current_user else 1

    try:
        # Validate category_id exists in menu_categories table
        cat_check = await db.execute(
            select(MenuCategory).where(
                MenuCategory.id == body.category_id,
                (MenuCategory.is_deleted == False) | (MenuCategory.is_deleted.is_(None))
            )
        )
        if not cat_check.scalar_one_or_none():
            fallback_cat_res = await db.execute(
                select(MenuCategory).where(
                    (MenuCategory.is_deleted == False) | (MenuCategory.is_deleted.is_(None))
                ).order_by(MenuCategory.id.asc())
            )
            first_cat = fallback_cat_res.scalars().first()
            if first_cat:
                body.category_id = first_cat.id
            else:
                raise HTTPException(status_code=400, detail="No active categories exist. Please create a category first.")

        raw_item_code = getattr(body, "item_code", None)
        if not raw_item_code:
            import random
            clean_prefix = "".join(c for c in body.name if c.isalnum()).upper()[:4] or "DISH"
            raw_item_code = f"{clean_prefix}-{random.randint(100, 999)}"

        item = MenuItem(
            tenant_id=tenant_id,
            branch_id=body.branch_id if body.branch_id else None,
            category_id=body.category_id,
            item_code=raw_item_code,
            name=body.name,
            description=body.description,
            short_description=body.short_description,
            price=body.base_price,
            tax_rate=body.gst_percent,
            packaging_charge=body.packaging_charge,
            image_url=body.image_url,
            images=body.images,
            product_id=body.product_id,
            kds_station=body.kds_station,
            allergens=body.allergens,
            nutrition=body.nutrition,
            is_veg=body.is_veg,
            is_popular=body.is_popular,
            is_available=body.is_available,
            sort_order=body.sort_order,
            created_by=user_id
        )
        db.add(item)
        await db.flush()

        # Process nested variant groups
        for vg_dto in (body.variant_groups or []):
            vg = MenuVariantGroup(
                tenant_id=tenant_id,
                branch_id=body.branch_id if body.branch_id else None,
                item_id=item.id,
                name=vg_dto.name,
                min_selection=vg_dto.min_selection,
                max_selection=vg_dto.max_selection,
                is_required=vg_dto.is_required,
                sort_order=vg_dto.sort_order,
                created_by=user_id,
            )
            db.add(vg)
            await db.flush()

            for opt_dto in (vg_dto.options or []):
                opt_sp = opt_dto.selling_price or opt_dto.price or 0.0
                opt = MenuVariantOption(
                    tenant_id=tenant_id,
                    branch_id=body.branch_id if body.branch_id else None,
                    group_id=vg.id,
                    name=opt_dto.name,
                    selling_price=opt_sp,
                    price=opt_sp,
                    is_default=opt_dto.is_default,
                    is_available=opt_dto.is_available,
                    sort_order=opt_dto.sort_order,
                    created_by=user_id,
                )
                db.add(opt)

        # Process nested addon groups
        for ag_dto in (body.addon_groups or []):
            ag = MenuAddonGroup(
                tenant_id=tenant_id,
                branch_id=body.branch_id if body.branch_id else None,
                item_id=item.id,
                name=ag_dto.name,
                min_selection=ag_dto.min_selection,
                max_selection=ag_dto.max_selection,
                sort_order=ag_dto.sort_order,
                created_by=user_id,
            )
            db.add(ag)
            await db.flush()

            for opt_dto in (ag_dto.options or []):
                opt = MenuAddonOption(
                    tenant_id=tenant_id,
                    branch_id=body.branch_id if body.branch_id else None,
                    group_id=ag.id,
                    name=opt_dto.name,
                    price=opt_dto.price,
                    variant_prices=opt_dto.variant_prices,
                    is_available=opt_dto.is_available,
                    sort_order=opt_dto.sort_order,
                    created_by=user_id,
                )
                db.add(opt)

        # Process tag associations
        for tag_id in (body.tag_ids or []):
            it_tag = MenuItemTag(
                tenant_id=tenant_id,
                branch_id=body.branch_id if body.branch_id else None,
                item_id=item.id,
                tag_id=tag_id,
            )
            db.add(it_tag)

        await db.commit()
    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        logger.error("Failed to create menu item", error=str(exc))
        raise HTTPException(status_code=500, detail=f"Failed to create menu item: {str(exc)}")

    # Re-fetch item to populate selectin relationships
    refreshed_stmt = select(MenuItem).where(MenuItem.id == item.id)
    refreshed_res = await db.execute(refreshed_stmt)
    refreshed_item = refreshed_res.scalar_one_or_none()
    if not refreshed_item:
        raise HTTPException(status_code=404, detail="Created menu item not found")

    return MenuItemResponseSchema.model_validate(_build_menu_item_response(refreshed_item))


@router.put("/menu-items/{item_id}", response_model=MenuItemResponseSchema)
async def update_menu_item(
    item_id: int,
    body: MenuItemCreateSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> MenuItemResponseSchema:
    result = await db.execute(
        select(MenuItem).where(
            MenuItem.id == item_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    tenant_id = current_user.tenant_id if current_user and current_user.tenant_id else (item.tenant_id or 2)
    user_id = current_user.id if current_user else 1

    try:
        # Validate category_id exists
        cat_check = await db.execute(
            select(MenuCategory).where(
                MenuCategory.id == body.category_id,
                (MenuCategory.is_deleted == False) | (MenuCategory.is_deleted.is_(None))
            )
        )
        if cat_check.scalar_one_or_none():
            item.category_id = body.category_id

        item.name = body.name
        if getattr(body, "item_code", None):
            item.item_code = body.item_code
        elif not item.item_code:
            import random
            clean_prefix = "".join(c for c in body.name if c.isalnum()).upper()[:4] or "DISH"
            item.item_code = f"{clean_prefix}-{random.randint(100, 999)}"
        item.description = body.description
        item.short_description = body.short_description
        item.price = body.base_price
        item.tax_rate = body.gst_percent
        item.packaging_charge = body.packaging_charge
        item.image_url = body.image_url
        item.images = body.images
        item.product_id = body.product_id
        item.kds_station = body.kds_station
        item.allergens = body.allergens
        item.nutrition = body.nutrition
        item.is_veg = body.is_veg
        item.is_popular = body.is_popular
        item.is_available = body.is_available
        item.sort_order = body.sort_order
        item.branch_id = body.branch_id
        item.updated_by = user_id

        # Refresh nested groups only when payload provides actual groups.
        if body.variant_groups is not None and len(body.variant_groups) > 0:
            from sqlalchemy import delete
            await db.execute(delete(MenuVariantGroup).where(MenuVariantGroup.item_id == item.id))
            await db.flush()
            for vg_dto in body.variant_groups:
                vg = MenuVariantGroup(
                    tenant_id=tenant_id,
                    branch_id=body.branch_id or 1,
                    item_id=item.id,
                    name=vg_dto.name,
                    min_selection=vg_dto.min_selection,
                    max_selection=vg_dto.max_selection,
                    is_required=vg_dto.is_required,
                    sort_order=vg_dto.sort_order,
                    created_by=user_id,
                )
                db.add(vg)
                await db.flush()
                for opt_dto in vg_dto.options:
                    opt_sp = opt_dto.selling_price or opt_dto.price or 0.0
                    opt = MenuVariantOption(
                        tenant_id=tenant_id,
                        branch_id=body.branch_id or 1,
                        group_id=vg.id,
                        name=opt_dto.name,
                        selling_price=opt_sp,
                        price=opt_sp,
                        is_default=opt_dto.is_default,
                        is_available=opt_dto.is_available,
                        sort_order=opt_dto.sort_order,
                        created_by=user_id,
                    )
                    db.add(opt)

        # Refresh addon groups with size-based variant_prices
        if body.addon_groups is not None and len(body.addon_groups) > 0:
            from sqlalchemy import delete
            await db.execute(delete(MenuAddonGroup).where(MenuAddonGroup.item_id == item.id))
            await db.flush()
            for ag_dto in body.addon_groups:
                ag = MenuAddonGroup(
                    tenant_id=tenant_id,
                    branch_id=body.branch_id or 1,
                    item_id=item.id,
                    name=ag_dto.name,
                    min_selection=ag_dto.min_selection,
                    max_selection=ag_dto.max_selection,
                    sort_order=ag_dto.sort_order,
                    created_by=user_id,
                )
                db.add(ag)
                await db.flush()
                for opt_dto in ag_dto.options:
                    opt = MenuAddonOption(
                        tenant_id=tenant_id,
                        branch_id=body.branch_id or 1,
                        group_id=ag.id,
                        name=opt_dto.name,
                        price=opt_dto.price,
                        variant_prices=opt_dto.variant_prices,
                        is_available=opt_dto.is_available,
                        sort_order=opt_dto.sort_order,
                        created_by=user_id,
                    )
                    db.add(opt)

        await db.commit()
    except HTTPException:
        await db.rollback()
        raise
    except Exception as exc:
        await db.rollback()
        logger.error("Failed to update menu item", error=str(exc))
        raise HTTPException(status_code=500, detail=f"Failed to update menu item: {str(exc)}")

    # Re-fetch item
    refreshed_stmt = select(MenuItem).where(MenuItem.id == item.id)
    refreshed_res = await db.execute(refreshed_stmt)
    refreshed_item = refreshed_res.scalar_one_or_none()
    if not refreshed_item:
        raise HTTPException(status_code=404, detail="Updated menu item not found")

    return MenuItemResponseSchema.model_validate(_build_menu_item_response(refreshed_item))


@router.delete("/menu-items/{item_id}")
async def delete_menu_item(
    item_id: int,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    result = await db.execute(
        select(MenuItem).where(
            MenuItem.id == item_id
        )
    )
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    
    item.is_deleted = True
    if hasattr(item, "updated_by") and current_user:
        item.updated_by = current_user.id
    try:
        await db.commit()
        return {"message": "Menu item deleted successfully", "id": item_id}
    except Exception as exc:
        await db.rollback()
        logger.error("Failed to delete menu item", error=str(exc))
        raise HTTPException(status_code=500, detail="Failed to delete menu item")


# ─── POS Shift & Cash Drawer Endpoints ─────────────────────────

from src.modules.restaurant.models import PosShift, PosShiftTransaction
from src.modules.restaurant.schemas import (
    PosShiftOpenSchema,
    PosShiftCloseSchema,
    PosShiftPayInOutSchema,
    PosShiftResponseSchema,
    PosShiftTransactionResponseSchema,
)


@router.get("/shifts/current", response_model=PosShiftResponseSchema | None)
async def get_current_shift(
    branch_id: int | None = 1,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> PosShiftResponseSchema | None:
    """Get active open POS shift with live transaction logs."""
    tenant_id = current_user.tenant_id if current_user else 1

    stmt = (
        select(PosShift)
        .where(
            PosShift.tenant_id == tenant_id,
            PosShift.status == "open",
            (PosShift.is_deleted == False) | (PosShift.is_deleted.is_(None))
        )
        .options(selectinload(PosShift.transactions))
        .order_by(PosShift.opened_at.desc())
    )
    res = await db.execute(stmt)
    shift = res.scalar_one_or_none()

    if not shift:
        raise HTTPException(status_code=404, detail="No active POS shift currently open for this branch.")

    return PosShiftResponseSchema.model_validate(shift)


@router.post("/shifts/open", response_model=PosShiftResponseSchema)
async def open_shift(
    body: PosShiftOpenSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> PosShiftResponseSchema:
    tenant_id = current_user.tenant_id if current_user else 1
    user_id = current_user.id if current_user else 1
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    shift_num = f"SH-{now.strftime('%Y%m%d%H%M%S')}"

    # Close any previous open shift
    prev_res = await db.execute(
        select(PosShift).where(PosShift.tenant_id == tenant_id, PosShift.status == "open")
    )
    for s in prev_res.scalars().all():
        s.status = "closed"
        s.closed_at = now

    shift = PosShift(
        tenant_id=tenant_id,
        branch_id=1,
        shift_number=shift_num,
        cashier_name=body.cashier_name or "Baithak Admin",
        status="open",
        opening_cash=body.opening_cash,
        expected_cash=body.opening_cash,
        opened_at=now,
        notes=body.notes,
        created_by=user_id,
    )
    db.add(shift)
    await db.flush()

    t_init = PosShiftTransaction(
        tenant_id=tenant_id,
        shift_id=shift.id,
        type="OPENING",
        amount=body.opening_cash,
        reason="Shift Opening Float",
        performed_by=body.cashier_name or "Baithak Admin"
    )
    db.add(t_init)
    await db.commit()
    await db.refresh(shift, ["transactions"])
    return PosShiftResponseSchema.model_validate(shift)


@router.post("/shifts/close", response_model=PosShiftResponseSchema)
async def close_shift(
    body: PosShiftCloseSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> PosShiftResponseSchema:
    tenant_id = current_user.tenant_id if current_user else 1
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)

    res = await db.execute(
        select(PosShift)
        .where(PosShift.tenant_id == tenant_id, PosShift.status == "open")
        .options(selectinload(PosShift.transactions))
        .order_by(PosShift.opened_at.desc())
    )
    shift = res.scalar_one_or_none()
    if not shift:
        raise HTTPException(status_code=400, detail="No active open shift found")

    expected = shift.opening_cash + shift.cash_sales + shift.pay_ins - shift.pay_outs
    variance = body.closing_cash - expected

    shift.status = "closed"
    shift.closing_cash = body.closing_cash
    shift.expected_cash = expected
    shift.variance = variance
    shift.closed_at = now
    if body.notes:
        shift.notes = body.notes

    t_close = PosShiftTransaction(
        tenant_id=tenant_id,
        shift_id=shift.id,
        type="SHIFT_CLOSE",
        amount=body.closing_cash,
        reason=f"Shift Closed (Variance: ₹{variance:+.2f})",
        performed_by=shift.cashier_name
    )
    db.add(t_close)
    await db.commit()
    await db.refresh(shift, ["transactions"])
    return PosShiftResponseSchema.model_validate(shift)


@router.post("/shifts/pay-in-out", response_model=PosShiftResponseSchema)
async def shift_pay_in_out(
    body: PosShiftPayInOutSchema,
    current_user: User | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db_session),
) -> PosShiftResponseSchema:
    tenant_id = current_user.tenant_id if current_user else 1

    res = await db.execute(
        select(PosShift)
        .where(PosShift.tenant_id == tenant_id, PosShift.status == "open")
        .options(selectinload(PosShift.transactions))
        .order_by(PosShift.opened_at.desc())
    )
    shift = res.scalar_one_or_none()
    if not shift:
        raise HTTPException(status_code=400, detail="No open shift to perform drawer pay-in/pay-out")

    ttype = body.type.upper()
    if ttype == "PAY_IN":
        shift.pay_ins += body.amount
    elif ttype == "PAY_OUT":
        shift.pay_outs += body.amount
    else:
        raise HTTPException(status_code=400, detail="Type must be PAY_IN or PAY_OUT")

    shift.expected_cash = shift.opening_cash + shift.cash_sales + shift.pay_ins - shift.pay_outs

    t_log = PosShiftTransaction(
        tenant_id=tenant_id,
        shift_id=shift.id,
        type=ttype,
        amount=body.amount,
        reason=body.reason,
        performed_by=body.performed_by or "Baithak Admin"
    )
    db.add(t_log)
    await db.commit()
    await db.refresh(shift, ["transactions"])
    return PosShiftResponseSchema.model_validate(shift)



