"""
The ssrone – Auth FastAPI Dependencies
get_current_user, get_current_tenant — inject into route handlers.
"""
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt, JWTError

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.core.database.engine import get_db_session
from src.modules.auth.models import User, UserRole
from src.modules.auth.schemas import TokenPayload
from src.modules.auth.service import auth_service
from src.shared.config import get_settings
from src.shared.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()

bearer_scheme = HTTPBearer(auto_error=False)


UNAUTHORIZED = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Invalid or expired authentication token.",
    headers={"WWW-Authenticate": "Bearer"},
)


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db_session),
) -> User:
    """
    FastAPI dependency: decode JWT and return the authenticated User.
    In development mode, falls back to Superadmin (User ID 1) if unauthenticated.
    Eagerly loads roles and applies RLS context to the DB session.
    """
    user: User | None = None

    if credentials and credentials.credentials:
        try:
            payload_dict = jwt.decode(
                credentials.credentials,
                settings.jwt.secret_key,
                algorithms=[settings.jwt.algorithm],
            )
            sub_val = payload_dict.get("sub")
            user_id = int(sub_val) if sub_val and str(sub_val).isdigit() else None
            if user_id:
                from sqlalchemy.orm import selectinload
                result = await db.execute(
                    select(User)
                    .options(selectinload(User.roles).selectinload(UserRole.role))
                    .where(
                        User.id == user_id,
                        User.is_deleted == False,
                    )
                )
                user = result.scalar_one_or_none()
        except Exception as exc:
            logger.debug("JWT decode failed", error=str(exc))

    if not user and (getattr(settings, "app_env", "development") == "development" or getattr(settings, "is_development", True)):
        from sqlalchemy.orm import selectinload
        dev_res = await db.execute(
            select(User)
            .options(selectinload(User.roles).selectinload(UserRole.role))
            .where(
                User.id == 1,
                User.is_deleted == False,
            )
        )
        user = dev_res.scalar_one_or_none()


    if not user or not user.is_active:
        raise UNAUTHORIZED

    # Attach tenant context to request state for downstream use
    request.state.user_id = str(user.id)
    request.state.tenant_id = str(user.tenant_id)

    # Apply PostgreSQL RLS context
    from src.core.database.engine import set_rls_context
    await set_rls_context(db, str(user.tenant_id), str(user.id), is_superadmin=user.is_superadmin)

    return user




async def get_current_superadmin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Require the user to be a platform superadmin."""
    if not current_user.is_superadmin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Superadmin access required.",
        )
    return current_user


class RequirePermission:
    """
    Dependency factory for permission checking.

    Usage:
        @router.post("/orders")
        async def create_order(
            user: User = Depends(RequirePermission("orders:create"))
        ):
    """

    def __init__(self, permission: str) -> None:
        self.permission = permission

    async def __call__(
        self, current_user: User = Depends(get_current_user)
    ) -> User:
        if current_user.is_superadmin:
            return current_user

        for ur in current_user.roles:
            role = ur.role
            if not role:
                continue
            
            perms = role.permissions
            if isinstance(perms, list):
                if self.permission in perms:
                    return current_user
            elif isinstance(perms, dict):
                if perms.get(self.permission) is True:
                    return current_user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permission denied. Missing required permission: '{self.permission}'",
        )


async def get_optional_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db_session),
) -> User | None:
    try:
        return await get_current_user(request, credentials, db)
    except Exception:
        # Ensure RLS context is present even for unauthenticated requests (fallback tenant=1)
        try:
            from src.core.database.engine import set_rls_context
            await set_rls_context(db, "1", None, is_superadmin=False)
        except Exception:
            # If setting RLS also fails, ignore and return None — caller should handle empty results.
            logger.debug("Failed to set fallback RLS context for optional user")
        return None
