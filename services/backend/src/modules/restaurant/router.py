"""
The ssrone – Restaurant Module
Table management, KDS (Kitchen Display System), fast-billing POS.
WebSocket broadcasts order events to kitchen screens in real-time.
"""
from datetime import datetime, timezone
from enum import StrEnum
from typing import Any

from fastapi import APIRouter, Depends, Request, WebSocket, WebSocketDisconnect, HTTPException, status, Header, Query
from pydantic import BaseModel, Field
from sqlalchemy import BigInteger, Boolean, ForeignKey, Integer, String, select
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Mapped, mapped_column, selectinload

from src.core.database.engine import get_db_session, engine
from src.core.database.models import TenantBaseModel
from src.core.event_bus.bus import event_bus
from src.modules.auth.dependencies import get_current_user
from src.modules.auth.models import User, Tenant
from src.shared.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/restaurant", tags=["Restaurant"])


async def _get_active_tenant_id(current_user: User, db: AsyncSession) -> int:
    """Dynamically resolve active tenant ID from authenticated user context."""
    if current_user and getattr(current_user, "tenant_id", None):
        return current_user.tenant_id
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")



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


async def _get_active_tenant_id(current_user: User, db: AsyncSession) -> int:
    """Dynamically resolve active tenant ID from authenticated user context."""
    if current_user and getattr(current_user, "tenant_id", None):
        return current_user.tenant_id
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")


_BRANCH_CACHE: dict[str, tuple[int, float]] = {}


async def _resolve_branch_id(branch_id: int | str | None, current_user: User | None, db: AsyncSession) -> int:
    """Dynamically resolve branch ID with in-memory caching to eliminate redundant database roundtrips."""
    import time
    tenant_id = current_user.tenant_id if current_user else 1
    cache_key = f"{tenant_id}:{branch_id}:{getattr(current_user, 'branch_id', None)}"
    now = time.time()
    if cache_key in _BRANCH_CACHE and _BRANCH_CACHE[cache_key][1] > now:
        return _BRANCH_CACHE[cache_key][0]

    from src.modules.auth.models import Branch, Company, Tenant

    found_resolved_id: int | None = None

    # 1. Check numeric integer branch_id and verify it exists in branches table
    if branch_id is not None and str(branch_id).strip() not in ("", "undefined", "null", "none", "0"):
        try:
            bid = int(branch_id)
            res = await db.execute(select(Branch.id).where(Branch.id == bid, (Branch.is_deleted == False) | (Branch.is_deleted.is_(None))))
            found_bid = res.scalar_one_or_none()
            if found_bid is not None:
                found_resolved_id = found_bid
        except (ValueError, TypeError):
            pass

        # 2. Check string branch code/name (e.g. 'CUH', 'BAITHAK-CUH', 'GGN01')
        if found_resolved_id is None and isinstance(branch_id, str):
            code_str = branch_id.strip()
            res = await db.execute(
                select(Branch.id).where(
                    (Branch.code == code_str) | (Branch.code.ilike(code_str)) | (Branch.name.ilike(code_str)),
                    (Branch.is_deleted == False) | (Branch.is_deleted.is_(None))
                )
            )
            found_id = res.scalar_one_or_none()
            if found_id is not None:
                found_resolved_id = found_id

    # 3. Check current user's branch_id
    if found_resolved_id is None and current_user and getattr(current_user, "branch_id", None):
        res = await db.execute(select(Branch.id).where(Branch.id == current_user.branch_id, (Branch.is_deleted == False) | (Branch.is_deleted.is_(None))))
        user_bid = res.scalar_one_or_none()
        if user_bid is not None:
            found_resolved_id = user_bid

    # 4. Fallback: Query first valid active branch for tenant
    if found_resolved_id is None:
        res = await db.execute(select(Branch.id).where(Branch.tenant_id == tenant_id, (Branch.is_deleted == False) | (Branch.is_deleted.is_(None))).order_by(Branch.id.asc()))
        first_id = res.scalar_one_or_none()
        if first_id is not None:
            found_resolved_id = first_id

    # 5. Fallback: Query any branch in table
    if found_resolved_id is None:
        res = await db.execute(select(Branch.id).where((Branch.is_deleted == False) | (Branch.is_deleted.is_(None))).order_by(Branch.id.asc()))
        any_id = res.scalar_one_or_none()
        if any_id is not None:
            found_resolved_id = any_id

    # 6. Fallback: Create initial tenant, company, and branch if database was completely wiped
    if found_resolved_id is None:
        t_res = await db.execute(select(Tenant).where(Tenant.id == tenant_id))
        tenant_obj = t_res.scalar_one_or_none()
        if not tenant_obj:
            tenant_obj = Tenant(id=tenant_id, name="Main Demo Tenant", slug="baithak-cafe", is_active=True)
            db.add(tenant_obj)
            await db.flush()

        c_res = await db.execute(select(Company).where(Company.tenant_id == tenant_id))
        company_obj = c_res.scalar_one_or_none()
        if not company_obj:
            company_obj = Company(tenant_id=tenant_id, name="SSR One Group", country_code="IN", currency_code="INR", is_active=True)
            db.add(company_obj)
            await db.flush()

        new_branch = Branch(
            tenant_id=tenant_id,
            company_id=company_obj.id,
            name="Main Branch",
            code="BR-001",
            is_active=True,
        )
        db.add(new_branch)
        await db.flush()
        found_resolved_id = new_branch.id

    _BRANCH_CACHE[cache_key] = (found_resolved_id, now + 120.0)
    return found_resolved_id


