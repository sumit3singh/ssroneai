# Security Standards – BAITHAK ERP Charter #16

## Multi-Tenant Security & Protection
- **JWT Auth**: Secure Bearer authentication with token expiry.
- **Tenant Isolation**: Mandatory `tenant_id`, `company_id`, and `branch_id` check on all backend database queries.
- **Role-Based Access Control**: Scoped permissions (`read`, `write`, `delete`, `approve`).
