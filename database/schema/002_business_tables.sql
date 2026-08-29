-- ============================================================
-- SSR ONE AI — MASTER ENTERPRISE BUSINESS & TRANSACTION DDL SCHEMA
-- 100% Normalized Architecture with Zero Table Duplications
-- Single Source of Truth: HRMS (employees), CRM (customers), Finance (invoices)
-- ============================================================

-- ─── 1. HRMS STAFF MASTER (SINGLE SOURCE OF TRUTH FOR ALL STAFF) ───
CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS designations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_id BIGINT,
    branch_id BIGINT,
    employee_code VARCHAR(50) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    designation VARCHAR(100) NOT NULL, -- 'WAITER', 'CAPTAIN', 'CASHIER', 'CHEF', 'MANAGER'
    department VARCHAR(100) NOT NULL,
    is_waiter BOOLEAN DEFAULT FALSE NOT NULL,
    is_cashier BOOLEAN DEFAULT FALSE NOT NULL,
    is_chef BOOLEAN DEFAULT FALSE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    basic_salary NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT uq_tenant_emp_code UNIQUE(tenant_id, employee_code)
);

CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    attendance_date DATE DEFAULT CURRENT_DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'PRESENT' NOT NULL,
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ─── 2. CRM & GUEST MASTER ───
CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_id BIGINT,
    branch_id BIGINT,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    city VARCHAR(100),
    total_orders INT DEFAULT 0,
    total_spent NUMERIC(12,2) DEFAULT 0.00,
    loyalty_points INT DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS crm_leads (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    contact_name VARCHAR(150) NOT NULL,
    company_name VARCHAR(150),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(150),
    lead_source VARCHAR(50),
    status VARCHAR(50) DEFAULT 'NEW' NOT NULL,
    estimated_value NUMERIC(12,2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ─── 3. POS CATALOG MASTER ───
CREATE TABLE IF NOT EXISTS menu_categories (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id BIGINT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT '🍛',
    sort_order INT DEFAULT 0,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_items (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id BIGINT,
    category_id BIGINT REFERENCES menu_categories(id) ON DELETE SET NULL,
    item_code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    base_price NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    selling_price NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    cost_price NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    tax_rate NUMERIC(5,2) DEFAULT 5.00 NOT NULL,
    is_veg BOOLEAN DEFAULT TRUE NOT NULL,
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    kds_station VARCHAR(100) DEFAULT 'Main Kitchen',
    image_url TEXT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_tenant_item_code UNIQUE(tenant_id, item_code)
);

CREATE TABLE IF NOT EXISTS dining_tables (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id BIGINT NOT NULL,
    table_number VARCHAR(20) NOT NULL,
    capacity INT DEFAULT 4 NOT NULL,
    status VARCHAR(20) DEFAULT 'free' NOT NULL, -- 'free', 'occupied', 'billing', 'cleaning'
    floor VARCHAR(50) DEFAULT 'Ground Floor',
    current_order_id BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_tenant_branch_table UNIQUE(tenant_id, branch_id, table_number)
);

CREATE TABLE IF NOT EXISTS kitchen_stations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(30) NOT NULL,
    printer_name VARCHAR(100),
    station_type VARCHAR(50) DEFAULT 'main',
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ─── 4. POS CONSOLIDATED ORDERS & KDS ───
CREATE TABLE IF NOT EXISTS orders (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_id BIGINT,
    branch_id BIGINT NOT NULL,
    fin_year_code VARCHAR(20),
    order_number VARCHAR(50) NOT NULL,
    token_number VARCHAR(20),
    order_type VARCHAR(30) DEFAULT 'dine_in' NOT NULL, -- 'dine_in', 'takeaway', 'delivery', 'room_service'
    status VARCHAR(30) DEFAULT 'draft' NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'unpaid' NOT NULL,
    is_held BOOLEAN DEFAULT FALSE NOT NULL,
    parent_order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,

    -- Single Source of Truth FK references
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    table_id BIGINT REFERENCES dining_tables(id) ON DELETE SET NULL,
    waiter_id BIGINT REFERENCES employees(id) ON DELETE SET NULL, -- FK to HRMS Employees!

    -- Financial Summaries
    subtotal NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    discount_amount NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    taxable_amount NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    cgst_amount NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    sgst_amount NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    total_tax NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    grand_total NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    amount_paid NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    balance_due NUMERIC(12,2) DEFAULT 0.00 NOT NULL,

    notes TEXT,
    special_instructions TEXT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    updated_by BIGINT,
    CONSTRAINT uq_tenant_order_number UNIQUE(tenant_id, order_number)
);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id BIGINT REFERENCES menu_items(id) ON DELETE SET NULL,
    product_name VARCHAR(200) NOT NULL,
    unit_price NUMERIC(12,2) NOT NULL,
    quantity NUMERIC(12,3) DEFAULT 1.000 NOT NULL,
    discount_amount NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    line_total NUMERIC(12,2) NOT NULL,
    kds_status VARCHAR(30) DEFAULT 'pending' NOT NULL,
    modifiers JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS kots (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id BIGINT NOT NULL,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    station_id BIGINT REFERENCES kitchen_stations(id) ON DELETE SET NULL,
    kot_number VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'printed' NOT NULL,
    printed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT REFERENCES employees(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS kot_items (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    kot_id BIGINT NOT NULL REFERENCES kots(id) ON DELETE CASCADE,
    order_item_id BIGINT NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    quantity NUMERIC(12,3) NOT NULL,
    status VARCHAR(30) DEFAULT 'preparing' NOT NULL,
    notes TEXT
);

-- ─── 5. HOTEL PMS ───
CREATE TABLE IF NOT EXISTS hotel_rooms (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id BIGINT,
    room_number VARCHAR(20) NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    rate_per_night NUMERIC(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'VACANT' NOT NULL,
    floor_number INT DEFAULT 1,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_tenant_hotel_room UNIQUE(tenant_id, room_number)
);

CREATE TABLE IF NOT EXISTS hotel_reservations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id BIGINT,
    reservation_code VARCHAR(50) NOT NULL,
    room_id BIGINT REFERENCES hotel_rooms(id) ON DELETE RESTRICT,
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    guest_name VARCHAR(150) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_nights INT DEFAULT 1 NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'CONFIRMED' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ─── 6. INVENTORY & SUPPLY CHAIN ───
CREATE TABLE IF NOT EXISTS inventory_items (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id BIGINT,
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    unit VARCHAR(20) DEFAULT 'PCS' NOT NULL,
    current_stock NUMERIC(12,3) DEFAULT 0.000 NOT NULL,
    min_stock_level NUMERIC(12,3) DEFAULT 10.000 NOT NULL,
    unit_cost NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_tenant_sku UNIQUE(tenant_id, sku)
);

CREATE TABLE IF NOT EXISTS stock_movements (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    item_id BIGINT REFERENCES inventory_items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL, -- IN, OUT, ADJUSTMENT, TRANSFER
    quantity NUMERIC(12,3) NOT NULL,
    reference_no VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ─── 7. FINANCE & BILLING ───
CREATE TABLE IF NOT EXISTS invoices (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id BIGINT NOT NULL,
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL, -- Traceability link to POS order!
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date DATE DEFAULT CURRENT_DATE NOT NULL,
    due_date DATE DEFAULT CURRENT_DATE NOT NULL,
    subtotal NUMERIC(12,2) NOT NULL,
    tax_amount NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    grand_total NUMERIC(12,2) NOT NULL,
    amount_paid NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    balance_due NUMERIC(12,2) DEFAULT 0.00 NOT NULL,
    status VARCHAR(50) DEFAULT 'UNPAID' NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_tenant_invoice_number UNIQUE(tenant_id, invoice_number)
);

CREATE TABLE IF NOT EXISTS invoice_payments (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    payment_date DATE DEFAULT CURRENT_DATE NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    reference_number VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT REFERENCES employees(id) ON DELETE SET NULL
);

-- ─── 8. PG HOSTEL MANAGEMENT ───
CREATE TABLE IF NOT EXISTS pg_properties (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    property_name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    total_rooms INT DEFAULT 10 NOT NULL,
    total_beds INT DEFAULT 20 NOT NULL,
    monthly_rent_per_bed NUMERIC(12,2) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS pg_beds (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    property_id BIGINT REFERENCES pg_properties(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    bed_number VARCHAR(20) NOT NULL,
    monthly_rent NUMERIC(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'VACANT' NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);
