import pytest
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException
from src.engines.licensing.engine import FeatureEngine, FeatureModule

class DummyResult:
    def __init__(self, val):
        self.val = val
        
    def scalar_one_or_none(self):
        return self.val

class DummySession:
    def __init__(self, results):
        self.results = results
        self.index = 0
        
    async def __aenter__(self):
        return self
        
    async def __aexit__(self, exc_type, exc, tb):
        return False
        
    async def execute(self, stmt):
        res = self.results[self.index]
        self.index += 1
        return DummyResult(res)

@pytest.mark.asyncio
async def test_core_features_always_enabled():
    engine = FeatureEngine()
    
    mock_master = MagicMock()
    mock_master.is_core = True
    mock_master.is_active = True
    
    dummy_session = DummySession([mock_master])
    
    with patch("src.core.database.engine.AsyncSessionLocal", return_value=dummy_session):
        with patch("src.engines.licensing.engine.cache.get", AsyncMock(return_value=None)):
            with patch("src.engines.licensing.engine.cache.set", AsyncMock()):
                with patch.object(engine, "resolve_dependencies", return_value=[]):
                    res = await engine.is_enabled("default", FeatureModule.CORE)
                    assert res is True

@pytest.mark.asyncio
async def test_non_core_licensed_feature():
    engine = FeatureEngine()
    
    mock_master = MagicMock()
    mock_master.is_core = False
    mock_master.is_active = True
    
    mock_license = MagicMock()
    mock_license.is_active = True
    mock_license.expires_at = None
    
    dummy_session = DummySession([mock_master, mock_license])
    tenant_id = "1"
    
    with patch("src.core.database.engine.AsyncSessionLocal", return_value=dummy_session):
        with patch("src.engines.licensing.engine.cache.get", AsyncMock(return_value=None)):
            with patch("src.engines.licensing.engine.cache.set", AsyncMock()):
                with patch.object(engine, "resolve_dependencies", return_value=[]):
                    res = await engine.is_enabled(tenant_id, FeatureModule.POS)
                    assert res is True

@pytest.mark.asyncio
async def test_unlicensed_feature_returns_false():
    engine = FeatureEngine()
    
    mock_master = MagicMock()
    mock_master.is_core = False
    mock_master.is_active = True
    
    dummy_session = DummySession([mock_master, None])
    tenant_id = "2"
    
    with patch("src.core.database.engine.AsyncSessionLocal", return_value=dummy_session):
        with patch("src.engines.licensing.engine.cache.get", AsyncMock(return_value=None)):
            with patch("src.engines.licensing.engine.cache.set", AsyncMock()):
                with patch.object(engine, "resolve_dependencies", return_value=[]):
                    res = await engine.is_enabled(tenant_id, FeatureModule.POS)
                    assert res is False

@pytest.mark.asyncio
async def test_invalidate_cache():
    engine = FeatureEngine()
    with patch("src.engines.licensing.engine.cache.delete_pattern", AsyncMock()) as mock_delete:
        await engine.invalidate_cache("tenant-123")
        mock_delete.assert_called_once_with("tenant-123:*")

class DummyValueResult:
    def __init__(self, val):
        self.val = val
    def scalar(self):
        return self.val

class DummyQuotaSession:
    def __init__(self, results):
        self.results = results
        self.index = 0
    async def __aenter__(self):
        return self
    async def __aexit__(self, exc_type, exc, tb):
        return False
    async def execute(self, stmt):
        res = self.results[self.index]
        self.index += 1
        return DummyValueResult(res)

@pytest.mark.asyncio
async def test_check_user_quota():
    engine = FeatureEngine()
    tenant_id = "3"
    
    # 1. Test user quota under limit (max = 10, count = 3)
    dummy_sess = DummyQuotaSession([10, 3])
    with patch("src.core.database.engine.AsyncSessionLocal", return_value=dummy_sess):
        res = await engine.check_user_quota(tenant_id)
        assert res is True

    # 2. Test user quota exceeded (max = 5, count = 6)
    dummy_sess2 = DummyQuotaSession([5, 6])
    with patch("src.core.database.engine.AsyncSessionLocal", return_value=dummy_sess2):
        res = await engine.check_user_quota(tenant_id)
        assert res is False


@pytest.mark.asyncio
async def test_feature_license_is_valid():
    from src.engines.licensing.engine import FeatureLicense
    tenant_id = "4"
    
    # 1. Active, no expiry
    lic = FeatureLicense(tenant_id=tenant_id, feature=FeatureModule.POS, is_active=True, expires_at=None)
    assert lic.is_valid is True

    # 2. Inactive
    lic2 = FeatureLicense(tenant_id=tenant_id, feature=FeatureModule.POS, is_active=False, expires_at=None)
    assert lic2.is_valid is False

    # 3. Active, not expired
    future_date = datetime(2100, 1, 1, tzinfo=timezone.utc)
    lic3 = FeatureLicense(tenant_id=tenant_id, feature=FeatureModule.POS, is_active=True, expires_at=future_date)
    assert lic3.is_valid is True

    # 4. Active, expired
    past_date = datetime(2020, 1, 1, tzinfo=timezone.utc)
    lic4 = FeatureLicense(tenant_id=tenant_id, feature=FeatureModule.POS, is_active=True, expires_at=past_date)
    assert lic4.is_valid is False


