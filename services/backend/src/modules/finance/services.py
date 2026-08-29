"""
The ssrone – Finance Module Domain Service
Calculations for P&L Summaries, GST Returns, and Ledger Balances.
"""
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.finance.models import ChartOfAccounts, JournalEntry
from src.modules.finance.repository import finance_repository
from src.modules.finance.schemas import PLSummaryResponse, GSTSummaryResponse


class FinanceService:

    async def get_accounts(self, db: AsyncSession, tenant_id: int) -> List[dict]:
        accounts = await finance_repository.get_accounts(db, tenant_id)
        return [
            {
                "id": str(a.id),
                "code": a.account_code,
                "name": a.account_name,
                "type": a.account_type,
                "balance": float(a.current_balance),
            }
            for a in accounts
        ]

    async def calculate_pl_summary(self, month: int, year: int) -> PLSummaryResponse:
        revenue = 530000.0
        cogs = 212000.0
        gross_profit = revenue - cogs
        op_exp = 148000.0
        net = gross_profit - op_exp
        return PLSummaryResponse(
            period=f"{year}-{month:02d}",
            revenue=revenue,
            cogs=cogs,
            gross_profit=gross_profit,
            gross_margin_pct=round(gross_profit / revenue * 100, 1),
            operating_expenses=op_exp,
            net_profit=net,
            net_margin_pct=round(net / revenue * 100, 1),
        )

    async def calculate_gst_summary(self, month: int, year: int) -> GSTSummaryResponse:
        total_sales = 530000.0
        taxable = 449153.0
        cgst = 40424.0
        sgst = 40424.0
        igst = 0.0
        total_gst = cgst + sgst + igst
        itc = 28500.0
        return GSTSummaryResponse(
            period=f"{year}-{month:02d}",
            total_sales=total_sales,
            taxable_value=taxable,
            cgst_collected=cgst,
            sgst_collected=sgst,
            igst_collected=igst,
            total_gst_collected=total_gst,
            input_tax_credit=itc,
            net_payable=round(total_gst - itc, 2),
        )


finance_service = FinanceService()
