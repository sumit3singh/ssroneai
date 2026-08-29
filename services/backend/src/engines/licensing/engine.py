"""
The ssrone – Feature Engine
Controls which modules are enabled per tenant via licensing.
If a feature is unlicensed: menus disappear, API endpoints reject, permissions revoked.
"""
from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import StrEnum
from functools import wraps
from typing import Any, Callable

from fastapi import HTTPException, status

from src.shared.logger import get_logger
from src.shared.redis_client import CacheService

logger = get_logger(__name__)
cache = CacheService(prefix="features")


class FeatureModule(StrEnum):
    """All available platform modules."""
    # Core
    CORE = "core"
    AUTH = "auth"
    SETTINGS = "settings"

    # Operations
    POS = "pos"
    RESTAURANT = "restaurant"
    KDS = "kds"
    TABLE_MANAGEMENT = "table_management"

    # Hotel
    HOTEL_PMS = "hotel_pms"
    RESERVATIONS = "reservations"
    REVENUE_MANAGEMENT = "revenue_management"

    # PG / Hostel
    PG_MANAGEMENT = "pg_management"

    # Inventory & Finance
    INVENTORY = "inventory"
    BILLING = "billing"
    FINANCE = "finance"
    ACCOUNTS = "accounts"
    GST_FILING = "gst_filing"

    # CRM & Loyalty
    CRM = "crm"
    LOYALTY = "loyalty"
    MARKETING = "marketing"

    # HR
    HR = "hr"
    PAYROLL = "payroll"
    ATTENDANCE = "attendance"

    # AI
    AI_COPILOT = "ai_copilot"
    AI_REPORTS = "ai_reports"
    AI_FORECASTING = "ai_forecasting"

    # Analytics
    REPORTS = "reports"
    DASHBOARD = "dashboard"
    ANALYTICS = "analytics"

    # Platform
    MULTI_BRANCH = "multi_branch"
    MULTI_COMPANY = "multi_company"
    WHITE_LABEL = "white_label"
    API_MARKETPLACE = "api_marketplace"
    VENDOR_PORTAL = "vendor_portal"
    CUSTOMER_PORTAL = "customer_portal"

    # Maintenance & Operations
    MAINTENANCE = "maintenance"
    ASSETS = "assets"
    TASKS = "tasks"


# Feature dependency tree — activating a feature auto-activates prerequisites
FEATURE_DEPENDENCIES: dict[FeatureModule, list[FeatureModule]] = {
    FeatureModule.POS: [FeatureModule.INVENTORY, FeatureModule.BILLING],
    FeatureModule.RESTAURANT: [FeatureModule.POS, FeatureModule.TABLE_MANAGEMENT],
    FeatureModule.KDS: [FeatureModule.RESTAURANT],
    FeatureModule.HOTEL_PMS: [FeatureModule.RESERVATIONS, FeatureModule.BILLING],
    FeatureModule.REVENUE_MANAGEMENT: [FeatureModule.HOTEL_PMS],
    FeatureModule.PG_MANAGEMENT: [FeatureModule.BILLING],
    FeatureModule.PAYROLL: [FeatureModule.HR, FeatureModule.ATTENDANCE],
    FeatureModule.GST_FILING: [FeatureModule.FINANCE, FeatureModule.BILLING],
    FeatureModule.AI_REPORTS: [FeatureModule.AI_COPILOT, FeatureModule.REPORTS],
    FeatureModule.AI_FORECASTING: [FeatureModule.AI_COPILOT, FeatureModule.INVENTORY],
    FeatureModule.LOYALTY: [FeatureModule.CRM],
    FeatureModule.MARKETING: [FeatureModule.CRM],
}


@dataclass
class FeatureLicense:
    """Represents a licensed feature for a tenant."""
    tenant_id: str
    feature: FeatureModule
    is_active: bool
    expires_at: datetime | None = None
    config: dict[str, Any] = field(default_factory=dict)

    @property
    def is_valid(self) -> bool:
        if not self.is_active:
            return False
        if self.expires_at and self.expires_at < datetime.now(timezone.utc):
            return False
        return True


