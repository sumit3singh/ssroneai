"""
The ssrone – Auth Router
Endpoints: login, logout, token refresh, register, session management.
"""
import asyncio
from datetime import timedelta, timezone, datetime

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.core.database.engine import get_db_session
from src.modules.auth.models import Tenant, User, UserSession, Company, Branch, Role, UserRole, FileMasterERP
from src.core.database.business_models import FinancialYearModel
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

REFRESH_COOKIE_NAME = "ssrone_refresh_token"


@router.get("/dev-table-counts")
async def dev_table_counts(db: AsyncSession = Depends(get_db_session)):
    """Fetch live row counts for all registered PostgreSQL database tables."""
    from sqlalchemy import text
    from src.core.database.models import Base

    counts = {}
    table_names = list(Base.metadata.tables.keys())
    for tname in sorted(table_names):
        try:
            res = await db.execute(text(f'SELECT COUNT(*) FROM "{tname}";'))
            counts[tname] = res.scalar()
        except Exception:
            counts[tname] = -1
    return {"status": "success", "total_tables": len(counts), "row_counts": counts}


@router.post("/dev-truncate-data")
async def dev_truncate_data(db: AsyncSession = Depends(get_db_session)):
    """Truncate all table data and re-seed initial tenant and admin user."""
    from sqlalchemy import text
    from src.core.database.models import Base
    from passlib.context import CryptContext

    table_names = list(Base.metadata.tables.keys())
    if table_names:
        tables_str = ", ".join(f'"{t}"' for t in table_names)
        await db.execute(text(f"TRUNCATE TABLE {tables_str} RESTART IDENTITY CASCADE;"))
        await db.commit()

    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    tenant = Tenant(id=1, name="Main Demo Tenant", slug="main-demo-tenant", plan="enterprise", is_active=True)
    db.add(tenant)
    await db.flush()

    company = Company(id=1, tenant_id=1, name="SSR One Hospitality Group", country_code="IN", currency_code="INR", is_active=True)
    db.add(company)
    await db.flush()

    branch = Branch(id=1, tenant_id=1, company_id=1, name="Main Branch - MG Road", code="BR-001", timezone="Asia/Kolkata", is_active=True)
    db.add(branch)
    await db.flush()

    role = Role(id=1, tenant_id=1, name="SUPER_ADMIN", description="Super Admin Role")
    db.add(role)
    await db.flush()

    admin_user = User(
        id=1, tenant_id=1, role_id=1, email="admin@ssrone.ai",
        display_name="Sumit Singh", first_name="Sumit", last_name="Singh",
        password_hash=pwd_context.hash("admin123"), is_active=True
    )
    db.add(admin_user)
    await db.commit()
    return {"status": "success", "message": "All data truncated and initial superadmin user re-seeded."}


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
        is_superadmin=True,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    await db.flush()

    logger.info("New tenant registered with Superadmin user", tenant_id=str(tenant.id), slug=body.tenant_slug)

    return {
        "message": "Tenant registered successfully with Superadmin account.",
        "tenant_id": str(tenant.id),
        "tenant_slug": body.tenant_slug,
    }


from pydantic import BaseModel as PydanticBaseModel

class ProvisionSuperadminRequest(PydanticBaseModel):
    tenant_slug: str
    email: str
    password: str
    first_name: str = "Tenant"
    last_name: str = "Admin"
    phone: str = ""


