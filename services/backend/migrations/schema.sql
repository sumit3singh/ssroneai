-- =============================================================================
-- SSR One AI – 10/10 Enterprise Database Schema (DDL)
-- World-Class Hospitality & ERP Platform Grade
-- Shared Database, Shared Schema Multi-Tenant Architecture with PostgreSQL RLS,
-- Optimistic Concurrency Control, High-Performance Composite Indexes, & DB Constraints
-- =============================================================================

BEGIN;

-- Helper function to check if current user is superadmin
CREATE OR REPLACE FUNCTION is_superadmin() RETURNS boolean AS $$
BEGIN
    RETURN current_setting('app.is_superadmin', true) = 'true';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 1. AUTH, MULTI-TENANCY & CORE PLATFORM
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS tenants (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    subdomain VARCHAR(100),
    domain VARCHAR(255) UNIQUE,
    logo_url VARCHAR(500),
    plan VARCHAR(50) DEFAULT 'starter' NOT NULL CHECK (plan IN ('starter', 'professional', 'enterprise')),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    theme JSONB DEFAULT '{}'::jsonb,
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);

CREATE TABLE IF NOT EXISTS companies (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    legal_name VARCHAR(300),
    gstin VARCHAR(15),
    pan VARCHAR(10),
    cin VARCHAR(21),
    address JSONB DEFAULT '{}'::jsonb,
    country_code VARCHAR(3) DEFAULT 'IN',
    currency_code VARCHAR(3) DEFAULT 'INR',
    fiscal_year_start VARCHAR(5) DEFAULT '04-01',
    business_type VARCHAR(50) DEFAULT 'restaurant',
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_companies_tenant ON companies(tenant_id);

CREATE TABLE IF NOT EXISTS branches (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    code VARCHAR(20) NOT NULL,
    branch_type VARCHAR(50) DEFAULT 'outlet',
    address JSONB DEFAULT '{}'::jsonb,
    phone VARCHAR(20),
    email VARCHAR(255),
    gstin VARCHAR(15),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    settings JSONB DEFAULT '{}'::jsonb,
    operating_hours JSONB DEFAULT '{}'::jsonb,
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT uq_branch_code UNIQUE (tenant_id, company_id, code)
);
CREATE INDEX IF NOT EXISTS idx_branches_tenant ON branches(tenant_id);
CREATE INDEX IF NOT EXISTS idx_branches_company ON branches(tenant_id, company_id);

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    company_id BIGINT REFERENCES companies(id) ON DELETE SET NULL,
    branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    display_name VARCHAR(200),
    avatar_url VARCHAR(500),
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    is_superadmin BOOLEAN DEFAULT FALSE NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
    last_login_at TIMESTAMP WITH TIME ZONE,
    mfa_enabled BOOLEAN DEFAULT FALSE NOT NULL,
    mfa_secret VARCHAR(255),
    failed_login_attempts INT DEFAULT 0 NOT NULL,
    locked_until TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}'::jsonb,
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT uq_user_email_per_tenant UNIQUE (tenant_id, email)
);
CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_tenant_active ON users(tenant_id, is_active);

CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}'::jsonb NOT NULL,
    is_system_role BOOLEAN DEFAULT FALSE NOT NULL,
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_roles_tenant ON roles(tenant_id);

