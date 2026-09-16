-- RLS policies for database tables
-- Enforces strict tenant isolation at the database level across all SSR One AI modules.

-- Helper function to check if the current user is a superadmin
CREATE OR REPLACE FUNCTION is_superadmin() RETURNS boolean AS $$
BEGIN
    RETURN current_setting('app.is_superadmin', true) = 'true';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Tenants Table
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenants_isolation ON tenants;
CREATE POLICY tenants_isolation ON tenants
    FOR ALL USING (is_superadmin() OR id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 2. Companies Table
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS companies_isolation ON companies;
CREATE POLICY companies_isolation ON companies
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 3. Branches Table
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS branches_isolation ON branches;
CREATE POLICY branches_isolation ON branches
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 4. Users Table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_isolation ON users;
CREATE POLICY users_isolation ON users
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 5. Roles Table
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS roles_isolation ON roles;
CREATE POLICY roles_isolation ON roles
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 6. User Roles Table
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_roles_isolation ON user_roles;
CREATE POLICY user_roles_isolation ON user_roles
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 7. Feature Licenses Table
ALTER TABLE feature_licenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS feature_licenses_isolation ON feature_licenses;
CREATE POLICY feature_licenses_isolation ON feature_licenses
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 8. Audit Logs Table
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_logs_isolation ON audit_logs;
CREATE POLICY audit_logs_isolation ON audit_logs
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 9. AI Conversations & Messages
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ai_conversations_isolation ON ai_conversations;
CREATE POLICY ai_conversations_isolation ON ai_conversations
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ai_messages_isolation ON ai_messages;
CREATE POLICY ai_messages_isolation ON ai_messages
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 10. Restaurant & Menu Masters
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS menu_categories_isolation ON menu_categories;
CREATE POLICY menu_categories_isolation ON menu_categories
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE menu_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS menu_tags_isolation ON menu_tags;
CREATE POLICY menu_tags_isolation ON menu_tags
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE menu_item_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS menu_item_tags_isolation ON menu_item_tags;
CREATE POLICY menu_item_tags_isolation ON menu_item_tags
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS menu_items_isolation ON menu_items;
CREATE POLICY menu_items_isolation ON menu_items
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE menu_variant_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS menu_variant_groups_isolation ON menu_variant_groups;
CREATE POLICY menu_variant_groups_isolation ON menu_variant_groups
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE menu_variant_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS menu_variant_options_isolation ON menu_variant_options;
CREATE POLICY menu_variant_options_isolation ON menu_variant_options
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE menu_addon_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS menu_addon_groups_isolation ON menu_addon_groups;
CREATE POLICY menu_addon_groups_isolation ON menu_addon_groups
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE menu_addon_options ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS menu_addon_options_isolation ON menu_addon_options;
CREATE POLICY menu_addon_options_isolation ON menu_addon_options
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 11. Orders & POS Operations
ALTER TABLE daily_order_sequences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS daily_order_sequences_isolation ON daily_order_sequences;
CREATE POLICY daily_order_sequences_isolation ON daily_order_sequences
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE dining_tables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dining_tables_isolation ON dining_tables;
CREATE POLICY dining_tables_isolation ON dining_tables
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE kitchen_stations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS kitchen_stations_isolation ON kitchen_stations;
CREATE POLICY kitchen_stations_isolation ON kitchen_stations
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS orders_isolation ON orders;
CREATE POLICY orders_isolation ON orders
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS order_items_isolation ON order_items;
CREATE POLICY order_items_isolation ON order_items
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE order_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS order_payments_isolation ON order_payments;
CREATE POLICY order_payments_isolation ON order_payments
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE kots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS kots_isolation ON kots;
CREATE POLICY kots_isolation ON kots
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE kot_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS kot_items_isolation ON kot_items;
CREATE POLICY kot_items_isolation ON kot_items
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE order_status_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS order_status_logs_isolation ON order_status_logs;
CREATE POLICY order_status_logs_isolation ON order_status_logs
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 12. Inventory & Stock
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS product_categories_isolation ON product_categories;
CREATE POLICY product_categories_isolation ON product_categories
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS products_isolation ON products;
CREATE POLICY products_isolation ON products
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE stock_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS stock_entries_isolation ON stock_entries;
CREATE POLICY stock_entries_isolation ON stock_entries
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS stock_movements_isolation ON stock_movements;
CREATE POLICY stock_movements_isolation ON stock_movements
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS production_batches_isolation ON production_batches;
CREATE POLICY production_batches_isolation ON production_batches
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 13. PG & Hostel Management
ALTER TABLE pg_floors ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pg_floors_isolation ON pg_floors;
CREATE POLICY pg_floors_isolation ON pg_floors
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE pg_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pg_rooms_isolation ON pg_rooms;
CREATE POLICY pg_rooms_isolation ON pg_rooms
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE pg_beds ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pg_beds_isolation ON pg_beds;
CREATE POLICY pg_beds_isolation ON pg_beds
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE pg_residents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pg_residents_isolation ON pg_residents;
CREATE POLICY pg_residents_isolation ON pg_residents
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE pg_rent_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pg_rent_records_isolation ON pg_rent_records;
CREATE POLICY pg_rent_records_isolation ON pg_rent_records
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE pg_visitor_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pg_visitor_logs_isolation ON pg_visitor_logs;
CREATE POLICY pg_visitor_logs_isolation ON pg_visitor_logs
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 14. Hotel PMS & Accommodations
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS room_types_isolation ON room_types;
CREATE POLICY room_types_isolation ON room_types
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE hotel_rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS hotel_rooms_isolation ON hotel_rooms;
CREATE POLICY hotel_rooms_isolation ON hotel_rooms
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE hotel_reservations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS hotel_reservations_isolation ON hotel_reservations;
CREATE POLICY hotel_reservations_isolation ON hotel_reservations
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 15. HRMS & Workforce
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS departments_isolation ON departments;
CREATE POLICY departments_isolation ON departments
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE designations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS designations_isolation ON designations;
CREATE POLICY designations_isolation ON designations
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS employees_isolation ON employees;
CREATE POLICY employees_isolation ON employees
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS shifts_isolation ON shifts;
CREATE POLICY shifts_isolation ON shifts
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS attendance_records_isolation ON attendance_records;
CREATE POLICY attendance_records_isolation ON attendance_records
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS leave_types_isolation ON leave_types;
CREATE POLICY leave_types_isolation ON leave_types
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS leave_requests_isolation ON leave_requests;
CREATE POLICY leave_requests_isolation ON leave_requests
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE payroll_runs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS payroll_runs_isolation ON payroll_runs;
CREATE POLICY payroll_runs_isolation ON payroll_runs
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS payslips_isolation ON payslips;
CREATE POLICY payslips_isolation ON payslips
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 16. Finance & Accounting
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS chart_of_accounts_isolation ON chart_of_accounts;
CREATE POLICY chart_of_accounts_isolation ON chart_of_accounts
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS journal_entries_isolation ON journal_entries;
CREATE POLICY journal_entries_isolation ON journal_entries
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS budget_entries_isolation ON budget_entries;
CREATE POLICY budget_entries_isolation ON budget_entries
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 17. CRM & Loyalty
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS customers_isolation ON customers;
CREATE POLICY customers_isolation ON customers
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS loyalty_transactions_isolation ON loyalty_transactions;
CREATE POLICY loyalty_transactions_isolation ON loyalty_transactions
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE customer_interactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS customer_interactions_isolation ON customer_interactions;
CREATE POLICY customer_interactions_isolation ON customer_interactions
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS campaigns_isolation ON campaigns;
CREATE POLICY campaigns_isolation ON campaigns
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 18. Billing & Invoicing
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS invoices_isolation ON invoices;
CREATE POLICY invoices_isolation ON invoices
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS invoice_items_isolation ON invoice_items;
CREATE POLICY invoice_items_isolation ON invoice_items
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

ALTER TABLE invoice_payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS invoice_payments_isolation ON invoice_payments;
CREATE POLICY invoice_payments_isolation ON invoice_payments
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 19. Form Builder & Metadata Engine
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS form_submissions_isolation ON form_submissions;
CREATE POLICY form_submissions_isolation ON form_submissions
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

