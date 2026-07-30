import pytest
from datetime import datetime, timezone
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi import HTTPException

from src.modules.auth.licensing_router import (
    require_superadmin,
    list_licenses,
    grant_license,
    update_license,
    revoke_license,
    invalidate_cache,
    list_feature_catalog,
    create_feature_master,
)
from src.modules.auth.schemas import (
    FeatureLicenseCreate,
    FeatureLicenseUpdate,
    FeatureMasterCreate,
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


@pytest.mark.asyncio
async def test_require_superadmin_allowed():
    mock_user = MagicMock()
    mock_user.is_superadmin = True
    res = require_superadmin(mock_user)
    assert res == mock_user


@pytest.mark.asyncio
async def test_require_superadmin_forbidden():
    mock_user = MagicMock()
    mock_user.is_superadmin = False
    with pytest.raises(HTTPException) as exc:
        require_superadmin(mock_user)
    assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_list_licenses():
    mock_user = MagicMock(is_superadmin=True)
    mock_db = AsyncMock()
    mock_license = MagicMock(id=1, tenant_id=10, feature_code="pos")
    mock_db.execute.return_value = DummyResult([mock_license])

    result = await list_licenses(tenant_id=10, current_user=mock_user, db=mock_db)
    assert len(result) == 1
    assert result[0].feature_code == "pos"


@pytest.mark.asyncio
async def test_grant_license_success():
    mock_user = MagicMock(is_superadmin=True)
    mock_db = AsyncMock()
    # No existing license
    mock_db.execute.return_value = DummyResult([])

    body = FeatureLicenseCreate(
        tenant_id=1,
        feature_code="restaurant",
        is_active=True,
        max_users=10,
    )

    with patch("src.engines.licensing.engine.feature_engine.invalidate_cache", AsyncMock()) as mock_inv:
        res = await grant_license(body=body, current_user=mock_user, db=mock_db)
        assert res.tenant_id == 1
        assert res.feature_code == "restaurant"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_inv.assert_called_once_with("1")


@pytest.mark.asyncio
async def test_grant_license_conflict():
    mock_user = MagicMock(is_superadmin=True)
    mock_db = AsyncMock()
    # License exists
    existing = MagicMock(id=1)
    mock_db.execute.return_value = DummyResult([existing])

    body = FeatureLicenseCreate(tenant_id=1, feature_code="pos")

    with pytest.raises(HTTPException) as exc:
        await grant_license(body=body, current_user=mock_user, db=mock_db)
    assert exc.value.status_code == 409


@pytest.mark.asyncio
async def test_update_license_success():
    mock_user = MagicMock(is_superadmin=True)
    mock_db = AsyncMock()
    existing_lic = MagicMock(id=5, tenant_id=2, is_active=True, max_users=5)
    mock_db.execute.return_value = DummyResult([existing_lic])

    body = FeatureLicenseUpdate(is_active=False, max_users=20)

    with patch("src.engines.licensing.engine.feature_engine.invalidate_cache", AsyncMock()) as mock_inv:
        res = await update_license(license_id=5, body=body, current_user=mock_user, db=mock_db)
        assert res.is_active is False
        assert res.max_users == 20
        mock_db.commit.assert_called_once()
        mock_inv.assert_called_once_with("2")


@pytest.mark.asyncio
async def test_revoke_license_success():
    mock_user = MagicMock(is_superadmin=True)
    mock_db = AsyncMock()
    existing_lic = MagicMock(id=3, tenant_id=7)
    mock_db.execute.return_value = DummyResult([existing_lic])

    with patch("src.engines.licensing.engine.feature_engine.invalidate_cache", AsyncMock()) as mock_inv:
        await revoke_license(license_id=3, current_user=mock_user, db=mock_db)
        mock_db.delete.assert_called_once_with(existing_lic)
        mock_db.commit.assert_called_once()
        mock_inv.assert_called_once_with("7")


@pytest.mark.asyncio
async def test_invalidate_cache_endpoint():
    mock_user = MagicMock(is_superadmin=True)
    with patch("src.engines.licensing.engine.feature_engine.invalidate_cache", AsyncMock()) as mock_inv:
        res = await invalidate_cache(tenant_id=99, current_user=mock_user)
        mock_inv.assert_called_once_with("99")
        assert "Cache invalidated for tenant 99" in res["message"]


@pytest.mark.asyncio
async def test_list_feature_catalog():
    mock_user = MagicMock(is_superadmin=True)
    mock_db = AsyncMock()
    mock_feat = MagicMock(code="pos", name="POS", category="operations")
    mock_db.execute.return_value = DummyResult([mock_feat])

    res = await list_feature_catalog(current_user=mock_user, db=mock_db)
    assert len(res) == 1
    assert res[0].code == "pos"


@pytest.mark.asyncio
async def test_create_feature_master_success():
    mock_user = MagicMock(is_superadmin=True)
    mock_db = AsyncMock()
    mock_db.execute.return_value = DummyResult([])

    body = FeatureMasterCreate(code="custom_crm", name="Custom CRM", category="crm")

    res = await create_feature_master(body=body, current_user=mock_user, db=mock_db)
    assert res.code == "custom_crm"
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
