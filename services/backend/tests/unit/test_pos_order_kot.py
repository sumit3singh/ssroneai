import pytest
from decimal import Decimal
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime, timezone
from fastapi import HTTPException

from src.modules.orders.router import (
    list_dining_tables,
    list_kitchen_stations,
    generate_kot,
    hold_order,
    resume_order,
    void_order,
    split_order,
    get_printable_bill,
)
from src.modules.orders.schemas import (
    HoldOrderSchema,
    VoidOrderSchema,
    SplitOrderSchema,
    SplitOrderItemInput,
)


class DummyResult:
    def __init__(self, items):
        self.items = items

    def scalars(self):
        return self

    def all(self):
        return self.items

    def scalar_one_or_none(self):
        return self.items[0] if self.items else None

    def scalar_one(self):
        return self.items[0]

    def first(self):
        return self.items[0] if self.items else None


@pytest.mark.asyncio
async def test_list_dining_tables():
    mock_user = SimpleNamespace(tenant_id=1, id=10)
    mock_db = AsyncMock()
    mock_table = SimpleNamespace(id=1, branch_id=1, table_number="T-01", name="Table 1", capacity=4, status="free", floor="Ground", sort_order=1, is_active=True)
    mock_db.execute.return_value = DummyResult([mock_table])

    tables = await list_dining_tables(branch_id=1, current_user=mock_user, db=mock_db)
    assert len(tables) == 1
    assert tables[0].table_number == "T-01"


@pytest.mark.asyncio
async def test_list_kitchen_stations():
    mock_user = SimpleNamespace(tenant_id=1, id=10)
    mock_db = AsyncMock()
    mock_st = SimpleNamespace(id=1, branch_id=1, name="Chinese & Wok", code="CHINESE", printer_name="PRINTER_01", is_active=True, sort_order=1)
    mock_db.execute.return_value = DummyResult([mock_st])

    stations = await list_kitchen_stations(branch_id=1, current_user=mock_user, db=mock_db)
    assert len(stations) == 1
    assert stations[0].code == "CHINESE"


