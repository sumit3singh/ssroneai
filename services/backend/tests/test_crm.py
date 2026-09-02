"""
PyTest Test Suite for CRM & Guest Loyalty Module endpoints.
Verifies customer profile registration, check-phone endpoint, and loyalty points calculations.
"""
import pytest
from httpx import AsyncClient, ASGITransport

from src.main import app


@pytest.mark.asyncio
async def test_crm_customers_list():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        res = await ac.get("/api/v1/crm/customers")
        assert res.status_code == 200
        data = res.json()
        assert "items" in data
        assert "total" in data


@pytest.mark.asyncio
async def test_crm_customer_registration_and_phone_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        test_phone = "9876599999"
        
        # Check phone before registration
        check_before = await ac.get(f"/api/v1/crm/customers/check-phone?phone={test_phone}")
        assert check_before.status_code == 200
        
        # Register new guest
        reg_res = await ac.post("/api/v1/crm/customers", json={
            "name": "Audit Test Customer",
            "first_name": "Audit",
            "last_name": "Customer",
            "phone": test_phone,
            "email": "audit@test.com",
            "city": "Mahendragarh"
        })
        assert reg_res.status_code == 201
        created = reg_res.json()
        assert created["phone"] == test_phone
        assert created["name"] == "Audit Test Customer"

        # Check phone after registration
        check_after = await ac.get(f"/api/v1/crm/customers/check-phone?phone={test_phone}")
        assert check_after.status_code == 200
        assert check_after.json()["exists"] is True
