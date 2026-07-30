# API Standards – BAITHAK ERP Charter #15

## RESTful API Contracts
- Base URL: `/api/v1`
- Naming: Kebab-case resource endpoints (`/api/v1/restaurant/menu-items`, `/api/v1/crm/customers`).
- Status Codes:
  - `200 OK`: Successful GET / PUT / PATCH.
  - `201 Created`: Successful POST.
  - `400 Bad Request`: Validation failure.
  - `401 Unauthorized`: Missing or invalid JWT.
  - `403 Forbidden`: Insufficient RBAC permission.
  - `404 Not Found`: Resource missing.
