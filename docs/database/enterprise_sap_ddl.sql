-- ===========================================================================
-- THE BAITHAK – WORLD-CLASS HOSPITALITY PLATFORM
-- Master Database DDL (SAP-Grade Multi-Tenant & Multi-Unit SaaS Architecture)
-- Target Engine: PostgreSQL 16+
-- ===========================================================================

-- All ID columns use BIGINT (auto-incrementing via BIGSERIAL)

-- ===========================================================================
-- PART 1: CORE SAAS & IDENTITY GOVERNANCE
-- ===========================================================================

-- 1. Tenants Table (Global SaaS Customers)
CREATE TABLE tenants (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(100) UNIQUE NOT NULL,
    custom_domain VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, suspended, trial
    logo_url TEXT,
    primary_color VARCHAR(10) DEFAULT '#1A3C34',
    secondary_color VARCHAR(10) DEFAULT '#E67E22',
    is_whitelabel BOOLEAN NOT NULL DEFAULT false,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);
CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);

-- 2. Units / Branches Table (Tenant Outlets, e.g. Noida Branch, Delhi CP)
CREATE TABLE units (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL, -- e.g. NOIDA62
    address TEXT NOT NULL,
    gstin VARCHAR(15), -- India specific tax identifier
    timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Kolkata',
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT,
    
    UNIQUE(tenant_id, code)
);
CREATE INDEX idx_units_tenant_id ON units(tenant_id);

-- 3. Users Table (Multi-Tenant Users Database)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100),
    phone VARCHAR(20),
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- active, inactive
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMPTZ,
    deleted_by BIGINT
);
CREATE INDEX idx_users_tenant_id ON users(tenant_id);

-- 4. Roles Table (Dynamic RBAC)
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- Superadmin, Manager, Chef, Waiter, FrontDesk
    description VARCHAR(255),
    is_system BOOLEAN NOT NULL DEFAULT false, -- If true, cannot be modified
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    
    UNIQUE(tenant_id, name)
);

-- 5. User Roles Mapping (Maps users to roles inside tenants & units)
CREATE TABLE user_roles (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    unit_id BIGINT REFERENCES units(id) ON DELETE SET NULL, -- Null if role applies globally to tenant
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    
    UNIQUE(user_id, role_id, unit_id)
);

-- 6. Feature Licenses Table (Feature Activation Rules)
CREATE TABLE feature_licenses (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    module_key VARCHAR(100) NOT NULL, -- pos, pms, crm, finance, hrms
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    expires_at TIMESTAMPTZ,
    quota_limit JSONB, -- e.g. {"max_rooms": 50, "max_branches": 2}
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by BIGINT,
    
    UNIQUE(tenant_id, module_key)
);

-- ===========================================================================
-- PART 2: DYNAMIC CONFIGURATION & METADATA ENGINES  
-- ===========================================================================

-- 7. Master LOVs Table (Dropdown value definitions)
CREATE TABLE lov_masters (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL, -- loyalty_tier, room_type, product_category
    label VARCHAR(150) NOT NULL, -- Deluxe Room, VIP Tier
    value VARCHAR(100) NOT NULL, -- deluxe, vip
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by BIGINT,
    
    UNIQUE(tenant_id, category, value)
);
CREATE INDEX idx_lov_category ON lov_masters(tenant_id, category);

-- 8. Dynamic Form Masters (Database-driven Form Schemas)
CREATE TABLE form_masters (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    form_key VARCHAR(100) NOT NULL, -- guest_registration, crm_onboard
    title VARCHAR(200) NOT NULL,
    description TEXT,
    submit_label VARCHAR(100) DEFAULT 'Submit',
    tabs VARCHAR(100)[] NOT NULL, -- Array of tab keys: ['basic', 'membership']
    sections VARCHAR(100)[] NOT NULL, -- Array of sections: ['personal', 'stay']
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by BIGINT,
    
    UNIQUE(tenant_id, form_key)
);

