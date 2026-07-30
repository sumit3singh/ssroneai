import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from src.engines.search.router import search_all

class DummyResult:
    def __init__(self, items):
        self.items = items
        
    def scalars(self):
        return self
        
    def all(self):
        return self.items

@pytest.mark.asyncio
async def test_search_all_combines_modules():
    mock_user = MagicMock()
    mock_user.tenant_id = 1
    
    # Mock Customer
    mock_cust = MagicMock()
    mock_cust.id = 2
    mock_cust.first_name = "Amit"
    mock_cust.last_name = "Sharma"
    mock_cust.phone = "9876543210"
    mock_cust.email = "amit@example.com"
    
    # Mock Order
    mock_order = MagicMock()
    mock_order.id = 3
    mock_order.order_number = "ORD-001"
    mock_order.order_type = "dine_in"
    mock_order.status = "completed"
    
    # Mock Room
    mock_room = MagicMock()
    mock_room.id = 4
    mock_room.room_number = "102"
    mock_room.status = "occupied"
    
    # Mock Product
    mock_prod = MagicMock()
    mock_prod.id = 5
    mock_prod.name = "Paneer Tikka"
    mock_prod.code = "PT-10"
    mock_prod.product_type = "food"

    db = MagicMock()
    # Mock the execute results sequentially for Customers, Orders, Rooms, Products
    db.execute = AsyncMock(side_effect=[
        DummyResult([mock_cust]),
        DummyResult([mock_order]),
        DummyResult([mock_room]),
        DummyResult([mock_prod]),
    ])
    
    res = await search_all(q="Tikka", current_user=mock_user, db=db)
    
    assert res["query"] == "Tikka"
    assert res["total"] == 4
    
    results = res["results"]
    assert results[0]["type"] == "customer"
    assert results[0]["title"] == "Amit Sharma"
    
    assert results[1]["type"] == "order"
    assert "ORD-001" in results[1]["title"]
    
    assert results[2]["type"] == "room"
    assert "102" in results[2]["title"]
    
    assert results[3]["type"] == "product"
    assert results[3]["title"] == "Paneer Tikka"
