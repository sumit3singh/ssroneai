"""
The Baithak – Feature Licensing Administration Router
Provides endpoints to list, grant, update, and revoke feature licenses for tenants.
Restricted to Superadmins only.
"""
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.core.database.engine import get_db_session
from src.modules.auth.models import User, FeatureLicense, FeatureMaster
from src.modules.auth.schemas import (
    FeatureLicenseCreate,
    FeatureLicenseUpdate,
    FeatureLicenseResponse,
    FeatureMasterCreate,
    FeatureMasterResponse,
)
from src.modules.auth.dependencies import get_current_user
from src.engines.licensing.engine import feature_engine
from src.shared.logger import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/licensing", tags=["Licensing Administration"])



def require_superadmin(current_user: User = Depends(get_current_user)) -> User:
    """Dependency to enforce that only superadmins can access licensing routes."""
    if not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Only system superadmins can manage licensing.",
        )
    return current_user


@router.get("/licenses", response_model=list[FeatureLicenseResponse])
async def list_licenses(
    tenant_id: int | None = None,
    current_user: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db_session),
) -> Any:
    """List all feature licenses, optionally filtered by tenant_id."""
    stmt = select(FeatureLicense)
    if tenant_id:
        stmt = stmt.where(FeatureLicense.tenant_id == tenant_id)
    
    res = await db.execute(stmt)
    licenses = res.scalars().all()
    return licenses


@router.post("/licenses", response_model=FeatureLicenseResponse, status_code=status.HTTP_201_CREATED)
async def grant_license(
    body: FeatureLicenseCreate,
    current_user: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db_session),
) -> Any:
    """Grant a new feature license to a tenant."""
    # Check if a license already exists for this tenant and feature
    stmt = select(FeatureLicense).where(
        FeatureLicense.tenant_id == body.tenant_id,
        FeatureLicense.feature_code == body.feature_code,
    )
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"License for feature '{body.feature_code}' already exists for this tenant.",
        )

    new_lic = FeatureLicense(
        tenant_id=body.tenant_id,
        feature_code=body.feature_code,
        is_active=body.is_active,
        expires_at=body.expires_at,
        max_users=body.max_users,
        max_branches=body.max_branches,
        config=body.config,
    )
    db.add(new_lic)
    await db.commit()
    await db.refresh(new_lic)

    # Invalidate cache for the tenant
    await feature_engine.invalidate_cache(str(body.tenant_id))
    logger.info("Feature license granted", tenant_id=str(body.tenant_id), feature=body.feature_code)

    return new_lic


@router.patch("/licenses/{license_id}", response_model=FeatureLicenseResponse)
async def update_license(
    license_id: int,
    body: FeatureLicenseUpdate,
    current_user: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db_session),
) -> Any:
    """Update an existing feature license."""
    stmt = select(FeatureLicense).where(FeatureLicense.id == license_id)
    res = await db.execute(stmt)
    lic = res.scalar_one_or_none()
    if not lic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature license not found.",
        )

    if body.is_active is not None:
        lic.is_active = body.is_active
    if body.expires_at is not None:
        lic.expires_at = body.expires_at
    if body.max_users is not None:
        lic.max_users = body.max_users
    if body.max_branches is not None:
        lic.max_branches = body.max_branches
    if body.config is not None:
        lic.config = body.config

    await db.commit()
    await db.refresh(lic)

    # Invalidate cache for the tenant
    await feature_engine.invalidate_cache(str(lic.tenant_id))
    logger.info("Feature license updated", license_id=str(license_id), tenant_id=str(lic.tenant_id))

    return lic


@router.delete("/licenses/{license_id}", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_license(
    license_id: int,
    current_user: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db_session),
) -> None:
    """Revoke (delete) a feature license."""
    stmt = select(FeatureLicense).where(FeatureLicense.id == license_id)
    res = await db.execute(stmt)
    lic = res.scalar_one_or_none()
    if not lic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature license not found.",
        )

    tenant_id = lic.tenant_id
    await db.delete(lic)
    await db.commit()

    # Invalidate cache for the tenant
    await feature_engine.invalidate_cache(str(tenant_id))
    logger.info("Feature license revoked", license_id=str(license_id), tenant_id=str(tenant_id))


@router.post("/cache/invalidate")
async def invalidate_cache(
    tenant_id: int,
    current_user: User = Depends(require_superadmin),
) -> dict:
    """Force invalidate the license cache for a tenant."""
    await feature_engine.invalidate_cache(str(tenant_id))
    return {"message": f"Cache invalidated for tenant {tenant_id}."}


@router.get("/features", response_model=list[FeatureMasterResponse])
async def list_feature_catalog(
    current_user: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db_session),
) -> Any:
    """List all available platform features in the FeatureMaster catalog."""
    stmt = select(FeatureMaster).order_by(FeatureMaster.category, FeatureMaster.code)
    res = await db.execute(stmt)
    features = res.scalars().all()
    return features


@router.post("/features", response_model=FeatureMasterResponse, status_code=status.HTTP_201_CREATED)
async def create_feature_master(
    body: FeatureMasterCreate,
    current_user: User = Depends(require_superadmin),
    db: AsyncSession = Depends(get_db_session),
) -> Any:
    """Register a new module/feature into FeatureMaster."""
    stmt = select(FeatureMaster).where(FeatureMaster.code == body.code)
    res = await db.execute(stmt)
    existing = res.scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Feature with code '{body.code}' already exists.",
        )

    feat = FeatureMaster(
        code=body.code,
        name=body.name,
        description=body.description,
        category=body.category,
        dependencies=body.dependencies,
        is_core=body.is_core,
        is_active=body.is_active,
    )
    db.add(feat)
    await db.commit()
    await db.refresh(feat)
    return feat

