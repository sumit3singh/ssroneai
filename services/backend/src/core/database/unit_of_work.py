"""
Unit of Work Pattern Implementation for Async SQLAlchemy Sessions.
Ensures atomic transactions across multi-repository operations.
"""
from typing import Self
from src.core.database.engine import AsyncSessionLocal
from sqlalchemy.ext.asyncio import AsyncSession


class UnitOfWork:
    """Async Unit of Work managing database session commit and rollback lifecycle."""

    def __init__(self) -> None:
        self.session_factory = AsyncSessionLocal
        self.session: AsyncSession | None = None

    async def __aenter__(self) -> Self:
        self.session = self.session_factory()
        return self

    async def __aexit__(self, exc_type: Exception | None, exc_val: Exception | None, exc_tb: Any | None) -> None:
        if not self.session:
            return
        if exc_type is not None:
            await self.rollback()
        else:
            await self.commit()
        await self.session.close()

    async def commit(self) -> None:
        if self.session:
            await self.session.commit()

    async def rollback(self) -> None:
        if self.session:
            await self.session.rollback()
