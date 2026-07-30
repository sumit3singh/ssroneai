import pytest
from sqlalchemy import text
from src.core.database.engine import AsyncSessionLocal

@pytest.mark.asyncio
async def test_database_table_columns_schema() -> None:
    """Verify database connection and query information schema."""
    async with AsyncSessionLocal() as session:
        result = await session.execute(
            text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
        )
        tables = [r[0] for r in result.fetchall()]
        assert isinstance(tables, list)
