# Database Architecture Document – BAITHAK ERP Charter #05

## 1. Single Source of Truth
- PostgreSQL database is the ONLY source of truth.
- Zero mock data in production code.

## 2. Universal Schema Standards
Every table MUST include:
- `id` (Primary Key UUID / BIGINT)
- `tenant_id` (Foreign Key -> `tenants.id`)
- `company_id` (Foreign Key -> `companies.id`)
- `branch_id` (Foreign Key -> `branches.id`)
- `created_at` (TIMESTAMP WITH TIME ZONE)
- `updated_at` (TIMESTAMP WITH TIME ZONE)
- `is_active` (BOOLEAN DEFAULT TRUE)
