import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException
from src.modules.restaurant.router import (
    list_categories, create_category, update_category, delete_category,
    list_menu_items, create_menu_item, update_menu_item, delete_menu_item,
    CategoryCreateSchema, MenuItemCreateSchema
)
from src.modules.restaurant.models import MenuCategory, MenuItem

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


@pytest.mark.asyncio
async def test_category_crud():
    mock_user = MagicMock()
    mock_user.tenant_id = 1
    mock_user.id = 1
    
    # 1. List
    mock_cat = MenuCategory(
        id=1,
        tenant_id=mock_user.tenant_id,
        name="Desserts",
        icon="🍰",
        slug="desserts",
        level=1,
        sort_order=1,
        branch_id=None
    )
    
    db = MagicMock()
    db.execute = AsyncMock(return_value=DummyResult([mock_cat]))
    
    cats = await list_categories(branch_id=None, current_user=mock_user, db=db)
    assert len(cats) == 1
    assert cats[0].name == "Desserts"
    
    # 2. Create
    create_schema = CategoryCreateSchema(
        name="Desserts",
        icon="🍰",
        slug="desserts"
    )
    
    db.add = MagicMock()
    db.commit = AsyncMock()
    
    def fake_refresh_cat(cat):
        cat.id = 1
    db.refresh = AsyncMock(side_effect=fake_refresh_cat)
    
    new_cat = await create_category(body=create_schema, current_user=mock_user, db=db)
    assert new_cat.name == "Desserts"
    assert new_cat.id == 1

    # 3. Update
    db.execute = AsyncMock(return_value=DummyResult([mock_cat]))
    mock_cat.to_dict = lambda: {"id": 1, "name": "Desserts Updated", "icon": "🍰", "slug": "desserts", "parent_id": None, "level": 1, "sort_order": 1, "branch_id": None, "tenant_id": mock_user.tenant_id}
    
    update_schema = CategoryCreateSchema(
        name="Desserts Updated",
        icon="🍰",
        slug="desserts"
    )
    
    updated = await update_category(category_id=1, body=update_schema, current_user=mock_user, db=db)
    assert updated.name == "Desserts Updated"
    
    # 4. Delete
    db.execute = AsyncMock(return_value=DummyResult([mock_cat]))
    res = await delete_category(category_id=1, current_user=mock_user, db=db)
    assert res["message"] == "Category deleted successfully"

@pytest.mark.asyncio
async def test_menu_item_crud():
    mock_user = MagicMock()
    mock_user.tenant_id = 2
    mock_user.id = 2
    
    # 1. List
    mock_item = MenuItem(
        id=2,
        category_id=1,
        name="Gulab Jamun",
        description=None,
        short_description=None,
        base_price=60.0,
        image_url=None,
        images=[],
        product_id=None,
        kds_station="Main",
        allergens=[],
        nutrition={},
        is_veg=True,
        is_popular=False,
        is_available=True,
        gst_percent=5.0,
        tags=[],
        variant_groups=[],
        addon_groups=[],
        branch_id=None,
        tenant_id=mock_user.tenant_id,
        variant_groups_rel=[],
        addon_groups_rel=[],
        item_tags_rel=[]
    )



    
    db = MagicMock()
    db.execute = AsyncMock(return_value=DummyResult([mock_item]))
    
    items = await list_menu_items(category_id=1, branch_id=None, current_user=mock_user, db=db)
    assert len(items) == 1
    assert items[0].name == "Gulab Jamun"
    
    # 2. Create
    create_schema = MenuItemCreateSchema(
        category_id=1,
        name="Gulab Jamun",
        base_price=60.0,
        is_veg=True
    )
    
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.flush = AsyncMock()

    
    def fake_refresh_item(item):
        item.id = 2
    db.refresh = AsyncMock(side_effect=fake_refresh_item)
    
    new_item = await create_menu_item(body=create_schema, current_user=mock_user, db=db)
    assert new_item.name == "Gulab Jamun"
    assert new_item.base_price == 60.0
    assert new_item.id == 2
    
    # 3. Update
    db.execute = AsyncMock(return_value=DummyResult([mock_item]))
    update_schema = MenuItemCreateSchema(
        category_id=1,
        name="Gulab Jamun Premium",
        base_price=80.0,
        is_veg=True
    )
    
    updated = await update_menu_item(item_id=2, body=update_schema, current_user=mock_user, db=db)
    assert updated.name == "Gulab Jamun Premium"
    assert updated.base_price == 80.0
    
    # 4. Delete
    db.execute = AsyncMock(return_value=DummyResult([mock_item]))
    res = await delete_menu_item(item_id=2, current_user=mock_user, db=db)
    assert res["message"] == "Menu item deleted successfully"
