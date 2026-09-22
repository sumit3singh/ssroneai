"""
SSR One AI – Tenant Customization & Connected Apps REST Router
Endpoints for site builder settings, draft/publish lifecycle, and custom domain verification.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database.engine import get_db_session
from src.modules.auth.dependencies import get_current_user
from src.modules.auth.models import User
from src.modules.customization.schemas import (
    AppConfigDraftUpdate,
    AppConfigPublishRequest,
    AppConfigResponse,
    PublicAppConfigResponse,
    CustomDomainCreate,
    CustomDomainResponse,
    DomainResolveResponse,
)
from src.modules.customization.service import (
    customization_service,
    build_dns_instruction,
    get_default_config,
)
from src.shared.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(tags=["Tenant Customization Studio"])


def _to_app_config_response(cfg) -> AppConfigResponse:
    """Helper to serialize TenantAppConfig ORM model to response schema."""
    draft = cfg.draft_config or {}
    published = cfg.published_config or {}
    is_modified = draft != published

    return AppConfigResponse(
        id=str(cfg.id),
        tenant_id=str(cfg.tenant_id),
        branch_id=str(cfg.branch_id) if cfg.branch_id else None,
        app_name=cfg.app_name,
        draft_config=draft,
        published_config=published,
        config_version=cfg.config_version,
        published_at=cfg.published_at,
        is_draft_modified=is_modified,
    )


def _to_domain_response(dom) -> CustomDomainResponse:
    """Helper to serialize TenantCustomDomain ORM model with DNS guidance."""
    instruction = build_dns_instruction(dom.domain, dom.record_type, dom.target_value)
    return CustomDomainResponse(
        id=str(dom.id),
        tenant_id=str(dom.tenant_id),
        branch_id=str(dom.branch_id) if dom.branch_id else None,
        app_name=dom.app_name,
        domain=dom.domain,
        status=dom.status,
        record_type=dom.record_type,
        target_value=dom.target_value,
        verified_at=dom.verified_at,
        last_checked_at=dom.last_checked_at,
        error_message=dom.error_message,
        dns_instruction=instruction,
    )


# ═══════════════════════════════════════════════════════════════
# PUBLIC RUNTIME ENDPOINTS (Consumed by Connected Apps & Preview)
# ═══════════════════════════════════════════════════════════════

@router.get(
    "/tenant-config/by-slug/{tenant_slug}/{branch_code}/{app_name}",
    response_model=PublicAppConfigResponse,
)
async def get_public_config_by_slug(
    tenant_slug: str,
    branch_code: str,
    app_name: str,
    draft: bool = Query(default=False, description="Whether to preview draft config"),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Public runtime endpoint for customer apps to fetch dynamic configuration.
    Resolves tenant & branch by slug/code and returns merged config.
    """
    tenant, branch = await customization_service.resolve_by_slug(
        db, tenant_slug, branch_code
    )

    if not tenant:
        # Graceful fallback to default configuration
        defaults = get_default_config(app_name)
        defaults["branding"] = get_default_config("global").get("branding", {})
        return PublicAppConfigResponse(
            tenant_id="0",
            branch_id=None,
            app_name=app_name,
            config=defaults,
            config_version=1,
            is_draft=draft,
        )

    branch_id = branch.id if branch else None
    effective_config = await customization_service.get_effective_public_config(
        db, tenant.id, branch_id, app_name, is_draft=draft
    )

    return PublicAppConfigResponse(
        tenant_id=str(tenant.id),
        branch_id=str(branch_id) if branch_id else None,
        app_name=app_name,
        config=effective_config,
        config_version=effective_config.get("version", 1),
        is_draft=draft,
    )


@router.get(
    "/tenant-config/{tenant_id}/{branch_id}/{app_name}",
    response_model=PublicAppConfigResponse,
)
async def get_public_config_by_id(
    tenant_id: int,
    branch_id: int,
    app_name: str,
    draft: bool = Query(default=False),
    db: AsyncSession = Depends(get_db_session),
):
    """Public runtime endpoint fetching configuration by numeric IDs."""
    effective_config = await customization_service.get_effective_public_config(
        db, tenant_id, branch_id, app_name, is_draft=draft
    )
    return PublicAppConfigResponse(
        tenant_id=str(tenant_id),
        branch_id=str(branch_id),
        app_name=app_name,
        config=effective_config,
        config_version=effective_config.get("version", 1),
        is_draft=draft,
    )


