import { ModuleNavConfig } from "./types";

export const moduleNavigationRegistry: Record<string, ModuleNavConfig> = {
    pos: {
        moduleId: "pos",
        moduleName: "POS Counter Terminal",
        moduleIcon: "Store",
        groups: [
            {
                id: "pos-dashboard",
                title: "DASHBOARD",
                iconName: "LayoutDashboard",
                items: [
                    { id: "pos-dash-main", label: "Today's Operational Summary", path: "/pos", iconName: "LayoutDashboard" }
                ]
            },
            {
                id: "pos-master",
                title: "MASTER",
                iconName: "Database",
                items: [
                    { id: "pos-master-items", label: "Menu Items & Variants", path: "/pos/master/menu-items", iconName: "Utensils" },
                    { id: "pos-master-cats", label: "Menu Categories", path: "/pos/master/categories", iconName: "Folder" },
                    { id: "pos-master-tables", label: "Dining Tables & Floors", path: "/pos/master/tables", iconName: "LayoutGrid" },
                    { id: "pos-master-waiters", label: "Waiters & Staff", path: "/pos/master/waiters", iconName: "Users" },
                    { id: "pos-master-pm", label: "Payment Modes", path: "/pos/master/payment-modes", iconName: "CreditCard" },
                    { id: "pos-master-ks", label: "Kitchen Stations", path: "/pos/master/kitchen-stations", iconName: "ChefHat" }
                ]
            },
            {
                id: "pos-transaction",
                title: "TRANSACTION",
                iconName: "Receipt",
                items: [
                    { id: "pos-trans-billing", label: "POS Counter Billing", path: "/pos/transaction/billing", iconName: "ShoppingBag" },
                    { id: "pos-trans-kds", label: "Kitchen Display (KDS)", path: "/pos/transaction/kds", iconName: "ChefHat" },
                    { id: "pos-trans-shift", label: "Shift & Drawer Management", path: "/pos/transaction/shift", iconName: "Lock" }
                ]
            },
            {
                id: "pos-report",
                title: "REPORT",
                iconName: "BarChart3",
                items: [
                    { id: "pos-rep-daily", label: "Daily Sales Report", path: "/pos/reports/daily-sales", iconName: "TrendingUp" },
                    { id: "pos-rep-item", label: "Item Sales Analytics", path: "/pos/reports/item-sales", iconName: "BarChart3" },
                    { id: "pos-rep-cashier", label: "Cashier Settlement", path: "/pos/reports/cashier-settlement", iconName: "DollarSign" },
                    { id: "pos-rep-gst", label: "GST Tax Summary", path: "/pos/reports/gst-summary", iconName: "Percent" }
                ]
            },
            {
                id: "pos-settings",
                title: "SETTINGS",
                iconName: "Settings",
                items: [
                    { id: "pos-set-config", label: "POS & Thermal Printers", path: "/pos/settings", iconName: "Settings" }
                ]
            }
        ]
    },

    platform: {
        moduleId: "platform",
        moduleName: "Platform Administration",
        moduleIcon: "Shield",
        groups: [
            {
                id: "plat-dashboard",
                title: "DASHBOARD",
                iconName: "LayoutDashboard",
                items: [
                    { id: "plat-dash-overview", label: "Platform Command Center", path: "/platform", iconName: "LayoutDashboard" }
                ]
            },
            {
                id: "plat-master",
                title: "MASTER",
                iconName: "Database",
                items: [
                    { id: "plat-master-tenants", label: "Multi-Tenant Isolation", path: "/platform/tenants", iconName: "Building2" },
                    { id: "plat-master-companies", label: "Company & Fiscal Entities", path: "/platform/companies", iconName: "Building" },
                    { id: "plat-master-branches", label: "Branch Locations", path: "/platform/branches", iconName: "MapPin" }
                ]
            },
            {
                id: "plat-transaction",
                title: "TRANSACTION",
                iconName: "Receipt",
                items: [
                    { id: "plat-trans-licensing", label: "Licensing & Subscriptions", path: "/platform/licensing", iconName: "Key" }
                ]
            },
            {
                id: "plat-report",
                title: "REPORT",
                iconName: "BarChart3",
                items: [
                    { id: "plat-rep-audit", label: "Audit Trail & System Logs", path: "/platform/audit", iconName: "FileText" }
                ]
            },
            {
                id: "plat-settings",
                title: "SETTINGS",
                iconName: "Settings",
                items: [
                    { id: "plat-set-flags", label: "Enterprise Feature Flags", path: "/platform/feature-flags", iconName: "ToggleRight" }
                ]
            }
        ]
    },

    restaurant: {
        moduleId: "restaurant",
        moduleName: "Restaurant Management",
        moduleIcon: "Utensils",
        groups: [
            {
                id: "rest-dashboard",
                title: "DASHBOARD",
                iconName: "LayoutDashboard",
                items: [
                    { id: "rest-dash-main", label: "Restaurant Overview", path: "/restaurant", iconName: "LayoutDashboard" }
                ]
            },
            {
                id: "rest-master",
                title: "MASTER",
                iconName: "Database",
                items: [
                    { id: "rest-master-items", label: "Dishes & Catalog", path: "/restaurant/menu-items", iconName: "Utensils" },
                    { id: "rest-master-tables", label: "Table Layout Map", path: "/restaurant/tables", iconName: "LayoutGrid" }
                ]
            },
            {
                id: "rest-transaction",
                title: "TRANSACTION",
                iconName: "Receipt",
                items: [
                    { id: "rest-trans-orders", label: "Active Orders Stream", path: "/restaurant/orders", iconName: "ShoppingBag" }
                ]
            },
            {
                id: "rest-report",
                title: "REPORT",
                iconName: "BarChart3",
                items: [
                    { id: "rest-rep-sales", label: "Restaurant Sales Report", path: "/restaurant/reports", iconName: "TrendingUp" }
                ]
            },
            {
                id: "rest-settings",
                title: "SETTINGS",
                iconName: "Settings",
                items: [
                    { id: "rest-set-config", label: "Restaurant Configuration", path: "/restaurant/settings", iconName: "Settings" }
                ]
            }
        ]
    },

    inventory: {
        moduleId: "inventory",
        moduleName: "Inventory & Stock",
        moduleIcon: "Package",
        groups: [
            {
                id: "inv-dashboard",
                title: "DASHBOARD",
                iconName: "LayoutDashboard",
                items: [
                    { id: "inv-dash-main", label: "Stock Overview", path: "/inventory", iconName: "LayoutDashboard" }
                ]
            },
            {
                id: "inv-master",
                title: "MASTER",
                iconName: "Database",
                items: [
                    { id: "inv-master-items", label: "Raw Ingredients & Items", path: "/inventory/items", iconName: "Package" },
                    { id: "inv-master-suppliers", label: "Supplier Vendors", path: "/inventory/suppliers", iconName: "Users" }
                ]
            },
            {
                id: "inv-transaction",
                title: "TRANSACTION",
                iconName: "Receipt",
                items: [
                    { id: "inv-trans-po", label: "Purchase Orders", path: "/inventory/purchase-orders", iconName: "FileText" },
                    { id: "inv-trans-grn", label: "Goods Receive Notes (GRN)", path: "/inventory/grn", iconName: "CheckCircle2" }
                ]
            },
            {
                id: "inv-report",
                title: "REPORT",
                iconName: "BarChart3",
                items: [
                    { id: "inv-rep-valuation", label: "Stock Valuation Report", path: "/inventory/reports", iconName: "TrendingUp" }
                ]
            },
            {
                id: "inv-settings",
                title: "SETTINGS",
                iconName: "Settings",
                items: [
                    { id: "inv-set-config", label: "Inventory Thresholds", path: "/inventory/settings", iconName: "Settings" }
                ]
            }
        ]
    },

    finance: {
        moduleId: "finance",
        moduleName: "Finance & Accounting",
        moduleIcon: "DollarSign",
        groups: [
            {
                id: "fin-dashboard",
                title: "DASHBOARD",
                iconName: "LayoutDashboard",
                items: [
                    { id: "fin-dash-main", label: "Financial Executive Summary", path: "/finance", iconName: "LayoutDashboard" }
                ]
            },
            {
                id: "fin-master",
                title: "MASTER",
                iconName: "Database",
                items: [
                    { id: "fin-master-coa", label: "Chart of Accounts", path: "/finance/coa", iconName: "Folder" },
                    { id: "fin-master-banks", label: "Bank Accounts", path: "/finance/banks", iconName: "CreditCard" }
                ]
            },
            {
                id: "fin-transaction",
                title: "TRANSACTION",
                iconName: "Receipt",
                items: [
                    { id: "fin-trans-vouchers", label: "Journal & Payment Vouchers", path: "/finance/vouchers", iconName: "FileText" }
                ]
            },
            {
                id: "fin-report",
                title: "REPORT",
                iconName: "BarChart3",
                items: [
                    { id: "fin-rep-pnl", label: "Profit & Loss Statement", path: "/finance/pnl", iconName: "TrendingUp" },
                    { id: "fin-rep-gst", label: "GST Return Filing", path: "/finance/gst", iconName: "Percent" }
                ]
            },
            {
                id: "fin-settings",
                title: "SETTINGS",
                iconName: "Settings",
                items: [
                    { id: "fin-set-rules", label: "Fiscal Rules & Lock Date", path: "/finance/settings", iconName: "Settings" }
                ]
            }
        ]
    },

    crm: {
        moduleId: "crm",
        moduleName: "CRM & Guests",
        moduleIcon: "Users",
        groups: [
            {
                id: "crm-dashboard",
                title: "DASHBOARD",
                iconName: "LayoutDashboard",
                items: [
                    { id: "crm-dash-main", label: "Guest Intelligence Center", path: "/crm", iconName: "LayoutDashboard" }
                ]
            },
            {
                id: "crm-master",
                title: "MASTER",
                iconName: "Database",
                items: [
                    { id: "crm-master-guests", label: "Guest Directory", path: "/crm/guests", iconName: "Users" },
                    { id: "crm-master-tiers", label: "Loyalty Tiers", path: "/crm/loyalty-tiers", iconName: "Award" }
                ]
            },
            {
                id: "crm-transaction",
                title: "TRANSACTION",
                iconName: "Receipt",
                items: [
                    { id: "crm-trans-campaigns", label: "SMS & WhatsApp Campaigns", path: "/crm/campaigns", iconName: "Send" }
                ]
            },
            {
                id: "crm-report",
                title: "REPORT",
                iconName: "BarChart3",
                items: [
                    { id: "crm-rep-visits", label: "Guest Retention Analytics", path: "/crm/reports", iconName: "TrendingUp" }
                ]
            },
            {
                id: "crm-settings",
                title: "SETTINGS",
                iconName: "Settings",
                items: [
                    { id: "crm-set-rules", label: "Loyalty Point Rules", path: "/crm/settings", iconName: "Settings" }
                ]
            }
        ]
    },

    hotel: {
        moduleId: "hotel",
        moduleName: "Hotel Management",
        moduleIcon: "Hotel",
        groups: [
            {
                id: "hotel-dashboard",
                title: "DASHBOARD",
                iconName: "LayoutDashboard",
                items: [
                    { id: "hotel-dash-main", label: "Front Desk & Room Status", path: "/hotel", iconName: "LayoutDashboard" }
                ]
            },
            {
                id: "hotel-master",
                title: "MASTER",
                iconName: "Database",
                items: [
                    { id: "hotel-master-rooms", label: "Rooms & Rate Cards", path: "/hotel/rooms", iconName: "Hotel" }
                ]
            },
            {
                id: "hotel-transaction",
                title: "TRANSACTION",
                iconName: "Receipt",
                items: [
                    { id: "hotel-trans-checkin", label: "Guest Check-In / Check-Out", path: "/hotel/checkin", iconName: "Key" }
                ]
            },
            {
                id: "hotel-report",
                title: "REPORT",
                iconName: "BarChart3",
                items: [
                    { id: "hotel-rep-occupancy", label: "Occupancy & RevPAR Analytics", path: "/hotel/reports", iconName: "TrendingUp" }
                ]
            },
            {
                id: "hotel-settings",
                title: "SETTINGS",
                iconName: "Settings",
                items: [
                    { id: "hotel-set-config", label: "Housekeeping & Tax Rules", path: "/hotel/settings", iconName: "Settings" }
                ]
            }
        ]
    }
};

export const registerModuleNavigation = (config: ModuleNavConfig) => {
    moduleNavigationRegistry[config.moduleId] = config;
};
