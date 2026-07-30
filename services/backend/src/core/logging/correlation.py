"""
Correlation ID Middleware for FastAPI Requests.
Injects unique X-Correlation-ID headers into incoming requests and JSON logs.
"""
import uuid
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
import structlog


class CorrelationIdMiddleware(BaseHTTPMiddleware):
    """Middleware attaching X-Correlation-ID to request context and response headers."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
        structlog.contextvars.bind_contextvars(correlation_id=correlation_id)

        response = await call_next(request)
        response.headers["X-Correlation-ID"] = correlation_id
        return response