@router.get("/custom-domains/resolve/{domain}", response_model=DomainResolveResponse)
async def resolve_custom_domain(
    domain: str,
    db: AsyncSession = Depends(get_db_session),
):
    """
    Reverse-proxy host resolution endpoint.
    Used by Caddy / Nginx / Traefik to look up tenant context from Host header.
    """
    resolved = await customization_service.resolve_host_domain(db, domain)
    if not resolved:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Domain '{domain}' is not registered or verified.",
        )
    return DomainResolveResponse(**resolved)


# ═══════════════════════════════════════════════════════════════
# TENANT ADMIN ENDPOINTS (Secured via JWT & RLS in Admin-Web)
# ═══════════════════════════════════════════════════════════════

@router.get("/tenant-config/admin/{app_name}", response_model=AppConfigResponse)
async def get_admin_app_config(
    app_name: str,
    branch_id: Optional[int] = Query(default=None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Fetch current app configuration for the active tenant admin."""
    cfg = await customization_service.get_or_create_config(
        db, current_user.tenant_id, branch_id, app_name
    )
    return _to_app_config_response(cfg)


@router.put("/tenant-config/admin/{app_name}/draft", response_model=AppConfigResponse)
async def update_app_config_draft(
    app_name: str,
    payload: AppConfigDraftUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Save draft changes for an app without publishing to live customers."""
    cfg = await customization_service.update_draft(
        db, current_user.tenant_id, payload.branch_id, app_name, payload.draft_config
    )
    return _to_app_config_response(cfg)


@router.post("/tenant-config/admin/{app_name}/publish", response_model=AppConfigResponse)
async def publish_app_config(
    app_name: str,
    payload: AppConfigPublishRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Publish draft changes to live configuration.
    Increments version and updates live customer views immediately.
    """
    cfg = await customization_service.publish(
        db, current_user.tenant_id, payload.branch_id, app_name
    )
    return _to_app_config_response(cfg)


@router.post("/tenant-config/admin/{app_name}/reset-draft", response_model=AppConfigResponse)
async def reset_app_config_draft(
    app_name: str,
    payload: AppConfigPublishRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Discard unsaved draft changes and revert to current published state."""
    cfg = await customization_service.reset_draft(
        db, current_user.tenant_id, payload.branch_id, app_name
    )
    return _to_app_config_response(cfg)


# ═══════════════════════════════════════════════════════════════
# CUSTOM DOMAIN MANAGEMENT ENDPOINTS (Admin-Web)
# ═══════════════════════════════════════════════════════════════

@router.get("/custom-domains", response_model=list[CustomDomainResponse])
async def list_custom_domains(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """List all custom domains configured for this tenant."""
    domains = await customization_service.list_custom_domains(
        db, current_user.tenant_id
    )
    return [_to_domain_response(d) for d in domains]


@router.post("/custom-domains", response_model=CustomDomainResponse)
async def add_custom_domain(
    payload: CustomDomainCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Register a new custom domain and obtain registrar DNS instructions."""
    try:
        dom = await customization_service.register_custom_domain(
            db,
            current_user.tenant_id,
            payload.branch_id,
            payload.app_name,
            payload.domain,
        )
        return _to_domain_response(dom)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))


@router.post("/custom-domains/{domain_id}/verify", response_model=CustomDomainResponse)
async def verify_custom_domain(
    domain_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Trigger DNS resolution verification for a domain."""
    try:
        dom = await customization_service.verify_custom_domain(
            db, current_user.tenant_id, domain_id
        )
        return _to_domain_response(dom)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))


@router.delete("/custom-domains/{domain_id}")
async def remove_custom_domain(
    domain_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """Disconnect and delete a custom domain."""
    success = await customization_service.delete_custom_domain(
        db, current_user.tenant_id, domain_id
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Domain not found"
        )
    return {"success": True, "message": "Domain mapping successfully removed."}
