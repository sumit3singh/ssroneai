"""
The ssrone – Finance Module Controller Router
Chart of accounts, journal entries, bank reconciliation, GST returns, budgets, and P&L reporting.
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database.engine import get_db_session
from src.modules.auth.dependencies import get_current_user
from src.modules.auth.models import User
from src.modules.finance.schemas import PLSummaryResponse, GSTSummaryResponse
from src.modules.finance.services import finance_service
from src.shared.logger import get_logger

logger = get_logger(__name__)
router = APIRouter(prefix="/finance", tags=["Finance"])


@router.get("/pl-summary", response_model=PLSummaryResponse)
async def get_pl_summary(
    month: int = Query(default=6, ge=1, le=12),
    year: int = Query(default=2026),
    branch_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> PLSummaryResponse:
    """Profit & Loss summary for a given month."""
    return await finance_service.calculate_pl_summary(month, year)


@router.get("/gst-summary", response_model=GSTSummaryResponse)
async def get_gst_summary(
    month: int = Query(default=6, ge=1, le=12),
    year: int = Query(default=2026),
    branch_id: int | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> GSTSummaryResponse:
    """GST return summary for GSTR-1 / GSTR-3B preparation."""
    return await finance_service.calculate_gst_summary(month, year)


@router.get("/chart-of-accounts")
async def list_accounts(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session),
) -> list[dict]:
    """List chart of accounts for the tenant directly from PostgreSQL."""
    return await finance_service.get_accounts(db, current_user.tenant_id)
