# Multi-Tenant Standards – BAITHAK ERP Charter #18

## Multi-Tenant Entity Hierarchy
```
Tenant (Holding Group / Enterprise)
  └── Company (Legal Entity / GSTIN)
        └── Branch (Physical Location / Outlet)
              ├── Unit / Warehouse (Stock Node)
              ├── Restaurant / POS Terminal
              └── Hotel / PG Property
```
- Every single SQL table and API request MUST operate within this tenant context.