@pytest.mark.asyncio
async def test_resolve_dependencies_recursive():
    engine = FeatureEngine()
    # POS requires INVENTORY and BILLING
    # RESTAURANT requires POS and TABLE_MANAGEMENT
    # So RESTAURANT resolved dependencies should contain POS, TABLE_MANAGEMENT, INVENTORY, BILLING
    deps = engine.resolve_dependencies(FeatureModule.RESTAURANT)
    assert FeatureModule.POS in deps
    assert FeatureModule.TABLE_MANAGEMENT in deps
    assert FeatureModule.INVENTORY in deps
    assert FeatureModule.BILLING in deps


@pytest.mark.asyncio
async def test_check_branch_quota():
    engine = FeatureEngine()
    tenant_id = "5"
    
    # Under limit
    dummy_sess = DummyQuotaSession([5, 2])
    with patch("src.core.database.engine.AsyncSessionLocal", return_value=dummy_sess):
        res = await engine.check_branch_quota(tenant_id)
        assert res is True

    # Exceeded
    dummy_sess2 = DummyQuotaSession([3, 4])
    with patch("src.core.database.engine.AsyncSessionLocal", return_value=dummy_sess2):
        res = await engine.check_branch_quota(tenant_id)
        assert res is False

    # No quota (None)
    dummy_sess3 = DummyQuotaSession([None, 4])
    with patch("src.core.database.engine.AsyncSessionLocal", return_value=dummy_sess3):
        res = await engine.check_branch_quota(tenant_id)
        assert res is True


@pytest.mark.asyncio
async def test_require_feature_raises_http_exception():
    engine = FeatureEngine()
    tenant_id = "6"
    
    with patch.object(engine, "is_enabled", AsyncMock(return_value=False)):
        with pytest.raises(HTTPException) as exc:
            await engine.require_feature(tenant_id, FeatureModule.POS)
        assert exc.value.status_code == 403
        assert exc.value.detail["error"] == "feature_not_licensed"

    with patch.object(engine, "is_enabled", AsyncMock(return_value=True)):
        # Should not raise exception
        await engine.require_feature(tenant_id, FeatureModule.POS)


@pytest.mark.asyncio
async def test_require_feature_decorator():
    from src.engines.licensing.engine import require_feature
    
    @require_feature(FeatureModule.POS)
    async def dummy_route(request):
        return "success"
        
    request = MagicMock()
    request.tenant_id = "tenant-123"
    
    with patch("src.engines.licensing.engine.feature_engine.require_feature", AsyncMock()) as mock_req:
        res = await dummy_route(request)
        assert res == "success"
        mock_req.assert_called_once_with("tenant-123", FeatureModule.POS)


@pytest.mark.asyncio
async def test_listen_cache_invalidations():
    from src.api.app.server import listen_cache_invalidations
    import asyncio
    
    mock_redis = AsyncMock()
    mock_pubsub = AsyncMock()
    mock_redis.pubsub = MagicMock(return_value=mock_pubsub)
    
    async def mock_listen():
        yield {"type": "message", "data": "123"}
        
    mock_pubsub.listen = mock_listen
    
    call_count = 0
    async def mock_get_redis():
        nonlocal call_count
        call_count += 1
        if call_count > 1:
            raise asyncio.CancelledError()
        return mock_redis
    
    with patch("src.shared.redis_client.get_redis", mock_get_redis):
        with patch("src.engines.licensing.engine.cache._local_cache.delete_pattern", MagicMock()) as mock_delete:
            await listen_cache_invalidations()
            mock_pubsub.subscribe.assert_called_once_with("baithak:licensing:cache_invalidation")
            mock_delete.assert_called_once_with("features:123:*")


@pytest.mark.asyncio
async def test_server_lifespan():
    from src.api.app.server import lifespan
    from fastapi import FastAPI
    app = FastAPI()
    
    with patch("src.api.app.server.ping_database", AsyncMock(return_value=True)):
        with patch("src.api.app.server.ping_redis", AsyncMock(return_value=True)):
            with patch("src.api.app.server.dispose_engine", AsyncMock()) as mock_dispose_db:
                with patch("src.api.app.server.close_redis", AsyncMock()) as mock_close_redis:
                    async with lifespan(app):
                        pass
                    mock_dispose_db.assert_called_once()
                    mock_close_redis.assert_called_once()

