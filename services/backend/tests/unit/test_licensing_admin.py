import pytest
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock, patch
from httpx import AsyncClient, ASGITransport
from fastapi import status

from src.api.app.server import app
from src.modules.auth.dependencies import get_current_user
from src.core.database.engine import get_db_session
from src.modules.auth.models import User, FeatureLicense


@pytest.mark.asyncio
async def test_licensing_routes_as_superadmin():
    # Mock superadmin user
    superadmin = User(
        id=1,
        tenant_id=1,
        email="superadmin@ssrone.ai",
        first_name="Super",
        last_name="Admin",
        is_active=True,
        is_superadmin=True
    )

    # Mock DB Session
    mock_db = AsyncMock()
    mock_db.add = MagicMock()
    mock_db.commit = AsyncMock()
    mock_db.refresh = AsyncMock()
    mock_db.delete = AsyncMock()
    
    # Mock response for list_licenses query
    mock_license = FeatureLicense(
        id=2,
        tenant_id=superadmin.tenant_id,
        feature_code="pos",
        is_active=True,
        expires_at=None,
        max_users=10,
        max_branches=5,
        config={}
    )
    mock_license.created_at = datetime.now(timezone.utc)
    mock_license.updated_at = datetime.now(timezone.utc)
    
    # Mock execute results
    mock_result = MagicMock()
    mock_result.scalars.return_value.all.return_value = [mock_license]
    mock_result.scalar_one_or_none.return_value = mock_license  # For patch/delete get
    mock_db.execute.return_value = mock_result

    # Dependency overrides
    app.dependency_overrides[get_current_user] = lambda: superadmin
    app.dependency_overrides[get_db_session] = lambda: mock_db

    try:
        with patch("src.modules.auth.licensing_router.feature_engine.invalidate_cache", AsyncMock()) as mock_invalidate:
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
                # 1. GET /api/v1/licensing/licenses
                response = await client.get("/api/v1/licensing/licenses")
                assert response.status_code == status.HTTP_200_OK
                data = response.json()
                assert len(data) == 1
                assert data[0]["feature_code"] == "pos"

                # 2. POST /api/v1/licensing/licenses (grant)
                new_license_data = {
                    "tenant_id": "3",
                    "feature_code": "hotel_pms",
                    "is_active": True,
                    "expires_at": None,
                    "max_users": 5,
                    "max_branches": 2,
                    "config": {}
                }
                # Mock no conflict for POST
                mock_result.scalar_one_or_none.return_value = None
                
                # Mock return for DB refresh after adding
                def mock_refresh(instance):
                    instance.id = 5
                    instance.created_at = datetime.now(timezone.utc)
                    instance.updated_at = datetime.now(timezone.utc)
                mock_db.refresh.side_effect = mock_refresh

                response = await client.post("/api/v1/licensing/licenses", json=new_license_data)
                assert response.status_code == status.HTTP_201_CREATED
                assert response.json()["feature_code"] == "hotel_pms"
                mock_invalidate.assert_called_once()

                # 3. PATCH /api/v1/licensing/licenses/{license_id}
                mock_invalidate.reset_mock()
                # Mock finding the license for PATCH
                mock_result.scalar_one_or_none.return_value = mock_license
                update_data = {
                    "is_active": False,
                    "max_users": 15
                }
                response = await client.patch(f"/api/v1/licensing/licenses/{mock_license.id}", json=update_data)
                assert response.status_code == status.HTTP_200_OK
                assert response.json()["is_active"] is False
                assert response.json()["max_users"] == 15
                mock_invalidate.assert_called_once()

                # 4. DELETE /api/v1/licensing/licenses/{license_id}
                mock_invalidate.reset_mock()
                # Mock finding the license for DELETE
                mock_result.scalar_one_or_none.return_value = mock_license
                response = await client.delete(f"/api/v1/licensing/licenses/{mock_license.id}")
                assert response.status_code == status.HTTP_204_NO_CONTENT
                mock_invalidate.assert_called_once()

                # 5. POST /api/v1/licensing/cache/invalidate
                mock_invalidate.reset_mock()
                response = await client.post(f"/api/v1/licensing/cache/invalidate?tenant_id={superadmin.tenant_id}")
                assert response.status_code == status.HTTP_200_OK
                assert "Cache invalidated" in response.json()["message"]
                mock_invalidate.assert_called_once_with(str(superadmin.tenant_id))
            
    finally:
        # Clean overrides
        app.dependency_overrides.clear()


@pytest.mark.asyncio
async def test_licensing_routes_as_regular_user():
    # Mock regular user
    regular_user = User(
        id=4,
        tenant_id=4,
        email="user@ssrone.ai",
        first_name="Regular",
        last_name="User",
        is_active=True,
        is_superadmin=False
    )

    app.dependency_overrides[get_current_user] = lambda: regular_user

    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            response = await client.get("/api/v1/licensing/licenses")
            assert response.status_code == status.HTTP_403_FORBIDDEN
    finally:
        app.dependency_overrides.clear()
