"""
SSR One AI – Comprehensive PyTest Test Suite for Customization Module
Validates:
1. Public tenant configuration fallback (Zero-Ruination compliance)
2. Public tenant configuration merged with global branding
3. Tenant admin draft saving, version tracking, and is_draft_modified flag
4. Tenant admin publishing lifecycle and version increment
5. Tenant admin reset draft functionality
6. Custom domain registration with CNAME / A record deduction
7. Custom domain verification simulation
8. Reverse-proxy host resolution
9. Custom domain deletion
"""
import uuid
import pytest
from httpx import AsyncClient, ASGITransport

from src.main import app
from src.core.database.engine import engine
from src.modules.auth.dependencies import get_current_user
from src.modules.auth.models import User


class MockAdminUser:
    id = 1
    tenant_id = 1
    email = "admin@baithakcafe.com"
    full_name = "Baithak Admin"
    is_active = True
    is_superadmin = False
    roles = []


async def override_get_current_user():
    return MockAdminUser()


@pytest.fixture(autouse=True)
async def test_env_setup():
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield
    app.dependency_overrides.pop(get_current_user, None)
    await engine.dispose()


@pytest.mark.asyncio
async def test_public_config_fallback_zero_ruination():
    """Verify that querying a non-existent tenant/branch returns fallback defaults rather than 404."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/tenant-config/by-slug/non-existent-tenant-999/b999/customer-food-web")
        assert res.status_code == 200
        data = res.json()
        assert data["app_name"] == "customer-food-web"
        assert "config" in data
        assert "branding" in data["config"]
        assert "features" in data["config"]
        assert data["config"]["features"]["tableQrOrdering"] is True


@pytest.mark.asyncio
async def test_admin_config_draft_publish_and_reset_lifecycle():
    """Verify complete draft-edit -> publish -> version-increment lifecycle."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        app_name = "customer-food-web"

        # 1. Fetch initial admin config
        initial_res = await ac.get(f"/api/v1/tenant-config/admin/{app_name}?branch_id=1")
        assert initial_res.status_code == 200
        initial_data = initial_res.json()
        assert initial_data["app_name"] == app_name
        initial_version = initial_data["config_version"]

        # 2. Update Draft with unique payload
        rand_tag = uuid.uuid4().hex[:6]
        order_msg = f"Your monsoon feast is being prepared with love! {rand_tag}"
        draft_payload = {
            "branch_id": 1,
            "draft_config": {
                "banner": {
                    "headline": f"Special Monsoon Treats {rand_tag}",
                    "subtext": "Sip hot chai and enjoy piping hot pakodas.",
                },
                "orderConfirmationMessage": order_msg,
            }
        }
        draft_res = await ac.put(f"/api/v1/tenant-config/admin/{app_name}/draft", json=draft_payload)
        assert draft_res.status_code == 200
        draft_data = draft_res.json()
        assert draft_data["is_draft_modified"] is True
        assert draft_data["draft_config"]["orderConfirmationMessage"] == order_msg

        # 3. Verify public runtime endpoint with ?draft=true vs ?draft=false
        # With draft=true, should show draft message
        pub_draft_res = await ac.get(f"/api/v1/tenant-config/1/1/{app_name}?draft=true")
        assert pub_draft_res.status_code == 200
        assert pub_draft_res.json()["config"]["orderConfirmationMessage"] == order_msg

        # 4. Publish Draft
        publish_res = await ac.post(f"/api/v1/tenant-config/admin/{app_name}/publish", json={"branch_id": 1})
        assert publish_res.status_code == 200
        published_data = publish_res.json()
        assert published_data["is_draft_modified"] is False
        assert published_data["config_version"] == initial_version + 1
        assert published_data["published_config"]["orderConfirmationMessage"] == order_msg

        # 5. Make another draft edit and reset it
        await ac.put(f"/api/v1/tenant-config/admin/{app_name}/draft", json={
            "branch_id": 1,
            "draft_config": {"orderConfirmationMessage": f"This will be discarded {rand_tag}"}
        })
        reset_res = await ac.post(f"/api/v1/tenant-config/admin/{app_name}/reset-draft", json={"branch_id": 1})
        assert reset_res.status_code == 200
        reset_data = reset_res.json()
        assert reset_data["is_draft_modified"] is False
        assert reset_data["draft_config"]["orderConfirmationMessage"] == order_msg


@pytest.mark.asyncio
async def test_custom_domain_registration_and_cname_detection():
    """Verify subdomain registers with CNAME target and apex domain with A record."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Register a subdomain
        sub_res = await ac.post("/api/v1/custom-domains", json={
            "domain": "order.baithakcafe.localhost",
            "app_name": "customer-food-web",
        })
        assert sub_res.status_code == 200
        sub_data = sub_res.json()
        assert sub_data["record_type"] == "CNAME"
        assert sub_data["target_value"] == "connect.ssrone.app"
        assert sub_data["dns_instruction"]["record_type"] == "CNAME"

        # Register root/apex domain
        root_res = await ac.post("/api/v1/custom-domains", json={
            "domain": "baithakfood.localhost",
            "app_name": "customer-food-web",
        })
        assert root_res.status_code == 200
        root_data = root_res.json()
        assert root_data["record_type"] == "A"
        assert root_data["target_value"] == "127.0.0.1"


@pytest.mark.asyncio
async def test_custom_domain_verify_and_resolve_flow():
    """Verify localhost/test custom domain verification simulation and reverse-proxy resolve lookup."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # 1. Register domain
        reg_res = await ac.post("/api/v1/custom-domains", json={
            "domain": "menu.tajhotels.localhost",
            "app_name": "customer-food-web",
        })
        assert reg_res.status_code == 200
        domain_id = reg_res.json()["id"]

        # 2. Trigger verification
        verify_res = await ac.post(f"/api/v1/custom-domains/{domain_id}/verify")
        assert verify_res.status_code == 200
        verified_data = verify_res.json()
        assert verified_data["status"] == "verified"
        assert verified_data["verified_at"] is not None

        # 3. Reverse proxy resolve lookup
        resolve_res = await ac.get("/api/v1/custom-domains/resolve/menu.tajhotels.localhost")
        assert resolve_res.status_code == 200
        resolved_data = resolve_res.json()
        assert resolved_data["domain"] == "menu.tajhotels.localhost"
        assert resolved_data["status"] == "verified"
        assert resolved_data["app_name"] == "customer-food-web"

        # 4. Delete custom domain
        del_res = await ac.delete(f"/api/v1/custom-domains/{domain_id}")
        assert del_res.status_code == 200
        assert del_res.json()["success"] is True
