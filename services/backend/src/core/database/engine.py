"""
The ssrone – Enterprise Database Engine
Async SQLAlchemy engine supporting Shared Schema RLS and Dynamic Dedicated Multi-Database Routing.
"""
from collections.abc import AsyncGenerator
from typing import Any, Dict
import asyncio

from sqlalchemy import event, text
from sqlalchemy.ext.asyncio import (
    AsyncConnection,
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, MappedColumn, mapped_column
from sqlalchemy.pool import NullPool

from src.shared.config import get_settings
from src.shared.logger import get_logger

logger = get_logger(__name__)
settings = get_settings()


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy ORM models."""
    pass


def create_engine(*, url: str | None = None, testing: bool = False) -> AsyncEngine:
    """Create an async SQLAlchemy engine with connection pooling."""
    target_url = url or settings.db.async_url
    kwargs: dict[str, Any] = {
        "echo": settings.db.echo,
        "future": True,
    }

    if "sqlite" in target_url:
        kwargs["connect_args"] = {"check_same_thread": False}
        kwargs["poolclass"] = NullPool
    elif testing:
        kwargs["poolclass"] = NullPool
    else:
        kwargs.update(
            {
                "pool_size": settings.db.pool_size,
                "max_overflow": settings.db.max_overflow,
                "pool_pre_ping": True,
                "pool_recycle": 3600,
            }
        )

    engine_instance = create_async_engine(target_url, **kwargs)
    logger.info("Database engine initialized", url=target_url)
    return engine_instance


# Primary default database engine & session factory
engine: AsyncEngine = create_engine()

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)

# ═══════════════════════════════════════════
# DYNAMIC MULTI-DATABASE ENGINE MANAGER
# Supports isolated dedicated databases per enterprise customer
# ═══════════════════════════════════════════

class DynamicDatabaseManager:
    """
    Manages dynamic connection pools for enterprise tenants with dedicated database instances.
    Zero code changes required when onboarding enterprise customers with custom databases.
    """
    def __init__(self) -> None:
        self._engines: Dict[str, AsyncEngine] = {}
        self._sessionmakers: Dict[str, async_sessionmaker[AsyncSession]] = {}
        self._lock = asyncio.Lock()

    async def get_session(self, connection_url: str | None = None) -> AsyncSession:
        """Get database session for primary shared DB or tenant's dedicated DB instance."""
        if not connection_url or connection_url == settings.db.async_url:
            return AsyncSessionLocal()

        if connection_url not in self._sessionmakers:
            async with self._lock:
                if connection_url not in self._sessionmakers:
                    custom_engine = create_engine(url=connection_url)
                    custom_sessionmaker = async_sessionmaker(
                        bind=custom_engine,
                        class_=AsyncSession,
                        expire_on_commit=False,
                        autoflush=False,
                        autocommit=False,
                    )
                    self._engines[connection_url] = custom_engine
                    self._sessionmakers[connection_url] = custom_sessionmaker
                    logger.info("Dedicated Enterprise Database Pool initialized", custom_url=connection_url)

        return self._sessionmakers[connection_url]()


db_manager = DynamicDatabaseManager()


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency: yields an async DB session.
    Automatically rolls back on exception.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except BaseException:
            if session.is_active:
                await session.rollback()
            raise
        finally:
            await session.close()


get_db = get_db_session


async def get_db_connection() -> AsyncGenerator[AsyncConnection, None]:
    """Yields a raw async connection for bulk operations."""
    async with engine.begin() as conn:
        yield conn


async def set_rls_context(
    session: AsyncSession,
    tenant_id: str,
    user_id: str | None = None,
    is_superadmin: bool = False
) -> None:
    """Sets PostgreSQL Row-Level Security (RLS) session variables."""
    try:
        await session.execute(
            text("SELECT set_config('app.current_tenant_id', :tenant_id, false)"),
            {"tenant_id": str(tenant_id)}
        )
        if user_id:
            await session.execute(
                text("SELECT set_config('app.current_user_id', :user_id, false)"),
                {"user_id": str(user_id)}
            )
        if is_superadmin:
            await session.execute(text("SELECT set_config('app.is_superadmin', 'true', false)"))
    except Exception as e:
        logger.warning("Failed to set RLS session context variables", error=str(e))


async def dispose_engine() -> None:
    """Disposes primary engine and all dedicated enterprise tenant database connection pools."""
    await engine.dispose()
    for custom_url, custom_engine in db_manager._engines.items():
        try:
            await custom_engine.dispose()
            logger.info("Dedicated enterprise DB engine disposed", custom_url=custom_url)
        except Exception:
            pass
    db_manager._engines.clear()
    db_manager._sessionmakers.clear()


async def ping_database() -> bool:
    """Pings primary database to verify health."""
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
