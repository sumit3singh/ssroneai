"""
The Baithak – Auth Router
Endpoints: login, logout, token refresh, register, session management.
"""
from datetime import timedelta, timezone, datetime

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.core.database.engine import get_db_session
from src.modules.auth.models import Tenant, User, UserSession, Company, Branch, Role, UserRole, FileMasterERP
from src.modules.auth.schemas import (
    ChangePasswordRequest,
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RegisterRequest,
    SessionInfo,
    UserProfile,
)
from src.modules.auth.service import auth_service
from src.modules.auth.dependencies import get_current_user
from src.shared.config import get_settings
from src.shared.logger import get_logger

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()
logger = get_logger(__name__)

REFRESH_COOKIE_NAME = "baithak_refresh_token"


@router.post("/login", response_model=LoginResponse)
async def login(
    request: Request,
    body: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db_session),
) -> LoginResponse:
    """
    Authenticate user and return access + refresh tokens.
    Refresh token is set as a secure HTTP-only cookie.
    """
    # Resolve tenant
    tenant_result = await db.execute(
        select(Tenant).where(Tenant.slug == body.tenant_slug, Tenant.is_active == True)
    )
    tenant = tenant_result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found or inactive.",
        )

    # Authenticate
    user = await auth_service.authenticate_user(
        db, body.email, body.password, str(tenant.id)
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is disabled. Contact your administrator.",
        )

    # Create session
    device_info = {
        "user_agent": request.headers.get("user-agent", ""),
        **body.device_info,
    }
    access_token, raw_refresh = await auth_service.create_session(
        db,
        user=user,
        device_info=device_info,
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    # Set refresh token as HTTP-only cookie
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=raw_refresh,
        httponly=True,
        secure=settings.is_production,
        samesite="strict",
        max_age=settings.jwt.refresh_token_expire_days * 86400,
        path="/api/v1/auth",
    )

    logger.info("User logged in", user_id=str(user.id), email=user.email)

    return LoginResponse(
        access_token=access_token,
        expires_in=settings.jwt.access_token_expire_minutes * 60,
        user=UserProfile.model_validate(user),
    )


@router.post("/logout")
async def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
) -> dict:
    """Logout from the current device."""
    # Revoke current session
    # In a full implementation, extract session_id from the access token
    response.delete_cookie(REFRESH_COOKIE_NAME, path="/api/v1/auth")
    logger.info("User logged out", user_id=str(current_user.id))
    return {"message": "Logged out successfully"}


@router.post("/logout-all")
async def logout_all_devices(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """Logout from all devices."""
    count = await auth_service.revoke_all_sessions(db, str(current_user.id))
    response.delete_cookie(REFRESH_COOKIE_NAME, path="/api/v1/auth")
    return {"message": f"Logged out from {count} session(s)"}


@router.post("/register")
async def register(
    body: RegisterRequest,
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """
    Register a new tenant with an admin user.
    Creates: Tenant, Company (default), Branch (default), Admin User.
    """
    # Check slug availability
    existing = await db.execute(select(Tenant).where(Tenant.slug == body.tenant_slug))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Slug '{body.tenant_slug}' is already taken.",
        )

    # Create tenant
    tenant = Tenant(
        name=body.tenant_name,
        slug=body.tenant_slug,
        plan="starter",
        is_active=True,
    )
    db.add(tenant)
    await db.flush()

    # Create admin user
    user = User(
        tenant_id=tenant.id,
        email=body.email,
        first_name=body.first_name,
        last_name=body.last_name,
        phone=body.phone,
        hashed_password=auth_service.hash_password(body.password),
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    await db.flush()

    logger.info("New tenant registered", tenant_id=str(tenant.id), slug=body.tenant_slug)

    return {
        "message": "Registration successful. Please check your email to verify your account.",
        "tenant_id": str(tenant.id),
        "tenant_slug": body.tenant_slug,
    }


@router.post("/refresh", response_model=LoginResponse)
async def refresh_token(
    response: Response,
    db: AsyncSession = Depends(get_db_session),
    refresh_token: str | None = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
) -> LoginResponse:
    """Exchange a valid refresh token (cookie) for a new access token."""
    import hashlib

    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="No refresh token provided.")

    hashed = hashlib.sha256(refresh_token.encode()).hexdigest()
    result = await db.execute(
        select(UserSession).where(
            UserSession.refresh_token_hash == hashed,
            UserSession.is_active == True,
        )
    )
    session = result.scalar_one_or_none()
    if not session or session.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired or invalid.")

    user_result = await db.execute(select(User).where(User.id == session.user_id))
    user = user_result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive.")

    access_token = auth_service.create_access_token({
        "sub": str(user.id),
        "tenant_id": str(user.tenant_id),
        "email": user.email,
        "session_id": str(session.id),
    })
    session.last_used_at = datetime.now(timezone.utc)

    return LoginResponse(
        access_token=access_token,
        expires_in=settings.jwt.access_token_expire_minutes * 60,
        user=UserProfile.model_validate(user),
    )


@router.get("/me", response_model=UserProfile)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserProfile:
    """Get the currently authenticated user's profile."""
    return UserProfile.model_validate(current_user)


@router.post("/change-password")
async def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> dict:
    """Change the current user's password and invalidate all sessions."""
    if not auth_service.verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )

    current_user.hashed_password = auth_service.hash_password(body.new_password)
    await auth_service.revoke_all_sessions(db, str(current_user.id))

    return {"message": "Password changed successfully. Please log in again."}


