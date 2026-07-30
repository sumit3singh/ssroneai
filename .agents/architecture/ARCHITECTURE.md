# BAITHAK ERP – Architecture Standard (ARCHITECTURE.md)

## System Vision: SSR INFINITY Platform
Applications are clients. Backend is the platform platform. Database is the single source of truth.

```
Applications (Web / Mobile / KDS)
       ↓
API Clients & Services
       ↓
FastAPI Backend Controllers
       ↓
Domain Services & Engines
       ↓
PostgreSQL Database
```

## Core Principles
1. **Platform First**: Applications never write custom business rules. They consume shared platform engines.
2. **Metadata Driven**: UI layouts, navigation trees, and forms are generated dynamically from metadata registration.
3. **Multi-Tenant Isolation**: Tenant, Company, and Branch scoping are enforced at database and API layers.