-- 9. Dynamic Form Fields (Metadata definitions for inputs)
CREATE TABLE field_masters (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    form_id BIGINT NOT NULL REFERENCES form_masters(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. first_name, allergy_list
    label VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL, -- text, number, select, checkbox, textarea
    placeholder VARCHAR(200),
    default_value VARCHAR(255),
    is_required BOOLEAN NOT NULL DEFAULT false,
    is_readonly BOOLEAN NOT NULL DEFAULT false,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    section_key VARCHAR(100) NOT NULL,
    tab_key VARCHAR(100) NOT NULL,
    width VARCHAR(50) DEFAULT 'full', -- full, half, third
    help_text TEXT,
    validation_regex VARCHAR(255),
    validation_message TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by BIGINT,
    
    UNIQUE(form_id, name)
);

-- 10. Dynamic Form Submissions (Reports Database)
CREATE TABLE form_submissions (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    unit_id BIGINT REFERENCES units(id) ON DELETE SET NULL,
    form_key VARCHAR(100) NOT NULL,
    data JSONB NOT NULL, -- Schema-less submitted key-value inputs
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT
);
CREATE INDEX idx_form_sub_key ON form_submissions(tenant_id, form_key);

-- 11. Workflow Templates (Visual Workflow configurations)
CREATE TABLE workflow_templates (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    trigger_event VARCHAR(150) NOT NULL, -- PurchaseOrderCreated, BigDiscountRequest
    steps VARCHAR(255)[] NOT NULL, -- Sequential stage labels
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by BIGINT
);

-- 12. Workflow Requests (Active Workflow instances)
CREATE TABLE workflow_requests (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    unit_id BIGINT REFERENCES units(id) ON DELETE SET NULL,
    workflow_id BIGINT REFERENCES workflow_templates(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    current_step INTEGER DEFAULT 0,
    steps VARCHAR(255)[] NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, approved, rejected
    requester VARCHAR(150) NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by BIGINT
);

-- 13. Workflow Actions Log (Comments, approvals and history)
CREATE TABLE workflow_actions (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    request_id BIGINT NOT NULL REFERENCES workflow_requests(id) ON DELETE CASCADE,
    author VARCHAR(150) NOT NULL,
    action_taken VARCHAR(50) NOT NULL, -- APPROVED, REJECTED, ESCALATED
    comments TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 14. Communication Templates
CREATE TABLE communication_templates (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    channel VARCHAR(50) NOT NULL, -- WhatsApp, Email, SMS
    subject VARCHAR(255), -- Email only
    content TEXT NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by BIGINT,
    
    UNIQUE(tenant_id, name)
);

-- 15. Communication Logs (Transmission audit trail)
CREATE TABLE communication_logs (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    unit_id BIGINT REFERENCES units(id) ON DELETE SET NULL,
    template_name VARCHAR(255) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    recipient VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Sent', -- Sent, Delivered, Failed
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================================================
-- PART 3: HOSPITALITY MASTER DATA MANAGEMENT (MDM)
-- ===========================================================================

-- 16. Product Categories (Master menu & item departments)
CREATE TABLE product_categories (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL, -- Starters, Main Course, Breads
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    
    UNIQUE(tenant_id, name)
);

-- 17. Products (Unified POS sellables)
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES product_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL, -- e.g. SKU01
    barcode VARCHAR(100),
    mrp DECIMAL(12,2) NOT NULL,
    selling_price DECIMAL(12,2) NOT NULL,
    cost_price DECIMAL(12,2) NOT NULL,
    unit_of_measure VARCHAR(50) DEFAULT 'plate',
    is_vegetarian BOOLEAN DEFAULT true,
    track_inventory BOOLEAN DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    
    UNIQUE(tenant_id, code)
);

-- 18. Room Types (Master hotel PMS categories)
CREATE TABLE room_types (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- Deluxe, Suite, Standard
    base_rate DECIMAL(12,2) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 2,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    
    UNIQUE(tenant_id, name)
);

-- 19. Rooms (Physical hotel keys)
CREATE TABLE rooms (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    unit_id BIGINT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    room_type_id BIGINT REFERENCES room_types(id) ON DELETE SET NULL,
    room_number VARCHAR(50) NOT NULL,
    floor VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'available', -- occupied, cleaning, available, maintenance
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    
    UNIQUE(unit_id, room_number)
);

-- 20. Customers (Unified CRM profile database)
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    first_name VARCHAR(150) NOT NULL,
    last_name VARCHAR(150),
    email VARCHAR(255),
    phone VARCHAR(20),
    loyalty_tier VARCHAR(50) DEFAULT 'standard',
    loyalty_points INTEGER DEFAULT 0,
    wallet_balance DECIMAL(12,2) DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    
    UNIQUE(tenant_id, phone)
);

-- ===========================================================================
-- PART 4: TRANSACTION TABLES (SCOPED BY UNIT & FINANCIAL YEAR)
-- ===========================================================================

-- 21. Orders Table (Shared Restaurant POS and Online Customer Food App orders)
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    unit_id BIGINT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    financial_year VARCHAR(10) NOT NULL, -- e.g. 2026-27
    order_number VARCHAR(100) NOT NULL, -- Sequential serial pattern
    
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    order_type VARCHAR(50) NOT NULL, -- dine_in, takeaway, delivery
    order_source VARCHAR(50) NOT NULL, -- erp_dashboard, customer_web, qr_order, mobile_app
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, preparing, completed, cancelled
    payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid', -- paid, unpaid, partial
    
    subtotal DECIMAL(12,2) NOT NULL,
    discount_amount DECIMAL(12,2) DEFAULT 0.00,
    tax_amount DECIMAL(12,2) NOT NULL,
    grand_total DECIMAL(12,2) NOT NULL,
    notes TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by BIGINT,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    
    UNIQUE(unit_id, financial_year, order_number)
);
CREATE INDEX idx_orders_scope ON orders(tenant_id, unit_id, financial_year);

-- 22. Order Items
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL,
    line_total DECIMAL(12,2) NOT NULL,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 23. Invoices (General billing ledger)
CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    unit_id BIGINT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    financial_year VARCHAR(10) NOT NULL,
    invoice_number VARCHAR(100) NOT NULL,
    
    order_id BIGINT REFERENCES orders(id) ON DELETE SET NULL,
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    amount DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'paid', -- paid, unpaid, partial, overdue
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    
    UNIQUE(unit_id, financial_year, invoice_number)
);