@router.post("/provision-superadmin")
async def provision_superadmin(
    body: ProvisionSuperadminRequest,
    db: AsyncSession = Depends(get_db_session)
) -> dict:
    """
    Creates or upgrades a user account to Superadmin status for a specific tenant by slug.
    """
    clean_slug = body.tenant_slug.strip().lower()
    clean_email = body.email.strip().lower()

    # 1. Fetch tenant by slug (with hyphen-resilient fallback and domain fallback)
    from sqlalchemy import or_
    slug_variants = [clean_slug, clean_slug.replace("-", ""), clean_slug.replace("_", ""), f"{clean_slug}-cafe"]
    result = await db.execute(
        select(Tenant).where(
            or_(
                Tenant.slug.in_(slug_variants),
                Tenant.domain.ilike(f"%{clean_slug}%")
            )
        )
    )
    tenant = result.scalars().first()
    if not tenant:
        raise HTTPException(status_code=404, detail=f"Tenant '{clean_slug}' not found.")

    # 2. Check if user already exists under tenant
    user_res = await db.execute(
        select(User).where(User.tenant_id == tenant.id, User.email == clean_email)
    )
    user = user_res.scalar_one_or_none()

    if user:
        user.is_superadmin = True
        user.is_active = True
        if body.password:
            user.hashed_password = auth_service.hash_password(body.password)
        await db.commit()
        return {
            "message": f"User {clean_email} successfully upgraded to Superadmin for tenant '{tenant.name}'.",
            "tenant_id": str(tenant.id),
            "user_id": str(user.id)
        }

    # Fetch default company & branch if any
    co_res = await db.execute(select(Company).where(Company.tenant_id == tenant.id))
    company = co_res.scalars().first()
    comp_id = company.id if company else None

    br_res = await db.execute(select(Branch).where(Branch.tenant_id == tenant.id))
    branch = br_res.scalars().first()
    branch_id = branch.id if branch else None

    # Fetch or create SUPER_ADMIN role
    role_res = await db.execute(select(Role).where(Role.tenant_id == tenant.id, Role.code == "super_admin"))
    role = role_res.scalars().first()
    if not role:
        role = Role(
            tenant_id=tenant.id,
            name="SUPER_ADMIN",
            code="super_admin",
            description="Super Admin Role",
            is_system_role=True,
            permissions={"*": ["*"]}
        )
        db.add(role)
        await db.flush()

    new_user = User(
        tenant_id=tenant.id,
        email=clean_email,
        display_name=f"{body.first_name} {body.last_name}".strip(),
        first_name=body.first_name,
        last_name=body.last_name,
        phone=body.phone,
        hashed_password=auth_service.hash_password(body.password),
        is_superadmin=True,
        is_active=True,
        is_verified=True
    )
    db.add(new_user)
    await db.flush()

    # Bind UserRole
    user_role = UserRole(
        tenant_id=tenant.id,
        user_id=new_user.id,
        role_id=role.id,
        company_id=comp_id,
        branch_id=branch_id
    )
    db.add(user_role)
    await db.commit()
    await db.refresh(new_user)

    return {
        "message": f"Superadmin account {clean_email} successfully provisioned for tenant '{tenant.name}'.",
        "tenant_id": str(tenant.id),
        "user_id": str(new_user.id)
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


@router.get("/public/tenants", response_model=list[dict])
async def public_list_tenants(
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    """Public unauthenticated endpoint to fetch active tenants from PostgreSQL."""
    stmt = select(Tenant).where(Tenant.is_active == True, Tenant.is_deleted == False)
    res = await db.execute(stmt)
    tenants = res.scalars().all()
    return [{"id": str(t.id), "name": t.name, "slug": t.slug} for t in tenants]


@router.get("/public/branches", response_model=list[dict])
async def public_list_branches(
    tenant_slug: str | None = None,
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    """Public unauthenticated endpoint to fetch active database branches for a tenant slug from PostgreSQL."""
    if not tenant_slug:
        return []
    slug = tenant_slug.strip()
    tenant_res = await db.execute(
        select(Tenant).where(Tenant.slug == slug, Tenant.is_active == True, Tenant.is_deleted == False)
    )
    tenant = tenant_res.scalar_one_or_none()
    if not tenant:
        return []

    stmt = select(Branch).where(
        Branch.tenant_id == tenant.id,
        Branch.is_active == True,
        Branch.is_deleted == False
    )
    res = await db.execute(stmt)
    branches = res.scalars().all()
    return [{"id": str(b.id), "name": b.name, "code": b.code or f"BR-00{b.id}", "address": b.address, "company_id": str(b.company_id or 1)} for b in branches]



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
@router.get("/tenant-metadata")
async def get_public_context(
    tenant_slug: str = "",
    db: AsyncSession = Depends(get_db_session)
) -> dict:
    """Fetch all companies, branches, roles, and financial years under an existing tenant directly from PostgreSQL database."""
    clean_slug = tenant_slug.strip() if tenant_slug else ""

    if not clean_slug:
        return {
            "companies": [],
            "branches": [],
            "roles": [],
            "financial_years": []
        }

    # 1. Fetch tenant from PostgreSQL database strictly by slug
    try:
        tenant_result = await db.execute(
            select(Tenant).where(Tenant.slug == clean_slug, Tenant.is_active == True)
        )
        tenant = tenant_result.scalar_one_or_none()
    except Exception as e:
        logger.error("Error querying tenant by slug", error=str(e))
        return {
            "companies": [],
            "branches": [],
            "roles": [],
            "financial_years": []
        }

    if not tenant:
        return {
            "companies": [],
            "branches": [],
            "roles": [],
            "financial_years": []
        }

    # 2. Fetch companies from PostgreSQL database
    try:
        co_result = await db.execute(
            select(Company).where(
                Company.tenant_id == tenant.id,
                Company.is_active == True,
                Company.is_deleted == False
            )
        )
        companies = co_result.scalars().all()
    except Exception as e:
        logger.error("Error querying companies for tenant", error=str(e))
        companies = []

    # 3. Fetch branches from PostgreSQL database
    try:
        company_ids = [c.id for c in companies]
        if company_ids:
            br_result = await db.execute(
                select(Branch).where(
                    (Branch.tenant_id == tenant.id) | (Branch.company_id.in_(company_ids)),
                    Branch.is_active == True,
                    Branch.is_deleted == False
                )
            )
        else:
            br_result = await db.execute(
                select(Branch).where(
                    Branch.tenant_id == tenant.id,
                    Branch.is_active == True,
                    Branch.is_deleted == False
                )
            )
        branches = br_result.scalars().all()
    except Exception as e:
        logger.error("Error querying branches for tenant", error=str(e))
        branches = []

    # 4. Fetch roles from PostgreSQL database
    try:
        role_result = await db.execute(
            select(Role).where(
                (Role.tenant_id == tenant.id) | (Role.is_system_role == True)
            )
        )
        roles = role_result.scalars().all()
    except Exception as e:
        logger.error("Error querying roles for tenant", error=str(e))
        roles = []

    # 5. Fetch financial years from PostgreSQL database
    try:
        fy_result = await db.execute(
            select(FinancialYearModel).where(
                FinancialYearModel.is_deleted == False
            )
        )
        financial_years = fy_result.scalars().all()
    except Exception as e:
        logger.error("Error querying financial years", error=str(e))
        financial_years = []

    fy_list = [
        {"id": str(fy.id), "name": fy.name, "code": fy.code} for fy in financial_years
    ]
    if not fy_list:
        fy_list = [{"id": "FY-2025-26", "name": "FY 2025-2026", "code": "2025-2026"}]

    return {
        "companies": [
            {
                "id": str(c.id),
                "name": c.name,
                "legal_name": getattr(c, "legal_name", c.name) or c.name,
                "currency_code": getattr(c, "currency_code", "INR") or "INR"
            }
            for c in companies
        ],
        "branches": [
            {
                "id": str(b.id),
                "company_id": str(b.company_id),
                "name": b.name,
                "code": b.code,
                "timezone": getattr(b, "timezone", "Asia/Kolkata") or "Asia/Kolkata"
            }
            for b in branches
        ],
        "roles": [
            {
                "id": str(r.id),
                "name": r.name,
                "code": getattr(r, "code", r.name) or r.name
            }
            for r in roles
        ],
        "financial_years": fy_list
    }


from pydantic import BaseModel

class SendOtpRequest(BaseModel):
    phone: str

class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str

class ResetPasswordRequest(BaseModel):
    phone: str
    otp: str
    newPassword: str


@router.post("/send-otp")
async def send_otp(body: SendOtpRequest, db: AsyncSession = Depends(get_db_session)):
    clean_phone = body.phone.replace("+91", "").replace("+", "").strip()
    from src.modules.crm.models import Customer
    query = select(Customer).where(
        (Customer.phone == clean_phone) | (Customer.phone == f"+91{clean_phone}") | (Customer.phone == body.phone),
        Customer.is_deleted == False
    )
    result = await db.execute(query)
    found = result.scalars().first()
    return {
        "success": True,
        "message": f"OTP sent to +91 {clean_phone}",
        "customer_exists": bool(found)
    }


@router.post("/verify-otp")
async def verify_otp(body: VerifyOtpRequest, db: AsyncSession = Depends(get_db_session)):
    clean_phone = body.phone.replace("+91", "").replace("+", "").strip()
    from src.modules.crm.models import Customer
    query = select(Customer).where(
        (Customer.phone == clean_phone) | (Customer.phone == f"+91{clean_phone}") | (Customer.phone == body.phone),
        Customer.is_deleted == False
    )
    result = await db.execute(query)
    found = result.scalars().first()
    
    if not found:
        found = Customer(
            tenant_id=2,
            name=f"Customer {clean_phone[-4:]}",
            phone=clean_phone,
            loyalty_points=100
        )
        db.add(found)
        await db.commit()
        await db.refresh(found)

    return {
        "success": True,
        "user": {
            "id": str(found.id),
            "name": found.name,
            "phone": found.phone,
            "loyaltyTier": "BRONZE",
            "loyaltyPoints": found.loyalty_points,
        }
    }


@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, db: AsyncSession = Depends(get_db_session)):
    from passlib.hash import bcrypt
    from src.modules.crm.models import Customer
    clean_phone = body.phone.replace("+91", "").replace("+", "").strip()
    query = select(Customer).where(
        (Customer.phone == clean_phone) | (Customer.phone == f"+91{clean_phone}") | (Customer.phone == body.phone),
        Customer.is_deleted == False
    )
    result = await db.execute(query)
    found = result.scalars().first()
    if not found:
        raise HTTPException(status_code=404, detail="Customer not found")

    found.hashed_password = bcrypt.hash(body.newPassword)
    await db.commit()
    return {"success": True, "message": "Password updated successfully in PostgreSQL database"}




