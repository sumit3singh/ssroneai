/**
 * The Baithak – Route Tree
 * TanStack Router configuration with all module routes.
 */
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";

import { ProtectedRoute } from "@/app/routes/ProtectedRoute";
import { LoginPage } from "@/modules/auth";
import { DashboardPage } from "@/modules/dashboard";
import { POSPage, KDSScreen } from "@/modules/pos";
import { RestaurantPage } from "@/modules/restaurant";
import { ConnectedAppsLauncher } from "@/shared/layout/ConnectedAppsLauncher";
import { TenantsAdminPage } from "@/platform/tenants/TenantsAdminPage";
import { CompaniesAdminPage } from "@/platform/companies/CompaniesAdminPage";
import { LicensingAdminPage } from "@/platform/licensing/LicensingAdminPage";


import { HotelPage } from "@/modules/hotel";
import { PGManagementPage } from "@/modules/pg-management";
import { ReservationsPage } from "@/modules/reservations";
import { InventoryPage } from "@/modules/inventory";
import { BillingPage } from "@/modules/billing";
import { CRMPage } from "@/modules/crm";
import { HRPage } from "@/modules/hr";
import { AICopilotPage } from "@/modules/ai-copilot";
import { ReportsPage } from "@/modules/reports";
import { SettingsPage, PlatformStudioPage, MasterStudioPage, WorkflowPage, CommunicationPage } from "@/modules/settings";
import { FinancePage } from "@/modules/finance";
import { ConnectedAppPage } from "@/modules/connected-apps";
import { FormBuilderPage } from "@/modules/forms";
import { ProjectTrackerPage } from "@/modules/project-tracker";
import { EnterpriseRoadmapPage } from "@/modules/enterprise-roadmap";

// ─── Root Route ──────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// ─── Public Routes ───────────────────────────────────────────

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

// ─── Protected Routes (wrapped in AppShell) ─────────────────

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppsLauncher />
    </ProtectedRoute>
  ),
});

const platformRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/platform",
  component: () => (
    <ProtectedRoute>
      <TenantsAdminPage />
    </ProtectedRoute>
  ),
});

const platformTenantsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/platform/tenants",
  component: () => (
    <ProtectedRoute>
      <TenantsAdminPage />
    </ProtectedRoute>
  ),
});

const platformCompaniesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/platform/companies",
  component: () => (
    <ProtectedRoute>
      <CompaniesAdminPage />
    </ProtectedRoute>
  ),
});

const platformBranchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/platform/branches",
  component: () => (
    <ProtectedRoute>
      <CompaniesAdminPage />
    </ProtectedRoute>
  ),
});

const platformLicensingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/platform/licensing",
  component: () => (
    <ProtectedRoute>
      <LicensingAdminPage />
    </ProtectedRoute>
  ),
});

const platformAuditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/platform/audit",
  component: () => (
    <ProtectedRoute>
      <TenantsAdminPage />
    </ProtectedRoute>
  ),
});

const platformFeatureFlagsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/platform/feature-flags",
  component: () => (
    <ProtectedRoute>
      <TenantsAdminPage />
    </ProtectedRoute>
  ),
});

const posRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const posMasterMenuItemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/master/menu-items",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const posMasterCategoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/master/categories",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const posMasterTablesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/master/tables",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const posMasterWaitersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/master/waiters",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const posMasterPaymentModesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/master/payment-modes",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const posMasterKitchenStationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/master/kitchen-stations",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const posTransactionBillingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/transaction/billing",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const posTransactionKDSRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/transaction/kds",
  component: () => (
    <ProtectedRoute>
      <KDSScreen />
    </ProtectedRoute>
  ),
});

const posTransactionShiftRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/transaction/shift",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const posReportsDailySalesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/reports/daily-sales",
  component: () => (
    <ProtectedRoute>
      <ReportsPage />
    </ProtectedRoute>
  ),
});

const posReportsItemSalesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/reports/item-sales",
  component: () => (
    <ProtectedRoute>
      <ReportsPage />
    </ProtectedRoute>
  ),
});

const posReportsCashierRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/reports/cashier-settlement",
  component: () => (
    <ProtectedRoute>
      <ReportsPage />
    </ProtectedRoute>
  ),
});

const posReportsGSTRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/reports/gst-summary",
  component: () => (
    <ProtectedRoute>
      <ReportsPage />
    </ProtectedRoute>
  ),
});

const posSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/settings",
  component: () => (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  ),
});

const restaurantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/restaurant",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const hotelRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hotel",
  component: () => (
    <ProtectedRoute>
      <HotelPage />
    </ProtectedRoute>
  ),
});

const pgRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pg",
  component: () => (
    <ProtectedRoute>
      <PGManagementPage />
    </ProtectedRoute>
  ),
});

const reservationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reservations",
  component: () => (
    <ProtectedRoute>
      <ReservationsPage />
    </ProtectedRoute>
  ),
});

const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inventory",
  component: () => (
    <ProtectedRoute>
      <InventoryPage />
    </ProtectedRoute>
  ),
});

const billingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/billing",
  component: () => (
    <ProtectedRoute>
      <BillingPage />
    </ProtectedRoute>
  ),
});

const financeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/finance",
  component: () => (
    <ProtectedRoute>
      <FinancePage />
    </ProtectedRoute>
  ),
});

const crmRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm",
  component: () => (
    <ProtectedRoute>
      <CRMPage />
    </ProtectedRoute>
  ),
});

const hrRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr",
  component: () => (
    <ProtectedRoute>
      <HRPage />
    </ProtectedRoute>
  ),
});

const aiRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai",
  component: () => (
    <ProtectedRoute>
      <AICopilotPage />
    </ProtectedRoute>
  ),
});

const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports",
  component: () => (
    <ProtectedRoute>
      <ReportsPage />
    </ProtectedRoute>
  ),
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: () => (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  ),
});

const formsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forms/$formKey",
  component: () => (
    <ProtectedRoute>
      <FormBuilderPage />
    </ProtectedRoute>
  ),
});

const platformStudioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/platform-studio",
  component: () => (
    <ProtectedRoute>
      <PlatformStudioPage />
    </ProtectedRoute>
  ),
});

const masterStudioRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/master-studio",
  component: () => (
    <ProtectedRoute>
      <MasterStudioPage />
    </ProtectedRoute>
  ),
});

const workflowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/workflow",
  component: () => (
    <ProtectedRoute>
      <WorkflowPage />
    </ProtectedRoute>
  ),
});

const communicationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/communication",
  component: () => (
    <ProtectedRoute>
      <CommunicationPage />
    </ProtectedRoute>
  ),
});

const projectTrackerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/project-tracker",
  component: () => (
    <ProtectedRoute>
      <ProjectTrackerPage />
    </ProtectedRoute>
  ),
});

const enterpriseRoadmapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/enterprise-roadmap",
  component: () => (
    <ProtectedRoute>
      <EnterpriseRoadmapPage />
    </ProtectedRoute>
  ),
});

// ─── Connected App Routes ────────────────────────────────────

const appsFoodRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/food",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="food" />
    </ProtectedRoute>
  ),
});

const appsStayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/stay",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="stay" />
    </ProtectedRoute>
  ),
});

const appsKDSRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/kds",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="kds" />
    </ProtectedRoute>
  ),
});

const appsStaffRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/staff",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="staff" />
    </ProtectedRoute>
  ),
});

const appsMobileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/mobile",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="mobile" />
    </ProtectedRoute>
  ),
});

const appsAdminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/admin",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="admin" />
    </ProtectedRoute>
  ),
});

// ─── POS Sub-routes ──────────────────────────────────────────

const posCategoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/categories",
  component: () => (
    <ProtectedRoute>
      <RestaurantPage />
    </ProtectedRoute>
  ),
});

const posMenuItemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/menu-items",
  component: () => (
    <ProtectedRoute>
      <RestaurantPage />
    </ProtectedRoute>
  ),
});

const posStationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/stations",
  component: () => (
    <ProtectedRoute>
      <RestaurantPage />
    </ProtectedRoute>
  ),
});

const posKdsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/kds",
  component: () => (
    <ProtectedRoute>
      <KDSScreen />
    </ProtectedRoute>
  ),
});

const posCounterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/counter",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const posSalesReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/sales-report",
  component: () => (
    <ProtectedRoute>
      <RestaurantPage />
    </ProtectedRoute>
  ),
});

const posTablesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/tables",
  component: () => (
    <ProtectedRoute>
      <RestaurantPage />
    </ProtectedRoute>
  ),
});


// ─── Hotel Sub-routes ────────────────────────────────────────

const hotelRoomsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hotel/rooms",
  component: () => (
    <ProtectedRoute>
      <HotelPage />
    </ProtectedRoute>
  ),
});

const hotelGuestsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hotel/guests",
  component: () => (
    <ProtectedRoute>
      <HotelPage />
    </ProtectedRoute>
  ),
});

const hotelReservationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hotel/reservations",
  component: () => (
    <ProtectedRoute>
      <HotelPage />
    </ProtectedRoute>
  ),
});

const hotelCheckoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hotel/checkout",
  component: () => (
    <ProtectedRoute>
      <HotelPage />
    </ProtectedRoute>
  ),
});

const hotelOccupancyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hotel/occupancy-report",
  component: () => (
    <ProtectedRoute>
      <HotelPage />
    </ProtectedRoute>
  ),
});

// ─── PG Sub-routes ───────────────────────────────────────────

const pgBedsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pg/beds",
  component: () => (
    <ProtectedRoute>
      <PGManagementPage />
    </ProtectedRoute>
  ),
});

const pgRoomsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pg/rooms",
  component: () => (
    <ProtectedRoute>
      <PGManagementPage />
    </ProtectedRoute>
  ),
});

const pgResidentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pg/residents",
  component: () => (
    <ProtectedRoute>
      <PGManagementPage />
    </ProtectedRoute>
  ),
});

const pgRentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pg/rent",
  component: () => (
    <ProtectedRoute>
      <PGManagementPage />
    </ProtectedRoute>
  ),
});

const pgLedgerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pg/ledger",
  component: () => (
    <ProtectedRoute>
      <PGManagementPage />
    </ProtectedRoute>
  ),
});

// ─── Inventory Sub-routes ────────────────────────────────────

const inventoryItemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inventory/items",
  component: () => (
    <ProtectedRoute>
      <InventoryPage />
    </ProtectedRoute>
  ),
});

const inventoryVendorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inventory/vendors",
  component: () => (
    <ProtectedRoute>
      <InventoryPage />
    </ProtectedRoute>
  ),
});

const inventoryAdjustmentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inventory/adjustment",
  component: () => (
    <ProtectedRoute>
      <InventoryPage />
    </ProtectedRoute>
  ),
});

const inventoryLedgerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inventory/ledger-report",
  component: () => (
    <ProtectedRoute>
      <InventoryPage />
    </ProtectedRoute>
  ),
});

// ─── Finance Sub-routes ──────────────────────────────────────

const financeChartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/finance/chart",
  component: () => (
    <ProtectedRoute>
      <FinancePage />
    </ProtectedRoute>
  ),
});

const financeJournalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/finance/journal",
  component: () => (
    <ProtectedRoute>
      <FinancePage />
    </ProtectedRoute>
  ),
});

const financePLRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/finance/profit-loss",
  component: () => (
    <ProtectedRoute>
      <FinancePage />
    </ProtectedRoute>
  ),
});

// ─── HR Sub-routes ───────────────────────────────────────────

const hrEmployeesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/employees",
  component: () => (
    <ProtectedRoute>
      <HRPage />
    </ProtectedRoute>
  ),
});

const hrAttendanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/attendance",
  component: () => (
    <ProtectedRoute>
      <HRPage />
    </ProtectedRoute>
  ),
});

const hrPayrollRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/payroll-run",
  component: () => (
    <ProtectedRoute>
      <HRPage />
    </ProtectedRoute>
  ),
});

const hrPayslipRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/payslips",
  component: () => (
    <ProtectedRoute>
      <HRPage />
    </ProtectedRoute>
  ),
});

// ─── Restaurant/Sweet Shop Sub-routes ────────────────────────

const restaurantRecipesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/restaurant/recipes",
  component: () => (
    <ProtectedRoute>
      <RestaurantPage />
    </ProtectedRoute>
  ),
});

const restaurantBillingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/restaurant/billing",
  component: () => (
    <ProtectedRoute>
      <RestaurantPage />
    </ProtectedRoute>
  ),
});

const restaurantSalesReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/restaurant/sales-report",
  component: () => (
    <ProtectedRoute>
      <RestaurantPage />
    </ProtectedRoute>
  ),
});

// ─── CRM Sub-routes ──────────────────────────────────────────

const crmTiersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm/tiers",
  component: () => (
    <ProtectedRoute>
      <CRMPage />
    </ProtectedRoute>
  ),
});

const crmPointsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm/points",
  component: () => (
    <ProtectedRoute>
      <CRMPage />
    </ProtectedRoute>
  ),
});

const crmLedgerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm/ledger",
  component: () => (
    <ProtectedRoute>
      <CRMPage />
    </ProtectedRoute>
  ),
});

// ─── Reservations Sub-routes ─────────────────────────────────

const reservationsTablesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reservations/tables",
  component: () => (
    <ProtectedRoute>
      <ReservationsPage />
    </ProtectedRoute>
  ),
});

const reservationsNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reservations/new",
  component: () => (
    <ProtectedRoute>
      <ReservationsPage />
    </ProtectedRoute>
  ),
});

const reservationsLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reservations/log",
  component: () => (
    <ProtectedRoute>
      <ReservationsPage />
    </ProtectedRoute>
  ),
});

// ─── Reports Sub-routes ──────────────────────────────────────

const reportsTemplatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports/templates",
  component: () => (
    <ProtectedRoute>
      <ReportsPage />
    </ProtectedRoute>
  ),
});

const reportsRunRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports/run",
  component: () => (
    <ProtectedRoute>
      <ReportsPage />
    </ProtectedRoute>
  ),
});

const reportsSummaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports/summary",
  component: () => (
    <ProtectedRoute>
      <ReportsPage />
    </ProtectedRoute>
  ),
});

// ─── AI Sub-routes ───────────────────────────────────────────

const aiConfigRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai/config",
  component: () => (
    <ProtectedRoute>
      <AICopilotPage />
    </ProtectedRoute>
  ),
});

const aiChatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai/chat",
  component: () => (
    <ProtectedRoute>
      <AICopilotPage />
    </ProtectedRoute>
  ),
});

const aiPredictRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai/predict",
  component: () => (
    <ProtectedRoute>
      <AICopilotPage />
    </ProtectedRoute>
  ),
});

// ─── Workflow Sub-routes ─────────────────────────────────────

const workflowRulesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/workflow/rules",
  component: () => (
    <ProtectedRoute>
      <WorkflowPage />
    </ProtectedRoute>
  ),
});

const workflowInboxRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/workflow/inbox",
  component: () => (
    <ProtectedRoute>
      <WorkflowPage />
    </ProtectedRoute>
  ),
});

const workflowAuditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/workflow/audit",
  component: () => (
    <ProtectedRoute>
      <WorkflowPage />
    </ProtectedRoute>
  ),
});

// ─── Communication Sub-routes ────────────────────────────────

const communicationTemplatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/communication/templates",
  component: () => (
    <ProtectedRoute>
      <CommunicationPage />
    </ProtectedRoute>
  ),
});

const communicationSendRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/communication/send",
  component: () => (
    <ProtectedRoute>
      <CommunicationPage />
    </ProtectedRoute>
  ),
});

const communicationLogsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/communication/logs",
  component: () => (
    <ProtectedRoute>
      <CommunicationPage />
    </ProtectedRoute>
  ),
});

// ─── Forms Sub-routes ────────────────────────────────────────

const formsDesignerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forms/designer",
  component: () => (
    <ProtectedRoute>
      <FormBuilderPage />
    </ProtectedRoute>
  ),
});

const formsFillRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forms/fill",
  component: () => (
    <ProtectedRoute>
      <FormBuilderPage />
    </ProtectedRoute>
  ),
});

const formsResponsesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forms/responses",
  component: () => (
    <ProtectedRoute>
      <FormBuilderPage />
    </ProtectedRoute>
  ),
});

// ─── Platform Studio Sub-routes ──────────────────────────────

const platformSchemasRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/platform-studio/schemas",
  component: () => (
    <ProtectedRoute>
      <PlatformStudioPage />
    </ProtectedRoute>
  ),
});

const platformFormsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/platform-studio/forms",
  component: () => (
    <ProtectedRoute>
      <PlatformStudioPage />
    </ProtectedRoute>
  ),
});

const platformLogsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/platform-studio/logs",
  component: () => (
    <ProtectedRoute>
      <PlatformStudioPage />
    </ProtectedRoute>
  ),
});

// ─── Settings Sub-routes ─────────────────────────────────────

const settingsOutletsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings/outlets",
  component: () => (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  ),
});

const settingsBackupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings/backup",
  component: () => (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  ),
});

const settingsAuditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings/audit",
  component: () => (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  ),
});

// ─── Project Tracker Sub-routes ──────────────────────────────

const projectMilestonesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/project-tracker/milestones",
  component: () => (
    <ProtectedRoute>
      <ProjectTrackerPage />
    </ProtectedRoute>
  ),
});

const projectTimesheetRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/project-tracker/timesheet",
  component: () => (
    <ProtectedRoute>
      <ProjectTrackerPage />
    </ProtectedRoute>
  ),
});

const projectVelocityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/project-tracker/velocity",
  component: () => (
    <ProtectedRoute>
      <ProjectTrackerPage />
    </ProtectedRoute>
  ),
});

// ─── Connected Apps Sub-routes ───────────────────────────────

const appsFoodMenuRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/food/menu",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="food" />
    </ProtectedRoute>
  ),
});

const appsFoodOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/food/orders",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="food" />
    </ProtectedRoute>
  ),
});

const appsFoodSessionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/food/sessions",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="food" />
    </ProtectedRoute>
  ),
});

const appsStayConfigRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/stay/config",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="stay" />
    </ProtectedRoute>
  ),
});

const appsStayBookingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/stay/bookings",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="stay" />
    </ProtectedRoute>
  ),
});

const appsStayInvoicesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/stay/invoices",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="stay" />
    </ProtectedRoute>
  ),
});

const appsKdsStationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/kds/stations",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="kds" />
    </ProtectedRoute>
  ),
});

const appsKdsQueueRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/kds/queue",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="kds" />
    </ProtectedRoute>
  ),
});

const appsKdsLogsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/kds/logs",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="kds" />
    </ProtectedRoute>
  ),
});

const appsStaffTasksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/staff/tasks",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="staff" />
    </ProtectedRoute>
  ),
});

const appsStaffShiftsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/staff/shifts",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="staff" />
    </ProtectedRoute>
  ),
});

const appsStaffChecklistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/staff/checklist",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="staff" />
    </ProtectedRoute>
  ),
});

const appsMobileCatalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/mobile/catalog",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="mobile" />
    </ProtectedRoute>
  ),
});

const appsMobileCheckinsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/mobile/checkins",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="mobile" />
    </ProtectedRoute>
  ),
});

const appsMobileNotificationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/mobile/notifications",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="mobile" />
    </ProtectedRoute>
  ),
});

const appsAdminConfigRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/admin/config",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="admin" />
    </ProtectedRoute>
  ),
});

const appsAdminMonitorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/admin/monitor",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="admin" />
    </ProtectedRoute>
  ),
});

const appsAdminSecurityRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/apps/admin/security",
  component: () => (
    <ProtectedRoute>
      <ConnectedAppPage appKey="admin" />
    </ProtectedRoute>
  ),
});

