"""001_feature_licensing

Revision ID: 001_feature_licensing
Revises: 
Create Date: 2026-07-27 10:25:00.000000

"""
from alembic import op
import sqlalchemy as sqa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_feature_licensing'
down_revision = None
branch_labels = None
depends_on = None

INITIAL_FEATURES = [
    # Core
    {"code": "core", "name": "Core Platform", "category": "core", "is_core": True},
    {"code": "auth", "name": "Authentication & Security", "category": "core", "is_core": True},
    {"code": "settings", "name": "System Settings", "category": "core", "is_core": True},
    # Operations
    {"code": "pos", "name": "Point of Sale (POS)", "category": "operations", "is_core": False},
    {"code": "restaurant", "name": "Restaurant Management", "category": "operations", "is_core": False},
    {"code": "kds", "name": "Kitchen Display System (KDS)", "category": "operations", "is_core": False},
    {"code": "table_management", "name": "Table Management", "category": "operations", "is_core": False},
    # Hotel
    {"code": "hotel_pms", "name": "Property Management System (Hotel PMS)", "category": "hotel", "is_core": False},
    {"code": "reservations", "name": "Reservations & Booking", "category": "hotel", "is_core": False},
    {"code": "revenue_management", "name": "Revenue Management", "category": "hotel", "is_core": False},
    # PG / Hostel
    {"code": "pg_management", "name": "PG / Hostel Management", "category": "hostel", "is_core": False},
    # Inventory & Finance
    {"code": "inventory", "name": "Inventory & Stock Control", "category": "finance", "is_core": False},
    {"code": "billing", "name": "Invoicing & Billing", "category": "finance", "is_core": False},
    {"code": "finance", "name": "Financial Accounting", "category": "finance", "is_core": False},
    {"code": "accounts", "name": "Chart of Accounts", "category": "finance", "is_core": False},
    {"code": "gst_filing", "name": "GST Filing & Tax Compliance", "category": "finance", "is_core": False},
    # CRM & Loyalty
    {"code": "crm", "name": "Customer Relationship Management (CRM)", "category": "crm", "is_core": False},
    {"code": "loyalty", "name": "Loyalty & Rewards Program", "category": "crm", "is_core": False},
    {"code": "marketing", "name": "Marketing Automation", "category": "crm", "is_core": False},
    # HR
    {"code": "hr", "name": "Human Resources (HRMS)", "category": "hr", "is_core": False},
    {"code": "payroll", "name": "Payroll Processing", "category": "hr", "is_core": False},
    {"code": "attendance", "name": "Time & Attendance Tracking", "category": "hr", "is_core": False},
    # AI
    {"code": "ai_copilot", "name": "AI Copilot Assistant", "category": "ai", "is_core": False},
    {"code": "ai_reports", "name": "AI Insights & Reports", "category": "ai", "is_core": False},
    {"code": "ai_forecasting", "name": "AI Demand & Revenue Forecasting", "category": "ai", "is_core": False},
    # Analytics
    {"code": "reports", "name": "Standard Reports", "category": "analytics", "is_core": True},
    {"code": "dashboard", "name": "Executive Dashboard", "category": "analytics", "is_core": True},
    {"code": "analytics", "name": "Advanced Data Analytics", "category": "analytics", "is_core": False},
    # Platform
    {"code": "multi_branch", "name": "Multi-Branch Management", "category": "platform", "is_core": False},
    {"code": "multi_company", "name": "Multi-Company Consolidation", "category": "platform", "is_core": False},
    {"code": "white_label", "name": "White-Label Branding", "category": "platform", "is_core": False},
    {"code": "api_marketplace", "name": "API Marketplace Integrations", "category": "platform", "is_core": False},
    {"code": "vendor_portal", "name": "Vendor Portal", "category": "platform", "is_core": False},
    {"code": "customer_portal", "name": "Customer Self-Service Portal", "category": "platform", "is_core": False},
    # Maintenance
    {"code": "maintenance", "name": "Property Maintenance", "category": "maintenance", "is_core": False},
    {"code": "assets", "name": "Fixed Asset Tracking", "category": "maintenance", "is_core": False},
    {"code": "tasks", "name": "Task & Operations Management", "category": "maintenance", "is_core": False},
]

def upgrade() -> None:
    for feat in INITIAL_FEATURES:
        op.execute(
            f"""
            INSERT INTO feature_master (code, name, category, is_core, is_active, is_deleted, dependencies)
            VALUES ('{feat["code"]}', '{feat["name"]}', '{feat["category"]}', {feat["is_core"]}, true, false, '[]'::jsonb)
            ON CONFLICT (code) DO NOTHING;
            """
        )



def downgrade() -> None:
    op.execute("DELETE FROM feature_master WHERE code IN (" + ", ".join([f"'{f['code']}'" for f in INITIAL_FEATURES]) + ")")