class FeatureEngine:
    """
    Feature Engine — the gatekeeper for all module access.
    """

    async def is_enabled(self, tenant_id: str, feature: FeatureModule) -> bool:
        """Check if a feature is enabled for a tenant (with caching)."""
        cache_key = f"{tenant_id}:{feature}"
        cached = await cache.get(cache_key)
        if cached is not None:
            return bool(cached)

        # Check dependencies first (if any) to prevent dependency bypass
        deps = self.resolve_dependencies(feature)
        for dep in deps:
            if dep != feature and not await self.is_enabled(tenant_id, dep):
                await cache.set(cache_key, False, ttl=300)
                return False

        from src.core.database.engine import AsyncSessionLocal
        from src.modules.auth.models import FeatureMaster, FeatureLicense
        from sqlalchemy import select

        result = False
        try:
            async with AsyncSessionLocal() as session:
                # 1. Check FeatureMaster is active
                master_stmt = select(FeatureMaster).where(
                    FeatureMaster.code == feature,
                    FeatureMaster.is_active == True
                )
                master_res = await session.execute(master_stmt)
                master = master_res.scalar_one_or_none()

                if master:
                    if master.is_core:
                        result = True
                    else:
                        # 2. Check FeatureLicense for tenant-specific licensing
                        try:
                            t_id = int(tenant_id)
                            lic_stmt = select(FeatureLicense).where(
                                FeatureLicense.tenant_id == t_id,
                                FeatureLicense.feature_code == feature,
                                FeatureLicense.is_active == True
                            )
                            lic_res = await session.execute(lic_stmt)
                            lic = lic_res.scalar_one_or_none()
                            if lic:
                                from datetime import datetime, timezone
                                if lic.expires_at is None or lic.expires_at > datetime.now(timezone.utc):
                                    result = True
                        except (ValueError, TypeError):
                            # Not a valid integer
                            result = False
                else:
                    # Treat CORE / AUTH / SETTINGS / DASHBOARD as implicit if not in DB to avoid lockout
                    if feature in [FeatureModule.CORE, FeatureModule.AUTH, FeatureModule.SETTINGS, FeatureModule.DASHBOARD]:
                        result = True
        except Exception as e:
            logger.error("Error checking feature license", tenant_id=tenant_id, feature=feature, error=str(e))
            if feature in [FeatureModule.CORE, FeatureModule.AUTH, FeatureModule.SETTINGS]:
                result = True

        await cache.set(cache_key, result, ttl=300)  # Cache for 5 minutes
        return result

    def is_tier_feature_allowed(self, feature_id: str, tenant_tier: str) -> bool:
        """
        Check feature gating server-side against metadata/features/feature_registry.json.
        """
        import json
        from pathlib import Path
        
        # Path resolution for feature_registry.json
        possible_paths = [
            Path("metadata/features/feature_registry.json"),
            Path("../../metadata/features/feature_registry.json"),
            Path("../../../metadata/features/feature_registry.json"),
            Path(__file__).parents[4] / "metadata" / "features" / "feature_registry.json"
        ]
        
        registry_data = None
        for path in possible_paths:
            if path.exists():
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        registry_data = json.load(f)
                        break
                except Exception:
                    pass

        if not registry_data:
            return True

        normalized_tier = tenant_tier.lower()
        if normalized_tier == "basic":
            normalized_tier = "starter"

        features = registry_data.get("features", [])
        for feat in features:
            if feat.get("feature_id") == feature_id:
                allowed_licenses = [l.lower() for l in feat.get("license", [])]
                return normalized_tier in allowed_licenses

        return True

    def require_tier_feature(self, feature_id: str, tenant_tier: str) -> None:
        """Enforce server-side licensing against subscription tier."""
        if not self.is_tier_feature_allowed(feature_id, tenant_tier):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "tier_feature_restricted",
                    "feature_id": feature_id,
                    "tenant_tier": tenant_tier,
                    "message": f"Feature '{feature_id}' is restricted on '{tenant_tier}' tier plan."
                }
            )


    async def check_user_quota(self, tenant_id: str) -> bool:
        """Check if the user count for the tenant exceeds max_users license quota."""
        from src.core.database.engine import AsyncSessionLocal
        from src.modules.auth.models import FeatureLicense, User
        from sqlalchemy import select, func

        try:
            t_id = int(tenant_id)
            async with AsyncSessionLocal() as session:
                lic_stmt = select(func.max(FeatureLicense.max_users)).where(
                    FeatureLicense.tenant_id == t_id,
                    FeatureLicense.is_active == True
                )
                lic_res = await session.execute(lic_stmt)
                max_users = lic_res.scalar()
                
                if max_users is None:
                    return True

                user_stmt = select(func.count(User.id)).where(
                    User.tenant_id == t_id,
                    User.is_deleted == False
                )
                user_res = await session.execute(user_stmt)
                user_count = user_res.scalar() or 0
                
                return user_count < max_users
        except (ValueError, TypeError) as e:
            logger.error("Error checking user quota", tenant_id=tenant_id, error=str(e))
            return True

    async def check_branch_quota(self, tenant_id: str) -> bool:
        """Check if the branch count for the tenant exceeds max_branches license quota."""
        from src.core.database.engine import AsyncSessionLocal
        from src.modules.auth.models import FeatureLicense, Branch
        from sqlalchemy import select, func

        try:
            t_id = int(tenant_id)
            async with AsyncSessionLocal() as session:
                lic_stmt = select(func.max(FeatureLicense.max_branches)).where(
                    FeatureLicense.tenant_id == t_id,
                    FeatureLicense.is_active == True
                )
                lic_res = await session.execute(lic_stmt)
                max_branches = lic_res.scalar()
                
                if max_branches is None:
                    return True

                branch_stmt = select(func.count(Branch.id)).where(
                    Branch.tenant_id == t_id,
                    Branch.is_deleted == False
                )
                branch_res = await session.execute(branch_stmt)
                branch_count = branch_res.scalar() or 0
                
                return branch_count < max_branches
        except (ValueError, TypeError) as e:
            logger.error("Error checking branch quota", tenant_id=tenant_id, error=str(e))
            return True

    async def require_feature(self, tenant_id: str, feature: FeatureModule) -> None:
        """
        Raise HTTP 403 if feature is not enabled for the tenant.
        Use as a FastAPI dependency or direct call in routes.
        """
        if not await self.is_enabled(tenant_id, feature):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "feature_not_licensed",
                    "feature": feature,
                    "message": f"The '{feature}' module is not enabled for your account. "
                               f"Please contact support to upgrade your plan.",
                },
            )

    def resolve_dependencies(self, feature: FeatureModule) -> list[FeatureModule]:
        """Return all dependencies required for a feature (recursive)."""
        deps = set()
        queue = [feature]
        while queue:
            current = queue.pop()
            for dep in FEATURE_DEPENDENCIES.get(current, []):
                if dep not in deps:
                    deps.add(dep)
                    queue.append(dep)
        return list(deps)

    async def invalidate_cache(self, tenant_id: str) -> None:
        """Invalidate all feature cache entries for a tenant."""
        await cache.delete_pattern(f"{tenant_id}:*")
        logger.info("Feature cache invalidated", tenant_id=tenant_id)
        
        # Broadcast invalidation event to other server instances via Redis Pub/Sub
        try:
            from src.shared.redis_client import get_redis
            redis = await get_redis()
            await redis.publish("ssrone:licensing:cache_invalidation", str(tenant_id))
            logger.info("Feature cache invalidation broadcasted", tenant_id=tenant_id)
        except Exception as e:
            logger.error("Failed to broadcast cache invalidation", tenant_id=tenant_id, error=str(e))


# Global singleton
feature_engine = FeatureEngine()


def require_feature(feature: FeatureModule) -> Callable:  # type: ignore[type-arg]
    """
    FastAPI route decorator to enforce feature licensing.

    Usage:
        @router.get("/pos/orders")
        @require_feature(FeatureModule.POS)
        async def list_orders(request: Request):
            ...
    """
    def decorator(func: Callable) -> Callable:  # type: ignore[type-arg]
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> Any:
            request = kwargs.get("request") or (args[0] if args else None)
            tenant_id = getattr(request, "tenant_id", "default")
            await feature_engine.require_feature(tenant_id, feature)
            return await func(*args, **kwargs)
        return wrapper
    return decorator
