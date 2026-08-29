"""
The ssrone – Request Logging Middleware
Logs every request with method, path, status, latency, and request ID.
"""
import time

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from src.shared.logger import bind_request_context, clear_request_context, get_logger

logger = get_logger(__name__)

# Paths to skip logging (health checks, static files)
SKIP_PATHS = {"/health", "/", "/favicon.ico", "/metrics"}


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if request.url.path in SKIP_PATHS:
            return await call_next(request)

        request_id = f"req-{time.time_ns()}"
        request.state.request_id = request_id

        bind_request_context(
            request_id=request_id,
            method=request.method,
            path=request.url.path,
        )

        start_time = time.perf_counter()

        try:
            response = await call_next(request)
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)

            log_fn = logger.warning if response.status_code >= 400 else logger.info
            log_fn(
                "Request completed",
                method=request.method,
                path=request.url.path,
                status_code=response.status_code,
                duration_ms=duration_ms,
                request_id=request_id,
            )

            response.headers["X-Request-ID"] = request_id
            response.headers["X-Response-Time"] = f"{duration_ms}ms"
            return response

        except Exception as exc:
            duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
            logger.error(
                "Request failed with exception",
                method=request.method,
                path=request.url.path,
                duration_ms=duration_ms,
                error=str(exc),
                request_id=request_id,
            )
            raise
        finally:
            clear_request_context()
