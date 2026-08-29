"""
SSR One AI – PostgreSQL Database Reset & DDL Schema Application Script
Resets public schema, executes 100% clean schema.sql, and applies rls.sql.
"""

import sys
import psycopg2

def reset_and_apply_ddl():
    host = 'localhost'
    port = 5432
    dbname = 'cafedb'
    user = 'postgres'
    password = 'asd123'

    print("==========================================================")
    print(" SSR One AI – Resetting Database & Applying Clean DDL")
    print("==========================================================")
    
    try:
        conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password)
        conn.autocommit = True
        cur = conn.cursor()

        print("[1/3] Dropping old schema and recreating public schema...")
        cur.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
        print("  └─ SUCCESS: Public schema reset.")

        print("[2/3] Applying 100% clean DDL (services/backend/migrations/schema.sql)...")
        with open("services/backend/migrations/schema.sql", "r", encoding="utf-8") as f:
            schema_sql = f.read()
        cur.execute(schema_sql)
        print("  └─ SUCCESS: Clean DDL schema applied.")

        print("[3/3] Enforcing Row-Level Security (services/backend/migrations/rls.sql)...")
        with open("services/backend/migrations/rls.sql", "r", encoding="utf-8") as f:
            rls_sql = f.read()
        cur.execute(rls_sql)
        print("  └─ SUCCESS: Row-Level Security policies enforced.")

        print("\n----------------------------------------------------------")
        print(" VERIFICATION: Listing All Tables in 'cafedb'")
        print("----------------------------------------------------------")
        cur.execute("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;")
        tables = [row[0] for row in cur.fetchall()]
        for idx, table in enumerate(tables, 1):
            print(f"  {idx:02d}. {table}")

        print(f"\n[+] SUCCESS: Total {len(tables)} clean tables created in '{dbname}' with 0 duplicates!")
        conn.close()

    except Exception as e:
        print(f"\n[-] ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    reset_and_apply_ddl()
