import pytest
from decimal import Decimal
from fastapi import HTTPException
from unittest.mock import AsyncMock, patch, MagicMock
from src.modules.orders.router import create_order, OrderCreateSchema, OrderItemCreateSchema

@pytest.mark.asyncio
async def test_create_order_blocks_large_unidentified_order():
    # 1. Setup mock body
    body = OrderCreateSchema(
        branch_id=1,
        customer_id=None,
        table_id=2,
        waiter_id=3,
        order_type="dine_in",
        items=[
            OrderItemCreateSchema(
                product_id=4,
                product_name="Golden Champagne Tower",
                quantity=Decimal("1"),
                unit_price=Decimal("60000.0")  # Above the 50,000 threshold
            )
        ]
    )
    
    mock_user = MagicMock()
    mock_user.id = 5
    mock_user.tenant_id = 5
    
    db = MagicMock()
    
    # Assert that calling create_order raises HTTP 400 Bad Request
    with pytest.raises(HTTPException) as exc:
        await create_order(body, current_user=mock_user, db=db)
    
    assert exc.value.status_code == 400
    assert "require an attached Customer profile" in exc.value.detail

@pytest.mark.asyncio
async def test_create_order_applies_takeaway_discount():
    # 1. Setup mock body
    body = OrderCreateSchema(
        branch_id=6,
        customer_id=7,
        table_id=8,
        waiter_id=9,
        order_type="takeaway",
        items=[
            OrderItemCreateSchema(
                product_id=10,
                product_name="Bulk Paneer Feast",
                quantity=Decimal("10"),
                unit_price=Decimal("600.0")  # Subtotal = 6000
            )
        ]
    )
    
    mock_user = MagicMock()
    mock_user.id = 11
    mock_user.tenant_id = 11
    
    # Mock database flush and refresh
    db = MagicMock()
    db.add = MagicMock()
    db.flush = AsyncMock()
    db.refresh = AsyncMock()
    
    with patch("src.core.event_bus.bus.event_bus.publish", AsyncMock()) as mock_publish:
        # We patch Order response model validation to return the order object itself for easy testing
        with patch("src.modules.orders.router.OrderResponse.model_validate", lambda x: x):
            res = await create_order(body, current_user=mock_user, db=db)
            # Original total was 6000 + 18% tax = 7080
            # 10% discount applies, making discount_amount > 0
            assert res.discount_amount > 0
            assert res.grand_total < Decimal("7080.0")


@pytest.mark.asyncio
async def test_update_order_status():
    from src.modules.orders.router import update_order_status
    from src.modules.orders.models import Order, OrderStatus
    
    mock_order = MagicMock()
    mock_order.id = 1
    mock_order.grand_total = Decimal("100.00")
    mock_order.amount_paid = Decimal("0.00")
    mock_order.balance_due = Decimal("100.00")
    mock_order.status = OrderStatus.CONFIRMED
    mock_order.payment_status = "unpaid"
    
    mock_execute_result = MagicMock()
    mock_execute_result.scalar_one_or_none.return_value = mock_order
    
    db = AsyncMock()
    db.execute.return_value = mock_execute_result
    
    mock_user = MagicMock()
    mock_user.id = 5
    mock_user.tenant_id = 5
    
    res = await update_order_status(
        order_id=1,
        status="completed",
        payment_status="paid",
        amount_paid=Decimal("100.00"),
        current_user=mock_user,
        db=db
    )
    
    assert res["status"] == "completed"
    assert res["payment_status"] == "paid"
    assert res["amount_paid"] == 100.0
    assert res["balance_due"] == 0.0
    db.commit.assert_called_once()
