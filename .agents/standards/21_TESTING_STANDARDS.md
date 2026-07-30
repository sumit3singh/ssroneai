# Testing Standards – BAITHAK ERP Charter #21

## Automated Quality Verification
- **Build Checks**: `npm --prefix apps/admin-web run build` must compile with 0 errors.
- **Type Checking**: `tsc --noEmit` validation before any production deployment.
- **API Health**: REST API endpoint response validation (`curl -s http://localhost:8000/api/v1/...`).
