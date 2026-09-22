"""
SSR One AI – Customization Service Layer
Business logic for tenant configuration lifecycle (draft -> published) and custom domain DNS verification.
"""
import socket
from datetime import datetime, timezone
from typing import Any, Optional

from sqlalchemy import select, and_, or_
from sqlalchemy.orm.attributes import flag_modified
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.auth.models import Tenant, Branch
from src.modules.customization.models import TenantAppConfig, TenantCustomDomain
from src.modules.customization.schemas import DNSInstruction
from src.shared.logger import get_logger

logger = get_logger(__name__)

DEFAULT_CONNECT_TARGET = "connect.ssrone.app"
DEFAULT_SERVER_IP = "127.0.0.1"


DEFAULT_CONFIGS: dict[str, dict[str, Any]] = {
    "global": {
        "branding": {
            "businessName": "Baithak Cafe",
            "tagline": "Traditional Flavour, Modern Experience",
            "logoUrl": "",
            "primaryColor": "#E11D48",
            "accentColor": "#F59E0B",
            "phone": "+91 98765 43210",
            "address": "Main Campus, Central University of Haryana, Mahendragarh",
            "businessHours": "09:00 AM - 10:00 PM",
            "socialLinks": {
                "instagram": "https://instagram.com",
                "whatsapp": "https://wa.me/919876543210",
                "googleMaps": "https://maps.google.com",
            },
        },
    },
    "customer-food-web": {
        "banner": {
            "imageUrl": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
            "headline": "Welcome to Our Kitchen",
            "subtext": "Freshly crafted delicious meals prepared with love and care.",
        },
        "features": {
            "tableQrOrdering": True,
            "takeaway": True,
            "delivery": True,
            "onlinePayment": True,
        },
        "orderConfirmationMessage": "Thank you for dining with us! Your order has been placed directly with the kitchen.",
        "hiddenCategories": [],
        "hiddenItems": [],
        "featuredItems": [],
    },
    "customer-stay-web": {
        "welcomeMessage": "Welcome to our boutique hotel. Enjoy luxury and unparalleled comfort.",
        "features": {
            "roomServiceRequests": True,
            "housekeepingRequests": True,
            "digitalCheckout": True,
        },
        "policies": {
            "checkInTime": "12:00 PM",
            "checkOutTime": "11:00 AM",
            "cancellationPolicy": "Free cancellation up to 24 hours prior to arrival.",
        },
    },
    "kds-web": {
        "displayTheme": "standard",
        "stationRouting": {
            "defaultStation": "Main Kitchen",
            "rules": [],
        },
    },
    "staff-web": {
        "showHousekeepingToWaiters": False,
        "floorPlanStyle": "grid",
    },
    "token-order-web": {
        "tokenFormat": "daily_reset",
        "nowServingText": "Now Serving",
        "screenTheme": "dark",
    },
}


def get_default_config(app_name: str) -> dict[str, Any]:
    """Retrieve default fallback configuration for an app."""
    return DEFAULT_CONFIGS.get(app_name, {}).copy()


def build_dns_instruction(domain: str, record_type: str, target: str) -> DNSInstruction:
    """Generate user-friendly registrar instructions."""
    parts = domain.strip().lower().split(".")
    is_subdomain = len(parts) > 2

    host = parts[0] if is_subdomain else "@"
    notes = (
        f"Create a CNAME record with host '{host}' pointing to '{target}'."
        if record_type == "CNAME"
        else f"Create an A record pointing the apex domain '@' to '{target}'."
    )

    return DNSInstruction(
        record_type=record_type,
        host=host,
        target=target,
        ttl="300 (or Auto)",
        notes=notes,
    )


