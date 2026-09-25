"""
The ssrone – FastAPI Application Server
Main entry point: app factory, lifespan, middleware, router registration.
"""
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse

from src.api.app.middleware.logging import RequestLoggingMiddleware
from src.api.app.middleware.tenant import TenantMiddleware
from src.core.database.engine import dispose_engine, ping_database
from src.shared.config import get_settings
from src.shared.logger import configure_logging, get_logger
from src.shared.redis_client import close_redis, ping_redis

configure_logging()
logger = get_logger(__name__)
settings = get_settings()


import asyncio

listener_task: asyncio.Task | None = None

async def listen_cache_invalidations() -> None:
    """Listen to Redis Pub/Sub cache invalidation messages and invalidate local cache."""
    try:
        from src.shared.redis_client import get_redis
        from src.engines.licensing.engine import cache
        
        while True:
            try:
                redis = await get_redis()
                pubsub = redis.pubsub()
                await pubsub.subscribe("ssrone:licensing:cache_invalidation")
                logger.info("Subscribed to ssrone:licensing:cache_invalidation Pub/Sub channel")
                
                async for message in pubsub.listen():
                    if message and message["type"] == "message":
                        tenant_id = message["data"]
                        logger.info("Received cache invalidation event from Pub/Sub", tenant_id=tenant_id)
                        # Invalidate local cache fallback
                        count = cache._local_cache.delete_pattern(f"features:{tenant_id}:*")
                        logger.info("Local memory cache fallback cleared", tenant_id=tenant_id, cleared_count=count)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error("Error in cache invalidation listener loop, retrying in 5s...", error=str(e))
                await asyncio.sleep(5)
    except asyncio.CancelledError:
        pass
    except Exception as e:
        logger.error("Cache invalidation listener task failed", error=str(e))


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan: startup checks and graceful shutdown."""
    logger.info("🚀 The ssrone Backend API Server Online")
    yield

    # ── Shutdown ───────────────────────────────
    logger.info("🛑 Shutting down The ssrone Platform...")
    if listener_task:
        listener_task.cancel()
        try:
            await listener_task
        except asyncio.CancelledError:
            pass
    await dispose_engine()
    await close_redis()
    logger.info("✅ Graceful shutdown complete")


def create_app() -> FastAPI:
    """Factory function — creates and configures the FastAPI application."""
    app = FastAPI(
        title="The ssrone Hospitality Platform API",
        description=(
            "World-class, AI-native, metadata-driven enterprise hospitality platform. "
            "One Platform. Every Hospitality Business."
        ),
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
        lifespan=lifespan,
        contact={
            "name": "The ssrone Engineering Team",
            "email": "engineering@ssrone.com",
        },
        license_info={
            "name": "Proprietary",
            "url": "https://ssrone.com/license",
        },
    )

    # ── Middleware ──────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173", "http://127.0.0.1:5173",
            "http://localhost:3000", "http://127.0.0.1:3000",
            "http://localhost:3001", "http://127.0.0.1:3001",
            "http://localhost:3002", "http://127.0.0.1:3002",
            "http://localhost:3003", "http://127.0.0.1:3003",
            "http://localhost:3004", "http://127.0.0.1:3004",
            "http://localhost:8000", "http://127.0.0.1:8000",
        ],
        allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    app.add_middleware(RequestLoggingMiddleware)
    app.add_middleware(TenantMiddleware)

    # ── API Routers ────────────────────────────────────────────
    from src.modules.auth.router import router as auth_router
    from src.modules.auth.licensing_router import router as licensing_router
    from src.modules.orders.router import router as orders_router
    from src.ai.copilot.router import router as ai_router
    from src.modules.inventory.router import router as inventory_router
    from src.modules.billing.router import router as billing_router
    from src.modules.crm.router import router as crm_router
    from src.modules.hotel.router import router as hotel_router
    from src.modules.pg_management.router import router as pg_router
    from src.modules.hrms.router import router as hr_router
    from src.modules.restaurant.router import router as restaurant_router
    from src.modules.finance.router import router as finance_router
    from src.modules.dashboard.router import router as dashboard_router
    from src.engines.notification.router import router as notifications_router
    from src.core.form_builder.router import router as form_builder_router
    from src.api.health.router import router as health_router
    from src.api.v1.business_crud import router as business_crud_router
    from src.engines.search.router import router as search_router


    API_V1 = "/api/v1"

    app.include_router(auth_router, prefix=API_V1)
    app.include_router(licensing_router, prefix=API_V1)
    app.include_router(orders_router, prefix=API_V1)
    app.include_router(dashboard_router, prefix=API_V1)
    app.include_router(ai_router, prefix=API_V1)
    app.include_router(inventory_router, prefix=API_V1)
    app.include_router(billing_router, prefix=API_V1)
    app.include_router(crm_router, prefix=API_V1)
    app.include_router(hotel_router, prefix=API_V1)
    app.include_router(pg_router, prefix=API_V1)
    app.include_router(hr_router, prefix=API_V1)
    app.include_router(restaurant_router, prefix=API_V1)
    app.include_router(finance_router, prefix=API_V1)
    app.include_router(notifications_router, prefix=API_V1)
    app.include_router(form_builder_router, prefix=API_V1)
    app.include_router(search_router, prefix=API_V1)
    app.include_router(business_crud_router, prefix=API_V1)
    app.include_router(health_router)


    # ── Health & Meta Endpoints ────────────────────────────────
    @app.get("/", tags=["Meta"], include_in_schema=False)
    async def root() -> dict:
        return {
            "name": settings.app_name,
            "version": settings.app_version,
            "status": "running",
            "docs": "/docs",
        }

    @app.get("/health", tags=["Meta"])
    async def health_check() -> dict:
        """Health check endpoint — used by load balancers and monitoring."""
        db_ok = await ping_database()
        redis_ok = await ping_redis()
        return {
            "status": "healthy" if db_ok else "degraded",
            "version": settings.app_version,
            "environment": settings.app_env,
            "services": {
                "database": "up" if db_ok else "down",
                "redis": "up" if redis_ok else "down",
            },
        }

    @app.get("/api/v1/ping", tags=["Meta"])
    async def ping() -> dict:
        return {"pong": True}

    # ── Global Exception Handlers ──────────────────────────────
    @app.exception_handler(404)
    async def not_found_handler(request: Request, exc: Exception) -> JSONResponse:
        return JSONResponse(
            status_code=404,
            content={"error": "not_found", "message": "The requested resource was not found."},
        )

    @app.exception_handler(500)
    async def server_error_handler(request: Request, exc: Exception) -> JSONResponse:
        import traceback
        tb = traceback.format_exc()
        logger.error("Unhandled server error", path=request.url.path, error=str(exc), traceback=tb)
        print(f"[500 EXCEPTION] {request.url.path}: {exc}\n{tb}")
        return JSONResponse(
            status_code=500,
            content={"error": "internal_server_error", "message": f"An unexpected error occurred: {exc}"},
        )


    return app


# Application instance
app = create_app()
