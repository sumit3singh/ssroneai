"""
CLI Script to create or upgrade a Tenant Superadmin account in PostgreSQL.
Usage:
    python scripts/create_superadmin.py --tenant-slug baithak-cafe --email admin@baithakcafe.com --password admin123
"""
import argparse
import sys
import os
import psycopg2

# Default DB URL from environment or standard local PostgreSQL setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:asd123@127.0.0.1:5432/cafedb")

def create_superadmin(tenant_slug: str, email: str, password: str, first_name: str = "Tenant", last_name: str = "Admin"):
    # Convert asyncpg/sqlalchemy URL format if needed
    db_url = DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    
    try:
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        hashed_password = pwd_context.hash(password)
    except Exception:
        import bcrypt
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()

        # 1. Fetch Tenant
        cur.execute("SELECT id, name FROM tenants WHERE slug = %s AND is_deleted = false;", (tenant_slug.strip().lower(),))
        tenant_row = cur.fetchone()
        if not tenant_row:
            print(f"❌ Error: Tenant with slug '{tenant_slug}' not found in database.")
            sys.exit(1)

        tenant_id, tenant_name = tenant_row[0], tenant_row[1]

        # 2. Get default Company & Branch for tenant
        cur.execute("SELECT id FROM companies WHERE tenant_id = %s AND is_deleted = false LIMIT 1;", (tenant_id,))
        comp_row = cur.fetchone()
        company_id = comp_row[0] if comp_row else None

        cur.execute("SELECT id FROM branches WHERE tenant_id = %s AND is_deleted = false LIMIT 1;", (tenant_id,))
        br_row = cur.fetchone()
        branch_id = br_row[0] if br_row else None

        # 3. Insert or Update User to Superadmin
        cur.execute("""
            INSERT INTO users (tenant_id, company_id, branch_id, email, first_name, last_name, hashed_password, is_superadmin, is_active, is_verified)
            VALUES (%s, %s, %s, %s, %s, %s, %s, TRUE, TRUE, TRUE)
            ON CONFLICT (tenant_id, email) DO UPDATE SET 
                is_superadmin = TRUE, 
                is_active = TRUE,
                hashed_password = EXCLUDED.hashed_password;
        """, (tenant_id, company_id, branch_id, email.strip().lower(), first_name, last_name, hashed_password))

        conn.commit()
        cur.close()
        conn.close()

        print("=" * 60)
        print(f"✅ SUCCESS: Superadmin Account Provisioned!")
        print(f"   • Tenant Name: {tenant_name} (ID: {tenant_id})")
        print(f"   • Tenant Slug: {tenant_slug}")
        print(f"   • Email:       {email}")
        print(f"   • Password:    {'*' * len(password)}")
        print(f"   • Role:        SUPERADMIN (is_superadmin = TRUE)")
        print("=" * 60)

    except Exception as e:
        print(f"❌ Database error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create or upgrade a Superadmin account for a tenant.")
    parser.add_argument("--tenant-slug", required=True, help="Tenant slug (e.g. baithak-cafe)")
    parser.add_argument("--email", required=True, help="Superadmin email address")
    parser.add_argument("--password", required=True, help="Superadmin password")
    parser.add_argument("--first-name", default="Tenant", help="First name")
    parser.add_argument("--last-name", default="Admin", help="Last name")

    args = parser.parse_args()
    create_superadmin(
        tenant_slug=args.tenant_slug,
        email=args.email,
        password=args.password,
        first_name=args.first_name,
        last_name=args.last_name
    )
