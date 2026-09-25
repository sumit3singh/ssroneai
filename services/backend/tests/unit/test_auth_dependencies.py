import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from fastapi import HTTPException
from jose import JWTError

from src.modules.auth.dependencies import get_current_user, get_current_superadmin, RequirePermission
from src.modules.auth.models import User, UserRole, Role
from src.modules.auth.schemas import TokenPayload

class DummyResult:
    def __init__(self, val):
        self.val = val
    def scalar_one_or_none(self):
        return self.val

@pytest.mark.asyncio
async def test_get_current_user_no_credentials():
    from src.modules.auth.dependencies import settings
    request = MagicMock()
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult(None)
    with patch.object(settings, "app_env", "production"):
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(request, credentials=None, db=mock_db)
        assert exc_info.value.status_code == 401

@pytest.mark.asyncio
async def test_get_current_user_jwt_error():
    from src.modules.auth.dependencies import settings
    request = MagicMock()
    credentials = MagicMock()
    credentials.credentials = "invalid-token"
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult(None)
    
    with patch.object(settings, "app_env", "production"):
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(request, credentials=credentials, db=mock_db)
        assert exc_info.value.status_code == 401

@pytest.mark.asyncio
async def test_get_current_user_not_found():
    request = MagicMock()
    credentials = MagicMock()
    credentials.credentials = "valid-token"
    payload = TokenPayload(sub="user-id", tenant_id="tenant-id", email="test@example.com", session_id="sess-id", exp=12345)
    
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult(None)
    
    with patch("src.modules.auth.dependencies.auth_service.decode_access_token", return_value=payload):
        with pytest.raises(HTTPException) as exc_info:
            await get_current_user(request, credentials=credentials, db=mock_db)
        assert exc_info.value.status_code == 401

@pytest.mark.asyncio
async def test_get_current_user_success():
    request = MagicMock()
    request.state = MagicMock()
    credentials = MagicMock()
    credentials.credentials = "valid-token"
    payload = TokenPayload(sub="1", tenant_id="1", email="test@example.com", session_id="sess-id", exp=12345)
    
    user = User(
        id=1,
        tenant_id=1,
        email="test@example.com",
        is_active=True,
        is_deleted=False,
        is_superadmin=False
    )
    
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult(user)
    
    with patch("src.modules.auth.dependencies.auth_service.decode_access_token", return_value=payload):
        with patch("src.core.database.engine.set_rls_context", AsyncMock()) as mock_rls:
            res = await get_current_user(request, credentials=credentials, db=mock_db)
            assert res == user
            mock_rls.assert_called_once()

@pytest.mark.asyncio
async def test_get_current_superadmin_forbidden():
    user = User(is_superadmin=False)
    with pytest.raises(HTTPException) as exc_info:
        await get_current_superadmin(user)
    assert exc_info.value.status_code == 403

@pytest.mark.asyncio
async def test_get_current_superadmin_success():
    user = User(is_superadmin=True)
    res = await get_current_superadmin(user)
    assert res == user

@pytest.mark.asyncio
async def test_require_permission_superadmin():
    user = User(is_superadmin=True)
    guard = RequirePermission("pos:write")
    res = await guard(user)
    assert res == user

@pytest.mark.asyncio
async def test_require_permission_list_match():
    role = Role(permissions=["pos:write", "pos:read"])
    ur = UserRole(role=role)
    user = User(is_superadmin=False, roles=[ur])
    
    guard = RequirePermission("pos:write")
    res = await guard(user)
    assert res == user

@pytest.mark.asyncio
async def test_require_permission_dict_match():
    role = Role(permissions={"pos:write": True})
    ur = UserRole(role=role)
    user = User(is_superadmin=False, roles=[ur])
    
    guard = RequirePermission("pos:write")
    res = await guard(user)
    assert res == user

@pytest.mark.asyncio
async def test_require_permission_denied():
    role = Role(permissions={"pos:read": True})
    ur = UserRole(role=role)
    user = User(is_superadmin=False, roles=[ur])
    
    guard = RequirePermission("pos:write")
    with pytest.raises(HTTPException) as exc_info:
        await guard(user)
    assert exc_info.value.status_code == 403

@pytest.mark.asyncio
async def test_require_permission_missing_role():
    ur = UserRole(role=None)
    user = User(is_superadmin=False, roles=[ur])
    guard = RequirePermission("pos:write")
    with pytest.raises(HTTPException) as exc_info:
        await guard(user)
    assert exc_info.value.status_code == 403