class CustomizationService:
    """Service handling tenant app configs and custom domain lifecycles."""

    async def get_or_create_config(
        self,
        db: AsyncSession,
        tenant_id: int,
        branch_id: Optional[int],
        app_name: str,
    ) -> TenantAppConfig:
        """Fetch config or initialize with sensible defaults in SSOT database."""
        stmt = select(TenantAppConfig).where(
            TenantAppConfig.tenant_id == tenant_id,
            TenantAppConfig.branch_id == branch_id,
            TenantAppConfig.app_name == app_name,
            TenantAppConfig.is_deleted == False,
        )
        res = await db.execute(stmt)
        config = res.scalar_one_or_none()

        if not config:
            defaults = get_default_config(app_name)
            config = TenantAppConfig(
                tenant_id=tenant_id,
                branch_id=branch_id,
                app_name=app_name,
                draft_config=defaults,
                published_config=defaults,
                config_version=1,
                published_at=datetime.now(timezone.utc),
            )
            db.add(config)
            await db.commit()
            await db.refresh(config)

        return config

    async def update_draft(
        self,
        db: AsyncSession,
        tenant_id: int,
        branch_id: Optional[int],
        app_name: str,
        draft_data: dict[str, Any],
    ) -> TenantAppConfig:
        """Update draft configuration without publishing."""
        config = await self.get_or_create_config(db, tenant_id, branch_id, app_name)
        # Deep copy / update
        current_draft = dict(config.draft_config or {})
        current_draft.update(draft_data)
        config.draft_config = current_draft
        flag_modified(config, "draft_config")
        await db.commit()
        await db.refresh(config)
        return config

    async def publish(
        self,
        db: AsyncSession,
        tenant_id: int,
        branch_id: Optional[int],
        app_name: str,
    ) -> TenantAppConfig:
        """Promote draft configuration to published live configuration."""
        config = await self.get_or_create_config(db, tenant_id, branch_id, app_name)
        config.published_config = dict(config.draft_config or {})
        flag_modified(config, "published_config")
        config.config_version += 1
        config.published_at = datetime.now(timezone.utc)
        await db.commit()
        await db.refresh(config)
        logger.info(
            "Published tenant app configuration",
            tenant_id=tenant_id,
            branch_id=branch_id,
            app_name=app_name,
            version=config.config_version,
        )
        return config

    async def reset_draft(
        self,
        db: AsyncSession,
        tenant_id: int,
        branch_id: Optional[int],
        app_name: str,
    ) -> TenantAppConfig:
        """Discard draft changes and revert to current published configuration."""
        config = await self.get_or_create_config(db, tenant_id, branch_id, app_name)
        config.draft_config = dict(config.published_config or {})
        flag_modified(config, "draft_config")
        await db.commit()
        await db.refresh(config)
        return config

    async def get_effective_public_config(
        self,
        db: AsyncSession,
        tenant_id: int,
        branch_id: Optional[int],
        app_name: str,
        is_draft: bool = False,
    ) -> dict[str, Any]:
        """
        Merge global branding and app-specific configuration.
        Falls back cleanly if no DB entry exists yet.
        """
        # 1. Fetch Global Branding
        global_cfg_record = await self.get_or_create_config(db, tenant_id, None, "global")
        global_blob = (
            global_cfg_record.draft_config
            if is_draft
            else global_cfg_record.published_config
        ) or get_default_config("global")

        # 2. Fetch App-Specific Config (Branch override falls back to tenant-wide config)
        app_cfg_record = None
        if branch_id is not None:
            branch_stmt = select(TenantAppConfig).where(
                TenantAppConfig.tenant_id == tenant_id,
                TenantAppConfig.branch_id == branch_id,
                TenantAppConfig.app_name == app_name,
                TenantAppConfig.is_deleted == False,
            )
            branch_res = await db.execute(branch_stmt)
            app_cfg_record = branch_res.scalar_one_or_none()

        if not app_cfg_record:
            app_cfg_record = await self.get_or_create_config(db, tenant_id, None, app_name)

        app_blob = (
            app_cfg_record.draft_config
            if is_draft
            else app_cfg_record.published_config
        ) or get_default_config(app_name)

        # 3. Merge global branding into app configuration
        effective = dict(app_blob)
        effective["branding"] = global_blob.get("branding", {})
        effective["version"] = app_cfg_record.config_version
        effective["is_draft"] = is_draft
        return effective

    async def resolve_by_slug(
        self,
        db: AsyncSession,
        tenant_slug: str,
        branch_code: Optional[str],
    ) -> tuple[Optional[Tenant], Optional[Branch]]:
        """Resolve Tenant and Branch ORM objects from human-friendly URL slugs."""
        tenant_stmt = select(Tenant).where(
            Tenant.slug == tenant_slug.strip(),
            Tenant.is_active == True,
            Tenant.is_deleted == False,
        )
        tenant_res = await db.execute(tenant_stmt)
        tenant = tenant_res.scalar_one_or_none()

        branch = None
        if tenant and branch_code:
            branch_stmt = select(Branch).where(
                Branch.tenant_id == tenant.id,
                Branch.code == branch_code.strip(),
                Branch.is_active == True,
                Branch.is_deleted == False,
            )
            branch_res = await db.execute(branch_stmt)
            branch = branch_res.scalar_one_or_none()

        return tenant, branch

    # ─── Custom Domain Management ────────────────────────────────

    async def list_custom_domains(
        self, db: AsyncSession, tenant_id: int
    ) -> list[TenantCustomDomain]:
        """List all custom domains registered by a tenant."""
        stmt = (
            select(TenantCustomDomain)
            .where(
                TenantCustomDomain.tenant_id == tenant_id,
                TenantCustomDomain.is_deleted == False,
            )
            .order_by(TenantCustomDomain.created_at.desc())
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def register_custom_domain(
        self,
        db: AsyncSession,
        tenant_id: int,
        branch_id: Optional[int],
        app_name: str,
        domain_raw: str,
    ) -> TenantCustomDomain:
        """Register a new domain, determining record type (CNAME for subdomains, A for root)."""
        clean_domain = domain_raw.strip().lower().replace("http://", "").replace("https://", "").rstrip("/")
        parts = clean_domain.split(".")

        if len(parts) < 2:
            raise ValueError("Invalid domain name format.")

        is_subdomain = len(parts) > 2
        record_type = "CNAME" if is_subdomain else "A"
        target_value = DEFAULT_CONNECT_TARGET if is_subdomain else DEFAULT_SERVER_IP

        # Check existing (including soft-deleted)
        stmt = select(TenantCustomDomain).where(
            TenantCustomDomain.domain == clean_domain,
        )
        res = await db.execute(stmt)
        existing = res.scalar_one_or_none()

        if existing:
            if existing.tenant_id != tenant_id:
                raise ValueError("This domain is already mapped to another tenant.")
            if existing.is_deleted:
                existing.is_deleted = False
                existing.branch_id = branch_id
                existing.app_name = app_name
                existing.status = "pending_dns"
                existing.record_type = record_type
                existing.target_value = target_value
                existing.error_message = None
                existing.verified_at = None
                await db.commit()
                await db.refresh(existing)
            return existing

        dom_entry = TenantCustomDomain(
            tenant_id=tenant_id,
            branch_id=branch_id,
            app_name=app_name,
            domain=clean_domain,
            status="pending_dns",
            record_type=record_type,
            target_value=target_value,
        )
        db.add(dom_entry)
        await db.commit()
        await db.refresh(dom_entry)
        return dom_entry

    async def verify_custom_domain(
        self, db: AsyncSession, tenant_id: int, domain_id: int
    ) -> TenantCustomDomain:
        """
        Verify DNS resolution of the registered domain.
        Uses socket address lookup with graceful local development simulation.
        """
        stmt = select(TenantCustomDomain).where(
            TenantCustomDomain.id == domain_id,
            TenantCustomDomain.tenant_id == tenant_id,
            TenantCustomDomain.is_deleted == False,
        )
        res = await db.execute(stmt)
        dom = res.scalar_one_or_none()
        if not dom:
            raise ValueError("Custom domain not found.")

        dom.last_checked_at = datetime.now(timezone.utc)

        # In dev or staging, localhost/test domains auto-pass for seamless validation
        if dom.domain.endswith(".localhost") or dom.domain.endswith(".test") or "localhost" in dom.domain:
            dom.status = "verified"
            dom.verified_at = datetime.now(timezone.utc)
            dom.error_message = None
            await db.commit()
            await db.refresh(dom)
            return dom

        # DNS resolution check
        try:
            resolved_ip = socket.gethostbyname(dom.domain)
            # If resolution succeeds
            dom.status = "verified"
            dom.verified_at = datetime.now(timezone.utc)
            dom.error_message = None
        except socket.gaierror as err:
            dom.status = "failed"
            dom.error_message = f"DNS resolution failed: {str(err)}. Please verify your DNS records."
        except Exception as exc:
            dom.status = "failed"
            dom.error_message = f"Lookup error: {str(exc)}"

        await db.commit()
        await db.refresh(dom)
        return dom

    async def delete_custom_domain(
        self, db: AsyncSession, tenant_id: int, domain_id: int
    ) -> bool:
        """Soft-delete a custom domain binding."""
        stmt = select(TenantCustomDomain).where(
            TenantCustomDomain.id == domain_id,
            TenantCustomDomain.tenant_id == tenant_id,
            TenantCustomDomain.is_deleted == False,
        )
        res = await db.execute(stmt)
        dom = res.scalar_one_or_none()
        if not dom:
            return False

        dom.is_deleted = True
        await db.commit()
        return True

    async def resolve_host_domain(
        self, db: AsyncSession, host: str
    ) -> Optional[dict[str, Any]]:
        """
        Reverse-proxy Host header lookup.
        Matches incoming Host against verified tenant custom domains.
        """
        clean_host = host.split(":")[0].strip().lower()
        stmt = select(TenantCustomDomain).where(
            TenantCustomDomain.domain == clean_host,
            TenantCustomDomain.status == "verified",
            TenantCustomDomain.is_deleted == False,
        )
        res = await db.execute(stmt)
        mapping = res.scalar_one_or_none()
        if not mapping:
            return None

        # Fetch tenant
        tenant_stmt = select(Tenant).where(Tenant.id == mapping.tenant_id)
        tenant_res = await db.execute(tenant_stmt)
        tenant = tenant_res.scalar_one_or_none()

        branch_code = None
        if mapping.branch_id:
            branch_stmt = select(Branch).where(Branch.id == mapping.branch_id)
            branch_res = await db.execute(branch_stmt)
            b = branch_res.scalar_one_or_none()
            if b:
                branch_code = b.code

        return {
            "domain": clean_host,
            "tenant_id": str(mapping.tenant_id),
            "tenant_slug": tenant.slug if tenant else "",
            "branch_id": str(mapping.branch_id) if mapping.branch_id else None,
            "branch_code": branch_code,
            "app_name": mapping.app_name,
            "status": mapping.status,
        }


customization_service = CustomizationService()
