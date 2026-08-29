"""
SSR One AI – Baithak Cafe Onboarding & Seed Script
Provisions Tenant 'Baithak Cafe', Company, 2 Branches (CUH Mahendragarh & Gurugram),
Admin Users, Menu Master, and Dining Tables in PostgreSQL 'cafedb'.
"""

import sys
import psycopg2
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_baithak_cafe():
    host = 'localhost'
    port = 5432
    dbname = 'cafedb'
    user = 'postgres'
    password = 'asd123'

    print("==========================================================")
    print(" SSR One AI – Onboarding Customer: BAITHAK CAFE")
    print("==========================================================")
    
    try:
        conn = psycopg2.connect(host=host, port=port, dbname=dbname, user=user, password=password)
        conn.autocommit = False
        cur = conn.cursor()

        # 1. Create Tenant
        print("[1/6] Provisioning Tenant 'Baithak Cafe'...")
        cur.execute("""
            INSERT INTO tenants (name, slug, subdomain, plan, is_active)
            VALUES ('Baithak Cafe', 'baithak-cafe', 'baithak', 'enterprise', TRUE)
            ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
            RETURNING id;
        """)
        tenant_id = cur.fetchone()[0]
        print(f"  └─ Tenant ID: {tenant_id}")

        # Set RLS Context
        cur.execute(f"SET LOCAL app.tenant_id = '{tenant_id}';")

        # 2. Create Company
        print("[2/6] Provisioning Legal Entity 'Baithak Hospitality Pvt Ltd'...")
        cur.execute("""
            INSERT INTO companies (tenant_id, name, legal_name, gstin, currency_code, business_type)
            VALUES (%s, 'Baithak Cafe', 'Baithak Hospitality Pvt Ltd', '06AAAAA0000A1Z5', 'INR', 'restaurant')
            RETURNING id;
        """, (tenant_id,))
        company_id = cur.fetchone()[0]
        print(f"  └─ Company ID: {company_id}")

        # 3. Create 2 Branches
        print("[3/6] Provisioning 2 Outlets (CUH Mahendragarh & Gurugram)...")
        cur.execute("""
            INSERT INTO branches (tenant_id, company_id, name, code, address, timezone)
            VALUES (%s, %s, 'Baithak Cafe - CUH Mahendragarh', 'BAITHAK-CUH', '{"city": "Mahendragarh", "state": "Haryana"}'::jsonb, 'Asia/Kolkata')
            RETURNING id;
        """, (tenant_id, company_id))
        branch_cuh_id = cur.fetchone()[0]

        cur.execute("""
            INSERT INTO branches (tenant_id, company_id, name, code, address, timezone)
            VALUES (%s, %s, 'Baithak Cafe - Gurugram', 'BAITHAK-GGR', '{"city": "Gurugram", "state": "Haryana"}'::jsonb, 'Asia/Kolkata')
            RETURNING id;
        """, (tenant_id, company_id))
        branch_ggr_id = cur.fetchone()[0]

        print(f"  ├─ Branch 1 (CUH Mahendragarh) ID: {branch_cuh_id}")
        print(f"  └─ Branch 2 (Gurugram) ID: {branch_ggr_id}")

        # 4. Create Owner Admin User
        print("[4/6] Creating Superadmin User 'admin@baithakcafe.com' and 'admin@baithak.com'...")
        hashed_pwd = pwd_context.hash("admin123")
        cur.execute("""
            INSERT INTO users (tenant_id, company_id, branch_id, email, phone, first_name, last_name, hashed_password, is_superadmin, is_active)
            VALUES (%s, %s, %s, 'admin@baithakcafe.com', '9876543210', 'Baithak', 'Admin', %s, TRUE, TRUE)
            ON CONFLICT (tenant_id, email) DO NOTHING;
        """, (tenant_id, company_id, branch_cuh_id, hashed_pwd))
        cur.execute("""
            INSERT INTO users (tenant_id, company_id, branch_id, email, phone, first_name, last_name, hashed_password, is_superadmin, is_active)
            VALUES (%s, %s, %s, 'admin@baithak.com', '9876543210', 'Baithak', 'Admin', %s, TRUE, TRUE)
            ON CONFLICT (tenant_id, email) DO NOTHING;
        """, (tenant_id, company_id, branch_cuh_id, hashed_pwd))
        print("  └─ Admin Users: admin@baithakcafe.com & admin@baithak.com / Password: admin123")

        # 5. Create Menu Categories & Menu Items
        print("[5/6] Seeding Baithak Cafe Menu (Chai, Coffee, Snacks, Burgers, Combos)...")
        categories = [
            ("Special Chai & Tea", "☕"),
            ("Artisanal Coffee", "🥤"),
            ("Quick Bites & Snacks", "🍟"),
            ("Baithak Special Burgers", "🍔"),
            ("Value Combos", "🍱")
        ]
        cat_ids = {}
        for cat_name, icon in categories:
            cur.execute("""
                INSERT INTO menu_categories (tenant_id, branch_id, name, icon)
                VALUES (%s, %s, %s, %s) RETURNING id;
            """, (tenant_id, branch_cuh_id, cat_name, icon))
            cat_ids[cat_name] = cur.fetchone()[0]

        items = [
            (cat_ids["Special Chai & Tea"], "CHAI-001", "Kulhad Masala Chai", 30.00, 10.00),
            (cat_ids["Special Chai & Tea"], "CHAI-002", "Elaichi Special Tea", 25.00, 8.00),
            (cat_ids["Artisanal Coffee"], "COFF-001", "Cold Coffee with Ice Cream", 120.00, 40.00),
            (cat_ids["Artisanal Coffee"], "COFF-002", "Hot Hazelnut Cappuccino", 110.00, 35.00),
            (cat_ids["Quick Bites & Snacks"], "SNK-001", "Peri Peri French Fries", 90.00, 30.00),
            (cat_ids["Quick Bites & Snacks"], "SNK-002", "Cheese Corn Garlic Bread", 130.00, 45.00),
            (cat_ids["Baithak Special Burgers"], "BGR-001", "Baithak Loaded Veggie Burger", 140.00, 50.00),
            (cat_ids["Value Combos"], "CMB-001", "Student Combo (Burger + Fries + Cold Coffee)", 240.00, 90.00)
        ]
        for cat_id, code, name, price, cost in items:
            cur.execute("""
                INSERT INTO menu_items (tenant_id, category_id, item_code, name, price, cost_price, is_available)
                VALUES (%s, %s, %s, %s, %s, %s, TRUE);
            """, (tenant_id, cat_id, code, name, price, cost))

        print(f"  └─ Seeded {len(items)} popular menu items.")

        # 6. Create Dining Tables for CUH and Gurugram
        print("[6/6] Seeding Dining Tables for CUH Mahendragarh & Gurugram Outlets...")
        # CUH Tables: T-1 to T-10
        for i in range(1, 11):
            cur.execute("""
                INSERT INTO dining_tables (tenant_id, branch_id, table_number, seating_capacity, status, section)
                VALUES (%s, %s, %s, 4, 'VACANT', 'CAMPUS_GARDEN');
            """, (tenant_id, branch_cuh_id, f"CUH-T{i}"))

        # Gurugram Tables: G-1 to G-15
        for i in range(1, 16):
            cur.execute("""
                INSERT INTO dining_tables (tenant_id, branch_id, table_number, seating_capacity, status, section)
                VALUES (%s, %s, %s, 4, 'VACANT', 'INDOOR_LOUNGE');
            """, (tenant_id, branch_ggr_id, f"GGR-T{i}"))

        conn.commit()
        print("\n==========================================================")
        print(" SUCCESS: BAITHAK CAFE ONBOARDING COMPLETE!")
        print(" Tenant: Baithak Cafe | Branches: 2 (CUH & Gurugram)")
        print(" Admin Credentials: admin@baithakcafe.com / admin123")
        print("==========================================================")
        conn.close()

    except Exception as e:
        conn.rollback()
        print(f"\n[-] ONBOARDING ERROR: {e}")
        sys.exit(1)

if __name__ == "__main__":
    seed_baithak_cafe()