CREATE TABLE IF NOT EXISTS user_roles (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL,
    company_id BIGINT REFERENCES companies(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_user_roles_lookup ON user_roles(tenant_id, user_id, role_id);

CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_user_sessions_lookup ON user_sessions(tenant_id, user_id, is_active);

CREATE TABLE IF NOT EXISTS feature_master (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    dependencies JSONB DEFAULT '[]'::jsonb,
    is_core BOOLEAN DEFAULT FALSE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS feature_licenses (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    feature_code VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    max_users INT,
    max_branches INT,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT uq_feature_license UNIQUE (tenant_id, feature_code)
);
CREATE INDEX IF NOT EXISTS idx_feature_licenses_lookup ON feature_licenses(tenant_id, feature_code, is_active);

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT REFERENCES tenants(id) ON DELETE CASCADE,
    user_id BIGINT,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_lookup ON audit_logs(tenant_id, resource_type, created_at DESC);

CREATE TABLE IF NOT EXISTS event_store (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL CHECK (status IN ('PENDING', 'PROCESSED', 'FAILED')),
    retry_count INT DEFAULT 0 NOT NULL,
    source_module VARCHAR(100),
    correlation_id VARCHAR(255),
    processed_at TIMESTAMP WITH TIME ZONE,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_event_store_lookup ON event_store(tenant_id, status, created_at ASC);

CREATE TABLE IF NOT EXISTS file_master_erp (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    label VARCHAR(200) NOT NULL,
    href VARCHAR(300) NOT NULL,
    icon VARCHAR(100),
    category VARCHAR(50) DEFAULT 'core',
    parent_code VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    required_permission VARCHAR(100),
    required_feature VARCHAR(100),
    type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT uq_file_master_erp_code UNIQUE (tenant_id, code)
);
CREATE INDEX IF NOT EXISTS idx_file_master_erp_lookup ON file_master_erp(tenant_id, category, is_active);

-- -----------------------------------------------------------------------------
-- 2. AI COPILOT & GOVERNANCE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS ai_conversations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL,
    agent_type VARCHAR(50) DEFAULT 'general' NOT NULL,
    title VARCHAR(300),
    context JSONB DEFAULT '{}'::jsonb,
    token_count INT DEFAULT 0 NOT NULL,
    cost_usd NUMERIC(10, 4) DEFAULT 0.0000 NOT NULL,
    is_archived BOOLEAN DEFAULT FALSE NOT NULL,
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_lookup ON ai_conversations(tenant_id, user_id, is_archived);

CREATE TABLE IF NOT EXISTS ai_messages (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    conversation_id BIGINT NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    token_count INT DEFAULT 0 NOT NULL,
    model_used VARCHAR(100),
    metadata JSONB DEFAULT '{}'::jsonb,
    feedback VARCHAR(10) CHECK (feedback IN ('good', 'bad')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_messages_lookup ON ai_messages(tenant_id, conversation_id, created_at ASC);

CREATE TABLE IF NOT EXISTS ai_prompt_templates (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100) NOT NULL,
    agent_type VARCHAR(50) NOT NULL,
    system_prompt TEXT NOT NULL,
    user_prompt_template TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    version INT DEFAULT 1 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    usage_count INT DEFAULT 0 NOT NULL,
    avg_rating NUMERIC(3, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_ai_prompt_templates_lookup ON ai_prompt_templates(tenant_id, agent_type, is_active);

-- -----------------------------------------------------------------------------
-- 3. DYNAMIC FORM BUILDER ENGINE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS form_master (
    id BIGSERIAL PRIMARY KEY,
    form_key VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description VARCHAR(500),
    business_type_id VARCHAR(50),
    submit_label VARCHAR(50) DEFAULT 'Save' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS form_fields (
    id BIGSERIAL PRIMARY KEY,
    form_id BIGINT NOT NULL REFERENCES form_master(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    field_label VARCHAR(200) NOT NULL,
    field_type VARCHAR(50) NOT NULL,
    placeholder VARCHAR(200),
    default_value VARCHAR(200),
    is_required BOOLEAN DEFAULT FALSE NOT NULL,
    is_readonly BOOLEAN DEFAULT FALSE NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
    sort_order INT DEFAULT 0 NOT NULL,
    section VARCHAR(50) DEFAULT 'default' NOT NULL,
    tab VARCHAR(50) DEFAULT 'basic' NOT NULL,
    width VARCHAR(50) DEFAULT 'full' NOT NULL,
    help_text VARCHAR(500),
    options JSONB,
    depends_on VARCHAR(100),
    depends_value VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_form_field_name UNIQUE (form_id, field_name)
);

CREATE TABLE IF NOT EXISTS field_validations (
    id BIGSERIAL PRIMARY KEY,
    field_id BIGINT UNIQUE NOT NULL REFERENCES form_fields(id) ON DELETE CASCADE,
    min_value NUMERIC,
    max_value NUMERIC,
    min_length INT,
    max_length INT,
    regex_pattern VARCHAR(500),
    regex_message VARCHAR(300),
    allowed_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS form_submissions (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    form_key VARCHAR(100) NOT NULL,
    submitted_by BIGINT,
    payload JSONB DEFAULT '{}'::jsonb,
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_form_submissions_lookup ON form_submissions(tenant_id, form_key, created_at DESC);

-- -----------------------------------------------------------------------------
-- 4. RESTAURANT & POS MODULE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS menu_categories (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(50),
    slug VARCHAR(100),
    parent_id BIGINT REFERENCES menu_categories(id) ON DELETE SET NULL,
    level INT DEFAULT 1,
    sort_order INT DEFAULT 1,
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_menu_categories_lookup ON menu_categories(tenant_id, branch_id, sort_order);

CREATE TABLE IF NOT EXISTS menu_tags (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    color_code VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_menu_tags_tenant ON menu_tags(tenant_id);

CREATE TABLE IF NOT EXISTS menu_items (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES menu_categories(id) ON DELETE SET NULL,
    item_code VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    cost_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    tax_rate NUMERIC(5, 2) DEFAULT 5.00 NOT NULL,
    is_available BOOLEAN DEFAULT TRUE NOT NULL,
    image_url TEXT,
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT uq_tenant_item_code UNIQUE (tenant_id, item_code)
);
CREATE INDEX IF NOT EXISTS idx_menu_items_pos_lookup ON menu_items(tenant_id, category_id, is_available);

CREATE TABLE IF NOT EXISTS menu_item_tags (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    tag_id BIGINT NOT NULL REFERENCES menu_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_menu_item_tags_lookup ON menu_item_tags(tenant_id, item_id, tag_id);

CREATE TABLE IF NOT EXISTS menu_variant_groups (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_variant_groups_item ON menu_variant_groups(tenant_id, item_id);

CREATE TABLE IF NOT EXISTS menu_variant_options (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    group_id BIGINT NOT NULL REFERENCES menu_variant_groups(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    additional_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_variant_options_group ON menu_variant_options(tenant_id, group_id);

CREATE TABLE IF NOT EXISTS menu_addon_groups (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    min_selection INT DEFAULT 0,
    max_selection INT DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_addon_groups_item ON menu_addon_groups(tenant_id, item_id);

CREATE TABLE IF NOT EXISTS menu_addon_options (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    group_id BIGINT NOT NULL REFERENCES menu_addon_groups(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_addon_options_group ON menu_addon_options(tenant_id, group_id);

CREATE TABLE IF NOT EXISTS dining_tables (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL,
    table_number VARCHAR(20) NOT NULL,
    seating_capacity INT DEFAULT 4 NOT NULL,
    status VARCHAR(50) DEFAULT 'VACANT' NOT NULL CHECK (status IN ('VACANT', 'OCCUPIED', 'RESERVED', 'DIRTY', 'OUT_OF_SERVICE')),
    section VARCHAR(50) DEFAULT 'MAIN',
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT uq_tenant_table_no UNIQUE (tenant_id, table_number)
);
CREATE INDEX IF NOT EXISTS idx_dining_tables_pos_lookup ON dining_tables(tenant_id, branch_id, status);

CREATE TABLE IF NOT EXISTS kitchen_stations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    display_ip VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_kitchen_stations_tenant ON kitchen_stations(tenant_id, branch_id);

-- -----------------------------------------------------------------------------
-- 5. ORDERS, BILLING & KOT ENGINE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS daily_order_sequences (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL DEFAULT 1 REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id BIGINT NOT NULL DEFAULT 1 REFERENCES branches(id) ON DELETE CASCADE,
    sequence_date VARCHAR(10) NOT NULL,
    last_seq INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_tenant_branch_date_seq UNIQUE (tenant_id, branch_id, sequence_date)
);
CREATE INDEX IF NOT EXISTS idx_daily_order_sequences_tenant ON daily_order_sequences(tenant_id, branch_id, sequence_date);

CREATE TABLE IF NOT EXISTS orders (

    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    branch_id BIGINT REFERENCES branches(id) ON DELETE SET NULL,
    order_number VARCHAR(50) NOT NULL,
    table_id BIGINT REFERENCES dining_tables(id) ON DELETE SET NULL,
    order_type VARCHAR(50) DEFAULT 'DINE_IN' NOT NULL CHECK (order_type IN ('DINE_IN', 'TAKEAWAY', 'DELIVERY', 'ROOM_SERVICE')),
    status VARCHAR(50) DEFAULT 'OPEN' NOT NULL CHECK (status IN ('OPEN', 'PREPARING', 'READY', 'SERVED', 'COMPLETED', 'CANCELLED')),
    subtotal NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    discount_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    total_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    customer_name VARCHAR(150),
    customer_phone VARCHAR(30),
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT uq_tenant_order_no UNIQUE (tenant_id, order_number)
);
CREATE INDEX IF NOT EXISTS idx_orders_pos_filtering ON orders(tenant_id, branch_id, status, created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    item_id BIGINT REFERENCES menu_items(id) ON DELETE SET NULL,
    item_name VARCHAR(200) NOT NULL,
    quantity INT DEFAULT 1 NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(tenant_id, order_id);

CREATE TABLE IF NOT EXISTS order_payments (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_mode VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'SUCCESS' NOT NULL CHECK (status IN ('SUCCESS', 'PENDING', 'FAILED', 'REFUNDED')),
    transaction_reference VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_payments_lookup ON order_payments(tenant_id, order_id);

CREATE TABLE IF NOT EXISTS kots (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    kot_number VARCHAR(50) NOT NULL,
    station_id BIGINT REFERENCES kitchen_stations(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL CHECK (status IN ('PENDING', 'PREPARING', 'READY', 'SERVED', 'CANCELLED')),
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_kots_kds_display ON kots(tenant_id, station_id, status, created_at ASC);

CREATE TABLE IF NOT EXISTS kot_items (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    kot_id BIGINT NOT NULL REFERENCES kots(id) ON DELETE CASCADE,
    item_name VARCHAR(200) NOT NULL,
    quantity INT DEFAULT 1 NOT NULL,
    status VARCHAR(50) DEFAULT 'PREPARING' NOT NULL CHECK (status IN ('PREPARING', 'READY', 'SERVED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_kot_items_kot ON kot_items(tenant_id, kot_id);

CREATE TABLE IF NOT EXISTS order_status_logs (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_order_status_logs_lookup ON order_status_logs(tenant_id, order_id, created_at DESC);

CREATE TABLE IF NOT EXISTS invoices (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal NUMERIC(12, 2) NOT NULL,
    tax_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    status VARCHAR(50) DEFAULT 'UNPAID' NOT NULL CHECK (status IN ('DRAFT', 'UNPAID', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'OVERDUE')),
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT uq_tenant_invoice_no UNIQUE (tenant_id, invoice_number)
);
CREATE INDEX IF NOT EXISTS idx_invoices_lookup ON invoices(tenant_id, status, due_date);

CREATE TABLE IF NOT EXISTS invoice_items (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    item_description VARCHAR(250) NOT NULL,
    quantity NUMERIC(12, 3) DEFAULT 1 NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    total_price NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice ON invoice_items(tenant_id, invoice_id);

CREATE TABLE IF NOT EXISTS invoice_payments (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    invoice_id BIGINT NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    payment_mode VARCHAR(50) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_invoice_payments_invoice ON invoice_payments(tenant_id, invoice_id);

-- -----------------------------------------------------------------------------
-- 6. INVENTORY & STOCK MANAGEMENT
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS product_categories (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_product_categories_tenant ON product_categories(tenant_id);

CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    category_id BIGINT REFERENCES product_categories(id) ON DELETE SET NULL,
    sku VARCHAR(50) NOT NULL,
    name VARCHAR(200) NOT NULL,
    unit VARCHAR(20) DEFAULT 'PCS' NOT NULL,
    current_stock NUMERIC(12, 3) DEFAULT 0.000 NOT NULL,
    min_stock_level NUMERIC(12, 3) DEFAULT 10.000 NOT NULL,
    unit_cost NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT uq_tenant_product_sku UNIQUE (tenant_id, sku)
);
CREATE INDEX IF NOT EXISTS idx_products_stock_lookup ON products(tenant_id, category_id, current_stock);

CREATE TABLE IF NOT EXISTS stock_entries (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    entry_type VARCHAR(50) NOT NULL,
    quantity NUMERIC(12, 3) NOT NULL,
    unit_cost NUMERIC(12, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_stock_entries_product ON stock_entries(tenant_id, product_id, created_at DESC);

CREATE TABLE IF NOT EXISTS stock_movements (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    movement_type VARCHAR(50) NOT NULL,
    quantity NUMERIC(12, 3) NOT NULL,
    source_location VARCHAR(100),
    destination_location VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_stock_movements_product ON stock_movements(tenant_id, product_id, created_at DESC);

CREATE TABLE IF NOT EXISTS production_batches (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    batch_number VARCHAR(50) NOT NULL,
    recipe_name VARCHAR(150) NOT NULL,
    quantity_produced NUMERIC(12, 3) NOT NULL,
    status VARCHAR(50) DEFAULT 'COMPLETED' NOT NULL CHECK (status IN ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_production_batches_lookup ON production_batches(tenant_id, status, created_at DESC);

-- -----------------------------------------------------------------------------
-- 7. HOTEL PMS (HOTEL & ROOMS)
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS room_types (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    base_rate NUMERIC(12, 2) NOT NULL,
    capacity INT DEFAULT 2 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_room_types_tenant ON room_types(tenant_id);

CREATE TABLE IF NOT EXISTS hotel_rooms (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    room_number VARCHAR(20) NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    rate_per_night NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'VACANT' NOT NULL CHECK (status IN ('VACANT', 'OCCUPIED', 'RESERVED', 'CLEANING', 'MAINTENANCE')),
    floor_number INT DEFAULT 1,
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT uq_tenant_hotel_room UNIQUE (tenant_id, room_number)
);
CREATE INDEX IF NOT EXISTS idx_hotel_rooms_pms_lookup ON hotel_rooms(tenant_id, status, room_type);

CREATE TABLE IF NOT EXISTS hotel_reservations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    reservation_code VARCHAR(50) NOT NULL,
    room_id BIGINT NOT NULL REFERENCES hotel_rooms(id) ON DELETE CASCADE,
    guest_name VARCHAR(150) NOT NULL,
    guest_phone VARCHAR(30) NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'CONFIRMED' NOT NULL CHECK (status IN ('CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'NO_SHOW')),
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT uq_tenant_reservation UNIQUE (tenant_id, reservation_code)
);
CREATE INDEX IF NOT EXISTS idx_hotel_reservations_pms_lookup ON hotel_reservations(tenant_id, room_id, status, check_in_date, check_out_date);

-- -----------------------------------------------------------------------------
-- 8. PG & HOSTEL MANAGEMENT
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS pg_floors (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    floor_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pg_floors_tenant ON pg_floors(tenant_id);

CREATE TABLE IF NOT EXISTS pg_rooms (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    floor_id BIGINT REFERENCES pg_floors(id) ON DELETE SET NULL,
    room_number VARCHAR(20) NOT NULL,
    sharing_type INT DEFAULT 2 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pg_rooms_tenant ON pg_rooms(tenant_id, floor_id);

CREATE TABLE IF NOT EXISTS pg_beds (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    room_id BIGINT REFERENCES pg_rooms(id) ON DELETE CASCADE,
    bed_number VARCHAR(20) NOT NULL,
    monthly_rent NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'VACANT' NOT NULL CHECK (status IN ('VACANT', 'OCCUPIED', 'MAINTENANCE', 'RESERVED')),
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pg_beds_lookup ON pg_beds(tenant_id, room_id, status);

CREATE TABLE IF NOT EXISTS pg_residents (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    bed_id BIGINT REFERENCES pg_beds(id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    id_proof_number VARCHAR(50),
    joining_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE', 'NOTICE', 'INACTIVE')),
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pg_residents_lookup ON pg_residents(tenant_id, status, bed_id);

CREATE TABLE IF NOT EXISTS pg_rent_records (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    resident_id BIGINT NOT NULL REFERENCES pg_residents(id) ON DELETE CASCADE,
    rent_month VARCHAR(7) NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    status VARCHAR(50) DEFAULT 'UNPAID' NOT NULL CHECK (status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pg_rent_records_lookup ON pg_rent_records(tenant_id, resident_id, status);

CREATE TABLE IF NOT EXISTS pg_visitor_logs (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    resident_id BIGINT REFERENCES pg_residents(id) ON DELETE SET NULL,
    visitor_name VARCHAR(150) NOT NULL,
    visitor_phone VARCHAR(30) NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    check_out_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pg_visitor_logs_lookup ON pg_visitor_logs(tenant_id, resident_id, check_in_time DESC);

-- -----------------------------------------------------------------------------
-- 9. HRMS & WORKFORCE
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS departments (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_departments_tenant ON departments(tenant_id);

CREATE TABLE IF NOT EXISTS designations (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    department_id BIGINT REFERENCES departments(id) ON DELETE SET NULL,
    title VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_designations_tenant ON designations(tenant_id, department_id);

CREATE TABLE IF NOT EXISTS employees (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_code VARCHAR(50) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    basic_salary NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED')),
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT uq_tenant_emp_code UNIQUE (tenant_id, employee_code)
);
CREATE INDEX IF NOT EXISTS idx_employees_lookup ON employees(tenant_id, status, designation);

CREATE TABLE IF NOT EXISTS shifts (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_shifts_tenant ON shifts(tenant_id);

CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    check_in TIMESTAMP WITH TIME ZONE,
    check_out TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'PRESENT' NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_attendance_records_lookup ON attendance_records(tenant_id, employee_id, attendance_date);

CREATE TABLE IF NOT EXISTS leave_types (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    max_days INT DEFAULT 12 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_leave_types_tenant ON leave_types(tenant_id);

CREATE TABLE IF NOT EXISTS leave_requests (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_leave_requests_lookup ON leave_requests(tenant_id, employee_id, status);

CREATE TABLE IF NOT EXISTS payroll_runs (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    pay_period VARCHAR(7) NOT NULL,
    total_payout NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PROCESSED' NOT NULL CHECK (status IN ('DRAFT', 'PROCESSED', 'APPROVED', 'CANCELLED')),
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_payroll_runs_lookup ON payroll_runs(tenant_id, pay_period, status);

CREATE TABLE IF NOT EXISTS payslips (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    payroll_run_id BIGINT NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
    employee_id BIGINT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    basic_salary NUMERIC(12, 2) NOT NULL,
    net_salary NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_payslips_lookup ON payslips(tenant_id, payroll_run_id, employee_id);

-- -----------------------------------------------------------------------------
-- 10. FINANCE & ACCOUNTING
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS chart_of_accounts (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    account_code VARCHAR(50) NOT NULL,
    account_name VARCHAR(150) NOT NULL,
    account_type VARCHAR(50) NOT NULL CHECK (account_type IN ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')),
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    CONSTRAINT uq_tenant_account_code UNIQUE (tenant_id, account_code)
);
CREATE INDEX IF NOT EXISTS idx_chart_of_accounts_lookup ON chart_of_accounts(tenant_id, account_type);

CREATE TABLE IF NOT EXISTS journal_entries (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    description TEXT,
    debit_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    credit_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_journal_entries_lookup ON journal_entries(tenant_id, entry_date);

CREATE TABLE IF NOT EXISTS budget_entries (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    fiscal_year VARCHAR(10) NOT NULL,
    category VARCHAR(100) NOT NULL,
    allocated_amount NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_budget_entries_lookup ON budget_entries(tenant_id, fiscal_year, category);

-- -----------------------------------------------------------------------------
-- 11. CRM & CUSTOMER LOYALTY
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS customers (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    loyalty_points INT DEFAULT 0 NOT NULL,
    version BIGINT DEFAULT 1 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_customers_lookup ON customers(tenant_id, phone);

CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    points_earned INT DEFAULT 0 NOT NULL,
    points_redeemed INT DEFAULT 0 NOT NULL,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('EARN', 'REDEEM', 'EXPIRE', 'ADJUSTMENT')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_lookup ON loyalty_transactions(tenant_id, customer_id, created_at DESC);

CREATE TABLE IF NOT EXISTS customer_interactions (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id BIGINT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_customer_interactions_lookup ON customer_interactions(tenant_id, customer_id);

CREATE TABLE IF NOT EXISTS campaigns (
    id BIGSERIAL PRIMARY KEY,
    tenant_id BIGINT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    channel VARCHAR(50) NOT NULL CHECK (channel IN ('SMS', 'EMAIL', 'WHATSAPP', 'PUSH')),
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL CHECK (status IN ('DRAFT', 'SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by BIGINT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_campaigns_lookup ON campaigns(tenant_id, status);

COMMIT;
