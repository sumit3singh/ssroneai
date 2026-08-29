import pytest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException

from src.modules.restaurant.router import (
    list_categories,
    create_category,
    update_category,
    delete_category,
    list_tags,
    create_tag,
    list_menu_items,
    create_menu_item,
    delete_menu_item,
    _build_menu_item_response,
)
from src.modules.restaurant.schemas import (
    CategoryCreateSchema,
    MenuItemCreateSchema,
    MenuVariantGroupCreate,
    MenuVariantOptionCreate,
    MenuAddonGroupCreate,
    MenuAddonOptionCreate,
    MenuTagCreate,
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


@pytest.mark.asyncio
async def test_list_categories():
    mock_user = SimpleNamespace(tenant_id=1, id=10)
    mock_db = AsyncMock()
    mock_cat = SimpleNamespace(id=1, name="Starters", icon="Flame", slug="starters", parent_id=None, level=1, sort_order=1, branch_id=1, tenant_id=1)
    mock_db.execute.return_value = DummyResult([mock_cat])

    cats = await list_categories(branch_id=1, current_user=mock_user, db=mock_db)
    assert len(cats) == 1
    assert cats[0].name == "Starters"


@pytest.mark.asyncio
async def test_create_category():
    mock_user = SimpleNamespace(tenant_id=1, id=10)
    mock_db = AsyncMock()
    mock_db.add = MagicMock()

    body = CategoryCreateSchema(name="Pizzas", sort_order=2)
    with patch("src.modules.restaurant.router.MenuCategory") as mock_model:
        cat_inst = SimpleNamespace(id=1, name="Pizzas", icon=None, slug=None, parent_id=None, level=1, sort_order=2, branch_id=None, tenant_id=1)
        mock_model.return_value = cat_inst
        cat = await create_category(body=body, current_user=mock_user, db=mock_db)
        assert cat.name == "Pizzas"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_delete_category_not_found():
    mock_user = SimpleNamespace(tenant_id=1, id=10)
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult([])

    with pytest.raises(HTTPException) as exc:
        await delete_category(category_id=99, current_user=mock_user, db=mock_db)
    assert exc.value.status_code == 404


@pytest.mark.asyncio
async def test_create_tag():
    mock_user = SimpleNamespace(tenant_id=1, id=10)
    mock_db = AsyncMock()
    mock_db.add = MagicMock()

    body = MenuTagCreate(name="Bestseller", color="#ef4444")
    with patch("src.modules.restaurant.router.MenuTag") as mock_model:
        tag_inst = SimpleNamespace(id=1, name="Bestseller", color="#ef4444", icon=None)
        mock_model.return_value = tag_inst
        tag = await create_tag(body=body, current_user=mock_user, db=mock_db)
        assert tag.name == "Bestseller"
        assert tag.color == "#ef4444"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()


@pytest.mark.asyncio
async def test_build_menu_item_response_relational():
    mock_opt = SimpleNamespace(id=1, group_id=10, name="Full (8 Pcs)", price_adjustment=50.0, is_default=False, is_available=True, sort_order=1, is_deleted=False)
    mock_vg = SimpleNamespace(id=10, item_id=100, name="Portion Size", min_selection=1, max_selection=1, is_required=True, sort_order=1, is_deleted=False, options=[mock_opt])
    
    mock_item = SimpleNamespace(
        id=100,
        category_id=1,
        name="Kurkure Momos",
        description="Crispy momos",
        short_description="Crispy momos",
        base_price=130.0,
        image_url=None,
        images=[],
        product_id=None,
        kds_station="Chinese",
        allergens=[],
        nutrition={},
        is_veg=True,
        is_popular=True,
        is_available=True,
        gst_percent=5.0,
        sort_order=1,
        branch_id=1,
        tenant_id=1,
        variant_groups_rel=[mock_vg],
        addon_groups_rel=[],
        item_tags_rel=[],
        variant_groups=[],
        addon_groups=[],
        tags=[]
    )

    res = _build_menu_item_response(mock_item)
    assert res["name"] == "Kurkure Momos"
    assert len(res["variant_groups"]) == 1
    assert res["variant_groups"][0]["name"] == "Portion Size"
    assert res["variant_groups"][0]["options"][0]["name"] == "Full (8 Pcs)"


@pytest.mark.asyncio
async def test_create_menu_item_nested():
    mock_user = SimpleNamespace(tenant_id=1, id=10)
    mock_db = AsyncMock()
    mock_db.add = MagicMock()


    body = MenuItemCreateSchema(
        category_id=1,
        name="Paneer Butter Masala",
        base_price=220.0,
        variant_groups=[
            MenuVariantGroupCreate(
                name="Portion Size",
                options=[MenuVariantOptionCreate(name="Full", price_adjustment=120.0)]
            )
        ],
        addon_groups=[
            MenuAddonGroupCreate(
                name="Extras",
                options=[MenuAddonOptionCreate(name="Extra Butter", price=30.0)]
            )
        ]
    )

    mock_created_item = SimpleNamespace(
        id=5,
        category_id=1,
        name="Paneer Butter Masala",
        description=None,
        short_description=None,
        base_price=220.0,
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
        sort_order=1,
        branch_id=None,
        tenant_id=1,
        variant_groups_rel=[],
        addon_groups_rel=[],
        item_tags_rel=[],
        variant_groups=[],
        addon_groups=[],
        tags=[]
    )
    mock_db.execute.return_value = DummyResult([mock_created_item])

    res = await create_menu_item(body=body, current_user=mock_user, db=mock_db)
    assert res.name == "Paneer Butter Masala"
    assert mock_db.commit.called


@pytest.mark.asyncio
async def test_addon_variant_pricing():
    """Verify variant-wise addon price resolution in _build_menu_item_response."""
    mock_opt = SimpleNamespace(
        id=10,
        group_id=2,
        name="Cheese Burst",
        price=50.0,
        variant_prices={"Small": 50.0, "Full": 100.0},
        is_available=True,
        sort_order=1,
        is_deleted=False
    )
    mock_ag = SimpleNamespace(
        id=2,
        item_id=1,
        name="Crust Upgrade",
        min_selection=0,
        max_selection=1,
        sort_order=1,
        options=[mock_opt],
        is_deleted=False
    )
    mock_item = SimpleNamespace(
        id=1,
        category_id=1,
        name="Veg Pizza",
        description=None,
        short_description=None,
        base_price=200.0,
        packaging_charge=10.0,
        image_url=None,
        images=[],
        product_id=None,
        kds_station="Main",
        allergens=[],
        nutrition={},
        is_veg=True,
        is_popular=True,
        is_available=True,
        gst_percent=5.0,
        sort_order=1,
        branch_id=1,
        tenant_id=1,
        variant_groups_rel=[],
        addon_groups_rel=[mock_ag],
        item_tags_rel=[],
        variant_groups=[],
        addon_groups=[],
        tags=[]
    )

    res = _build_menu_item_response(mock_item)
    addon_opt = res["addon_groups"][0]["options"][0]
    assert addon_opt["name"] == "Cheese Burst"
    assert addon_opt["price"] == 50.0
    assert addon_opt["variant_prices"] == {"Small": 50.0, "Full": 100.0}
    assert res["packaging_charge"] == 10.0


@pytest.mark.asyncio
async def test_camel_case_pydantic_schema_validation():
    """Verify frontend camelCase payloads parse cleanly into MenuItemCreateSchema."""
    raw_payload = {
        "categoryId": 2,
        "name": "Special Chai",
        "basePrice": 40.0,
        "packagingCharge": 5.0,
        "isVeg": True,
        "variantGroups": [
            {
                "name": "Serving Size",
                "isRequired": True,
                "maxSelection": 1,
                "options": [
                    {"name": "Single Cup", "sellingPrice": 40.0},
                    {"name": "Kulhad Chai", "sellingPrice": 60.0}
                ]
            }
        ],
        "addonGroups": [
            {
                "name": "Extras",
                "options": [
                    {"name": "Extra Elaichi", "price": 10.0, "variantPrices": {"Single Cup": 10.0}}
                ]
            }
        ]
    }
    parsed = MenuItemCreateSchema.model_validate(raw_payload)
    assert parsed.category_id == 2
    assert parsed.name == "Special Chai"
    assert parsed.base_price == 40.0
    assert parsed.packaging_charge == 5.0
    assert parsed.is_veg is True
    assert len(parsed.variant_groups) == 1
    assert parsed.variant_groups[0].is_required is True
    assert parsed.variant_groups[0].options[0].selling_price == 40.0
    assert parsed.addon_groups[0].options[0].variant_prices == {"Single Cup": 10.0}


@pytest.mark.asyncio
async def test_update_menu_item():
    from src.modules.restaurant.router import update_menu_item
    mock_user = SimpleNamespace(tenant_id=1, id=10)
    mock_db = AsyncMock()
    mock_db.add = MagicMock()

    existing_item = SimpleNamespace(
        id=1,
        tenant_id=1,
        branch_id=1,
        category_id=1,
        name="Chai",
        description=None,
        short_description=None,
        base_price=20.0,
        packaging_charge=0.0,
        image_url=None,
        images=[],
        product_id=None,
        kds_station="Beverages",
        allergens=[],
        nutrition={},
        is_veg=True,
        is_popular=False,
        is_available=True,
        gst_percent=5.0,
        sort_order=1,
        variant_groups_rel=[],
        addon_groups_rel=[],
        item_tags_rel=[],
        variant_groups=[],
        addon_groups=[],
        tags=[]
    )
    mock_db.execute.side_effect = [DummyResult([existing_item]), DummyResult([existing_item])]

    body = MenuItemCreateSchema(
        category_id=1,
        name="Masala Chai",
        base_price=30.0,
        packaging_charge=5.0,
        variant_groups=[],
        addon_groups=[]
    )

    res = await update_menu_item(item_id=1, body=body, current_user=mock_user, db=mock_db)
    assert res.name == "Masala Chai"
    assert mock_db.commit.called


@pytest.mark.asyncio
async def test_delete_menu_item():
    from src.modules.restaurant.router import delete_menu_item
    mock_user = SimpleNamespace(tenant_id=1, id=10)
    mock_db = AsyncMock()

    existing_item = SimpleNamespace(
        id=1,
        tenant_id=1,
        is_deleted=False
    )
    mock_db.execute.return_value = DummyResult([existing_item])

    res = await delete_menu_item(item_id=1, current_user=mock_user, db=mock_db)
    assert res["message"] == "Menu item deleted successfully"
    assert existing_item.is_deleted is True
    assert mock_db.commit.called


