import pytest
import hashlib
from datetime import datetime, timezone, timedelta
from unittest.mock import AsyncMock, MagicMock, patch
from httpx import AsyncClient, ASGITransport
from fastapi import status

from src.api.app.server import app
from src.modules.auth.dependencies import get_current_user
from src.core.database.engine import get_db_session
from src.modules.auth.models import User, Tenant, UserSession, Company, Branch, Role, UserRole, FileMasterERP

class DummyResult:
    def __init__(self, val):
        self.val = val
        
    def scalar_one_or_none(self):
        return self.val
        
    def scalars(self):
        return self
        
    def all(self):
        return self.val if isinstance(self.val, list) else [self.val]

def get_mock_user(is_superadmin=False, is_active=True):
    return User(
        id=1,
        tenant_id=1,
        email="test@example.com",
        first_name="Test",
        last_name="User",
        hashed_password="hashed_password",
        is_active=is_active,
        is_verified=True,
        is_superadmin=is_superadmin,
        language="en",
        timezone="UTC",
        created_at=datetime.now(timezone.utc)
    )

@pytest.mark.asyncio
async def test_login_tenant_not_found():
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult(None)
    
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/v1/auth/login", json={
                "tenant_slug": "nonexistent",
                "email": "test@example.com",
                "password": "securepassword123",
                "device_info": {}
            })
            assert response.status_code == status.HTTP_404_NOT_FOUND
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_login_invalid_credentials():
    tenant = Tenant(id=1, slug="test-tenant", is_active=True)
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult(tenant)
    
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        with patch("src.modules.auth.service.auth_service.authenticate_user", AsyncMock(return_value=None)):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                response = await client.post("/api/v1/auth/login", json={
                    "tenant_slug": "test-tenant",
                    "email": "test@example.com",
                    "password": "wrongpassword123",
                    "device_info": {}
                })
                assert response.status_code == status.HTTP_401_UNAUTHORIZED
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_login_inactive_user():
    tenant = Tenant(id=1, slug="test-tenant", is_active=True)
    user = get_mock_user(is_active=False)
    
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult(tenant)
    
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        with patch("src.modules.auth.service.auth_service.authenticate_user", AsyncMock(return_value=user)):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                response = await client.post("/api/v1/auth/login", json={
                    "tenant_slug": "test-tenant",
                    "email": "test@example.com",
                    "password": "securepassword123",
                    "device_info": {}
                })
                assert response.status_code == status.HTTP_403_FORBIDDEN
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_logout_endpoint():
    user = get_mock_user()
    mock_db = AsyncMock()
    
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/v1/auth/logout")
            assert response.status_code == status.HTTP_200_OK
            assert response.json()["message"] == "Logged out successfully"
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_logout_all_endpoint():
    user = get_mock_user()
    mock_db = AsyncMock()
    
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        with patch("src.modules.auth.service.auth_service.revoke_all_sessions", AsyncMock(return_value=3)):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                response = await client.post("/api/v1/auth/logout-all")
                assert response.status_code == status.HTTP_200_OK
                assert "Logged out from 3 session" in response.json()["message"]
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_register_success():
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult(None)
    mock_db.add = MagicMock()
    mock_db.flush = AsyncMock()
    
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/v1/auth/register", json={
                "tenant_name": "New Tenant",
                "tenant_slug": "new-tenant",
                "email": "admin@newtenant.com",
                "password": "securepassword123",
                "first_name": "Admin",
                "last_name": "User",
                "phone": "9876543210"
            })
            assert response.status_code == status.HTTP_200_OK
            assert "Registration successful" in response.json()["message"]
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_register_conflict():
    tenant = Tenant(id=2, slug="existing-tenant", is_active=True)
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult(tenant)
    
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/v1/auth/register", json={
                "tenant_name": "Existing Tenant",
                "tenant_slug": "existing-tenant",
                "email": "admin@exist.com",
                "password": "securepassword123",
                "first_name": "Admin",
                "last_name": "User",
                "phone": "9876543210"
            })
            assert response.status_code == status.HTTP_409_CONFLICT
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_refresh_token_no_cookie():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/auth/refresh")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

