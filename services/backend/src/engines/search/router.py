from typing import Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database.engine import get_db_session
from src.modules.auth.dependencies import get_current_user
from src.modules.auth.models import User
from src.modules.crm.models import Customer
from src.modules.orders.models import Order
from src.modules.hotel.models import Room
from src.modules.inventory.models import Product

router = APIRouter(prefix="/search", tags=["Unified Search"])

@router.get("")
async def search_all(
    q: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict[str, Any]:
    """
    Tenant-scoped search across Customers, Orders, Rooms, and Products.
    """
    q_pattern = f"%{q}%"
    tenant_id = current_user.tenant_id

    # 1. Search Customers
    cust_stmt = select(Customer).where(
        Customer.tenant_id == tenant_id,
        or_(
            Customer.first_name.ilike(q_pattern),
            Customer.last_name.ilike(q_pattern),
            Customer.email.ilike(q_pattern),
            Customer.phone.ilike(q_pattern),
        )
    ).limit(10)
    cust_res = await db.execute(cust_stmt)
    customers = [
        {
            "id": str(c.id),
            "title": f"{c.first_name} {c.last_name}",
            "subtitle": c.phone or c.email or "No Contact Info",
            "type": "customer",
            "url": f"/crm",
        }
        for c in cust_res.scalars().all()
    ]

    # 2. Search Orders
    ord_stmt = select(Order).where(
        Order.tenant_id == tenant_id,
        or_(
            Order.order_number.ilike(q_pattern),
        )
    ).limit(10)
    ord_res = await db.execute(ord_stmt)
    orders = [
        {
            "id": str(o.id),
            "title": f"Order {o.order_number}",
            "subtitle": f"{o.order_type.capitalize()} - {o.status.capitalize()}",
            "type": "order",
            "url": f"/pos",
        }
        for o in ord_res.scalars().all()
    ]

    # 3. Search Rooms
    room_stmt = select(Room).where(
        Room.tenant_id == tenant_id,
        or_(
            Room.room_number.ilike(q_pattern),
        )
    ).limit(10)
    room_res = await db.execute(room_stmt)
    rooms = [
        {
            "id": str(r.id),
            "title": f"Room {r.room_number}",
            "subtitle": f"Status: {r.status.capitalize()}",
            "type": "room",
            "url": f"/hotel",
        }
        for r in room_res.scalars().all()
    ]

    # 4. Search Products
    prod_stmt = select(Product).where(
        Product.tenant_id == tenant_id,
        or_(
            Product.name.ilike(q_pattern),
            Product.code.ilike(q_pattern),
        )
    ).limit(10)
    prod_res = await db.execute(prod_stmt)
    products = [
        {
            "id": str(p.id),
            "title": p.name,
            "subtitle": f"Code: {p.code} - {p.product_type.capitalize()}",
            "type": "product",
            "url": f"/inventory",
        }
        for p in prod_res.scalars().all()
    ]

    results = customers + orders + rooms + products

    return {
        "query": q,
        "results": results,
        "total": len(results),
    }
