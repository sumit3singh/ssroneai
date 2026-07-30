"""
Centralized FastAPI Dependency Injection Container.
Provides db sessions, repositories, authentication, tenant headers, and services.
"""
from typing import AsyncGenerator
from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.database.engine import AsyncSessionLocal
from src.core.exceptions.base import UnauthorizedException


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Provide AsyncSession dependency for FastAPI route handlers."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def get_tenant_slug(x_tenant_slug: str | None = Header(None, alias="X-Tenant-Slug")) -> str | None:
    """Extract tenant slug header."""
    return x_tenant_slug


def get_branch_id(x_branch_id: str | None = Header(None, alias="X-Branch-ID")) -> str | None:
    """Extract branch ID header."""
    return x_branch_id
