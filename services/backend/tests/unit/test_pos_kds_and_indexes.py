import pytest
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from src.modules.orders.models import OrderItem, KOT, Order
from src.modules.orders.schemas import KOTResponseSchema


def test_order_item_nullable_product_id():
    item = OrderItem(
        tenant_id=1,
        order_id=10,
        menu_item_id=100,
        product_id=None,  # Verified nullable
        product_name="Kurkure Momos",
        quantity=Decimal("2"),
        unit_price=Decimal("130.00"),
        line_total=Decimal("260.00")
    )
    assert item.product_id is None
    assert item.product_name == "Kurkure Momos"


def test_kot_schema_validation():
    kot_data = {
        "id": 1,
        "branch_id": 1,
        "order_id": 100,
        "kot_number": "KOT-ORD-100-112000-1",
        "station_id": 10,
        "station_name": "Chinese & Wok",
        "status": "printed",
        "items": [
            {
                "id": 101,
                "kot_id": 1,
                "order_item_id": 5,
                "quantity": Decimal("2"),
                "status": "preparing",
                "notes": "Extra crispy"
            }
        ],
        "created_at": "2026-07-27T11:40:00Z"
    }
    res = KOTResponseSchema.model_validate(kot_data)
    assert res.kot_number == "KOT-ORD-100-112000-1"
    assert len(res.items) == 1
    assert res.items[0].status == "preparing"
