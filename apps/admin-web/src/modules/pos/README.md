# ssrone ERP – POS Module Architecture

The Point of Sale (POS) module delivers high-throughput restaurant billing, Kitchen Display System (KDS) streams, table management, and shift settlement.

## Architectural Layers

- **`domain/`**: Pure TypeScript domain entities (`Order.ts`, `Bill.ts`, `MenuItem.ts`) handling financial math, tax calculations, and status transitions.
- **`dto/`**: Data Transfer Objects (`OrderDTO.ts`) defining API request/response structures.
- **`mappers/`**: Object mappers (`OrderMapper.ts`) translating between DTO payloads and Domain entities.
- **`repositories/`**: Repository pattern layer (`OrderRepository.ts`) decoupling UI from Axios/HTTP transport.
- **`components/`**: Module UI boundaries:
  - `ErrorBoundary.tsx`: Module crash isolation.
  - `LoadingSkeleton.tsx`: Content placeholders.
  - `EmptyState.tsx`: Universal empty list view.
  - `PermissionGuard.tsx`: Component-level action protection.
- **`hooks/`**: Specialized React domain hooks (`useAuditLog.ts`, `useKeyboardShortcuts.ts`).
- **`module.json`**: Module metadata manifest declaring routes, capabilities, and dependencies.

## Navigation Layout (5-Part Standard)

```
Dashboard  --> /pos
Master     --> /pos/master
Transaction--> /pos/transaction
Report     --> /pos/report
Settings   --> /pos/settings
```
