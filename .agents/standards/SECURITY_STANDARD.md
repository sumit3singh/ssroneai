# BAITHAK ERP – Security Standard (SECURITY_STANDARD.md)

## Multi-Tenant Security & Isolation
- Tenant, Company, and Branch isolation MUST be enforced on every single query and endpoint.
- Every API endpoint requires JWT authentication and granular Role-Based Access Control (RBAC).
- Never trust client inputs; validate on backend before processing.