@pytest.mark.asyncio
async def test_hold_and_resume_order():
    mock_user = SimpleNamespace(tenant_id=1, id=10)
    mock_db = AsyncMock()

    mock_order = SimpleNamespace(
        id=100,
        tenant_id=1,
        branch_id=1,
        order_number="ORD-100",
        order_type="dine_in",
        status="draft",
        payment_status="unpaid",
        subtotal=Decimal("300.00"),
        discount_amount=Decimal("0.00"),
        taxable_amount=Decimal("300.00"),
        cgst_amount=Decimal("7.50"),
        sgst_amount=Decimal("7.50"),
        igst_amount=Decimal("0.00"),
        total_tax=Decimal("15.00"),
        grand_total=Decimal("315.00"),
        amount_paid=Decimal("0.00"),
        balance_due=Decimal("315.00"),
        is_held=False,
        held_at=None,
        is_deleted=False,
        notes=None,
        special_instructions=None,
        source_channel="pos",
        metadata_payload={},
        customer_id=None,
        table_id=None,
        waiter_id=None,
        token_number=None,
        guest_count=1,
        parent_order_id=None,
        kot_sent_at=None,
        ready_at=None,
        served_at=None,
        confirmed_at=None,
        completed_at=None,
        cancelled_at=None,
        cancellation_reason=None,
        items=[],
        payments=[],
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    mock_db.execute.return_value = DummyResult([mock_order])

    # Hold test
    held_order = await hold_order(order_id=100, body=HoldOrderSchema(reason="Customer stepped out"), current_user=mock_user, db=mock_db)
    assert mock_order.is_held is True
    assert mock_order.held_at is not None

    # Resume test
    res_order = await resume_order(order_id=100, current_user=mock_user, db=mock_db)
    assert mock_order.is_held is False


@pytest.mark.asyncio
async def test_void_entire_order():
    mock_user = SimpleNamespace(tenant_id=1, id=10)
    mock_db = AsyncMock()

    mock_item = SimpleNamespace(
        id=1,
        order_id=100,
        product_id=5,
        product_name="Kurkure Momos",
        product_code="MOMO1",
        variant_id=None,
        variant_name=None,
        quantity=Decimal("2"),
        unit_of_measure="pcs",
        unit_price=Decimal("130.00"),
        mrp=Decimal("130.00"),
        discount_amount=Decimal("0.00"),
        tax_amount=Decimal("13.00"),
        line_total=Decimal("260.00"),
        kds_status="pending",
        kds_sent_at=None,
        kds_completed_at=None,
        course="Chinese",
        preparation_notes=None,
        modifiers=[],
        tax_breakdown={},
        is_voided=False,
        void_reason=None,
        voided_at=None,
        voided_by=None
    )
    mock_order = SimpleNamespace(
        id=100,
        tenant_id=1,
        branch_id=1,
        order_number="ORD-100",
        order_type="dine_in",
        status="confirmed",
        payment_status="unpaid",
        subtotal=Decimal("260.00"),
        discount_amount=Decimal("0.00"),
        taxable_amount=Decimal("260.00"),
        cgst_amount=Decimal("6.50"),
        sgst_amount=Decimal("6.50"),
        igst_amount=Decimal("0.00"),
        total_tax=Decimal("13.00"),
        grand_total=Decimal("273.00"),
        amount_paid=Decimal("0.00"),
        balance_due=Decimal("273.00"),
        is_held=False,
        held_at=None,
        notes=None,
        special_instructions=None,
        source_channel="pos",
        metadata_payload={},
        customer_id=None,
        table_id=None,
        waiter_id=None,
        token_number=None,
        guest_count=1,
        parent_order_id=None,
        kot_sent_at=None,
        ready_at=None,
        served_at=None,
        confirmed_at=None,
        completed_at=None,
        cancelled_at=None,
        cancellation_reason=None,
        is_deleted=False,
        items=[mock_item],
        payments=[],
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc)
    )
    mock_db.execute.return_value = DummyResult([mock_order])

    voided_res = await void_order(order_id=100, body=VoidOrderSchema(reason="Customer cancelled order"), current_user=mock_user, db=mock_db)
    assert mock_order.status == "cancelled"
    assert mock_item.is_voided is True
    assert mock_item.void_reason == "Customer cancelled order"


@pytest.mark.asyncio
async def test_generate_kot_station_routing():
    mock_user = SimpleNamespace(tenant_id=1, id=10)
    mock_db = AsyncMock()

    mock_item1 = SimpleNamespace(
        id=1, product_name="Paneer Butter Masala", quantity=Decimal("1"), course="Main", kds_status="pending", is_voided=False, preparation_notes="Medium spicy", kot_id=None, kds_sent_at=None
    )
    mock_item2 = SimpleNamespace(
        id=2, product_name="Cold Coffee", quantity=Decimal("2"), course="Beverages", kds_status="pending", is_voided=False, preparation_notes=None, kot_id=None, kds_sent_at=None
    )
    mock_order = SimpleNamespace(
        id=100,
        tenant_id=1,
        branch_id=1,
        order_number="ORD-100",
        order_type="dine_in",
        status="confirmed",
        kot_sent_at=None,
        is_deleted=False,
        items=[mock_item1, mock_item2]
    )

    mock_st_main = SimpleNamespace(id=10, code="MAIN")
    mock_st_bev = SimpleNamespace(id=20, code="BEVERAGES")

    mock_db.execute.side_effect = [
        DummyResult([mock_order]),
        DummyResult([mock_st_main, mock_st_bev])
    ]

    kots = await generate_kot(order_id=100, current_user=mock_user, db=mock_db)
    assert len(kots) == 2
    assert mock_item1.kds_status == "in_kitchen"
    assert mock_item2.kds_status == "in_kitchen"
    assert mock_order.status == "kot_sent"


