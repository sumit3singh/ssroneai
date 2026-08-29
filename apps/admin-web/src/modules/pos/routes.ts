export const posRoutes = {
  root: "/pos",
  dashboard: "/pos/dashboard",
  master: {
    root: "/pos/master",
    categories: "/pos/master/categories",
    menuItems: "/pos/master/menu-items",
    tables: "/pos/master/tables",
    waiters: "/pos/master/waiters",
    paymentModes: "/pos/master/payment-modes",
    kitchenStations: "/pos/master/kitchen-stations"
  },
  transaction: {
    root: "/pos/transaction",
    billing: "/pos/transaction/billing",
    orders: "/pos/transaction/orders",
    tables: "/pos/transaction/tables",
    kds: "/pos/transaction/kds",
    shift: "/pos/transaction/shift"
  },
  reports: {
    root: "/pos/reports",
    dailySales: "/pos/reports/daily-sales",
    itemSales: "/pos/reports/item-sales",
    cashierSettlement: "/pos/reports/cashier-settlement",
    gstSummary: "/pos/reports/gst-summary"
  },
  settings: "/pos/settings"
} as const;
