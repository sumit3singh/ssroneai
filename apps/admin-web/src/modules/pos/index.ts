// 1. Core Types & Constants
export * from "./types";
export * from "./constants";
export * from "./permissions";

// 2. Configuration & Features
export * from "./constants/config";
export * from "./constants/featureFlags";
export * from "./navigation";
export * from "./routes";
export * from "./hooks";

// 3. Domain, DTOs, Mappers & Repositories
export * from "./domain/Order";
export * from "./dto/OrderDTO";
export * from "./mappers/OrderMapper";
export * from "./repositories/OrderRepository";

// 4. Resilience & Enterprise UI Components
export * from "./components/ErrorBoundary";
export * from "./components/LoadingSkeleton";
export * from "./components/EmptyState";
export * from "./components/PermissionGuard";

// 5. API Clients & Services
export * from "./api/categories.api";
export * from "./api/menuItems.api";
export * from "./api/tables.api";
export * from "./api/waiters.api";
export * from "./api/orders.api";

export * from "./services/billing.service";
export * from "./services/printer.service";

// 6. Stores & Hooks
export * from "./store/cart.store";

// 7. Utilities & Validators
export * from "./utils/price";
export * from "./utils/gst";
export * from "./utils/currency";
export * from "./validators/menuItem.schema";
export * from "./validators/table.schema";

// 8. 5-Part Domain Sections
export { POSDashboardPage } from "./pages/dashboard/POSDashboardPage";
export { POSMasterSection } from "./pages/master/POSMasterSection";
export { POSTransactionSection } from "./pages/transaction/POSTransactionSection";
export { POSReportsPage } from "./pages/report/POSReportsPage";
export { POSSettingsPage } from "./pages/settings/POSSettingsPage";

// 9. Module Shell Pages
export { POSPage } from "./pages/dashboard/POSPage";
export { KDSScreen } from "./pages/transaction/KDSScreen";
export { POSOrdersListPage } from "./pages/transaction/POSOrdersListPage";
