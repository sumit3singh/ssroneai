export interface POSNavItem {
  id: string;
  label: string;
  iconName: string;
  path: string;
}

export const posNavigationItems: POSNavItem[] = [
  { id: "dashboard", label: "Dashboard", iconName: "LayoutDashboard", path: "/pos/dashboard" },
  { id: "master", label: "Master Config", iconName: "Database", path: "/pos/master" },
  { id: "transaction", label: "POS Terminal", iconName: "Receipt", path: "/pos/transaction" },
  { id: "report", label: "Analytics & Reports", iconName: "BarChart3", path: "/pos/report" },
  { id: "settings", label: "Settings", iconName: "Settings", path: "/pos/settings" }
];
