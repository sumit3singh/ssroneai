"""
The Baithak – Tenant Middleware
Extracts tenant context from JWT or request headers.
Sets request.state.tenant_id for downstream use.
"""
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from src.shared.logger import get_logger

logger = get_logger(__name__)

PUBLIC_PATHS = {
    "/",
    "/health",
    "/docs",
    "/redoc",
    "/openapi.json",
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/auth/public/context",
    "/api/v1/ping",
}


class TenantMiddleware(BaseHTTPMiddleware):
    """
    Extracts tenant_id from:
    1. X-Tenant-ID header (for API clients / mobile apps)
    2. JWT token (set by auth router — downstream reads request.state.tenant_id)
    """

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if request.url.path in PUBLIC_PATHS or request.url.path.startswith("/docs"):
            return await call_next(request)

        # Try header-based tenant resolution (for API integrations)
        tenant_id = request.headers.get("X-Tenant-ID")
        if tenant_id:
            request.state.tenant_id = tenant_id

        # JWT-based tenant_id is set by auth dependency — no action needed here
        return await call_next(request)
