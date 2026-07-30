import pytest
from sqlalchemy import select
from src.core.database.engine import AsyncSessionLocal
from src.core.form_builder.models import FormMaster

@pytest.mark.asyncio
async def test_form_master_query() -> None:
    """Verify querying FormMaster model from database."""
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(FormMaster))
        forms = res.scalars().all()
        assert isinstance(forms, list)
