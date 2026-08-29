"""
Integration test – API health and meta endpoints.
These tests use httpx.AsyncClient against the real FastAPI app
(with a test database connection via env vars).
"""
import pytest
from httpx import AsyncClient, ASGITransport


@pytest.mark.asyncio
async def test_root_returns_200():
    from src.api.app.server import app
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "SSR One AI Platform"
    assert data["status"] == "running"


@pytest.mark.asyncio
async def test_ping_endpoint():
    from src.api.app.server import app
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/ping")
    assert response.status_code == 200
    assert response.json() == {"pong": True}


@pytest.mark.asyncio
async def test_health_endpoint_structure():
    from src.api.app.server import app
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert "services" in data
    assert "database" in data["services"]
    assert "redis" in data["services"]


@pytest.mark.asyncio
async def test_protected_route_requires_auth():
    from src.api.app.server import app
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.get("/api/v1/orders")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_login_with_wrong_credentials():
    from src.api.app.server import app
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        response = await client.post("/api/v1/auth/login", json={
            "tenant_slug": "wrong-tenant",
            "email": "nobody@example.com",
            "password": "wrongpass",
        })
    assert response.status_code in (401, 404)
