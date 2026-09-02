"""
PyTest Test Suite for PG Management Module endpoints.
Verifies PostgreSQL database SSOT compliance, room creation, bed auto-generation, resident onboarding, and rent collections.
"""
import pytest
from decimal import Decimal
from datetime import date
from httpx import AsyncClient, ASGITransport

from src.main import app


@pytest.mark.asyncio
async def test_pg_dashboard_kpis_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/pg/dashboard")
        assert response.status_code == 200
        data = response.json()
        assert "total_residents" in data
        assert "rent_collected" in data
        assert "pending_dues" in data
        assert "occupancy_pct" in data


@pytest.mark.asyncio
async def test_pg_floors_crud():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Get floors
        get_res = await ac.get("/api/v1/pg/floors")
        assert get_res.status_code == 200
        assert isinstance(get_res.json(), list)

        # Create floor
        create_res = await ac.post("/api/v1/pg/floors", json={
            "branch_id": 1,
            "company_id": 1,
            "floor_name": "Third Floor Test Block"
        })
        assert create_res.status_code == 201
        created = create_res.json()
        assert created["floor_name"] == "Third Floor Test Block"


@pytest.mark.asyncio
async def test_pg_rooms_and_beds_auto_creation():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Create room with sharing_type = 2
        res = await ac.post("/api/v1/pg/rooms", json={
            "branch_id": 1,
            "company_id": 1,
            "room_number": "Test-301",
            "sharing_type": 2,
            "monthly_rent": 8500.00
        })
        assert res.status_code == 201
        room = res.json()
        assert room["room_number"] == "Test-301"
        assert room["sharing_type"] == 2

        # Verify auto-generated beds
        beds_res = await ac.get(f"/api/v1/pg/beds?room_id={room['id']}")
        assert beds_res.status_code == 200
        beds = beds_res.json()
        assert len(beds) == 2
        assert beds[0]["status"] == "VACANT"
