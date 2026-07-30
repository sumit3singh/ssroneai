"""
The Baithak – Database Engine
Async SQLAlchemy engine with connection pooling and RLS support.
"""
from collections.abc import AsyncGenerator
from typing import Any

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


def create_engine(*, testing: bool = False) -> AsyncEngine:
    """Create the async SQLAlchemy engine."""
    kwargs: dict[str, Any] = {
        "echo": settings.db.echo,
        "future": True,
    }

    if testing:
        # Use NullPool for tests to avoid connection reuse issues
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

    engine = create_async_engine(settings.db.async_url, **kwargs)
    logger.info(
        "Database engine created",
        host=settings.db.host,
        port=settings.db.port,
        database=settings.db.name,
    )
    return engine


# Global engine & session factory
engine: AsyncEngine = create_engine()

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI dependency: yields an async DB session.
    Automatically commits on success, rolls back on exception.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


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
    """
    Set PostgreSQL Row Level Security context variables for multi-tenancy.
    Call this at the start of every request after authentication.
    """
    await session.execute(
        text("SELECT set_config('app.tenant_id', :tenant_id, true)"),
        {"tenant_id": tenant_id},
    )
    if user_id:
        await session.execute(
            text("SELECT set_config('app.user_id', :user_id, true)"),
            {"user_id": user_id},
        )
    await session.execute(
        text("SELECT set_config('app.is_superadmin', :is_superadmin, true)"),
        {"is_superadmin": "true" if is_superadmin else "false"},
    )


async def ping_database() -> bool:
    """Health check — returns True if database is reachable."""
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        logger.error("Database health check failed", error=str(exc))
        return False


async def dispose_engine() -> None:
    """Dispose the engine connection pool (call on shutdown)."""
    await engine.dispose()
    logger.info("Database engine disposed")
