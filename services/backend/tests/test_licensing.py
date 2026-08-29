"""
SSR One AI — Backend Feature Licensing & Subscription Entitlement Test Suite
"""
import pytest
from fastapi import HTTPException
from src.engines.licensing.engine import feature_engine


def test_basic_tier_blocked_from_professional_feature():
    """Verify that a Basic/Starter tier tenant is blocked (HTTP 403) from a Professional-gated feature."""
    feature_id = "hotel.dynamic_pricing"
    tenant_tier = "Basic"
    
    # 1. Direct bool check
    allowed = feature_engine.is_tier_feature_allowed(feature_id, tenant_tier)
    assert allowed is False, f"Basic tier should not have access to '{feature_id}'"
    
    # 2. Enforcement check (raises HTTP 403)
    with pytest.raises(HTTPException) as exc_info:
        feature_engine.require_tier_feature(feature_id, tenant_tier)
    
    assert exc_info.value.status_code == 403
    assert exc_info.value.detail["error"] == "tier_feature_restricted"
    assert exc_info.value.detail["feature_id"] == feature_id


def test_enterprise_tier_access_allowed():
    """Verify that an Enterprise tier tenant has full access to professional/enterprise features."""
    feature_id = "hotel.dynamic_pricing"
    tenant_tier = "Enterprise"
    
    # 1. Direct bool check
    allowed = feature_engine.is_tier_feature_allowed(feature_id, tenant_tier)
    assert allowed is True, f"Enterprise tier must have access to '{feature_id}'"
    
    # 2. Enforcement check (should not raise)
    feature_engine.require_tier_feature(feature_id, tenant_tier)
