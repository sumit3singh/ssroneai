/**
 * The ssrone – Route Tree
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
import { POSPage, KDSScreen, POSOrdersListPage } from "@/modules/pos";
import { POSCustomerFacingDisplayPage } from "@/modules/pos/pages/transaction/POSCustomerFacingDisplayPage";
import { lazy } from "react";
import { ConnectedAppsLauncher } from "@/shared/layout/ConnectedAppsLauncher";
import { ConnectedAppPage } from "@/shared/layout/ConnectedAppPage";
import { PlatformRedirectPage } from "@/shared/pages/PlatformRedirectPage";
import { ComingSoonPage } from "@/shared/components/ComingSoonPage";

// ─── Code-Split Secondary Modules (Lazy Loaded on Navigation) ──
const HotelPage = lazy(() => import("@/modules/hotel").then(m => ({ default: m.HotelPage })));
const PGManagementPage = lazy(() => import("@/modules/pg-management").then(m => ({ default: m.PGManagementPage })));
const InventoryPage = lazy(() => import("@/modules/inventory").then(m => ({ default: m.InventoryPage })));
const CRMPage = lazy(() => import("@/modules/crm").then(m => ({ default: m.CRMPage })));

const HRPage = lazy(() => import("@/modules/hr").then(m => ({ default: m.HRPage })));
const EmployeeDirectoryPage = lazy(() => import("@/modules/hr").then(m => ({ default: m.EmployeeDirectoryPage })));
const DepartmentMasterPage = lazy(() => import("@/modules/hr").then(m => ({ default: m.DepartmentMasterPage })));
const DesignationMasterPage = lazy(() => import("@/modules/hr").then(m => ({ default: m.DesignationMasterPage })));
const AttendancePunchPage = lazy(() => import("@/modules/hr").then(m => ({ default: m.AttendancePunchPage })));
const PayrollGenerationPage = lazy(() => import("@/modules/hr").then(m => ({ default: m.PayrollGenerationPage })));
const SalarySlipReportPage = lazy(() => import("@/modules/hr").then(m => ({ default: m.SalarySlipReportPage })));

const AICopilotPage = lazy(() => import("@/modules/ai-copilot").then(m => ({ default: m.AICopilotPage })));

const SettingsPage = lazy(() => import("@/modules/settings").then(m => ({ default: m.SettingsPage })));
const PlatformStudioPage = lazy(() => import("@/modules/settings").then(m => ({ default: m.PlatformStudioPage })));
const MasterStudioPage = lazy(() => import("@/modules/settings").then(m => ({ default: m.MasterStudioPage })));
const WorkflowPage = lazy(() => import("@/modules/settings").then(m => ({ default: m.WorkflowPage })));
const CommunicationPage = lazy(() => import("@/modules/settings").then(m => ({ default: m.CommunicationPage })));
const ProjectTrackerPage = lazy(() => import("@/modules/settings").then(m => ({ default: m.ProjectTrackerPage })));
const EnterpriseRoadmapPage = lazy(() => import("@/modules/settings").then(m => ({ default: m.EnterpriseRoadmapPage })));

const FinancePage = lazy(() => import("@/modules/finance").then(m => ({ default: m.FinancePage })));
const FormBuilderPage = lazy(() => import("@/modules/forms").then(m => ({ default: m.FormBuilderPage })));
const CustomizationStudioPage = lazy(() => import("@/modules/customization").then(m => ({ default: m.CustomizationStudioPage })));


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
      <PlatformRedirectPage />
    </ProtectedRoute>
  ),
});

const platformTenantsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/platform/tenants",
  component: () => (
    <ProtectedRoute>
      <PlatformRedirectPage />
    </ProtectedRoute>
  ),
});

const platformCompaniesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/platform/companies",
  component: () => (
    <ProtectedRoute>
      <PlatformRedirectPage />
    </ProtectedRoute>
  ),
});

const platformBranchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/platform/branches",
  component: () => (
    <ProtectedRoute>
      <PlatformRedirectPage />
    </ProtectedRoute>
  ),
});

const platformLicensingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/platform/licensing",
  component: () => (
    <ProtectedRoute>
      <PlatformRedirectPage />
    </ProtectedRoute>
  ),
});

const platformAuditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/platform/audit",
  component: () => (
    <ProtectedRoute>
      <PlatformRedirectPage />
    </ProtectedRoute>
  ),
});

const platformFeatureFlagsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/platform/feature-flags",
  component: () => (
    <ProtectedRoute>
      <PlatformRedirectPage />
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

const posCustomerFacingDisplayRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/cfd",
  component: () => <POSCustomerFacingDisplayPage />,
});

const posTransactionKDSRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/transaction/kds",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const posTransactionOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/transaction/orders",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const posTransactionTablesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/transaction/tables",
  component: () => (
    <ProtectedRoute>
      <POSPage />
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
      <POSPage />
    </ProtectedRoute>
  ),
});

const posReportsItemSalesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/reports/item-sales",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const posReportsCashierRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/reports/cashier-settlement",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const posReportsGSTRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/reports/gst-summary",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const posReportsCategoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/reports/categories",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const posReportsDebtRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/reports/debt",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const posReportsVoidAuditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/reports/void-audit",
  component: () => (
    <ProtectedRoute>
      <POSPage />
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

const pgManagementRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pg-management",
  component: () => (
    <ProtectedRoute>
      <PGManagementPage />
    </ProtectedRoute>
  ),
});

const pgManagementSplatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pg-management/$",
  component: () => (
    <ProtectedRoute>
      <PGManagementPage />
    </ProtectedRoute>
  ),
});

const pgManagementMasterBedsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pg-management/master/beds",
  component: () => (
    <ProtectedRoute>
      <PGManagementPage />
    </ProtectedRoute>
  ),
});

const pgManagementMasterRoomsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pg-management/master/rooms",
  component: () => (
    <ProtectedRoute>
      <PGManagementPage />
    </ProtectedRoute>
  ),
});

const pgManagementMasterResidentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pg-management/master/residents",
  component: () => (
    <ProtectedRoute>
      <PGManagementPage />
    </ProtectedRoute>
  ),
});

const pgManagementMasterFloorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pg-management/master/floors",
  component: () => (
    <ProtectedRoute>
      <PGManagementPage />
    </ProtectedRoute>
  ),
});

const pgManagementTransRentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pg-management/transaction/rent",
  component: () => (
    <ProtectedRoute>
      <PGManagementPage />
    </ProtectedRoute>
  ),
});

const pgManagementTransVisitorsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pg-management/transaction/visitors",
  component: () => (
    <ProtectedRoute>
      <PGManagementPage />
    </ProtectedRoute>
  ),
});

const pgManagementReportLedgerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pg-management/report/ledger",
  component: () => (
    <ProtectedRoute>
      <PGManagementPage />
    </ProtectedRoute>
  ),
});

const pgManagementReportOccupancyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pg-management/report/occupancy",
  component: () => (
    <ProtectedRoute>
      <PGManagementPage />
    </ProtectedRoute>
  ),
});

const pgManagementSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pg-management/settings",
  component: () => (
    <ProtectedRoute>
      <PGManagementPage />
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

const crmSplatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm/$",
  component: () => (
    <ProtectedRoute>
      <CRMPage />
    </ProtectedRoute>
  ),
});

const crmMasterCustomersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm/master/customers",
  component: () => (
    <ProtectedRoute>
      <CRMPage />
    </ProtectedRoute>
  ),
});

const crmMasterTiersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm/master/tiers",
  component: () => (
    <ProtectedRoute>
      <CRMPage />
    </ProtectedRoute>
  ),
});

const crmTransPointsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm/transaction/points",
  component: () => (
    <ProtectedRoute>
      <CRMPage />
    </ProtectedRoute>
  ),
});

const crmTransInteractionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm/transaction/interactions",
  component: () => (
    <ProtectedRoute>
      <CRMPage />
    </ProtectedRoute>
  ),
});

const crmReportLedgerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm/report/ledger",
  component: () => (
    <ProtectedRoute>
      <CRMPage />
    </ProtectedRoute>
  ),
});

const crmLedgerShortRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm/ledger",
  component: () => (
    <ProtectedRoute>
      <CRMPage />
    </ProtectedRoute>
  ),
});

const crmTierDistributionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm/report/tier-distribution",
  component: () => (
    <ProtectedRoute>
      <CRMPage />
    </ProtectedRoute>
  ),
});

const crmCustomersShortRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm/customers",
  component: () => (
    <ProtectedRoute>
      <CRMPage />
    </ProtectedRoute>
  ),
});

const crmTiersShortRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm/tiers",
  component: () => (
    <ProtectedRoute>
      <CRMPage />
    </ProtectedRoute>
  ),
});

const crmPointsShortRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm/points",
  component: () => (
    <ProtectedRoute>
      <CRMPage />
    </ProtectedRoute>
  ),
});

const crmInteractionsShortRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm/interactions",
  component: () => (
    <ProtectedRoute>
      <CRMPage />
    </ProtectedRoute>
  ),
});

const crmCampaignsShortRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm/campaigns",
  component: () => (
    <ProtectedRoute>
      <CRMPage />
    </ProtectedRoute>
  ),
});

const crmSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/crm/settings",
  component: () => (
    <ProtectedRoute>
      <CRMPage />
    </ProtectedRoute>
  ),
});



const reservationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reservations",
  component: () => (
    <ProtectedRoute>
      <HotelPage />
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
      <POSPage />
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

const hrRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr",
  component: () => (
    <ProtectedRoute>
      <HRPage />
    </ProtectedRoute>
  ),
});

const hrEmployeesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/employees",
  component: () => (
    <ProtectedRoute>
      <EmployeeDirectoryPage />
    </ProtectedRoute>
  ),
});

const hrEmployeesMasterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/master/employees",
  component: () => (
    <ProtectedRoute>
      <HRPage />
    </ProtectedRoute>
  ),
});

const hrDepartmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/departments",
  component: () => (
    <ProtectedRoute>
      <HRPage />
    </ProtectedRoute>
  ),
});

const hrMasterDepartmentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/master/departments",
  component: () => (
    <ProtectedRoute>
      <HRPage />
    </ProtectedRoute>
  ),
});

const hrDesignationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/designations",
  component: () => (
    <ProtectedRoute>
      <HRPage />
    </ProtectedRoute>
  ),
});

const hrMasterDesignationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/master/designations",
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

const hrAttendanceTransRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/transaction/attendance",
  component: () => (
    <ProtectedRoute>
      <HRPage />
    </ProtectedRoute>
  ),
});

const hrPayrollRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/payroll",
  component: () => (
    <ProtectedRoute>
      <HRPage />
    </ProtectedRoute>
  ),
});

const hrPayrollTransRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/transaction/payroll",
  component: () => (
    <ProtectedRoute>
      <HRPage />
    </ProtectedRoute>
  ),
});

const hrPayslipRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/payslip",
  component: () => (
    <ProtectedRoute>
      <HRPage />
    </ProtectedRoute>
  ),
});

const hrReportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/reports",
  component: () => (
    <ProtectedRoute>
      <HRPage />
    </ProtectedRoute>
  ),
});

const hrWildcardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/hr/$",
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

const aiCopilotRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai-copilot",
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
      <POSPage />
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

const settingsApprovalsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings/approvals",
  component: () => (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  ),
});

const settingsPluginsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings/plugins",
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

const formsBuilderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/forms/builder",
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
      <POSPage />
    </ProtectedRoute>
  ),
});

const posMenuItemsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/menu-items",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const posStationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/stations",
  component: () => (
    <ProtectedRoute>
      <POSPage />
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
      <POSPage />
    </ProtectedRoute>
  ),
});

const posTablesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pos/tables",
  component: () => (
    <ProtectedRoute>
      <POSPage />
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

const inventoryGRNRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inventory/grn",
  component: () => (
    <ProtectedRoute>
      <InventoryPage />
    </ProtectedRoute>
  ),
});

const inventoryBatchesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inventory/batches",
  component: () => (
    <ProtectedRoute>
      <InventoryPage />
    </ProtectedRoute>
  ),
});

const inventoryWildcardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inventory/$",
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



// ─── Restaurant/Sweet Shop Sub-routes ────────────────────────

const restaurantRecipesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/restaurant/recipes",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const restaurantBillingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/restaurant/billing",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const restaurantSalesReportRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/restaurant/sales-report",
  component: () => (
    <ProtectedRoute>
      <POSPage />
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
      <POSPage />
    </ProtectedRoute>
  ),
});

const reservationsNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reservations/new",
  component: () => (
    <ProtectedRoute>
      <HotelPage />
    </ProtectedRoute>
  ),
});

const reservationsLogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reservations/log",
  component: () => (
    <ProtectedRoute>
      <HotelPage />
    </ProtectedRoute>
  ),
});

// ─── Reports Sub-routes ──────────────────────────────────────

const reportsTemplatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports/templates",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const reportsRunRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports/run",
  component: () => (
    <ProtectedRoute>
      <POSPage />
    </ProtectedRoute>
  ),
});

const reportsSummaryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reports/summary",
  component: () => (
    <ProtectedRoute>
      <POSPage />
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

const aiTemplatesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/ai/templates",
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

const customizationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/customization",
  component: () => (
    <ProtectedRoute>
      <CustomizationStudioPage />
    </ProtectedRoute>
  ),
});

const customizationDomainsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/customization/domains",
  component: () => (
    <ProtectedRoute>
      <CustomizationStudioPage />
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
  posTransactionOrdersRoute,
  posTransactionTablesRoute,
  posTransactionShiftRoute,
  posReportsDailySalesRoute,
  posReportsItemSalesRoute,
  posReportsCashierRoute,
  posReportsGSTRoute,
  posReportsCategoriesRoute,
  posReportsDebtRoute,
  posReportsVoidAuditRoute,
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
  pgManagementRoute,
  pgManagementSplatRoute,
  pgManagementMasterBedsRoute,
  pgManagementMasterRoomsRoute,
  pgManagementMasterResidentsRoute,
  pgManagementMasterFloorsRoute,
  pgManagementTransRentRoute,
  pgManagementTransVisitorsRoute,
  pgManagementReportLedgerRoute,
  pgManagementReportOccupancyRoute,
  pgManagementSettingsRoute,
  crmRoute,
  crmSplatRoute,
  crmMasterCustomersRoute,
  crmMasterTiersRoute,
  crmTransPointsRoute,
  crmTransInteractionsRoute,
  crmReportLedgerRoute,
  crmLedgerShortRoute,
  crmTierDistributionRoute,
  crmCustomersShortRoute,
  crmTiersShortRoute,
  crmPointsShortRoute,
  crmInteractionsShortRoute,
  crmCampaignsShortRoute,
  crmSettingsRoute,
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
  inventoryGRNRoute,
  inventoryBatchesRoute,
  inventoryWildcardRoute,
  billingRoute,
  financeRoute,
  financeChartRoute,
  financeJournalRoute,
  financePLRoute,
  hrRoute,
  hrEmployeesRoute,
  hrEmployeesMasterRoute,
  hrDepartmentsRoute,
  hrMasterDepartmentsRoute,
  hrDesignationsRoute,
  hrMasterDesignationsRoute,
  hrAttendanceRoute,
  hrAttendanceTransRoute,
  hrPayrollRoute,
  hrPayrollTransRoute,
  hrPayslipRoute,
  hrReportsRoute,
  reportsRoute,
  reportsTemplatesRoute,
  reportsRunRoute,
  reportsSummaryRoute,
  aiRoute,
  aiCopilotRoute,
  aiConfigRoute,
  aiChatRoute,
  aiPredictRoute,
  aiTemplatesRoute,
  settingsRoute,
  settingsApprovalsRoute,
  settingsPluginsRoute,
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
  formsBuilderRoute,
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
  customizationRoute,
  customizationDomainsRoute,
  hrWildcardRoute,
  posCustomerFacingDisplayRoute,
]);

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: () => <ComingSoonPage />,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