@pytest.mark.asyncio
async def test_get_printable_bill():
    mock_user = SimpleNamespace(tenant_id=1, id=10)
    mock_db = AsyncMock()

    mock_item = SimpleNamespace(
        product_name="Farmhouse Loaded Pizza", quantity=Decimal("1"), unit_price=Decimal("280.00"), line_total=Decimal("280.00"), is_voided=False
    )
    mock_order = SimpleNamespace(
        id=100,
        tenant_id=1,
        order_number="ORD-100",
        created_at=datetime.now(timezone.utc),
        notes="Table T-02",
        items=[mock_item],
        subtotal=Decimal("280.00"),
        discount_amount=Decimal("0.00"),
        total_tax=Decimal("14.00"),
        grand_total=Decimal("294.00"),
        amount_paid=Decimal("294.00"),
        balance_due=Decimal("0.00"),
        payment_status="paid",
        is_deleted=False
    )
    mock_db.execute.return_value = DummyResult([mock_order])

    res = await get_printable_bill(order_id=100, current_user=mock_user, db=mock_db)
    assert "THE ssrone CAFE" in res["thermal_text"]
    assert "Farmhouse Loaded Pizza" in res["thermal_text"]
    assert res["grand_total"] == 294.00


@pytest.mark.asyncio
async def test_order_update_soft_void_preserves_audit():
    """Verify that removing an item during order update marks it as is_voided=True and does NOT hard-delete it."""
    from src.modules.orders.router import create_order, OrderCreateSchema, OrderItemCreateSchema
    mock_user = SimpleNamespace(tenant_id=1, id=10)
    mock_db = AsyncMock()

    # Existing order has Item 1 (Rajma Rice) and Item 2 (Cold Coffee)
    mock_item_rajma = SimpleNamespace(
        id=8630, product_id=220, product_name="Punjabi Rajma + Rice", variant_name="", quantity=Decimal("1"), unit_price=Decimal("120.00"), discount_amount=Decimal("0"), line_total=Decimal("120.00"), is_voided=False, void_reason=None
    )
    mock_item_coffee = SimpleNamespace(
        id=8632, product_id=108, product_name="Cold Coffee", variant_name="", quantity=Decimal("1"), unit_price=Decimal("80.00"), discount_amount=Decimal("0"), line_total=Decimal("80.00"), is_voided=False, void_reason=None
    )

    mock_existing_order = SimpleNamespace(
        id=3652,
        tenant_id=1,
        branch_id=1,
        order_number="271026-61",
        daily_order_number=61,
        order_type="dine_in",
        status="kot_sent",
        payment_status="unpaid",
        subtotal=Decimal("200.00"),
        discount_amount=Decimal("0.00"),
        taxable_amount=Decimal("200.00"),
        cgst_amount=Decimal("5.00"),
        sgst_amount=Decimal("5.00"),
        total_tax=Decimal("10.00"),
        grand_total=Decimal("210.00"),
        amount_paid=Decimal("0.00"),
        balance_due=Decimal("210.00"),
        items=[mock_item_rajma, mock_item_coffee],
        metadata_payload={},
        customer_id=None,
        table_id=7,
        waiter_id=None,
        token_number="61",
        notes=None,
        is_deleted=False,
        created_at=datetime.now(timezone.utc),
        confirmed_at=None,
    )

    # DB returns existing order
    mock_db.execute.return_value = DummyResult([mock_existing_order])

    # Incoming payload replaces Cold Coffee with Kitkat Shake (id 114)
    body = OrderCreateSchema(
        order_id=3652,
        order_number="271026-61",
        is_update=True,
        branch_id=1,
        table_id=7,
        status="kot_sent",
        items=[
            OrderItemCreateSchema(product_id=220, product_name="Punjabi Rajma + Rice", quantity=Decimal("1"), unit_price=Decimal("120.00")),
            OrderItemCreateSchema(product_id=114, product_name="Kitkat Shake", quantity=Decimal("1"), unit_price=Decimal("90.00")),
        ]
    )

    resp = await create_order(body=body, current_user=mock_user, db=mock_db)

    # 1. Verify db.delete was NEVER called on Cold Coffee (No hard delete!)
    mock_db.delete.assert_not_called()

    # 2. Verify Cold Coffee was soft-voided with audit reason and timestamp
    assert mock_item_coffee.is_voided is True
    assert mock_item_coffee.is_active is False
    assert mock_item_coffee.voided_at is not None
    assert mock_item_coffee.voided_by == 10
    assert "order modification" in mock_item_coffee.void_reason.lower()

    # 3. Verify Rajma Rice was kept active
    assert mock_item_rajma.is_voided is False

