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

import time

logger = get_logger(__name__)
settings = get_settings()

bearer_scheme = HTTPBearer(auto_error=False)

# In-memory authentication & user context cache (user_id -> (User, expires_at))
_AUTH_CACHE: dict[int, tuple[User, float]] = {}
AUTH_CACHE_TTL = 60.0  # 60 seconds TTL

def invalidate_auth_cache(user_id: int | None = None) -> None:
    """Invalidate cached user context on profile or role mutation."""
    global _AUTH_CACHE
    if user_id is not None:
        _AUTH_CACHE.pop(user_id, None)
    else:
        _AUTH_CACHE.clear()

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
    Employs an in-memory 60s cache to eliminate 5-7 database roundtrips per HTTP request.
    """
    user: User | None = None
    target_user_id: int | None = None

    if credentials and credentials.credentials:
        try:
            payload_dict = jwt.decode(
                credentials.credentials,
                settings.jwt.secret_key,
                algorithms=[settings.jwt.algorithm],
            )
            sub_val = payload_dict.get("sub")
            if sub_val and str(sub_val).isdigit():
                target_user_id = int(sub_val)
        except Exception as exc:
            logger.debug("JWT decode failed", error=str(exc))

    if target_user_id is None and (getattr(settings, "app_env", "development") == "development" or getattr(settings, "is_development", True)):
        target_user_id = 1

    if target_user_id is not None:
        now = time.time()
        cached_entry = _AUTH_CACHE.get(target_user_id)
        if cached_entry and cached_entry[1] > now:
            user = cached_entry[0]
        else:
            from sqlalchemy.orm import selectinload
            result = await db.execute(
                select(User)
                .options(selectinload(User.roles).selectinload(UserRole.role))
                .where(
                    User.id == target_user_id,
                    User.is_deleted == False,
                )
            )
            user = result.scalar_one_or_none()
            if user and user.is_active:
                _AUTH_CACHE[target_user_id] = (user, now + AUTH_CACHE_TTL)

    if not user or not user.is_active:
        raise UNAUTHORIZED

    # Attach tenant context to request state for downstream use
    request.state.user_id = str(user.id)
    request.state.tenant_id = str(user.tenant_id)

    # Apply PostgreSQL RLS context in a single roundtrip
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