@router.get("/sessions", response_model=list[SessionInfo])
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[SessionInfo]:
    """List all active sessions for the current user."""
    result = await db.execute(
        select(UserSession).where(
            UserSession.user_id == current_user.id,
            UserSession.is_active == True,
        )
    )
    sessions = result.scalars().all()
    return [SessionInfo.model_validate(s) for s in sessions]


# ═══════════════════════════════════════════
# ENTERPRISE CONTEXT SELECTORS & MENUS
# ═══════════════════════════════════════════

@router.get("/companies", response_model=list[dict])
async def list_companies(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    """Fetch all active companies under the logged-in user's tenant."""
    if current_user.is_superadmin:
        stmt = select(Company).where(
            Company.tenant_id == current_user.tenant_id,
            Company.is_active == True,
            Company.is_deleted == False
        )
    else:
        stmt = (
            select(Company)
            .join(UserRole, UserRole.company_id == Company.id)
            .where(
                UserRole.user_id == current_user.id,
                Company.tenant_id == current_user.tenant_id,
                Company.is_active == True,
                Company.is_deleted == False
            )
            .distinct()
        )
    res = await db.execute(stmt)
    companies = res.scalars().all()
    return [{"id": str(c.id), "name": c.name, "legal_name": c.legal_name, "currency_code": c.currency_code} for c in companies]


@router.get("/branches", response_model=list[dict])
async def list_branches(
    company_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    """Fetch active branches/units under a selected company."""
    try:
        co_id = int(company_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid company ID format.")

    if current_user.is_superadmin:
        stmt = select(Branch).where(
            Branch.company_id == co_id,
            Branch.is_active == True,
            Branch.is_deleted == False
        )
    else:
        stmt = (
            select(Branch)
            .join(UserRole, UserRole.branch_id == Branch.id)
            .where(
                UserRole.user_id == current_user.id,
                Branch.company_id == co_id,
                Branch.is_active == True,
                Branch.is_deleted == False
            )
            .distinct()
        )
    res = await db.execute(stmt)
    branches = res.scalars().all()
    return [{"id": str(b.id), "name": b.name, "code": b.code, "timezone": b.timezone} for b in branches]


@router.get("/roles", response_model=list[dict])
async def list_user_roles(
    company_id: str | None = None,
    branch_id: str | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    """Fetch all assigned roles for the user in the selected company/branch context."""
    
    if current_user.is_superadmin:
        stmt = select(Role).where(
            Role.tenant_id == current_user.tenant_id,
            Role.code == "super_admin"
        )
        res = await db.execute(stmt)
        roles = res.scalars().all()
        return [{"id": str(r.id), "name": r.name, "code": r.code, "permissions": r.permissions} for r in roles]

    stmt = select(Role).join(UserRole, UserRole.role_id == Role.id).where(
        UserRole.user_id == current_user.id
    )
    if company_id:
        try:
            stmt = stmt.where(UserRole.company_id == int(company_id))
        except ValueError:
            pass
    if branch_id:
        try:
            stmt = stmt.where(UserRole.branch_id == int(branch_id))
        except ValueError:
            pass

    res = await db.execute(stmt)
    roles = res.scalars().all()
    return [{"id": str(r.id), "name": r.name, "code": r.code, "permissions": r.permissions} for r in roles]


@router.get("/menu-configuration", response_model=list[dict])
async def get_menu_configuration(
    current_user: User = Depends(get_current_user),
    company_id: str | None = None,
    branch_id: str | None = None,
    role_code: str | None = None,
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    """Retrieve metadata-driven menu options dynamically filtered by feature license and RBAC permissions."""
    from src.engines.licensing.engine import feature_engine
    
    stmt = select(FileMasterERP).where(
        FileMasterERP.tenant_id == current_user.tenant_id,
        FileMasterERP.is_active == True,
        FileMasterERP.is_deleted == False
    ).order_by(FileMasterERP.sort_order.asc())
    
    res = await db.execute(stmt)
    menus = res.scalars().all()
    
    allowed_menus = []
    
    user_permissions = {}
    if current_user.is_superadmin:
        user_permissions = {"*": ["*"]}
    elif role_code:
        role_stmt = select(Role).where(
            Role.tenant_id == current_user.tenant_id,
            Role.code == role_code
        )
        role_res = await db.execute(role_stmt)
        active_role = role_res.scalar_one_or_none()
        if active_role:
            user_permissions = active_role.permissions
    
    import asyncio
    # Resolve all required feature enablement checks in parallel to optimize loading time
    unique_features = list({m.required_feature for m in menus if m.required_feature})
    enabled_features = {}
    if unique_features:
        results = await asyncio.gather(*(
            feature_engine.is_enabled(str(current_user.tenant_id), feat)
            for feat in unique_features
        ))
        enabled_features = dict(zip(unique_features, results))

    for m in menus:
        if m.required_feature:
            if not enabled_features.get(m.required_feature, False):
                continue
                
        if m.required_permission and not current_user.is_superadmin:
            has_perm = False
            if isinstance(user_permissions, list):
                has_perm = m.required_permission in user_permissions
            elif isinstance(user_permissions, dict):
                if user_permissions.get("*") or user_permissions.get("all") or user_permissions.get(m.required_permission):
                    has_perm = True
            if not has_perm:
                continue
                
        allowed_menus.append({
            "id": str(m.id),
            "code": m.code,
            "label": m.label,
            "href": m.href,
            "icon": m.icon,
            "category": m.category,
            "parent_code": m.parent_code,
            "sort_order": m.sort_order,
            "type": m.type
        })
        
    return allowed_menus


@router.get("/public/context")
async def get_public_context(
    tenant_slug: str = "baithak-demo",
    db: AsyncSession = Depends(get_db_session)
) -> dict:
    """Fetch all companies, branches, and roles under a tenant for public selectors."""
    tenant_result = await db.execute(
        select(Tenant).where(Tenant.slug == tenant_slug, Tenant.is_active == True)
    )
    tenant = tenant_result.scalar_one_or_none()
    if not tenant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tenant not found or inactive.",
        )
    
    co_result = await db.execute(
        select(Company).where(
            Company.tenant_id == tenant.id,
            Company.is_active == True,
            Company.is_deleted == False
        )
    )
    companies = co_result.scalars().all()
    
    br_result = await db.execute(
        select(Branch).where(
            Branch.tenant_id == tenant.id,
            Branch.is_active == True,
            Branch.is_deleted == False
        )
    )
    branches = br_result.scalars().all()
    
    role_result = await db.execute(
        select(Role).where(
            Role.tenant_id == tenant.id,
            Role.is_system_role == True
        )
    )
    roles = role_result.scalars().all()
    
    return {
        "companies": [{"id": str(c.id), "name": c.name, "legal_name": c.legal_name, "currency_code": c.currency_code} for c in companies],
        "branches": [{"id": str(b.id), "company_id": str(b.company_id), "name": b.name, "code": b.code, "timezone": b.timezone} for b in branches],
        "roles": [{"id": str(r.id), "name": r.name, "code": r.code} for r in roles],
        "financial_years": [
            {"id": "fy-2026", "name": "FY 2026-2027", "code": "2026-2027"},
            {"id": "fy-2025", "name": "FY 2025-2026", "code": "2025-2026"},
            {"id": "fy-2027", "name": "FY 2027-2028", "code": "2027-2028"},
        ]
    }


@router.get("/roles")
async def list_user_roles(
    company_id: int | None = None,
    branch_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
):
    """
    Get available user security roles directly from PostgreSQL database.
    """
    result = await db.execute(
        select(Role).where(
            (Role.tenant_id == current_user.tenant_id) | (Role.is_system_role == True)
        )
    )
    roles = result.scalars().all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "code": r.code,
            "description": r.description,
            "is_system_role": r.is_system_role,
        }
        for r in roles
    ]



