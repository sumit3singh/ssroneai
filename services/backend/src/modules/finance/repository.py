"""
The ssrone – Finance Module Database Access Repository
"""
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.modules.finance.models import ChartOfAccounts, JournalEntry, BudgetEntry


class FinanceRepository:

    async def get_accounts(self, db: AsyncSession, tenant_id: int) -> List[ChartOfAccounts]:
        stmt = (
            select(ChartOfAccounts)
            .where(
                ChartOfAccounts.tenant_id == tenant_id,
                ChartOfAccounts.is_deleted == False
            )
            .order_by(ChartOfAccounts.account_code)
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def create_account(self, db: AsyncSession, account: ChartOfAccounts) -> ChartOfAccounts:
        db.add(account)
        await db.flush()
        return account

    async def get_journal_entries(self, db: AsyncSession, tenant_id: int) -> List[JournalEntry]:
        stmt = (
            select(JournalEntry)
            .where(
                JournalEntry.tenant_id == tenant_id,
                JournalEntry.is_deleted == False
            )
            .order_by(JournalEntry.entry_date.desc())
        )
        res = await db.execute(stmt)
        return list(res.scalars().all())

    async def create_journal_entry(self, db: AsyncSession, entry: JournalEntry) -> JournalEntry:
        db.add(entry)
        await db.flush()
        return entry


finance_repository = FinanceRepository()