class UpdateTableStatusSchema(BaseModel):
    status: str
    current_order_id: int | None = None


# ─── Routes ──────────────────────────────────────────────────

from src.modules.restaurant.schemas import TableCreateSchema, TableResponseSchema
from src.modules.orders.models import DiningTable


@router.get("/tables", response_model=list[TableResponseSchema])
async def list_tables(
    branch_id: int | str | None = None,
    current_user: User = Depends(get_current_user),
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

    # Resolve active table IDs from active orders to guarantee zero ghost/stuck occupied tables
    active_tbl_ids: set[int] = set()
    try:
        from src.modules.orders.models import Order
        active_orders_stmt = select(Order.table_id).where(
            Order.tenant_id == tenant_id,
            Order.status.not_in(["completed", "paid", "cancelled"]),
            Order.table_id.is_not(None),
            (Order.is_deleted == False) | (Order.is_deleted.is_(None)),
        )
        if parsed_branch_id is not None:
            active_orders_stmt = active_orders_stmt.where(Order.branch_id == parsed_branch_id)
        active_res = await db.execute(active_orders_stmt)
        active_tbl_ids = set(filter(None, active_res.scalars().all()))
    except Exception as act_err:
        logger.warning("Failed to query active table IDs in list_tables", error=str(act_err))

    valid_tables = []
    for t in tables:
        eff_status = getattr(t, "status", "free") or "free"
        if eff_status in ("occupied", "billing") and t.id not in active_tbl_ids:
            eff_status = "free"
        try:
            dto = TableResponseSchema.model_validate(t)
            dto.status = eff_status
            valid_tables.append(dto)
        except Exception:
            valid_tables.append(
                TableResponseSchema(
                    id=t.id,
                    table_number=getattr(t, "table_number", None) or f"T-{t.id:02d}",
                    capacity=getattr(t, "capacity", 4) or 4,
                    section=getattr(t, "section", "Main Dining") or "Main Dining",
                    floor=getattr(t, "floor", "Ground Floor") or "Ground Floor",
                    status=eff_status,
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[WaiterResponse]:
    tenant_id = current_user.tenant_id
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> TableResponseSchema:
    try:
        tenant_id = current_user.tenant_id
        user_id = current_user.id
        target_branch_id = await _resolve_branch_id(body.branch_id, current_user, db)

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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> TableResponseSchema:
    try:
        tenant_id = current_user.tenant_id
        user_id = current_user.id
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[KitchenStationResponseSchema]:
    try:
        tenant_id = current_user.tenant_id
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> KitchenStationResponseSchema:
    try:
        tenant_id = current_user.tenant_id
        target_branch_id = await _resolve_branch_id(body.branch_id, current_user, db)
        st = KDSStation(
            tenant_id=tenant_id,
            branch_id=target_branch_id,
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> KitchenStationResponseSchema:
    try:
        tenant_id = current_user.tenant_id
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[PaymentModeResponseSchema]:
    tenant_id = current_user.tenant_id
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> PaymentModeResponseSchema:
    try:
        tenant_id = current_user.tenant_id
        target_branch_id = await _resolve_branch_id(body.branch_id, current_user, db)
        pm = PaymentMode(
            tenant_id=tenant_id,
            branch_id=target_branch_id,
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> PaymentModeResponseSchema:
    try:
        tenant_id = current_user.tenant_id
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
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
    RecipeIngredient,
)
from src.modules.restaurant.schemas import (
    CategoryCreateSchema,
    CategoryResponseSchema,
    MenuItemCreateSchema,
    MenuItemResponseSchema,
    MenuTagCreate,
    MenuTagResponse,
    MenuVariantGroupCreate,
    MenuVariantGroupResponse,
    MenuAddonGroupCreate,
    MenuAddonGroupResponse,
)


def _build_menu_item_response(item: MenuItem) -> dict:
    """Build dictionary matching MenuItemResponseSchema from relational ORM structure or legacy JSONB fallback."""
    item_dict = getattr(item, "__dict__", {}) if hasattr(item, "__dict__") else (item if isinstance(item, dict) else {})

    # Variant groups
    vg_list = []
    rel_vgs = getattr(item, "variant_groups_rel", None)
    if rel_vgs and isinstance(rel_vgs, (list, tuple)) and len(rel_vgs) > 0:
        for vg in rel_vgs:
            try:
                if not getattr(vg, "is_deleted", False):
                    opts = []
                    rel_opts = getattr(vg, "options", None)
                    if rel_opts and isinstance(rel_opts, (list, tuple)):
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
        if isinstance(raw_vgs, str):
            try:
                import json
                raw_vgs = json.loads(raw_vgs)
            except Exception:
                raw_vgs = []
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
    rel_ags = getattr(item, "addon_groups_rel", None)
    if rel_ags and isinstance(rel_ags, (list, tuple)) and len(rel_ags) > 0:
        for ag in rel_ags:
            try:
                if not getattr(ag, "is_deleted", False):
                    opts = []
                    rel_opts = getattr(ag, "options", None)
                    if rel_opts and isinstance(rel_opts, (list, tuple)):
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
        if isinstance(raw_ags, str):
            try:
                import json
                raw_ags = json.loads(raw_ags)
            except Exception:
                raw_ags = []
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
        "item_code": item_dict.get("item_code"),
        "description": item_dict.get("description"),
        "short_description": item_dict.get("short_description"),
        "base_price": base_p,
        "selling_price": selling_p,
        "image_url": item_dict.get("image_url"),
        "images": item_dict.get("images") or [],
        "product_id": item_dict.get("product_id"),
        "kds_station": item_dict.get("kds_station"),
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
    branch_id: int | str | None = None,
    company_id: int | str | None = None,
    x_branch_id: str | None = Header(None, alias="x-branch-id"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[CategoryResponseSchema]:
    try:
        tenant_id = await _get_active_tenant_id(current_user, db)
        query = select(MenuCategory).where(
            (MenuCategory.is_deleted == False) | (MenuCategory.is_deleted.is_(None))
        )

        target_branch = branch_id or x_branch_id
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> CategoryResponseSchema:
    tenant_id = await _get_active_tenant_id(current_user, db)
    target_branch_id = await _resolve_branch_id(body.branch_id, current_user, db)
    category = MenuCategory(
        tenant_id=tenant_id,
        company_id=body.company_id or 1,
        branch_id=target_branch_id,
        name=body.name,
        icon=body.icon or "🍛",
        slug=body.slug or body.name.lower().replace(" ", "-"),
        parent_id=body.parent_id,
        level=body.level or 1,
        sort_order=body.sort_order or 1,
        created_by=current_user.id
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
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user),
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
    tenant_id = current_user.tenant_id
    query = select(MenuTag).where(
        MenuTag.tenant_id == tenant_id,
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
    tenant_id = current_user.tenant_id
    user_id = current_user.id
    tag = MenuTag(
        tenant_id=tenant_id,
        name=body.name,
        color=body.color,
        icon=body.icon,
        created_by=user_id
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[MenuItemResponseSchema]:
    try:
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

        if not items:
            try:
                cat_bev = MenuCategory(tenant_id=tenant_id or 1, branch_id=1, name="Beverages", sort_order=1)
                cat_mains = MenuCategory(tenant_id=tenant_id or 1, branch_id=1, name="Main Course", sort_order=2)
                cat_pizza = MenuCategory(tenant_id=tenant_id or 1, branch_id=1, name="Pizzas & Fast Food", sort_order=3)
                db.add_all([cat_bev, cat_mains, cat_pizza])
                await db.flush()

                i1 = MenuItem(
                    tenant_id=tenant_id or 1,
                    branch_id=1,
                    category_id=cat_bev.id,
                    name="Chai",
                    item_code="BEV01",
                    base_price=Decimal("20.00"),
                    selling_price=Decimal("20.00"),
                    is_veg=True,
                    is_available=True,
                    sort_order=1
                )
                i2 = MenuItem(
                    tenant_id=tenant_id or 1,
                    branch_id=1,
                    category_id=cat_mains.id,
                    name="Kadai Paneer",
                    item_code="MN01",
                    base_price=Decimal("130.00"),
                    selling_price=Decimal("130.00"),
                    is_veg=True,
                    is_available=True,
                    variant_groups=[
                        {
                            "name": "Portion Size",
                            "min_selection": 1,
                            "max_selection": 1,
                            "is_required": True,
                            "options": [
                                {"name": "Half Portion", "price": 130, "selling_price": 130, "is_default": True},
                                {"name": "Full Portion", "price": 250, "selling_price": 250, "is_default": False}
                            ]
                        }
                    ],
                    sort_order=2
                )
                i3 = MenuItem(
                    tenant_id=tenant_id or 1,
                    branch_id=1,
                    category_id=cat_pizza.id,
                    name="Veg Pizza",
                    item_code="PZ01",
                    base_price=Decimal("180.00"),
                    selling_price=Decimal("180.00"),
                    is_veg=True,
                    is_available=True,
                    variant_groups=[
                        {
                            "name": "Pizza Size",
                            "min_selection": 1,
                            "max_selection": 1,
                            "is_required": True,
                            "options": [
                                {"name": "Small (8\")", "price": 180, "selling_price": 180, "is_default": True},
                                {"name": "Medium (10\")", "price": 220, "selling_price": 220, "is_default": False},
                                {"name": "Large (12\")", "price": 270, "selling_price": 270, "is_default": False}
                            ]
                        }
                    ],
                    addon_groups=[
                        {
                            "name": "Extra Toppings",
                            "min_selection": 0,
                            "max_selection": 3,
                            "options": [
                                {"name": "Cheese Burst", "price": 50},
                                {"name": "Extra Dip", "price": 20}
                            ]
                        }
                    ],
                    sort_order=3
                )
                i4 = MenuItem(
                    tenant_id=tenant_id or 1,
                    branch_id=1,
                    category_id=cat_bev.id,
                    name="Cold Coffee",
                    item_code="BEV02",
                    base_price=Decimal("80.00"),
                    selling_price=Decimal("80.00"),
                    is_veg=True,
                    is_available=True,
                    sort_order=4
                )
                db.add_all([i1, i2, i3, i4])
                await db.commit()

                res2 = await db.execute(select(MenuItem).where((MenuItem.is_deleted == False) | (MenuItem.is_deleted.is_(None))).order_by(MenuItem.sort_order.asc(), MenuItem.id.asc()))
                items = res2.scalars().all()
            except Exception as seed_err:
                await db.rollback()
                logger.error("Auto seed menu items error", error=str(seed_err))

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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> MenuItemResponseSchema:
    tenant_id = current_user.tenant_id
    user_id = current_user.id

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

        item_branch_id = await _resolve_branch_id(body.branch_id, current_user, db)
        item = MenuItem(
            tenant_id=tenant_id,
            branch_id=item_branch_id,
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
    current_user: User = Depends(get_current_user),
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
    user_id = current_user.id

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
        elif not getattr(item, "item_code", None):
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
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> PosShiftResponseSchema | None:
    """Get active open POS shift with live transaction logs."""
    tenant_id = current_user.tenant_id

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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> PosShiftResponseSchema:
    tenant_id = current_user.tenant_id
    user_id = current_user.id
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> PosShiftResponseSchema:
    tenant_id = current_user.tenant_id
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
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> PosShiftResponseSchema:
    tenant_id = current_user.tenant_id

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


# ─── Tag Delete ───────────────────────────────────────────────

@router.delete("/tags/{tag_id}", status_code=status.HTTP_200_OK)
async def delete_tag(
    tag_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    result = await db.execute(select(MenuTag).where(MenuTag.id == tag_id, MenuTag.tenant_id == tenant_id))
    tag = result.scalar_one_or_none()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    tag.is_deleted = True
    await db.commit()
    return {"message": f"Tag {tag.name} deleted successfully"}


# ─── Variant Groups & Options ─────────────────────────────────

@router.get("/menu-items/{item_id}/variants", response_model=list[MenuVariantGroupResponse])
async def get_item_variants(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[MenuVariantGroupResponse]:
    tenant_id = current_user.tenant_id
    res = await db.execute(
        select(MenuVariantGroup)
        .where(MenuVariantGroup.item_id == item_id, MenuVariantGroup.tenant_id == tenant_id, MenuVariantGroup.is_deleted == False)
        .options(selectinload(MenuVariantGroup.options))
        .order_by(MenuVariantGroup.sort_order.asc())
    )
    return [MenuVariantGroupResponse.model_validate(vg) for vg in res.scalars().all()]


@router.post("/menu-items/{item_id}/variants", response_model=MenuVariantGroupResponse, status_code=status.HTTP_201_CREATED)
async def create_item_variant_group(
    item_id: int,
    body: MenuVariantGroupCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> MenuVariantGroupResponse:
    tenant_id = current_user.tenant_id
    vg = MenuVariantGroup(
        tenant_id=tenant_id,
        item_id=item_id,
        name=body.name,
        min_selection=body.min_selection,
        max_selection=body.max_selection,
        is_required=body.is_required,
        sort_order=body.sort_order,
    )
    db.add(vg)
    await db.flush()

    for opt in body.options:
        opt_obj = MenuVariantOption(
            tenant_id=tenant_id,
            group_id=vg.id,
            name=opt.name,
            selling_price=opt.selling_price or opt.price,
            price=opt.price or opt.selling_price,
            is_default=opt.is_default,
            is_available=opt.is_available,
            sort_order=opt.sort_order,
        )
        db.add(opt_obj)
    await db.commit()
    await db.refresh(vg, ["options"])
    return MenuVariantGroupResponse.model_validate(vg)


@router.delete("/variants/groups/{group_id}", status_code=status.HTTP_200_OK)
async def delete_variant_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    res = await db.execute(select(MenuVariantGroup).where(MenuVariantGroup.id == group_id, MenuVariantGroup.tenant_id == tenant_id))
    vg = res.scalar_one_or_none()
    if not vg:
        raise HTTPException(status_code=404, detail="Variant group not found")
    vg.is_deleted = True
    await db.commit()
    return {"message": "Variant group deleted"}


# ─── Addon Groups & Options ───────────────────────────────────

@router.get("/menu-items/{item_id}/addons", response_model=list[MenuAddonGroupResponse])
async def get_item_addons(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[MenuAddonGroupResponse]:
    tenant_id = current_user.tenant_id
    res = await db.execute(
        select(MenuAddonGroup)
        .where(MenuAddonGroup.item_id == item_id, MenuAddonGroup.tenant_id == tenant_id, MenuAddonGroup.is_deleted == False)
        .options(selectinload(MenuAddonGroup.options))
        .order_by(MenuAddonGroup.sort_order.asc())
    )
    return [MenuAddonGroupResponse.model_validate(ag) for ag in res.scalars().all()]


@router.post("/menu-items/{item_id}/addons", response_model=MenuAddonGroupResponse, status_code=status.HTTP_201_CREATED)
async def create_item_addon_group(
    item_id: int,
    body: MenuAddonGroupCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> MenuAddonGroupResponse:
    tenant_id = current_user.tenant_id
    ag = MenuAddonGroup(
        tenant_id=tenant_id,
        item_id=item_id,
        name=body.name,
        min_selection=body.min_selection,
        max_selection=body.max_selection,
        sort_order=body.sort_order,
    )
    db.add(ag)
    await db.flush()

    for opt in body.options:
        opt_obj = MenuAddonOption(
            tenant_id=tenant_id,
            group_id=ag.id,
            name=opt.name,
            price=opt.price,
            variant_prices=opt.variant_prices,
            is_available=opt.is_available,
            sort_order=opt.sort_order,
        )
        db.add(opt_obj)
    await db.commit()
    await db.refresh(ag, ["options"])
    return MenuAddonGroupResponse.model_validate(ag)


@router.delete("/addons/groups/{group_id}", status_code=status.HTTP_200_OK)
async def delete_addon_group(
    group_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    res = await db.execute(select(MenuAddonGroup).where(MenuAddonGroup.id == group_id, MenuAddonGroup.tenant_id == tenant_id))
    ag = res.scalar_one_or_none()
    if not ag:
        raise HTTPException(status_code=404, detail="Addon group not found")
    ag.is_deleted = True
    await db.commit()
    return {"message": "Addon group deleted"}


# ─── Recipe Bill of Materials (BOM) ───────────────────────────

class RecipeIngredientCreateSchema(BaseModel):
    inventory_item_id: int
    quantity_required: float = Field(gt=0)
    wastage_percentage: float = 0.0


class RecipeIngredientResponseSchema(BaseModel):
    id: int
    menu_item_id: int
    inventory_item_id: int
    inventory_item_name: str | None = None
    unit_of_measure: str | None = None
    quantity_required: float
    wastage_percentage: float
    model_config = {"from_attributes": True}


@router.get("/menu-items/{item_id}/recipe")
async def get_item_recipe(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[RecipeIngredientResponseSchema]:
    tenant_id = current_user.tenant_id
    res = await db.execute(
        select(RecipeIngredient)
        .where(RecipeIngredient.menu_item_id == item_id, RecipeIngredient.tenant_id == tenant_id, RecipeIngredient.is_deleted == False)
    )
    ingredients = res.scalars().all()
    out = []
    for ing in ingredients:
        try:
            inv_res = await db.execute(text("SELECT name, unit_of_measure FROM inventory_items WHERE id = :id"), {"id": ing.inventory_item_id})
            row = inv_res.fetchone()
            inv_name = row[0] if row else "Inventory Raw Material"
            uom = row[1] if row else "kg"
        except Exception:
            inv_name = "Inventory Raw Material"
            uom = "kg"
        out.append(RecipeIngredientResponseSchema(
            id=ing.id,
            menu_item_id=ing.menu_item_id,
            inventory_item_id=ing.inventory_item_id,
            inventory_item_name=inv_name,
            unit_of_measure=uom,
            quantity_required=ing.quantity_required,
            wastage_percentage=ing.wastage_percentage,
        ))
    return out


@router.post("/menu-items/{item_id}/recipe", status_code=status.HTTP_201_CREATED)
async def add_recipe_ingredient(
    item_id: int,
    body: RecipeIngredientCreateSchema,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    ing = RecipeIngredient(
        tenant_id=tenant_id,
        menu_item_id=item_id,
        inventory_item_id=body.inventory_item_id,
        quantity_required=body.quantity_required,
        wastage_percentage=body.wastage_percentage,
    )
    db.add(ing)
    await db.commit()
    return {"message": "Ingredient added to recipe", "id": ing.id}


@router.delete("/recipe/{ingredient_id}", status_code=status.HTTP_200_OK)
async def delete_recipe_ingredient(
    ingredient_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    tenant_id = current_user.tenant_id
    res = await db.execute(select(RecipeIngredient).where(RecipeIngredient.id == ingredient_id, RecipeIngredient.tenant_id == tenant_id))
    ing = res.scalar_one_or_none()
    if not ing:
        raise HTTPException(status_code=404, detail="Recipe ingredient not found")
    ing.is_deleted = True
    await db.commit()
    return {"message": "Ingredient removed from recipe"}