-- 24. Reservations (Unified bookings engine)
CREATE TABLE reservations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    unit_id BIGINT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    financial_year VARCHAR(10) NOT NULL,
    reservation_number VARCHAR(100) NOT NULL,
    
    customer_id BIGINT REFERENCES customers(id) ON DELETE SET NULL,
    room_id BIGINT REFERENCES rooms(id) ON DELETE SET NULL, -- Null if table booking
    table_number VARCHAR(50), -- Null if hotel room booking
    
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed', -- confirmed, checked_in, checked_out, cancelled
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by BIGINT,
    
    UNIQUE(unit_id, financial_year, reservation_number)
);

-- 25. General Ledger Accounts (Accounting charts)
CREATE TABLE ledger_accounts (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL, -- e.g. 10100 CASH
    name VARCHAR(150) NOT NULL,
    type VARCHAR(50) NOT NULL, -- asset, liability, equity, revenue, expense
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    UNIQUE(tenant_id, code)
);

-- 26. Financial Journal Transactions (Double-entry transaction records)
CREATE TABLE financial_journal_entries (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    unit_id BIGINT NOT NULL REFERENCES units(id) ON DELETE CASCADE,
    financial_year VARCHAR(10) NOT NULL,
    entry_number VARCHAR(100) NOT NULL,
    entry_date DATE NOT NULL,
    narration TEXT,
    
    -- Audit fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by BIGINT,
    
    UNIQUE(unit_id, financial_year, entry_number)
);

-- 27. Financial Journal Line Items
CREATE TABLE financial_journal_lines (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entry_id BIGINT NOT NULL REFERENCES financial_journal_entries(id) ON DELETE CASCADE,
    account_id BIGINT NOT NULL REFERENCES ledger_accounts(id),
    debit_amount DECIMAL(12,2) DEFAULT 0.00,
    credit_amount DECIMAL(12,2) DEFAULT 0.00,
    
    CONSTRAINT chk_debit_credit CHECK (
        (debit_amount > 0 AND credit_amount = 0) OR 
        (credit_amount > 0 AND debit_amount = 0)
    )
);

-- ===========================================================================
-- PART 5: SYSTEM SECURITY & AUDIT TRAILS
-- ===========================================================================

-- 28. Audit Logs Table (Tracks user edits, creations, and deletes)
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    unit_id BIGINT REFERENCES units(id) ON DELETE SET NULL,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN
    table_name VARCHAR(100) NOT NULL,
    record_id BIGINT NOT NULL,
    old_data JSONB, -- JSON representation of fields before change
    new_data JSONB, -- JSON representation of fields after change
    ip_address VARCHAR(45),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_table ON audit_logs(tenant_id, table_name, record_id);
