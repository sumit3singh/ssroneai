// 1. Core Types & Constants
export * from "./types";
export * from "./constants";
export * from "./permissions";

// 2. Configuration & Features
export * from "./config";
export * from "./featureFlags";
export * from "./navigation";
export * from "./routes";
export * from "./hooks";

// 3. API Clients & Services
export * from "./api/categories.api";
export * from "./api/menuItems.api";
export * from "./api/tables.api";
export * from "./api/waiters.api";
export * from "./api/orders.api";

export * from "./services/billing.service";
export * from "./services/printer.service";

// 4. Stores & Hooks
export * from "./store/cart.store";
// hooks are exported via the hooks barrel

// 5. Utilities & Validators
export * from "./utils/price";
export * from "./utils/gst";
export * from "./utils/currency";
export * from "./validators/menuItem.schema";
export * from "./validators/table.schema";

// 6. 5-Part Domain Sections
export { POSDashboardPage } from "./dashboard/POSDashboardPage";
export { POSMasterSection } from "./master/POSMasterSection";
export { POSTransactionSection } from "./transaction/POSTransactionSection";
export { POSReportsPage } from "./report/POSReportsPage";
export { POSSettingsPage } from "./settings/POSSettingsPage";

// 7. Module Shell Pages
export { POSPage } from "./POSPage";
export { KDSScreen } from "./KDSScreen";
