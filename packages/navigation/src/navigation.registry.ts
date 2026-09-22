import { ModuleNavConfig } from "./types";

export const moduleNavigationRegistry: Record<string, ModuleNavConfig> = {
    pos: {
        moduleId: "pos",
        moduleName: "POS & Restaurant",
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
                    { id: "pos-master-cats", label: "Menu Categories", path: "/pos/master/categories", iconName: "Folder" },
                    { id: "pos-master-items", label: "Menu Items & Variants", path: "/pos/master/menu-items", iconName: "Utensils" },
                    { id: "pos-master-tables", label: "Dining Tables & Floor Plan", path: "/pos/master/tables", iconName: "LayoutGrid" },
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
                    { id: "pos-trans-tables", label: "Table Floor & Live Tracker", path: "/pos/transaction/tables", iconName: "LayoutGrid" },
                    { id: "pos-trans-orders", label: "Order Tracking & Edit", path: "/pos/transaction/orders", iconName: "Receipt" },
                    { id: "pos-trans-kds", label: "Kitchen Display (KDS)", path: "/pos/transaction/kds", iconName: "ChefHat" },
                    { id: "pos-trans-cfd", label: "Customer Display (2nd Screen)", path: "/pos/cfd", iconName: "Tv" },
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

    hotel: {
        moduleId: "hotel",
        moduleName: "Hotel PMS & Rooms",
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
                    { id: "hotel-master-rooms", label: "Rooms & Rate Cards", path: "/hotel/rooms", iconName: "Hotel" },
                    { id: "hotel-master-guests", label: "Guest Directory", path: "/hotel/guests", iconName: "Users" }
                ]
            },
            {
                id: "hotel-transaction",
                title: "TRANSACTION",
                iconName: "Receipt",
                items: [
                    { id: "hotel-trans-res", label: "Room Reservations", path: "/hotel/reservations", iconName: "Calendar" },
                    { id: "hotel-trans-checkout", label: "Check-In / Check-Out", path: "/hotel/checkout", iconName: "Key" }
                ]
            },
            {
                id: "hotel-report",
                title: "REPORT",
                iconName: "BarChart3",
                items: [
                    { id: "hotel-rep-occupancy", label: "Occupancy & RevPAR Analytics", path: "/hotel/occupancy-report", iconName: "TrendingUp" }
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
    },

    pg: {
        moduleId: "pg",
        moduleName: "PG & Hostels",
        moduleIcon: "Home",
        groups: [
            {
                id: "pg-dashboard",
                title: "DASHBOARD",
                iconName: "LayoutDashboard",
                items: [
                    { id: "pg-dash-main", label: "Hostel Occupancy Overview", path: "/pg-management", iconName: "LayoutDashboard" }
                ]
            },
            {
                id: "pg-master",
                title: "MASTER",
                iconName: "Database",
                items: [
                    { id: "pg-master-beds", label: "Bed Allotment Matrix", path: "/pg-management/master/beds", iconName: "LayoutGrid" },
                    { id: "pg-master-rooms", label: "Rooms & Sharing Types", path: "/pg-management/master/rooms", iconName: "Home" },
                    { id: "pg-master-residents", label: "Tenant Residents Directory", path: "/pg-management/master/residents", iconName: "Users" }
                ]
            },
            {
                id: "pg-transaction",
                title: "TRANSACTION",
                iconName: "Receipt",
                items: [
                    { id: "pg-trans-rent", label: "Rent Receipt Entry", path: "/pg-management/transaction/rent", iconName: "Receipt" },
                    { id: "pg-trans-visitors", label: "Visitor Check-In Log", path: "/pg-management/transaction/visitors", iconName: "UserCheck" }
                ]
            },
            {
                id: "pg-report",
                title: "REPORT",
                iconName: "BarChart3",
                items: [
                    { id: "pg-rep-ledger", label: "Rent Collection Ledger", path: "/pg-management/report/ledger", iconName: "TrendingUp" },
                    { id: "pg-rep-occupancy", label: "Occupancy & Revenue Yield", path: "/pg-management/report/occupancy", iconName: "BarChart3" }
                ]
            },
            {
                id: "pg-settings",
                title: "SETTINGS",
                iconName: "Settings",
                items: [
                    { id: "pg-set-config", label: "Deposit & Penalty Slabs", path: "/pg-management/settings", iconName: "Settings" }
                ]
            }
        ]
    },

    inventory: {
        moduleId: "inventory",
        moduleName: "Material & Inventory",
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
                    { id: "inv-master-items", label: "Raw Ingredients & Stock Items", path: "/inventory/items", iconName: "Package" },
                    { id: "inv-master-vendors", label: "Supplier Vendors", path: "/inventory/vendors", iconName: "Users" }
                ]
            },
            {
                id: "inv-transaction",
                title: "TRANSACTION",
                iconName: "Receipt",
                items: [
                    { id: "inv-trans-adj", label: "Stock Adjustments & Waste", path: "/inventory/adjustment", iconName: "RefreshCw" },
                    { id: "inv-trans-grn", label: "Goods Receipt Note (GRN)", path: "/inventory/grn", iconName: "Truck" },
                    { id: "inv-trans-batches", label: "Daily Production Batches", path: "/inventory/batches", iconName: "Factory" }
                ]
            },
            {
                id: "inv-report",
                title: "REPORT",
                iconName: "BarChart3",
                items: [
                    { id: "inv-rep-ledger", label: "Stock Valuation Ledger", path: "/inventory/ledger-report", iconName: "TrendingUp" }
                ]
            },
            {
                id: "inv-settings",
                title: "SETTINGS",
                iconName: "Settings",
                items: [
                    { id: "inv-set-config", label: "Reorder Alert Levels", path: "/inventory/settings", iconName: "Settings" }
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
                    { id: "fin-master-chart", label: "Chart of Accounts", path: "/finance/chart", iconName: "Folder" },
                    { id: "fin-master-fy", label: "Financial Years & Periods", path: "/finance/financial-years", iconName: "Calendar" },
                    { id: "fin-master-budgets", label: "Annual & Monthly Budgets", path: "/finance/budgets", iconName: "PieChart" }
                ]
            },
            {
                id: "fin-transaction",
                title: "TRANSACTION",
                iconName: "Receipt",
                items: [
                    { id: "fin-trans-journal", label: "Journal & Voucher Entry", path: "/finance/journal", iconName: "FileText" },
                    { id: "fin-trans-invoices", label: "Corporate Invoices & Billing", path: "/finance/invoices", iconName: "Receipt" }
                ]
            },
            {
                id: "fin-report",
                title: "REPORT",
                iconName: "BarChart3",
                items: [
                    { id: "fin-rep-pl", label: "Profit & Loss Statement", path: "/finance/profit-loss", iconName: "TrendingUp" }
                ]
            },
            {
                id: "fin-settings",
                title: "SETTINGS",
                iconName: "Settings",
                items: [
                    { id: "fin-set-rules", label: "Fiscal Period Locks", path: "/finance/settings", iconName: "Settings" }
                ]
            }
        ]
    },

    crm: {
        moduleId: "crm",
        moduleName: "Guest CRM & Loyalty",
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
                    { id: "crm-master-tiers", label: "Loyalty Tiers", path: "/crm/tiers", iconName: "Award" }
                ]
            },
            {
                id: "crm-transaction",
                title: "TRANSACTION",
                iconName: "Receipt",
                items: [
                    { id: "crm-trans-points", label: "Loyalty Points Redemptions", path: "/crm/points", iconName: "Gift" },
                    { id: "crm-trans-campaigns", label: "Promotional Campaigns", path: "/crm/campaigns", iconName: "Megaphone" },
                    { id: "crm-trans-interactions", label: "Guest Feedback & Support", path: "/crm/interactions", iconName: "MessageSquare" }
                ]
            },
            {
                id: "crm-report",
                title: "REPORT",
                iconName: "BarChart3",
                items: [
                    { id: "crm-rep-ledger", label: "Customer Visit Ledger", path: "/crm/ledger", iconName: "TrendingUp" }
                ]
            },
            {
                id: "crm-settings",
                title: "SETTINGS",
                iconName: "Settings",
                items: [
                    { id: "crm-set-rules", label: "SMS & Loyalty Rules", path: "/crm/settings", iconName: "Settings" }
                ]
            }
        ]
    },

    hr: {
        moduleId: "hr",
        moduleName: "HR & Payroll",
        moduleIcon: "User",
        groups: [
            {
                id: "hr-dashboard",
                title: "DASHBOARD",
                iconName: "LayoutDashboard",
                items: [
                    { id: "hr-dash-main", label: "HR & Staff Overview", path: "/hr", iconName: "LayoutDashboard" }
                ]
            },
            {
                id: "hr-master",
                title: "MASTER",
                iconName: "Database",
                items: [
                    { id: "hr-master-employees", label: "Employee Directory", path: "/hr/employees", iconName: "Users" },
                    { id: "hr-master-departments", label: "Department Master", path: "/hr/departments", iconName: "Building2" },
                    { id: "hr-master-designations", label: "Designation Master", path: "/hr/designations", iconName: "UserCheck" },
                    { id: "hr-master-shifts", label: "Shift Master", path: "/hr/shifts", iconName: "Clock" },
                    { id: "hr-master-leave-types", label: "Leave Types & Policies", path: "/hr/leave-types", iconName: "Calendar" }
                ]
            },
            {
                id: "hr-transaction",
                title: "TRANSACTION",
                iconName: "Receipt",
                items: [
                    { id: "hr-trans-attendance", label: "Daily Attendance & Overrides", path: "/hr/attendance", iconName: "Clock" },
                    { id: "hr-trans-leaves", label: "Leave Applications & Approvals", path: "/hr/leaves", iconName: "Calendar" },
                    { id: "hr-trans-payroll", label: "Payroll Execution & Register", path: "/hr/payroll", iconName: "DollarSign" }
                ]
            },
            {
                id: "hr-report",
                title: "REPORT",
                iconName: "BarChart3",
                items: [
                    { id: "hr-rep-payslip", label: "Salary Slip Reports", path: "/hr/payslip", iconName: "FileText" }
                ]
            },
            {
                id: "hr-settings",
                title: "SETTINGS",
                iconName: "Settings",
                items: [
                    { id: "hr-set-config", label: "PF & Tax Deductions", path: "/hr/settings", iconName: "Settings" }
                ]
            }
        ]
    },

    forms: {
        moduleId: "forms",
        moduleName: "Dynamic Forms",
        moduleIcon: "FormInput",
        groups: [
            {
                id: "forms-dashboard",
                title: "DASHBOARD",
                iconName: "LayoutDashboard",
                items: [
                    { id: "forms-dash-main", label: "Forms Central Studio", path: "/forms/builder", iconName: "LayoutDashboard" }
                ]
            },
            {
                id: "forms-master",
                title: "MASTER",
                iconName: "Database",
                items: [
                    { id: "forms-master-designer", label: "Form Schema Designer", path: "/forms/designer", iconName: "FormInput" }
                ]
            },
            {
                id: "forms-transaction",
                title: "TRANSACTION",
                iconName: "Receipt",
                items: [
                    { id: "forms-trans-fill", label: "Submit Form Record", path: "/forms/fill", iconName: "Send" }
                ]
            },
            {
                id: "forms-report",
                title: "REPORT",
                iconName: "BarChart3",
                items: [
                    { id: "forms-rep-responses", label: "Form Submissions Audit", path: "/forms/responses", iconName: "Table" }
                ]
            },
            {
                id: "forms-settings",
                title: "SETTINGS",
                iconName: "Settings",
                items: [
                    { id: "forms-set-config", label: "Field Validation Rules", path: "/forms/settings", iconName: "Settings" }
                ]
            }
        ]
    },

    ai: {
        moduleId: "ai",
        moduleName: "AI Copilot",
        moduleIcon: "Sparkles",
        groups: [
            {
                id: "ai-dashboard",
                title: "DASHBOARD",
                iconName: "LayoutDashboard",
                items: [
                    { id: "ai-dash-main", label: "AI Insights Command Center", path: "/ai", iconName: "LayoutDashboard" }
                ]
            },
            {
                id: "ai-master",
                title: "MASTER",
                iconName: "Database",
                items: [
                    { id: "ai-master-config", label: "Copilot Knowledge Base", path: "/ai/config", iconName: "Database" },
                    { id: "ai-master-templates", label: "Prompt Template Studio", path: "/ai/templates", iconName: "Sparkles" }
                ]
            },
            {
                id: "ai-transaction",
                title: "TRANSACTION",
                iconName: "Receipt",
                items: [
                    { id: "ai-trans-chat", label: "Interactive Assistant Chat", path: "/ai/chat", iconName: "Sparkles" }
                ]
            },
            {
                id: "ai-report",
                title: "REPORT",
                iconName: "BarChart3",
                items: [
                    { id: "ai-rep-predict", label: "Demand Forecasting Stream", path: "/ai/predict", iconName: "TrendingUp" }
                ]
            },
            {
                id: "ai-settings",
                title: "SETTINGS",
                iconName: "Settings",
                items: [
                    { id: "ai-set-config", label: "LLM API Key & Prompts", path: "/ai/settings", iconName: "Settings" }
                ]
            }
        ]
    },

    "project-tracker": {
        moduleId: "project-tracker",
        moduleName: "System Tracker",
        moduleIcon: "Kanban",
        groups: [
            {
                id: "pt-dashboard",
                title: "DASHBOARD",
                iconName: "LayoutDashboard",
                items: [
                    { id: "pt-dash-main", label: "Kanban Sprint Board", path: "/project-tracker", iconName: "LayoutDashboard" }
                ]
            },
            {
                id: "pt-master",
                title: "MASTER",
                iconName: "Database",
                items: [
                    { id: "pt-master-milestones", label: "Release Milestones", path: "/project-tracker/milestones", iconName: "Flag" }
                ]
            },
            {
                id: "pt-transaction",
                title: "TRANSACTION",
                iconName: "Receipt",
                items: [
                    { id: "pt-trans-timesheet", label: "Time Log & Dev Punch", path: "/project-tracker/timesheet", iconName: "Clock" }
                ]
            },
            {
                id: "pt-report",
                title: "REPORT",
                iconName: "BarChart3",
                items: [
                    { id: "pt-rep-velocity", label: "Sprint Velocity Chart", path: "/project-tracker/velocity", iconName: "TrendingUp" }
                ]
            },
            {
                id: "pt-settings",
                title: "SETTINGS",
                iconName: "Settings",
                items: [
                    { id: "pt-set-config", label: "Agile Workflow Sprints", path: "/project-tracker/settings", iconName: "Settings" }
                ]
            }
        ]
    },

    "enterprise-roadmap": {
        moduleId: "enterprise-roadmap",
        moduleName: "Enterprise Roadmap",
        moduleIcon: "FileText",
        groups: [
            {
                id: "er-dashboard",
                title: "DASHBOARD",
                iconName: "LayoutDashboard",
                items: [
                    { id: "er-dash-main", label: "Architecture Roadmap", path: "/enterprise-roadmap", iconName: "LayoutDashboard" }
                ]
            },
            {
                id: "er-master",
                title: "MASTER",
                iconName: "Database",
                items: [
                    { id: "er-master-charters", label: "Master Platform Charters", path: "/enterprise-roadmap", iconName: "FileText" }
                ]
            },
            {
                id: "er-transaction",
                title: "TRANSACTION",
                iconName: "Receipt",
                items: [
                    { id: "er-trans-audits", label: "System Compliance Audits", path: "/enterprise-roadmap", iconName: "CheckCircle2" }
                ]
            },
            {
                id: "er-report",
                title: "REPORT",
                iconName: "BarChart3",
                items: [
                    { id: "er-rep-matrix", label: "Feature Matrix Summary", path: "/enterprise-roadmap", iconName: "BarChart3" }
                ]
            },
            {
                id: "er-settings",
                title: "SETTINGS",
                iconName: "Settings",
                items: [
                    { id: "er-set-config", label: "Roadmap Milestones", path: "/enterprise-roadmap", iconName: "Settings" }
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
                    { id: "plat-dash-overview", label: "Platform Command Center", path: "/platform", iconName: "LayoutDashboard" },
                    { id: "plat-dash-leads", label: "Sales Inquiries & Leads", path: "/platform#leads", iconName: "Megaphone" }
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

    settings: {
        moduleId: "settings",
        moduleName: "System Settings",
        moduleIcon: "Settings",
        groups: [
            {
                id: "set-dashboard",
                title: "DASHBOARD",
                iconName: "LayoutDashboard",
                items: [
                    { id: "set-dash-main", label: "Workspace Preferences", path: "/settings", iconName: "LayoutDashboard" }
                ]
            },
            {
                id: "set-master",
                title: "MASTER",
                iconName: "Database",
                items: [
                    { id: "set-master-studio", label: "Master Data Registry", path: "/master-studio", iconName: "Database" }
                ]
            },
            {
                id: "set-transaction",
                title: "AUTOMATION & STUDIO",
                iconName: "Receipt",
                items: [
                    { id: "set-trans-workflow", label: "Workflow Rules", path: "/workflow", iconName: "GitMerge" },
                    { id: "set-trans-comm", label: "Communication Alerts", path: "/communication", iconName: "Send" },
                    { id: "set-trans-cust", label: "Branding & Customization Studio", path: "/customization", iconName: "Palette" },
                    { id: "set-trans-domains", label: "Custom Domains & DNS", path: "/customization/domains", iconName: "Globe" },
                    { id: "set-trans-approvals", label: "Maker-Checker Approvals", path: "/settings/approvals", iconName: "ShieldCheck" },
                    { id: "set-trans-plugins", label: "Plugin Connectors", path: "/settings/plugins", iconName: "Puzzle" }
                ]
            },
            {
                id: "set-report",
                title: "AUDIT",
                iconName: "BarChart3",
                items: [
                    { id: "set-rep-audit", label: "System Audit Logs", path: "/settings/audit", iconName: "FileText" }
                ]
            }
        ]
    },

    customization: {
        moduleId: "customization",
        moduleName: "Website & App Customization",
        moduleIcon: "Palette",
        groups: [
            {
                id: "customization-studio",
                title: "STUDIO",
                iconName: "Palette",
                items: [
                    { id: "customization-main", label: "Branding & Content Studio", path: "/customization", iconName: "Palette" },
                    { id: "customization-domains", label: "Custom Domains & DNS", path: "/customization/domains", iconName: "Globe" }
                ]
            },
            {
                id: "customization-apps",
                title: "CONNECTED PORTALS",
                iconName: "Smartphone",
                items: [
                    { id: "cust-app-food", label: "Customer Food Ordering App", path: "/apps/food/menu", iconName: "Utensils" },
                    { id: "cust-app-stay", label: "Guest Hotel Stay App", path: "/apps/stay/config", iconName: "Hotel" },
                    { id: "cust-app-kds", label: "Kitchen Display (KDS) App", path: "/apps/kds/stations", iconName: "ChefHat" },
                    { id: "cust-app-staff", label: "Waiter & Staff App", path: "/apps/staff/tasks", iconName: "Users" }
                ]
            }
        ]
    }
};

export const registerModuleNavigation = (config: ModuleNavConfig) => {
    moduleNavigationRegistry[config.moduleId] = config;
};
