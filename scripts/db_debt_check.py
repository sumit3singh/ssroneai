import asyncio
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent / "services" / "backend"
sys.path.insert(0, str(backend_dir))

from src.core.database.engine import AsyncSessionLocal
from sqlalchemy import text

async def main():
    async with AsyncSessionLocal() as db:
        res = await db.execute(text("SELECT count(*) FROM customers"))
        total_cust = res.scalar()
        print(f"Total customers registered in DB: {total_cust}")

        res = await db.execute(text("SELECT id, name, phone FROM customers LIMIT 10"))
        print("\nRegistered Customers:")
        for r in res.fetchall():
            print(f"  ID={r[0]}: {r[1]} ({r[2]})")

        res = await db.execute(text("""
            SELECT id, order_number, customer_id, status, payment_status, grand_total, amount_paid, balance_due 
            FROM orders 
            WHERE balance_due > 0
        """))
        unpaid_orders = res.fetchall()
        print(f"\nOrders with balance_due > 0 ({len(unpaid_orders)} orders):")
        for r in unpaid_orders:
            print(f"  Order #{r[1]} (ID={r[0]}): CustID={r[2]}, Status={r[3]}, PayStatus={r[4]}, Total={r[5]}, Paid={r[6]}, Due={r[7]}")

        res = await db.execute(text("""
            SELECT id, order_id, payment_mode, amount, status, transaction_reference, created_at 
            FROM order_payments 
            ORDER BY id DESC LIMIT 6
        """))
        payments = res.fetchall()
        print(f"\nLatest Payments in order_payments ({len(payments)} rows):")
        for r in payments:
            print(f"  Payment ID={r[0]}: OrderID={r[1]}, Mode={r[2]}, Amount={r[3]}, Status={r[4]}, Ref={r[5]}, At={r[6]}")

if __name__ == "__main__":
    asyncio.run(main())
