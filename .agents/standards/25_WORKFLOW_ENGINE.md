# Workflow Engine – BAITHAK ERP Charter #25

## State Machine & Approval Engine
- **POS Orders**: `draft` -> `pending` -> `in_kitchen` -> `ready` -> `served` -> `paid`.
- **Hotel Rooms**: `available` -> `occupied` -> `cleaning` -> `maintenance`.
- **Approval Engine**: Purchase orders and financial vouchers require multi-step approval above defined threshold limits.