@pytest.mark.asyncio
async def test_refresh_token_expired_session():
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult(None)
    
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        cookies = {"ssrone_refresh_token": "some-token"}
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.post("/api/v1/auth/refresh", cookies=cookies)
            assert response.status_code == status.HTTP_401_UNAUTHORIZED
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_get_me_endpoint():
    user = get_mock_user()
    app.dependency_overrides[get_current_user] = lambda: user
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/v1/auth/me")
            assert response.status_code == status.HTTP_200_OK
            assert response.json()["email"] == "test@example.com"
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_change_password_success():
    user = get_mock_user()
    mock_db = AsyncMock()
    
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        with patch("src.modules.auth.service.auth_service.verify_password", return_value=True):
            with patch("src.modules.auth.service.auth_service.revoke_all_sessions", AsyncMock(return_value=1)):
                async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                    response = await client.post("/api/v1/auth/change-password", json={
                        "current_password": "currentpassword123",
                        "new_password": "newsecurepassword123",
                        "confirm_password": "newsecurepassword123"
                    })
                    assert response.status_code == status.HTTP_200_OK
                    assert "Password changed successfully" in response.json()["message"]
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_change_password_incorrect():
    user = get_mock_user()
    mock_db = AsyncMock()
    
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        with patch("src.modules.auth.service.auth_service.verify_password", return_value=False):
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                response = await client.post("/api/v1/auth/change-password", json={
                    "current_password": "wrongpassword123",
                    "new_password": "newsecurepassword123",
                    "confirm_password": "newsecurepassword123"
                })
                assert response.status_code == status.HTTP_400_BAD_REQUEST
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_list_sessions():
    user = get_mock_user()
    session = UserSession(
        id=3,
        user_id=user.id,
        refresh_token_hash="hash",
        ip_address="127.0.0.1",
        user_agent="Agent",
        device_info={"os": "Windows"},
        is_active=True,
        expires_at=datetime.now(timezone.utc) + timedelta(days=1),
        created_at=datetime.now(timezone.utc)
    )
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult([session])
    
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/v1/auth/sessions")
            assert response.status_code == status.HTTP_200_OK
            assert len(response.json()) == 1
            assert response.json()[0]["ip_address"] == "127.0.0.1"
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_list_companies_superadmin():
    user = get_mock_user(is_superadmin=True)
    company = Company(id=4, tenant_id=user.tenant_id, name="Taj", legal_name="Taj Ltd", currency_code="INR", is_active=True, is_deleted=False)
    
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult([company])
    
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/v1/auth/companies")
            assert response.status_code == status.HTTP_200_OK
            assert response.json()[0]["name"] == "Taj"
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_list_branches_superadmin():
    user = get_mock_user(is_superadmin=True)
    co_id = 5
    branch = Branch(id=6, company_id=co_id, name="Delhi", code="DEL", timezone="Asia/Kolkata", is_active=True, is_deleted=False)
    
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult([branch])
    
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get(f"/api/v1/auth/branches?company_id={co_id}")
            assert response.status_code == status.HTTP_200_OK
            assert response.json()[0]["name"] == "Delhi"
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_list_roles_superadmin():
    user = get_mock_user(is_superadmin=True)
    role = Role(id=7, tenant_id=user.tenant_id, name="Super", code="super_admin", permissions={"*": ["*"]})
    
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult([role])
    
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/v1/auth/roles")
            assert response.status_code == status.HTTP_200_OK
            assert response.json()[0]["code"] == "super_admin"
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_menu_configuration_superadmin():
    user = get_mock_user(is_superadmin=True)
    menu_item = FileMasterERP(
        id=8,
        tenant_id=user.tenant_id,
        code="pos",
        label="POS",
        href="/pos",
        icon="ShoppingCart",
        category="core",
        parent_code=None,
        sort_order=10,
        type="module",
        is_active=True,
        is_deleted=False
    )
    
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult([menu_item])
    
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/v1/auth/menu-configuration")
            assert response.status_code == status.HTTP_200_OK
            assert response.json()[0]["code"] == "pos"
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_login_success():
    tenant = Tenant(id=9, slug="test-tenant", is_active=True)
    user = get_mock_user()
    
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult(tenant)
    
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        with patch("src.modules.auth.service.auth_service.authenticate_user", AsyncMock(return_value=user)):
            with patch("src.modules.auth.service.auth_service.create_session", AsyncMock(return_value=("access-token", "refresh-token"))):
                async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                    response = await client.post("/api/v1/auth/login", json={
                        "tenant_slug": "test-tenant",
                        "email": "test@example.com",
                        "password": "securepassword123",
                        "device_info": {}
                    })
                    assert response.status_code == status.HTTP_200_OK
                    assert response.json()["access_token"] == "access-token"
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_refresh_token_success():
    session = UserSession(
        id=10,
        user_id=11,
        refresh_token_hash="hash",
        device_info={},
        is_active=True,
        expires_at=datetime.now(timezone.utc) + timedelta(days=1),
        created_at=datetime.now(timezone.utc)
    )
    user = get_mock_user()
    mock_db = AsyncMock()
    mock_db.execute.side_effect = [DummyResult(session), DummyResult(user)]
    
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        with patch("src.modules.auth.service.auth_service.create_access_token", return_value="new-access-token"):
            cookies = {"ssrone_refresh_token": "some-token"}
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                response = await client.post("/api/v1/auth/refresh", cookies=cookies)
                assert response.status_code == status.HTTP_200_OK
                assert response.json()["access_token"] == "new-access-token"
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_list_companies_regular_user():
    user = get_mock_user(is_superadmin=False)
    company = Company(id=12, tenant_id=user.tenant_id, name="Taj", legal_name="Taj Ltd", currency_code="INR", is_active=True, is_deleted=False)
    
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult([company])
    
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/v1/auth/companies")
            assert response.status_code == status.HTTP_200_OK
            assert len(response.json()) == 1
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_list_branches_regular_user():
    user = get_mock_user(is_superadmin=False)
    co_id = 13
    branch = Branch(id=14, company_id=co_id, name="Delhi", code="DEL", timezone="Asia/Kolkata", is_active=True, is_deleted=False)
    
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult([branch])
    
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get(f"/api/v1/auth/branches?company_id={co_id}")
            assert response.status_code == status.HTTP_200_OK
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_list_roles_regular_user():
    user = get_mock_user(is_superadmin=False)
    role = Role(id=15, tenant_id=user.tenant_id, name="User", code="user", permissions={})
    
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult([role])
    
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/v1/auth/roles")
            assert response.status_code == status.HTTP_200_OK
    finally:
        app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_menu_configuration_regular_user():
    user = get_mock_user(is_superadmin=False)
    menu_item = FileMasterERP(
        id=16,
        tenant_id=user.tenant_id,
        code="pos",
        label="POS",
        href="/pos",
        icon="ShoppingCart",
        category="core",
        parent_code=None,
        sort_order=10,
        type="module",
        required_feature="pos_feature",
        required_permission="pos_permission",
        is_active=True,
        is_deleted=False
    )
    role = Role(
        id=17,
        tenant_id=user.tenant_id,
        name="Cashier",
        code="cashier",
        permissions={"pos_permission": ["read"]}
    )
    
    mock_db = AsyncMock()
    mock_db.execute.side_effect = [DummyResult([menu_item]), DummyResult(role)]
    
    app.dependency_overrides[get_current_user] = lambda: user
    app.dependency_overrides[get_db_session] = lambda: mock_db
    try:
        with patch("src.engines.licensing.engine.feature_engine.is_enabled", AsyncMock(return_value=True)) as mock_enabled:
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                response = await client.get("/api/v1/auth/menu-configuration?role_code=cashier")
                assert response.status_code == status.HTTP_200_OK
                assert len(response.json()) == 1
                mock_enabled.assert_called_once_with(str(user.tenant_id), "pos_feature")
    finally:
        app.dependency_overrides.clear()

def test_change_password_request_validation_error():
    from pydantic import ValidationError
    from src.modules.auth.schemas import ChangePasswordRequest
    with pytest.raises(ValidationError):
        ChangePasswordRequest(
            current_password="currentpassword123",
            new_password="newsecurepassword123",
            confirm_password="differentpassword123"
        )



