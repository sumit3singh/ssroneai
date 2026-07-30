"""
Tests for The Baithak Auth Service.
"""
import pytest
from datetime import datetime, timezone, timedelta
from unittest.mock import MagicMock, AsyncMock, patch
from src.modules.auth.service import AuthService
from src.modules.auth.models import User, UserSession

class DummyResult:
    def __init__(self, val):
        self.val = val
    def scalar_one_or_none(self):
        return self.val
    def scalars(self):
        return self
    def all(self):
        return self.val if isinstance(self.val, list) else [self.val]


class TestPasswordHashing:
    def test_hash_password_produces_bcrypt(self):
        svc = AuthService()
        hashed = svc.hash_password("TestPass123")
        assert hashed.startswith("$2b$")

    def test_verify_correct_password(self):
        svc = AuthService()
        hashed = svc.hash_password("MySecret")
        assert svc.verify_password("MySecret", hashed) is True

    def test_reject_wrong_password(self):
        svc = AuthService()
        hashed = svc.hash_password("MySecret")
        assert svc.verify_password("WrongPass", hashed) is False


class TestJWTTokens:
    def test_create_and_decode_access_token(self):
        svc = AuthService()
        payload = {
            "sub": "user-123",
            "tenant_id": "tenant-abc",
            "email": "test@example.com",
            "session_id": "session-xyz",
        }
        token = svc.create_access_token(payload)
        assert isinstance(token, str)
        assert len(token) > 50

        decoded = svc.decode_access_token(token)
        assert decoded.sub == "user-123"
        assert decoded.tenant_id == "tenant-abc"
        assert decoded.email == "test@example.com"

    def test_create_refresh_token_returns_tuple(self):
        svc = AuthService()
        raw, hashed = svc.create_refresh_token()
        assert isinstance(raw, str)
        assert isinstance(hashed, str)
        assert raw != hashed
        assert len(raw) > 32

    def test_refresh_token_hash_is_sha256(self):
        import hashlib
        svc = AuthService()
        raw, hashed = svc.create_refresh_token()
        expected = hashlib.sha256(raw.encode()).hexdigest()
        assert hashed == expected


class TestServiceMethods:
    @pytest.mark.asyncio
    async def test_authenticate_user_success(self):
        svc = AuthService()
        user = User(id=1, email="test@example.com", hashed_password="hashed_password", failed_login_attempts=0, locked_until=None)
        mock_db = AsyncMock()
        mock_db.execute.return_value = DummyResult(user)
        
        with patch.object(svc, "verify_password", return_value=True):
            res = await svc.authenticate_user(mock_db, "test@example.com", "password", "1")
            assert res == user

    @pytest.mark.asyncio
    async def test_authenticate_user_not_found(self):
        svc = AuthService()
        mock_db = AsyncMock()
        mock_db.execute.return_value = DummyResult(None)
        
        res = await svc.authenticate_user(mock_db, "test@example.com", "password", "10")
        assert res is None

    @pytest.mark.asyncio
    async def test_authenticate_user_locked(self):
        svc = AuthService()
        locked_time = datetime.now(timezone.utc) + timedelta(minutes=5)
        user = User(id=2, email="test@example.com", hashed_password="hashed_password", locked_until=locked_time)
        mock_db = AsyncMock()
        mock_db.execute.return_value = DummyResult(user)
        
        res = await svc.authenticate_user(mock_db, "test@example.com", "password", "11")
        assert res is None

    @pytest.mark.asyncio
    async def test_authenticate_user_wrong_password(self):
        svc = AuthService()
        user = User(id=3, email="test@example.com", hashed_password="hashed_password", failed_login_attempts=0, locked_until=None)
        mock_db = AsyncMock()
        mock_db.execute.return_value = DummyResult(user)
        
        with patch.object(svc, "verify_password", return_value=False):
            with patch.object(svc, "_increment_failed_attempts", AsyncMock()) as mock_inc:
                res = await svc.authenticate_user(mock_db, "test@example.com", "password", "3")
                assert res is None
                mock_inc.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_session(self):
        svc = AuthService()
        user = User(id=4, tenant_id=4, email="test@example.com")
        mock_db = AsyncMock()
        mock_db.add = MagicMock()
        mock_db.flush = AsyncMock()
        
        with patch("src.modules.auth.service.settings.jwt.refresh_token_expire_days", 30):
            access, refresh = await svc.create_session(mock_db, user, {"os": "Linux"})
            assert access is not None
            assert refresh is not None

    @pytest.mark.asyncio
    async def test_revoke_session(self):
        svc = AuthService()
        session = UserSession(id=5, user_id=5, is_active=True)
        mock_db = AsyncMock()
        mock_db.execute.return_value = DummyResult(session)
        mock_db.flush = AsyncMock()
        
        with patch("src.modules.auth.service.cache.delete", AsyncMock()) as mock_cache:
            res = await svc.revoke_session(mock_db, "5")
            assert res is True
            assert session.is_active is False
            mock_cache.assert_called_once_with(f"perms:5")

    @pytest.mark.asyncio
    async def test_revoke_all_sessions(self):
        svc = AuthService()
        user_id = 6
        session = UserSession(id=6, user_id=user_id, is_active=True)
        mock_db = AsyncMock()
        mock_db.execute.return_value = DummyResult([session])
        mock_db.flush = AsyncMock()
        
        with patch("src.modules.auth.service.cache.delete", AsyncMock()) as mock_cache:
            res = await svc.revoke_all_sessions(mock_db, "6")
            assert res == 1
            assert session.is_active is False
            mock_cache.assert_called_once_with(f"perms:6")

    @pytest.mark.asyncio
    async def test_authenticate_user_reset_failed_attempts(self):
        svc = AuthService()
        user = User(
            id=7,
            email="test@example.com",
            hashed_password="hashed_password",
            failed_login_attempts=2,
            locked_until=None
        )
        mock_db = AsyncMock()
        mock_db.execute.return_value = DummyResult(user)
        mock_db.flush = AsyncMock()
        
        with patch.object(svc, "verify_password", return_value=True):
            res = await svc.authenticate_user(mock_db, "test@example.com", "password", "7")
            assert res == user
            assert user.failed_login_attempts == 0
            assert user.locked_until is None

    @pytest.mark.asyncio
    async def test_authenticate_user_lock_trigger(self):
        svc = AuthService()
        user = User(
            id=8,
            email="test@example.com",
            hashed_password="hashed_password",
            failed_login_attempts=4,
            locked_until=None
        )
        mock_db = AsyncMock()
        mock_db.execute.return_value = DummyResult(user)
        mock_db.flush = AsyncMock()
        
        with patch.object(svc, "verify_password", return_value=False):
            res = await svc.authenticate_user(mock_db, "test@example.com", "password", "8")
            assert res is None
            assert user.failed_login_attempts == 5
            assert user.locked_until is not None

    @pytest.mark.asyncio
    async def test_revoke_session_not_found(self):
        svc = AuthService()
        mock_db = AsyncMock()
        mock_db.execute.return_value = DummyResult(None)
        
        res = await svc.revoke_session(mock_db, "9")
        assert res is False

