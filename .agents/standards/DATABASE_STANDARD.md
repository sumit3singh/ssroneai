# BAITHAK ERP – Database Standard (DATABASE_STANDARD.md)

## PostgreSQL Single Source of Truth
PostgreSQL is the ONLY database for business data.

## Standard Columns
Every database table must include:
- `id`: Primary key
- `tenant_id`: Multi-tenant isolation ID
- `company_id`: Company entity ID
- `branch_id`: Branch location ID
- `is_active`: Status flag
- `is_deleted`: Soft delete flag
- `created_at`: Creation timestamp
- `updated_at`: Modification timestamp
- `created_by`: User ID who created
- `modified_by`: User ID who modified
