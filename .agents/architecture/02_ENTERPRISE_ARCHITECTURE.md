# Enterprise Architecture Document (EAD) – BAITHAK ERP Charter #02

## 1. Platform Layer Architecture
- **Clients**: Web (`admin-web`, `customer-food-web`, `customer-stay-web`, `kds-web`, `staff-web`), Mobile (`mobile-app`).
- **Gateway**: API Gateway handling SSL termination, rate limiting, and JWT validation.
- **Backend Controllers**: FastAPI RESTful microservices.
- **Platform Engines**: Multi-Tenant, Workflow, Pricing, Notification, Audit, AI Copilot engines.
- **Database**: PostgreSQL with multi-tenant row-level security.