// ─── Route Tree ──────────────────────────────────────────────

const routeTree = rootRoute.addChildren([
  loginRoute,
  indexRoute,
  posRoute,
  posMasterMenuItemsRoute,
  posMasterCategoriesRoute,
  posMasterTablesRoute,
  posMasterWaitersRoute,
  posMasterPaymentModesRoute,
  posMasterKitchenStationsRoute,
  posTransactionBillingRoute,
  posTransactionKDSRoute,
  posTransactionShiftRoute,
  posReportsDailySalesRoute,
  posReportsItemSalesRoute,
  posReportsCashierRoute,
  posReportsGSTRoute,
  posSettingsRoute,
  posCategoriesRoute,
  posMenuItemsRoute,
  posStationsRoute,
  posKdsRoute,
  posTablesRoute,
  posCounterRoute,
  posSalesReportRoute,

  restaurantRoute,
  restaurantRecipesRoute,
  restaurantBillingRoute,
  restaurantSalesReportRoute,
  hotelRoute,
  hotelRoomsRoute,
  hotelGuestsRoute,
  hotelReservationsRoute,
  hotelCheckoutRoute,
  hotelOccupancyRoute,
  pgRoute,
  pgRoomsRoute,
  pgBedsRoute,
  pgResidentsRoute,
  pgRentRoute,
  pgLedgerRoute,
  reservationsRoute,
  reservationsTablesRoute,
  reservationsNewRoute,
  reservationsLogRoute,
  inventoryRoute,
  inventoryItemsRoute,
  inventoryVendorsRoute,
  inventoryAdjustmentRoute,
  inventoryLedgerRoute,
  billingRoute,
  financeRoute,
  financeChartRoute,
  financeJournalRoute,
  financePLRoute,
  crmRoute,
  crmTiersRoute,
  crmPointsRoute,
  crmLedgerRoute,
  hrRoute,
  hrEmployeesRoute,
  hrAttendanceRoute,
  hrPayrollRoute,
  hrPayslipRoute,
  reportsRoute,
  reportsTemplatesRoute,
  reportsRunRoute,
  reportsSummaryRoute,
  aiRoute,
  aiConfigRoute,
  aiChatRoute,
  aiPredictRoute,
  settingsRoute,
  settingsOutletsRoute,
  settingsBackupRoute,
  settingsAuditRoute,
  platformRoute,
  platformTenantsRoute,
  platformCompaniesRoute,
  platformBranchesRoute,
  platformLicensingRoute,
  platformAuditRoute,
  platformFeatureFlagsRoute,
  formsRoute,
  formsDesignerRoute,
  formsFillRoute,
  formsResponsesRoute,
  platformStudioRoute,
  masterStudioRoute,
  platformSchemasRoute,
  platformFormsRoute,
  platformLogsRoute,
  workflowRoute,
  workflowRulesRoute,
  workflowInboxRoute,
  workflowAuditRoute,
  communicationRoute,
  communicationTemplatesRoute,
  communicationSendRoute,
  communicationLogsRoute,
  projectTrackerRoute,
  enterpriseRoadmapRoute,
  projectMilestonesRoute,
  projectTimesheetRoute,
  projectVelocityRoute,
  appsFoodRoute,
  appsFoodMenuRoute,
  appsFoodOrdersRoute,
  appsFoodSessionsRoute,
  appsStayRoute,
  appsStayConfigRoute,
  appsStayBookingsRoute,
  appsStayInvoicesRoute,
  appsKDSRoute,
  appsKdsStationsRoute,
  appsKdsQueueRoute,
  appsKdsLogsRoute,
  appsStaffRoute,
  appsStaffTasksRoute,
  appsStaffShiftsRoute,
  appsStaffChecklistRoute,
  appsMobileRoute,
  appsMobileCatalogRoute,
  appsMobileCheckinsRoute,
  appsMobileNotificationsRoute,
  appsAdminRoute,
  appsAdminConfigRoute,
  appsAdminMonitorRoute,
  appsAdminSecurityRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
