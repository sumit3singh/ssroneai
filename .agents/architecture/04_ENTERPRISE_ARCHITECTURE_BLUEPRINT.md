# The Baithak — Enterprise Architecture Blueprint
**Version:** 1.0  
**Status:** Frozen  

---

## 1. Scope & Reference
This document serves as the structural reference for the architecture of **The Baithak Hospitality Ecosystem**. For the complete baseline details, refer to the master architecture document:
- [THEBAITHAK_BLUEPRINT.md](file:///e:/2026/baithak/THEBAITHAK_BLUEPRINT.md)

---

## 2. Core Architectural Philosophy: Engines Over Modules
To support diverse hospitality verticals (QSR, Fine Dining, Hotels, Student Housing) on a single platform without code bloating, the system is designed around **generic database engines** rather than custom code.

- **Dynamic Metadata Mapping**: Forms, inputs, verification flows, and screen layouts are loaded from database configurations.
- **The Golden Rule**: Never write branch-specific or client-specific `if-else` blocks in frontend or backend logic. Solve all custom behaviors via database metadata configurations.

---

## 3. Deployment Topology
The Baithak uses a cloud-managed Kubernetes setup with regional nodes for multi-tenant isolation, combined with local gateways for low-latency offline sync at physical registers.

```
       [ Client POS / PWA ] 
                 │
       [ Cloudflare WAF / CDN ]
                 │
       [ Ingress Controller ]
                 │
       [ fastapi App Cluster ]
         │        │         │
    [ Redis ] [ RabbitMQ ] [ PostgreSQL ]
```
- **PostgreSQL**: Single database schema with Row-Level Security (RLS) partition keys on `tenant_id` and `branch_id`.
- **Redis**: Low-latency cache storage for active user sessions and temporary cart tokens.
- **RabbitMQ**: Message bus for distributing order events to KDS and notification hubs.
