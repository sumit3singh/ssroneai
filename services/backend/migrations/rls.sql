-- RLS policies for database tables
-- Enforces strict tenant isolation at the database level.

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

-- Helper macro-like declarations for standard tenant tables
-- We apply RLS and create policy for each tenant table:

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

-- 9. Orders Table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS orders_isolation ON orders;
CREATE POLICY orders_isolation ON orders
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 10. Order Items Table
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS order_items_isolation ON order_items;
CREATE POLICY order_items_isolation ON order_items
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 11. Products Table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS products_isolation ON products;
CREATE POLICY products_isolation ON products
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 12. Product Categories Table
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS product_categories_isolation ON product_categories;
CREATE POLICY product_categories_isolation ON product_categories
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 13. Customers Table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS customers_isolation ON customers;
CREATE POLICY customers_isolation ON customers
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 14. Rooms Table
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS rooms_isolation ON rooms;
CREATE POLICY rooms_isolation ON rooms
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 15. Room Types Table
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS room_types_isolation ON room_types;
CREATE POLICY room_types_isolation ON room_types
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 16. Reservations Table
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS reservations_isolation ON reservations;
CREATE POLICY reservations_isolation ON reservations
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 17. AI Conversations Table
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ai_conversations_isolation ON ai_conversations;
CREATE POLICY ai_conversations_isolation ON ai_conversations
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);

-- 18. AI Messages Table
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ai_messages_isolation ON ai_messages;
CREATE POLICY ai_messages_isolation ON ai_messages
    FOR ALL USING (is_superadmin() OR tenant_id = NULLIF(current_setting('app.tenant_id', true), '')::bigint);
