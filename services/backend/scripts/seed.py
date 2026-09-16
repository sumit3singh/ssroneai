"""
The ssrone – Database Seed Script
Creates default tenant, company, branch, roles, and admin user for development.

Usage:
    python scripts/seed.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.core.database.engine import AsyncSessionLocal, engine, Base
from src.modules.auth.models import (
    Tenant, User, Role, UserRole,
    FeatureMaster, FeatureLicense, FileMasterERP,
)
from src.modules.auth.service import auth_service
from src.shared.logger import configure_logging, get_logger

# Import every module's models so Base.metadata knows about all tables
from src.ai.copilot.models import AIConversation, AIMessage, AIPromptTemplate  # noqa: F401
from src.modules.billing.models import Invoice, InvoiceItem, InvoicePayment  # noqa: F401
from src.modules.crm.models import Campaign, Customer, CustomerInteraction, LoyaltyTransaction  # noqa: F401
from src.modules.hotel.models import Guest, Reservation, Room, RoomType  # noqa: F401
from src.modules.hrms.models import (  # noqa: F401
    AttendanceRecord, Department, Designation, Employee,
    LeaveRequest, LeaveType, Payslip, PayrollRun, Shift,
)
from src.modules.inventory.models import (  # noqa: F401
    Product, ProductCategory, StockEntry, StockMovement,
)
from src.modules.orders.models import Order, OrderItem, OrderPayment  # noqa: F401
from src.modules.pg_management.models import (  # noqa: F401
    PGBed, PGFloor, PGRentRecord, PGResident, PGRoom, PGVisitorLog,
)
from src.modules.auth.models import Company, Branch  # noqa: F401
from src.modules.restaurant.models import (  # noqa: F401
    MenuCategory, MenuItem, MenuVariantGroup, MenuVariantOption, MenuAddonGroup, MenuAddonOption,
)
from src.engines.form_builder.models import (  # noqa: F401
    FormMaster, FormFieldModel, FieldValidationModel, FormSubmission,
)

configure_logging()
logger = get_logger("seed")


def _reset_public_schema(sync_conn) -> None:
    """Drop and recreate the public schema to avoid stale table/column mismatch."""
    sync_conn.exec_driver_sql("DROP SCHEMA IF EXISTS public CASCADE")
    sync_conn.exec_driver_sql("CREATE SCHEMA public")


async def create_tables(reset: bool = False):
    """Create all tables, optionally rebuilding the schema from scratch."""
    async with engine.begin() as conn:
        if reset:
            await conn.run_sync(_reset_public_schema)
            logger.info("🧹 Existing database schema dropped")
        await conn.run_sync(Base.metadata.create_all)
    logger.info("✅ Database tables created")


async def seed():
    async with AsyncSessionLocal() as db:
        # Check if already seeded
        from sqlalchemy import select, text
        result = await db.execute(select(Tenant).where(Tenant.slug == "ssrone-demo"))
        if result.scalar_one_or_none():
            logger.info("⚠️  Database already seeded. Skipping.")
            return

        # ── Feature Master ──────────────────────────────────────
        features = [
            ("core", "Core Platform", "platform"),
            ("auth", "Authentication", "platform"),
            ("pos", "Point of Sale", "operations"),
            ("restaurant", "Restaurant Management", "operations"),
            ("kds", "Kitchen Display System", "operations"),
            ("hotel_pms", "Hotel Property Management", "operations"),
            ("reservations", "Reservations", "operations"),
            ("pg_management", "PG / Hostel Management", "operations"),
            ("inventory", "Inventory Management", "supply_chain"),
            ("billing", "Billing & Invoicing", "finance"),
            ("finance", "Finance & Accounting", "finance"),
            ("crm", "Customer Relationship Management", "crm"),
            ("loyalty", "Loyalty & Rewards", "crm"),
            ("hr", "Human Resources", "hr"),
            ("payroll", "Payroll", "hr"),
            ("ai_copilot", "AI Copilot", "ai"),
            ("reports", "Reports & Analytics", "analytics"),
            ("dashboard", "Dashboard Builder", "analytics"),
            ("multi_branch", "Multi-Branch Management", "platform"),
        ]
        for code, name, category in features:
            fm = FeatureMaster(
                code=code, name=name, category=category,
                is_core=(code in ("core", "auth")), is_active=True
            )
            db.add(fm)
        await db.flush()
        logger.info("✅ Feature master seeded")

        # ── Demo Tenant ─────────────────────────────────────────
        tenant = Tenant(
            name="The ssrone Demo",
            slug="ssrone-demo",
            plan="enterprise",
            is_active=True,
            settings={
                "currency": "INR",
                "timezone": "Asia/Kolkata",
                "date_format": "DD/MM/YYYY",
                "fiscal_year_start": "04-01",
            },
            theme={
                "primary": "#1A3C34",
                "accent": "#E67E22",
                "background": "#F8F5F1",
            },
        )
        db.add(tenant)
        await db.flush()
        logger.info("✅ Demo tenant created", tenant_id=str(tenant.id))

        # ── Default Company & Branch ────────────────────────────
        company = Company(
            tenant_id=tenant.id,
            name="The ssrone Demo Restaurant",
            legal_name="The ssrone Hospitality Pvt Ltd",
            gstin="29ABCDE1234F1Z5",
            pan="ABCDE1234F",
            country_code="IN",
            currency_code="INR",
            business_type="restaurant",
            is_active=True,
            address={
                "line1": "123 MG Road",
                "city": "Bengaluru",
                "state": "Karnataka",
                "pincode": "560001",
                "country": "India",
            },
        )
        db.add(company)
        await db.flush()
        logger.info("✅ Demo company created", company_id=str(company.id))

        branch = Branch(
            tenant_id=tenant.id,
            company_id=company.id,
            name="Main Branch - MG Road",
            code="MAIN",
            branch_type="outlet",
            phone="+91-9876543210",
            email="mainbranch@ssrone.com",
            gstin="29ABCDE1234F1Z5",
            timezone="Asia/Kolkata",
            is_active=True,
            address={
                "line1": "123 MG Road",
                "city": "Bengaluru",
                "state": "Karnataka",
                "pincode": "560001",
            },
        )
        db.add(branch)
        await db.flush()
        logger.info("✅ Demo branch created", branch_id=str(branch.id))

        # ── Default Roles ───────────────────────────────────────
        roles_data = [
            ("Super Admin", "super_admin", {"*": ["*"]}),
            ("Owner", "owner", {"all": ["read", "write", "delete"]}),
            ("Manager", "manager", {"orders": ["read", "write"], "reports": ["read"]}),
            ("Cashier", "cashier", {"orders": ["read", "write"], "billing": ["read", "write"]}),
            ("Receptionist", "receptionist", {"reservations": ["read", "write"]}),
            ("Kitchen Staff", "kitchen_staff", {"orders": ["read"], "kds": ["read", "write"]}),
        ]
        created_roles = {}
        for name, code, perms in roles_data:
            role = Role(
                tenant_id=tenant.id,
                name=name,
                code=code,
                permissions=perms,
                is_system_role=True,
            )
            db.add(role)
            created_roles[code] = role
        await db.flush()
        logger.info("✅ Default roles created")

        # ── Admin User ──────────────────────────────────────────
        admin = User(
            tenant_id=tenant.id,
            email="admin@ssrone.com",
            first_name="Platform",
            last_name="Admin",
            display_name="The ssrone Admin",
            hashed_password=auth_service.hash_password("Admin@123"),
            is_active=True,
            is_verified=True,
            is_superadmin=True,
        )
        db.add(admin)
        await db.flush()

        # Assign super_admin role
        admin_role_link = UserRole(
            tenant_id=tenant.id,
            user_id=admin.id,
            role_id=created_roles["super_admin"].id,
            company_id=company.id,
            branch_id=branch.id,
        )
        db.add(admin_role_link)

        # ── Manager User ────────────────────────────────────────
        manager = User(
            tenant_id=tenant.id,
            email="manager@ssrone.com",
            first_name="Demo",
            last_name="Manager",
            hashed_password=auth_service.hash_password("Manager@123"),
            is_active=True,
            is_verified=True,
        )
        db.add(manager)
        await db.flush()

        manager_role_link = UserRole(
            tenant_id=tenant.id,
            user_id=manager.id,
            role_id=created_roles["manager"].id,
            company_id=company.id,
            branch_id=branch.id,
        )
        db.add(manager_role_link)

        # ── Cashier User ─────────────────────────────────────────
        cashier = User(
            tenant_id=tenant.id,
            email="cashier@ssrone.com",
            first_name="Demo",
            last_name="Cashier",
            hashed_password=auth_service.hash_password("Cashier@123"),
            is_active=True,
            is_verified=True,
        )
        db.add(cashier)
        await db.flush()

        cashier_role_link = UserRole(
            tenant_id=tenant.id,
            user_id=cashier.id,
            role_id=created_roles["cashier"].id,
            company_id=company.id,
            branch_id=branch.id,
        )
        db.add(cashier_role_link)

        # ── Feature Licenses ────────────────
        licensed_features = [
            "pos", "restaurant", "hotel_pms", "pg_management", "inventory",
            "crm", "billing", "finance", "hr", "payroll", "ai_copilot", "reports", "dashboard"
        ]
        for feat in licensed_features:
            lic = FeatureLicense(
                tenant_id=tenant.id,
                feature_code=feat,
                is_active=True,
                expires_at=None,
                max_users=10,
                max_branches=5,
            )
            db.add(lic)
        await db.flush()
        logger.info("✅ Feature licenses seeded")

        menu_items = [
            # Core Modules
            ("dashboard", "Dashboard", "/", "LayoutDashboard", "core", None, 10, None, "dashboard", None),
            ("pos", "POS Restaurant", "/pos", "ShoppingCart", "core", None, 20, "orders:write", "pos", None),
            ("hotel", "Hotel PMS", "/hotel", "Hotel", "core", None, 30, "reservations:read", "hotel_pms", None),
            ("pg", "PG Management", "/pg", "Home", "core", None, 40, "billing:read", "pg_management", None),
            ("restaurant_management", "Sweet Shop & Bakery", "/restaurant", "Utensils", "core", None, 50, "orders:read", "restaurant", None),
            ("inventory", "Inventory", "/inventory", "Package", "core", None, 60, "inventory:read", "inventory", None),
            ("crm", "CRM & Loyalty", "/crm", "Users", "core", None, 70, "crm:read", "crm", None),
            ("reservations", "Reservations", "/reservations", "Building2", "core", None, 80, "reservations:read", "reservations", None),
            ("finance", "Finance & Accounting", "/finance", "DollarSign", "core", None, 90, "finance:read", "finance", None),
            ("hr", "HR & Payroll", "/hr", "UserCheck", "core", None, 100, "hr:read", "hr", None),
            ("reports", "Reports & Analytics", "/reports", "BarChart3", "core", None, 110, "reports:read", "reports", None),

            # Sub-items for Hotel PMS
            ("hotel_room_setup", "Room Configuration Setup", "/hotel/rooms", "Settings", "core", "hotel", 1, "reservations:read", "hotel_pms", "master"),
            ("hotel_guest_setup", "Guest Profiles Setup", "/hotel/guests", "User", "core", "hotel", 2, "reservations:read", "hotel_pms", "master"),
            ("hotel_reservations", "Reservations & Booking", "/hotel/reservations", "Calendar", "core", "hotel", 3, "reservations:read", "hotel_pms", "transaction"),
            ("hotel_checkout", "Billing & Room Checkout", "/hotel/checkout", "DollarSign", "core", "hotel", 4, "reservations:read", "hotel_pms", "transaction"),
            ("hotel_occupancy_report", "Occupancy & Revenue List", "/hotel/occupancy-report", "Activity", "core", "hotel", 5, "reservations:read", "hotel_pms", "report"),

            # Sub-items for POS Restaurant
            ("pos_category_setup", "Menu Category Setup", "/pos/categories", "Settings", "core", "pos", 1, "orders:write", "pos", "master"),
            ("pos_menu_setup", "Dish Item Configuration", "/pos/menu-items", "Utensils", "core", "pos", 2, "orders:write", "pos", "master"),
            ("pos_counter", "Quick POS Billing", "/pos/counter", "ShoppingCart", "core", "pos", 3, "orders:write", "pos", "transaction"),
            ("pos_sales_report", "Daily Sales Register", "/pos/sales-report", "BarChart3", "core", "pos", 4, "orders:write", "pos", "report"),

            # Sub-items for PG Management
            ("pg_bed_setup", "Bed & Room Configuration", "/pg/beds", "Home", "core", "pg", 1, "billing:read", "pg_management", "master"),
            ("pg_resident_setup", "Resident Details Setup", "/pg/residents", "User", "core", "pg", 2, "billing:read", "pg_management", "master"),
            ("pg_rent_collect", "Rent Posting & Receipts", "/pg/rent", "DollarSign", "core", "pg", 3, "billing:read", "pg_management", "transaction"),
            ("pg_ledger_report", "Resident Account Ledger", "/pg/ledger", "Activity", "core", "pg", 4, "billing:read", "pg_management", "report"),

            # Sub-items for Inventory
            ("inventory_item_setup", "Product & Material Master", "/inventory/items", "Settings", "core", "inventory", 1, "inventory:read", "inventory", "master"),
            ("inventory_vendor_setup", "Vendor Setup Profiles", "/inventory/vendors", "Users", "core", "inventory", 2, "inventory:read", "inventory", "master"),
            ("inventory_inward", "Stock Adjustment Entry", "/inventory/adjustment", "Package", "core", "inventory", 3, "inventory:read", "inventory", "transaction"),
            ("inventory_ledger_report", "Stock Ledger Register", "/inventory/ledger-report", "BarChart3", "core", "inventory", 4, "inventory:read", "inventory", "report"),

            # Sub-items for Finance
            ("finance_chart_setup", "Chart of Accounts Setup", "/finance/chart", "Settings", "core", "finance", 1, "finance:read", "finance", "master"),
            ("finance_journal_entry", "Journal Voucher Entry", "/finance/journal", "FormInput", "core", "finance", 2, "finance:read", "finance", "transaction"),
            ("finance_pl_report", "Profit & Loss Ledger", "/finance/profit-loss", "BarChart3", "core", "finance", 3, "finance:read", "finance", "report"),

            # Sub-items for HR & Payroll
            ("hr_employee_setup", "Employee Contract Setup", "/hr/employees", "User", "core", "hr", 1, "hr:read", "hr", "master"),
            ("hr_attendance_entry", "Monthly Attendance Logs", "/hr/attendance", "Calendar", "core", "hr", 2, "hr:read", "hr", "transaction"),
            ("hr_payroll_run", "Execute Monthly Payroll", "/hr/payroll-run", "DollarSign", "core", "hr", 3, "hr:read", "hr", "transaction"),
            ("hr_payslip_report", "Payroll register reports", "/hr/payslips", "Activity", "core", "hr", 4, "hr:read", "hr", "report"),

            # Platform Modules
            ("ai", "AI Assistant (B-Thak AI)", "/ai", "Bot", "platform", None, 120, "ai_copilot:read", "ai_copilot", None),
            ("workflow", "Workflow & Approvals", "/workflow", "Award", "platform", None, 130, "all:read", "core", None),
            ("communication", "Communication Center", "/communication", "Bell", "platform", None, 140, "all:read", "core", None),
            ("forms", "Form Builder", "/forms/guest_registration", "FormInput", "platform", None, 150, "all:read", "core", None),
            ("platform_studio", "Platform Studio", "/platform-studio", "Settings", "platform", None, 160, "all:read", "core", None),
            ("master_studio", "Master Data Studio", "/master-studio", "LayoutGrid", "platform", None, 165, "all:read", "core", "master"),
            ("settings", "Settings & Configurations", "/settings", "Settings", "platform", None, 170, "all:read", "core", None),
            ("project_tracker", "Project Development", "/project-tracker", "Activity", "platform", None, 180, "all:read", "core", None),

            # Connected Apps
            ("apps_food", "Customer Food Web", "/apps/food", "Globe", "connected", None, 190, None, "customer_portal", None),
            ("apps_stay", "Customer Stay Web", "/apps/stay", "Globe", "connected", None, 200, None, "customer_portal", None),
            ("apps_kds", "Kitchen Display (KDS)", "/apps/kds", "ChefHat", "connected", None, 210, "kds:read", "kds", None),
            ("apps_staff", "Staff Portal", "/apps/staff", "Briefcase", "connected", None, 220, "hr:read", "core", None),
            ("apps_mobile", "Guest Mobile App", "/apps/mobile", "Smartphone", "connected", None, 230, None, "customer_portal", None),
        ]

        for code, label, href, icon, category, parent, sort_order, required_perm, required_feat, menu_type in menu_items:
            me = FileMasterERP(
                tenant_id=tenant.id,
                company_id=company.id,
                branch_id=branch.id,
                code=code,
                label=label,
                href=href,
                icon=icon,
                category=category,
                parent_code=parent,
                sort_order=sort_order,
                required_permission=required_perm,
                required_feature=required_feat,
                type=menu_type,
                is_active=True
            )
            db.add(me)
        await db.flush()
        logger.info("✅ ERP menu definitions seeded")

        # ── Form Builder Metadata ────────────────────────────────
        customer_form = FormMaster(
            form_key="customer_registration",
            title="Customer Registration Form",
            description="Dynamic form to register new customers across branches.",
            submit_label="Register Customer",
            is_active=True,
        )
        db.add(customer_form)
        await db.flush()

        fields_data = [
            ("first_name", "First Name", "text", "Enter first name", True, 10, "basic", "default", "half"),
            ("last_name", "Last Name", "text", "Enter last name", True, 20, "basic", "default", "half"),
            ("email", "Email Address", "email", "name@example.com", True, 30, "basic", "default", "half"),
            ("phone", "Phone Number", "phone", "+91 99999 99999", True, 40, "basic", "default", "half"),
            ("gstin", "GSTIN (GST Number)", "gstin", "22AAAAA1111A1Z1", False, 50, "business", "tax_info", "full"),
            ("pincode", "PIN Code", "pincode", "6 digits", False, 60, "business", "address_info", "half"),
            ("notes", "Notes", "textarea", "Additional details", False, 70, "business", "additional_info", "full"),
        ]

        for name, label, type_, placeholder, req, order, tab, sec, width in fields_data:
            field_model = FormFieldModel(
                form_id=customer_form.id,
                field_name=name,
                field_label=label,
                field_type=type_,
                placeholder=placeholder,
                is_required=req,
                sort_order=order,
                tab=tab,
                section=sec,
                width=width,
            )
            db.add(field_model)
            await db.flush()

            # Add validation helper defaults for email, phone, pincode, gstin
            if type_ in ("email", "phone", "gstin", "pincode"):
                val_model = FieldValidationModel(
                    field_id=field_model.id,
                )
                db.add(val_model)

        # ── Finance Chart of Accounts Seed ────────────────────────
        from src.modules.finance.models import ChartOfAccounts
        coa_items = [
            ("1000", "Cash & Cash Equivalents", "asset", Decimal("125000.00")),
            ("1100", "Accounts Receivable", "asset", Decimal("45000.00")),
            ("2000", "Accounts Payable", "liability", Decimal("18000.00")),
            ("3000", "Owner Capital", "equity", Decimal("500000.00")),
            ("4000", "Food & Beverage Revenue", "revenue", Decimal("350000.00")),
            ("5000", "Salaries & Wages Expense", "expense", Decimal("95000.00")),
            ("5100", "Electricity & Utilities Expense", "expense", Decimal("18000.00")),
        ]
        for code, name, type_, bal in coa_items:
            acc = ChartOfAccounts(
                tenant_id=tenant.id,
                account_code=code,
                account_name=name,
                account_type=type_,
                current_balance=bal,
                is_active=True,
                is_system=True,
            )
            db.add(acc)

        # ── Hotel Rooms & Types Seed ─────────────────────────────
        from src.modules.hotel.models import RoomType, Room
        rt1 = RoomType(tenant_id=tenant.id, name="Deluxe King Room", code="DELUXE", base_rate=Decimal("3500.00"), max_occupancy=2)
        rt2 = RoomType(tenant_id=tenant.id, name="Executive Suite", code="SUITE", base_rate=Decimal("7500.00"), max_occupancy=4)
        db.add(rt1)
        db.add(rt2)
        await db.flush()

        r1 = Room(tenant_id=tenant.id, room_type_id=rt1.id, room_number="101", floor_number=1, status="VACANT", is_clean=True)
        r2 = Room(tenant_id=tenant.id, room_type_id=rt2.id, room_number="201", floor_number=2, status="OCCUPIED", is_clean=True)
        db.add(r1)
        db.add(r2)

        # ── PG Management Beds Seed ──────────────────────────────
        from src.modules.pg_management.models import PGFloor, PGRoom, PGBed, PGResident
        pg_fl = PGFloor(tenant_id=tenant.id, floor_number=1, name="First Floor Boys Wing")
        db.add(pg_fl)
        await db.flush()

        pg_rm = PGRoom(tenant_id=tenant.id, floor_id=pg_fl.id, room_number="G-101", sharing_type="DOUBLE", monthly_rent_per_bed=Decimal("8500.00"))
        db.add(pg_rm)
        await db.flush()

        b1 = PGBed(tenant_id=tenant.id, room_id=pg_rm.id, bed_number="Bed-A", monthly_rent=Decimal("8500.00"), status="OCCUPIED")
        b2 = PGBed(tenant_id=tenant.id, room_id=pg_rm.id, bed_number="Bed-B", monthly_rent=Decimal("8500.00"), status="VACANT")
        db.add(b1)
        db.add(b2)
        await db.flush()

        res1 = PGResident(tenant_id=tenant.id, bed_id=b1.id, full_name="Rahul Sharma", phone="+91-9876543210", email="rahul@example.com", is_active=True)
        db.add(res1)

        # ── CRM Customers Seed ──────────────────────────────────
        from src.modules.crm.models import Customer
        c1 = Customer(tenant_id=tenant.id, name="Ananya Gupta", phone="+91-9988776655", email="ananya@example.com", loyalty_points=250, loyalty_tier="Gold")
        c2 = Customer(tenant_id=tenant.id, name="Vikram Singh", phone="+91-8877665544", email="vikram@example.com", loyalty_points=120, loyalty_tier="Silver")
        db.add(c1)
        db.add(c2)

        # ── HRMS Employees & Departments Seed ────────────────────
        from src.modules.hrms.models import Department, Designation, Employee
        d1 = Department(tenant_id=tenant.id, name="Kitchen & Operations", code="KITCHEN")
        d2 = Department(tenant_id=tenant.id, name="Front Office & PMS", code="FRONTDESK")
        db.add(d1)
        db.add(d2)
        await db.flush()

        des1 = Designation(tenant_id=tenant.id, department_id=d1.id, title="Head Chef", grade="G-4")
        des2 = Designation(tenant_id=tenant.id, department_id=d2.id, title="Front Desk Executive", grade="G-2")
        db.add(des1)
        db.add(des2)
        await db.flush()

        emp1 = Employee(tenant_id=tenant.id, department_id=d1.id, designation_id=des1.id, employee_code="EMP-101", first_name="Suresh", last_name="Kumar", email="suresh@ssrone.com", basic_salary=Decimal("45000.00"), status="ACTIVE")
        emp2 = Employee(tenant_id=tenant.id, department_id=d2.id, designation_id=des2.id, employee_code="EMP-102", first_name="Priya", last_name="Verma", email="priya@ssrone.com", basic_salary=Decimal("32000.00"), status="ACTIVE")
        db.add(emp1)
        db.add(emp2)

        # ── POS Menu Categories & Dishes Seed ─────────────────────
        cat_tea = MenuCategory(tenant_id=tenant.id, company_id=company.id, branch_id=branch.id, name="Special Chai & Tea", icon="🫖", slug="special-chai-tea", sort_order=1)
        cat_coffee = MenuCategory(tenant_id=tenant.id, company_id=company.id, branch_id=branch.id, name="Artisanal Coffee", icon="🥤", slug="artisanal-coffee", sort_order=2)
        cat_pizza = MenuCategory(tenant_id=tenant.id, company_id=company.id, branch_id=branch.id, name="Pizzas & Garlic Bread", icon="🍕", slug="pizzas-garlic-bread", sort_order=3)
        cat_combos = MenuCategory(tenant_id=tenant.id, company_id=company.id, branch_id=branch.id, name="Value Combos", icon="🍱", slug="value-combos", sort_order=4)

        db.add_all([cat_tea, cat_coffee, cat_pizza, cat_combos])
        await db.flush()

        item_chai = MenuItem(
            tenant_id=tenant.id, company_id=company.id, branch_id=branch.id,
            category_id=cat_tea.id, name="Baithak Special Kulhad Chai",
            description="Freshly brewed ginger and cardamom tea served in authentic earthen kulhad.",
            base_price=30.0, packaging_charge=5.0, kds_station="Beverages & Bar",
            is_veg=True, is_popular=True, is_available=True, gst_percent=5.0, sort_order=1
        )
        item_coffee = MenuItem(
            tenant_id=tenant.id, company_id=company.id, branch_id=branch.id,
            category_id=cat_coffee.id, name="Artisanal Cold Brew Coffee",
            description="Steeped overnight, rich Arabica cold coffee blend served over ice.",
            base_price=120.0, packaging_charge=10.0, kds_station="Beverages & Bar",
            is_veg=True, is_popular=True, is_available=True, gst_percent=5.0, sort_order=2
        )
        item_pizza = MenuItem(
            tenant_id=tenant.id, company_id=company.id, branch_id=branch.id,
            category_id=cat_pizza.id, name="Cheese Loaded Farmhouse Pizza",
            description="Fresh dough pizza loaded with capsicum, onion, tomato, jalapenos, and mozzarella.",
            base_price=180.0, packaging_charge=15.0, kds_station="Main Kitchen",
            is_veg=True, is_popular=True, is_available=True, gst_percent=5.0, sort_order=3
        )
        db.add_all([item_chai, item_coffee, item_pizza])
        await db.flush()

        # Pizza Size Variant Group & Options
        vg_pizza = MenuVariantGroup(
            tenant_id=tenant.id, branch_id=branch.id, item_id=item_pizza.id,
            name="Pizza Size", min_selection=1, max_selection=1, is_required=True, sort_order=1
        )
        db.add(vg_pizza)
        await db.flush()

        opt_sm = MenuVariantOption(tenant_id=tenant.id, branch_id=branch.id, group_id=vg_pizza.id, name="Small (7\")", selling_price=150.0, price=150.0, is_default=False, sort_order=1)
        opt_md = MenuVariantOption(tenant_id=tenant.id, branch_id=branch.id, group_id=vg_pizza.id, name="Medium (10\")", selling_price=180.0, price=180.0, is_default=True, sort_order=2)
        opt_lg = MenuVariantOption(tenant_id=tenant.id, branch_id=branch.id, group_id=vg_pizza.id, name="Large (12\")", selling_price=230.0, price=230.0, is_default=False, sort_order=3)
        db.add_all([opt_sm, opt_md, opt_lg])

        # Pizza Addon Group
        ag_crust = MenuAddonGroup(
            tenant_id=tenant.id, branch_id=branch.id, item_id=item_pizza.id,
            name="Crust Upgrade & Addons", min_selection=0, max_selection=5, sort_order=1
        )
        db.add(ag_crust)
        await db.flush()

        ao_cheese = MenuAddonOption(
            tenant_id=tenant.id, branch_id=branch.id, group_id=ag_crust.id,
            name="Cheese Burst Crust", price=80.0,
            variant_prices={"Small (7\")": 50.0, "Medium (10\")": 80.0, "Large (12\")": 100.0},
            is_available=True, sort_order=1
        )
        db.add(ao_cheese)

        await db.commit()

        logger.info("=" * 55)
        logger.info("✅ DATABASE SEEDED SUCCESSFULLY!")
        logger.info("=" * 55)
        logger.info("Tenant Slug : ssrone-demo")
        logger.info(f"Branch ID   : {branch.id}")
        logger.info("Admin Email : admin@ssrone.com")
        logger.info("Admin Pass  : Admin@123")
        logger.info("Manager     : manager@ssrone.com / Manager@123")
        logger.info("Cashier     : cashier@ssrone.com / Cashier@123")
        logger.info("=" * 55)
        logger.info("NOTE: Copy the Branch ID above into frontend demo")
        logger.info("calls (e.g. POS checkout) if you wire up live data.")
        logger.info("=" * 55)


async def main():
    await create_tables(reset=True)
    await seed()
    
    try:
        rls_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "migrations", "rls.sql")
        with open(rls_path, "r", encoding="utf-8") as f:
            rls_sql = f.read()
        
        async with engine.begin() as conn:
            raw_conn = await conn.get_raw_connection()
            await raw_conn.driver_connection.execute(rls_sql)
        logger.info("✅ Database Row-Level Security (RLS) policies applied successfully.")
    except Exception as e:
        logger.error(f"❌ Failed to apply RLS policies: {e}")


if __name__ == "__main__":
    asyncio.run(main())
