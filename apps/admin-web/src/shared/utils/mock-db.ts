/**
 * The Baithak – Mock Database & Client Persistence Engine
 * Empty seeds to guarantee database is the only truth source.
 */

export const SEED_FILE_MASTER_ERP = [
  // Core Modules
  { code: "dashboard", label: "Dashboard", href: "/", icon: "LayoutDashboard", category: "core", parent_code: null, sort_order: 10, required_permission: null, required_feature: "dashboard" },
  { code: "pos", label: "POS Restaurant", href: "/pos", icon: "ShoppingCart", category: "core", parent_code: null, sort_order: 20, required_permission: "orders:write", required_feature: "pos" },
  { code: "hotel", label: "Hotel PMS", href: "/hotel", icon: "Hotel", category: "core", parent_code: null, sort_order: 30, required_permission: "reservations:read", required_feature: "hotel_pms" },
  { code: "pg", label: "PG Management", href: "/pg", icon: "Home", category: "core", parent_code: null, sort_order: 40, required_permission: "billing:read", required_feature: "pg_management" },
  { code: "restaurant_management", label: "Sweet Shop & Bakery", href: "/restaurant", icon: "Utensils", category: "core", parent_code: null, sort_order: 50, required_permission: "orders:read", required_feature: "restaurant" },
  { code: "inventory", label: "Inventory", href: "/inventory", icon: "Package", category: "core", parent_code: null, sort_order: 60, required_permission: "inventory:read", required_feature: "inventory" },
  { code: "crm", label: "CRM & Loyalty", href: "/crm", icon: "Users", category: "core", parent_code: null, sort_order: 70, required_permission: "crm:read", required_feature: "crm" },
  { code: "reservations", label: "Reservations", href: "/reservations", icon: "Building2", category: "core", parent_code: null, sort_order: 80, required_permission: "reservations:read", required_feature: "reservations" },
  { code: "finance", label: "Finance & Accounting", href: "/finance", icon: "DollarSign", category: "core", parent_code: null, sort_order: 90, required_permission: "finance:read", required_feature: "finance" },
  { code: "hr", label: "HR & Payroll", href: "/hr", icon: "UserCheck", category: "core", parent_code: null, sort_order: 100, required_permission: "hr:read", required_feature: "hr" },
  { code: "reports", label: "Reports & Analytics", href: "/reports", icon: "BarChart3", category: "core", parent_code: null, sort_order: 110, required_permission: "reports:read", required_feature: "reports" },

  // Sub-items for Hotel PMS
  { code: "hotel_room_setup", label: "Room Configuration Setup", href: "/hotel/rooms", icon: "Settings", category: "core", parent_code: "hotel", sort_order: 1, required_permission: "reservations:read", required_feature: "hotel_pms", type: "master" },
  { code: "hotel_guest_setup", label: "Guest Profiles Setup", href: "/hotel/guests", icon: "User", category: "core", parent_code: "hotel", sort_order: 2, required_permission: "reservations:read", required_feature: "hotel_pms", type: "master" },
  { code: "hotel_reservations", label: "Reservations & Booking", href: "/hotel/reservations", icon: "Calendar", category: "core", parent_code: "hotel", sort_order: 3, required_permission: "reservations:read", required_feature: "hotel_pms", type: "transaction" },
  { code: "hotel_checkout", label: "Billing & Room Checkout", href: "/hotel/checkout", icon: "DollarSign", category: "core", parent_code: "hotel", sort_order: 4, required_permission: "reservations:read", required_feature: "hotel_pms", type: "transaction" },
  { code: "hotel_occupancy_report", label: "Occupancy & Revenue List", href: "/hotel/occupancy-report", icon: "Activity", category: "core", parent_code: "hotel", sort_order: 5, required_permission: "reservations:read", required_feature: "hotel_pms", type: "report" },

  // Sub-items for POS Restaurant
  { code: "pos_menu_setup", label: "Menu & Dish Setup", href: "/restaurant", icon: "Utensils", category: "core", parent_code: "pos", sort_order: 1, required_permission: "orders:write", required_feature: "pos", type: "master" },
  { code: "pos_station_setup", label: "Kitchen Station Setup", href: "/pos/stations", icon: "ChefHat", category: "core", parent_code: "pos", sort_order: 2, required_permission: "orders:write", required_feature: "pos", type: "master" },
  { code: "pos_table_setup", label: "Table Setup Configuration", href: "/pos/tables", icon: "Grid", category: "core", parent_code: "pos", sort_order: 3, required_permission: "orders:write", required_feature: "pos", type: "master" },

  { code: "pos_counter", label: "Quick POS Billing", href: "/pos", icon: "ShoppingCart", category: "core", parent_code: "pos", sort_order: 5, required_permission: "orders:write", required_feature: "pos", type: "transaction" },
  { code: "pos_kds", label: "Live KDS Kitchen Display", href: "/pos/kds", icon: "Flame", category: "core", parent_code: "pos", sort_order: 6, required_permission: "orders:write", required_feature: "pos", type: "transaction" },
  { code: "pos_sales_report", label: "Daily Sales Register", href: "/pos/sales-report", icon: "BarChart3", category: "core", parent_code: "pos", sort_order: 7, required_permission: "orders:write", required_feature: "pos", type: "report" },


  // Sub-items for PG Management
  { code: "pg_room_setup", label: "Room Configuration Setup", href: "/pg/rooms", icon: "Settings", category: "core", parent_code: "pg", sort_order: 1, required_permission: "billing:read", required_feature: "pg_management", type: "master" },
  { code: "pg_bed_setup", label: "Bed Configuration Setup", href: "/pg/beds", icon: "Home", category: "core", parent_code: "pg", sort_order: 2, required_permission: "billing:read", required_feature: "pg_management", type: "master" },
  { code: "pg_resident_setup", label: "Resident Details Setup", href: "/pg/residents", icon: "User", category: "core", parent_code: "pg", sort_order: 3, required_permission: "billing:read", required_feature: "pg_management", type: "master" },
  { code: "pg_rent_collect", label: "Rent Posting & Receipts", href: "/pg/rent", icon: "DollarSign", category: "core", parent_code: "pg", sort_order: 4, required_permission: "billing:read", required_feature: "pg_management", type: "transaction" },
  { code: "pg_ledger_report", label: "Resident Account Ledger", href: "/pg/ledger", icon: "Activity", category: "core", parent_code: "pg", sort_order: 5, required_permission: "billing:read", required_feature: "pg_management", type: "report" },

  // Sub-items for Sweet Shop & Bakery (restaurant_management)
  { code: "restaurant_recipes", label: "Sweet Recipes Setup", href: "/restaurant/recipes", icon: "Settings", category: "core", parent_code: "restaurant_management", sort_order: 1, required_permission: "orders:read", required_feature: "restaurant", type: "master" },
  { code: "restaurant_billing", label: "Sweet Billing Counter", href: "/restaurant/billing", icon: "ShoppingCart", category: "core", parent_code: "restaurant_management", sort_order: 2, required_permission: "orders:read", required_feature: "restaurant", type: "transaction" },
  { code: "restaurant_sales_report", label: "Daily Bakery Sales", href: "/restaurant/sales-report", icon: "BarChart3", category: "core", parent_code: "restaurant_management", sort_order: 3, required_permission: "orders:read", required_feature: "restaurant", type: "report" },

  // Sub-items for Inventory
  { code: "inventory_item_setup", label: "Product & Material Master", href: "/inventory/items", icon: "Settings", category: "core", parent_code: "inventory", sort_order: 1, required_permission: "inventory:read", required_feature: "inventory", type: "master" },
  { code: "inventory_vendor_setup", label: "Vendor Setup Profiles", href: "/inventory/vendors", icon: "Users", category: "core", parent_code: "inventory", sort_order: 2, required_permission: "inventory:read", required_feature: "inventory", type: "master" },
  { code: "inventory_inward", label: "Stock Adjustment Entry", href: "/inventory/adjustment", icon: "Package", category: "core", parent_code: "inventory", sort_order: 3, required_permission: "inventory:read", required_feature: "inventory", type: "transaction" },
  { code: "inventory_ledger_report", label: "Stock Ledger Register", href: "/inventory/ledger-report", icon: "BarChart3", category: "core", parent_code: "inventory", sort_order: 4, required_permission: "inventory:read", required_feature: "inventory", type: "report" },

  // Sub-items for CRM & Loyalty (crm)
  { code: "crm_tiers", label: "Loyalty Tiers Setup", href: "/crm/tiers", icon: "Settings", category: "core", parent_code: "crm", sort_order: 1, required_permission: "crm:read", required_feature: "crm", type: "master" },
  { code: "crm_points", label: "Issue Loyalty Points", href: "/crm/points", icon: "Plus", category: "core", parent_code: "crm", sort_order: 2, required_permission: "crm:read", required_feature: "crm", type: "transaction" },
  { code: "crm_ledger", label: "Customer Loyalty Ledger", href: "/crm/ledger", icon: "Activity", category: "core", parent_code: "crm", sort_order: 3, required_permission: "crm:read", required_feature: "crm", type: "report" },

  // Sub-items for Reservations (reservations)
  { code: "reservations_tables", label: "Table & Room Capacity", href: "/reservations/tables", icon: "Settings", category: "core", parent_code: "reservations", sort_order: 1, required_permission: "reservations:read", required_feature: "reservations", type: "master" },
  { code: "reservations_new", label: "Walk-in Booking", href: "/reservations/new", icon: "Plus", category: "core", parent_code: "reservations", sort_order: 2, required_permission: "reservations:read", required_feature: "reservations", type: "transaction" },
  { code: "reservations_log", label: "Daily Bookings Log", href: "/reservations/log", icon: "BarChart3", category: "core", parent_code: "reservations", sort_order: 3, required_permission: "reservations:read", required_feature: "reservations", type: "report" },

  // Sub-items for Finance
  { code: "finance_chart_setup", label: "Chart of Accounts Setup", href: "/finance/chart", icon: "Settings", category: "core", parent_code: "finance", sort_order: 1, required_permission: "finance:read", required_feature: "finance", type: "master" },
  { code: "finance_journal_entry", label: "Journal Voucher Entry", href: "/finance/journal", icon: "FormInput", category: "core", parent_code: "finance", sort_order: 2, required_permission: "finance:read", required_feature: "finance", type: "transaction" },
  { code: "finance_pl_report", label: "Profit & Loss Ledger", href: "/finance/profit-loss", icon: "BarChart3", category: "core", parent_code: "finance", sort_order: 3, required_permission: "finance:read", required_feature: "finance", type: "report" },

  // Sub-items for HR & Payroll
  { code: "hr_employee_setup", label: "Employee Contract Setup", href: "/hr/employees", icon: "User", category: "core", parent_code: "hr", sort_order: 1, required_permission: "hr:read", required_feature: "hr", type: "master" },
  { code: "hr_attendance_entry", label: "Monthly Attendance Logs", href: "/hr/attendance", icon: "Calendar", category: "core", parent_code: "hr", sort_order: 2, required_permission: "hr:read", required_feature: "hr", type: "transaction" },
  { code: "hr_payroll_run", label: "Execute Monthly Payroll", href: "/hr/payroll-run", icon: "DollarSign", category: "core", parent_code: "hr", sort_order: 3, required_permission: "hr:read", required_feature: "hr", type: "transaction" },
  { code: "hr_payslip_report", label: "Payroll register reports", href: "/hr/payslips", icon: "Activity", category: "core", parent_code: "hr", sort_order: 4, required_permission: "hr:read", required_feature: "hr", type: "report" },

  // Sub-items for Reports & Analytics (reports)
  { code: "reports_templates", label: "Custom Report Templates", href: "/reports/templates", icon: "Settings", category: "core", parent_code: "reports", sort_order: 1, required_permission: "reports:read", required_feature: "reports", type: "master" },
  { code: "reports_run", label: "Run Analytics Pipeline", href: "/reports/run", icon: "Play", category: "core", parent_code: "reports", sort_order: 2, required_permission: "reports:read", required_feature: "reports", type: "transaction" },
  { code: "reports_summary", label: "Summary Executive Dashboard", href: "/reports/summary", icon: "Activity", category: "core", parent_code: "reports", sort_order: 3, required_permission: "reports:read", required_feature: "reports", type: "report" },

  // Platform Modules
  { code: "ai", label: "AI Assistant (B-Thak AI)", href: "/ai", icon: "Bot", category: "platform", parent_code: null, sort_order: 120, required_permission: "ai_copilot:read", required_feature: "ai_copilot" },
  { code: "workflow", label: "Workflow & Approvals", href: "/workflow", icon: "Award", category: "platform", parent_code: null, sort_order: 130, required_permission: "all:read", required_feature: "core" },
  { code: "communication", label: "Communication Center", href: "/communication", icon: "Bell", category: "platform", parent_code: null, sort_order: 140, required_permission: "all:read", required_feature: "core" },
  { code: "forms", label: "Form Builder", href: "/forms/guest_registration", icon: "FormInput", category: "platform", parent_code: null, sort_order: 150, required_permission: "all:read", required_feature: "core" },
  { code: "platform_studio", label: "Platform Studio", href: "/platform-studio", icon: "Settings", category: "platform", parent_code: null, sort_order: 160, required_permission: "all:read", required_feature: "core" },
  { code: "master_studio", label: "Master Data Studio", href: "/master-studio", icon: "LayoutGrid", category: "platform", parent_code: null, sort_order: 165, required_permission: "all:read", required_feature: "core" },
  { code: "settings", label: "Settings & Configurations", href: "/settings", icon: "Settings", category: "platform", parent_code: null, sort_order: 170, required_permission: "all:read", required_feature: "core" },
  { code: "project_tracker", label: "Project Development", href: "/project-tracker", icon: "Activity", category: "platform", parent_code: null, sort_order: 180, required_permission: "all:read", required_feature: "core" },
  { code: "enterprise_roadmap", label: "Enterprise Roadmap", href: "/enterprise-roadmap", icon: "Sparkles", category: "platform", parent_code: null, sort_order: 185, required_permission: "all:read", required_feature: "core" },

  // Sub-items for AI Copilot (ai)
  { code: "ai_config", label: "AI Cognitive Config", href: "/ai/config", icon: "Settings", category: "platform", parent_code: "ai", sort_order: 1, required_permission: "ai_copilot:read", required_feature: "ai_copilot", type: "master" },
  { code: "ai_chat", label: "Copilot Conversational Chat", href: "/ai/chat", icon: "MessageSquare", category: "platform", parent_code: "ai", sort_order: 2, required_permission: "ai_copilot:read", required_feature: "ai_copilot", type: "transaction" },
  { code: "ai_predict", label: "Business Analytics Predictor", href: "/ai/predict", icon: "TrendingUp", category: "platform", parent_code: "ai", sort_order: 3, required_permission: "ai_copilot:read", required_feature: "ai_copilot", type: "report" },

  // Sub-items for Workflow & Approvals (workflow)
  { code: "workflow_rules", label: "Workflow Rules Setup", href: "/workflow/rules", icon: "Settings", category: "platform", parent_code: "workflow", sort_order: 1, required_permission: "all:read", required_feature: "core", type: "master" },
  { code: "workflow_inbox", label: "Pending Approvals Inbox", href: "/workflow/inbox", icon: "Inbox", category: "platform", parent_code: "workflow", sort_order: 2, required_permission: "all:read", required_feature: "core", type: "transaction" },
  { code: "workflow_audit", label: "Audit Trail Log", href: "/workflow/audit", icon: "Activity", category: "platform", parent_code: "workflow", sort_order: 3, required_permission: "all:read", required_feature: "core", type: "report" },

  // Sub-items for Communication Center (communication)
  { code: "communication_templates", label: "Msg Template Editor", href: "/communication/templates", icon: "Settings", category: "platform", parent_code: "communication", sort_order: 1, required_permission: "all:read", required_feature: "core", type: "master" },
  { code: "communication_send", label: "Dispatch Campaigns", href: "/communication/send", icon: "Send", category: "platform", parent_code: "communication", sort_order: 2, required_permission: "all:read", required_feature: "core", type: "transaction" },
  { code: "communication_logs", label: "Messaging Delivery Log", href: "/communication/logs", icon: "BarChart3", category: "platform", parent_code: "communication", sort_order: 3, required_permission: "all:read", required_feature: "core", type: "report" },

  // Sub-items for Form Builder (forms)
  { code: "forms_designer", label: "Dynamic Schema Designer", href: "/forms/designer", icon: "Settings", category: "platform", parent_code: "forms", sort_order: 1, required_permission: "all:read", required_feature: "core", type: "master" },
  { code: "forms_fill", label: "Active Entry Fillers", href: "/forms/fill", icon: "FormInput", category: "platform", parent_code: "forms", sort_order: 2, required_permission: "all:read", required_feature: "core", type: "transaction" },
  { code: "forms_responses", label: "Survey Responders Data", href: "/forms/responses", icon: "Activity", category: "platform", parent_code: "forms", sort_order: 3, required_permission: "all:read", required_feature: "core", type: "report" },

  // Sub-items for Platform Studio (platform_studio)
  { code: "platform_schemas", label: "Schema Entity Manager", href: "/platform-studio/schemas", icon: "Settings", category: "platform", parent_code: "platform_studio", sort_order: 1, required_permission: "all:read", required_feature: "core", type: "master" },
  { code: "platform_forms", label: "Form Builder Config", href: "/platform-studio/forms", icon: "FormInput", category: "platform", parent_code: "platform_studio", sort_order: 2, required_permission: "all:read", required_feature: "core", type: "transaction" },
  { code: "platform_logs", label: "System Logs Viewer", href: "/platform-studio/logs", icon: "Activity", category: "platform", parent_code: "platform_studio", sort_order: 3, required_permission: "all:read", required_feature: "core", type: "report" },

  // Sub-items for Settings & Configurations (settings)
  { code: "settings_outlets", label: "Outlet Profiles Setup", href: "/settings/outlets", icon: "Settings", category: "platform", parent_code: "settings", sort_order: 1, required_permission: "all:read", required_feature: "core", type: "master" },
  { code: "settings_backup", label: "Backup & Restore Utility", href: "/settings/backup", icon: "RefreshCw", category: "platform", parent_code: "settings", sort_order: 2, required_permission: "all:read", required_feature: "core", type: "transaction" },
  { code: "settings_audit", label: "Audit Trail Logs", href: "/settings/audit", icon: "Activity", category: "platform", parent_code: "settings", sort_order: 3, required_permission: "all:read", required_feature: "core", type: "report" },

  // Sub-items for Project Tracker (project_tracker)
  { code: "project_milestones", label: "Task Milestones", href: "/project-tracker/milestones", icon: "Settings", category: "platform", parent_code: "project_tracker", sort_order: 1, required_permission: "all:read", required_feature: "core", type: "master" },
  { code: "project_timesheet", label: "Timesheet Punching", href: "/project-tracker/timesheet", icon: "Clock", category: "platform", parent_code: "project_tracker", sort_order: 2, required_permission: "all:read", required_feature: "core", type: "transaction" },
  { code: "project_velocity", label: "Weekly Velocity Chart", href: "/project-tracker/velocity", icon: "Activity", category: "platform", parent_code: "project_tracker", sort_order: 3, required_permission: "all:read", required_feature: "core", type: "report" },

  // Connected Apps
  { code: "apps_food", label: "Customer Food Web", href: "/apps/food", icon: "Globe", category: "connected", parent_code: null, sort_order: 190, required_permission: null, required_feature: "customer_portal" },
  { code: "apps_stay", label: "Customer Stay Web", href: "/apps/stay", icon: "Globe", category: "connected", parent_code: null, sort_order: 200, required_permission: null, required_feature: "customer_portal" },
  { code: "apps_kds", label: "Kitchen Display (KDS)", href: "/apps/kds", icon: "ChefHat", category: "connected", parent_code: null, sort_order: 210, required_permission: null, required_feature: "core" },
  { code: "apps_staff", label: "Staff Portal", href: "/apps/staff", icon: "Briefcase", category: "connected", parent_code: null, sort_order: 220, required_permission: null, required_feature: "core" },
  { code: "apps_mobile", label: "Guest Mobile App", href: "/apps/mobile", icon: "Smartphone", category: "connected", parent_code: null, sort_order: 230, required_permission: null, required_feature: "customer_portal" },
  { code: "apps_admin", label: "Admin Web Panel", href: "/apps/admin", icon: "Settings", category: "connected", parent_code: null, sort_order: 240, required_permission: null, required_feature: "core" },

  // Sub-items for Connected Apps: apps_food
  { code: "apps_food_menu", label: "Menu Catalog Sync", href: "/apps/food/menu", icon: "Settings", category: "connected", parent_code: "apps_food", sort_order: 1, required_permission: null, required_feature: "customer_portal", type: "master" },
  { code: "apps_food_orders", label: "Guest Cart Orders", href: "/apps/food/orders", icon: "ShoppingCart", category: "connected", parent_code: "apps_food", sort_order: 2, required_permission: null, required_feature: "customer_portal", type: "transaction" },
  { code: "apps_food_sessions", label: "Active Sessions Log", href: "/apps/food/sessions", icon: "Activity", category: "connected", parent_code: "apps_food", sort_order: 3, required_permission: null, required_feature: "customer_portal", type: "report" },

  // Sub-items for Connected Apps: apps_stay
  { code: "apps_stay_config", label: "Stay Config", href: "/apps/stay/config", icon: "Settings", category: "connected", parent_code: "apps_stay", sort_order: 1, required_permission: null, required_feature: "customer_portal", type: "master" },
  { code: "apps_stay_bookings", label: "Stay Bookings", href: "/apps/stay/bookings", icon: "Calendar", category: "connected", parent_code: "apps_stay", sort_order: 2, required_permission: null, required_feature: "customer_portal", type: "transaction" },
  { code: "apps_stay_invoices", label: "Stay Checkout Invoices", href: "/apps/stay/invoices", icon: "DollarSign", category: "connected", parent_code: "apps_stay", sort_order: 3, required_permission: null, required_feature: "customer_portal", type: "report" },

  // Sub-items for Connected Apps: apps_kds
  { code: "apps_kds_stations", label: "Kitchen Stations", href: "/apps/kds/stations", icon: "Settings", category: "connected", parent_code: "apps_kds", sort_order: 1, required_permission: null, required_feature: "core", type: "master" },
  { code: "apps_kds_queue", label: "Prep Queue Monitor", href: "/apps/kds/queue", icon: "ChefHat", category: "connected", parent_code: "apps_kds", sort_order: 2, required_permission: null, required_feature: "core", type: "transaction" },
  { code: "apps_kds_logs", label: "Speed of Prep Logs", href: "/apps/kds/logs", icon: "Activity", category: "connected", parent_code: "apps_kds", sort_order: 3, required_permission: null, required_feature: "core", type: "report" },

  // Sub-items for Connected Apps: apps_staff
  { code: "apps_staff_tasks", label: "Housekeeping Tasks", href: "/apps/staff/tasks", icon: "Settings", category: "connected", parent_code: "apps_staff", sort_order: 1, required_permission: null, required_feature: "core", type: "master" },
  { code: "apps_staff_shifts", label: "Shift Schedule Sync", href: "/apps/staff/shifts", icon: "Calendar", category: "connected", parent_code: "apps_staff", sort_order: 2, required_permission: null, required_feature: "core", type: "transaction" },
  { code: "apps_staff_checklist", label: "Performance Checklist", href: "/apps/staff/checklist", icon: "Activity", category: "connected", parent_code: "apps_staff", sort_order: 3, required_permission: null, required_feature: "core", type: "report" },

  // Sub-items for Connected Apps: apps_mobile
  { code: "apps_mobile_catalog", label: "Mobile Points Catalog", href: "/apps/mobile/catalog", icon: "Settings", category: "connected", parent_code: "apps_mobile", sort_order: 1, required_permission: null, required_feature: "customer_portal", type: "master" },
  { code: "apps_mobile_checkins", label: "Mobile Check-ins", href: "/apps/mobile/checkins", icon: "User", category: "connected", parent_code: "apps_mobile", sort_order: 2, required_permission: null, required_feature: "customer_portal", type: "transaction" },
  { code: "apps_mobile_notifications", label: "Push Notifications Log", href: "/apps/mobile/notifications", icon: "Activity", category: "connected", parent_code: "apps_mobile", sort_order: 3, required_permission: null, required_feature: "customer_portal", type: "report" },

  // Sub-items for Connected Apps: apps_admin
  { code: "apps_admin_config", label: "App Settings Config", href: "/apps/admin/config", icon: "Settings", category: "connected", parent_code: "apps_admin", sort_order: 1, required_permission: null, required_feature: "core", type: "master" },
  { code: "apps_admin_monitor", label: "System Health Monitor", href: "/apps/admin/monitor", icon: "Activity", category: "connected", parent_code: "apps_admin", sort_order: 2, required_permission: null, required_feature: "core", type: "transaction" },
  { code: "apps_admin_security", label: "Security Audits Logs", href: "/apps/admin/security", icon: "Lock", category: "connected", parent_code: "apps_admin", sort_order: 3, required_permission: null, required_feature: "core", type: "report" }
];

const SEED_CUSTOMERS: any[] = [
  {
    "id": "cust-1",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "CUH02",
    "first_name": "Sumit",
    "last_name": "Singh",
    "email": "sumit@baithak.com",
    "phone": "9999999999",
    "loyalty_tier": "gold",
    "loyalty_points": 450,
    "wallet_balance": 0.0,
    "lifetime_spent": 4500.0,
    "total_visits": 15,
    "last_visit_at": "2026-07-14T18:00:00Z",
    "preferences": {
      "favorite_item": "Veg Pizza",
      "last_order_text": "Veg Pizza Medium with Cheese Burst"
    },
    "is_active": true
  },
  {
    "id": "cust-2",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "CUH02",
    "first_name": "Chunu",
    "last_name": "Rao",
    "email": "chunu@baithak.com",
    "phone": "7056841994",
    "loyalty_tier": "platinum",
    "loyalty_points": 820,
    "wallet_balance": 0.0,
    "lifetime_spent": 8900.0,
    "total_visits": 24,
    "last_visit_at": "2026-07-14T18:00:00Z",
    "preferences": {
      "favorite_item": "Cold Coffee",
      "last_order_text": "Kitkat Shake with Extra Ice Cream"
    },
    "is_active": true
  },
  {
    "id": "cust-3",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "CUH02",
    "first_name": "Mohit",
    "last_name": "Bhanja",
    "email": "mohit@baithak.com",
    "phone": "8683849395",
    "loyalty_tier": "silver",
    "loyalty_points": 120,
    "wallet_balance": 0.0,
    "lifetime_spent": 1800.0,
    "total_visits": 6,
    "last_visit_at": "2026-07-14T18:00:00Z",
    "preferences": {
      "favorite_item": "Veg Steam Momos",
      "last_order_text": "Veg Steam Momos Half"
    },
    "is_active": true
  }
];
const SEED_PRODUCTS: any[] = [
  {
    "id": "prod-cuh02-1",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Veg Steam Momos",
    "code": "DISH-CUH02-001",
    "barcode": "10000000",
    "category": "Veg.Momo's",
    "product_type": "food",
    "mrp": 60.0,
    "selling_price": 60.0,
    "cost_price": 24.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Half",
            "price": 60.0
          },
          {
            "name": "Full",
            "price": 80.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Kurkure Crispiness",
        "price": 30.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-2",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Veg. Fry Momos",
    "code": "DISH-CUH02-002",
    "barcode": "10000001",
    "category": "Veg.Momo's",
    "product_type": "food",
    "mrp": 70.0,
    "selling_price": 70.0,
    "cost_price": 28.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Half",
            "price": 70.0
          },
          {
            "name": "Full",
            "price": 100.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Kurkure Crispiness",
        "price": 30.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-3",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Veg. Butter Momos",
    "code": "DISH-CUH02-003",
    "barcode": "10000002",
    "category": "Veg.Momo's",
    "product_type": "food",
    "mrp": 80.0,
    "selling_price": 80.0,
    "cost_price": 32.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Half",
            "price": 80.0
          },
          {
            "name": "Full",
            "price": 110.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Kurkure Crispiness",
        "price": 30.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-4",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Veg. Kurkure Momos",
    "code": "DISH-CUH02-004",
    "barcode": "10000003",
    "category": "Veg.Momo's",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Trending"
    ],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Half",
            "price": 100.0
          },
          {
            "name": "Full",
            "price": 140.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-5",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Veg. Tandoori Momos",
    "code": "DISH-CUH02-005",
    "barcode": "10000004",
    "category": "Veg.Momo's",
    "product_type": "food",
    "mrp": 140.0,
    "selling_price": 140.0,
    "cost_price": 56.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Full",
            "price": 140.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-6",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Veg. Malai Momos",
    "code": "DISH-CUH02-006",
    "barcode": "10000005",
    "category": "Veg.Momo's",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Full",
            "price": 160.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-7",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Veg. Afgani Momos",
    "code": "DISH-CUH02-007",
    "barcode": "10000006",
    "category": "Veg.Momo's",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Full",
            "price": 160.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-8",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Veg. Chilli Momos",
    "code": "DISH-CUH02-008",
    "barcode": "10000007",
    "category": "Veg.Momo's",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Full",
            "price": 160.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-9",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paneer Steam Momos",
    "code": "DISH-CUH02-009",
    "barcode": "10000008",
    "category": "Paneer Momo's",
    "product_type": "food",
    "mrp": 70.0,
    "selling_price": 70.0,
    "cost_price": 28.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Half",
            "price": 70.0
          },
          {
            "name": "Full",
            "price": 100.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Kurkure Crispiness",
        "price": 30.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-10",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paneer Fry Momos",
    "code": "DISH-CUH02-010",
    "barcode": "10000009",
    "category": "Paneer Momo's",
    "product_type": "food",
    "mrp": 90.0,
    "selling_price": 90.0,
    "cost_price": 36.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Half",
            "price": 90.0
          },
          {
            "name": "Full",
            "price": 120.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Kurkure Crispiness",
        "price": 30.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-11",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paneer Butter Momos",
    "code": "DISH-CUH02-011",
    "barcode": "10000010",
    "category": "Paneer Momo's",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Half",
            "price": 100.0
          },
          {
            "name": "Full",
            "price": 140.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Kurkure Crispiness",
        "price": 30.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-12",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paneer Kurkure Momos",
    "code": "DISH-CUH02-012",
    "barcode": "10000011",
    "category": "Paneer Momo's",
    "product_type": "food",
    "mrp": 120.0,
    "selling_price": 120.0,
    "cost_price": 48.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Trending"
    ],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Half",
            "price": 120.0
          },
          {
            "name": "Full",
            "price": 160.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-13",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paneer Tandoori Momos",
    "code": "DISH-CUH02-013",
    "barcode": "10000012",
    "category": "Paneer Momo's",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Full",
            "price": 160.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-14",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paneer Malai Momos",
    "code": "DISH-CUH02-014",
    "barcode": "10000013",
    "category": "Paneer Momo's",
    "product_type": "food",
    "mrp": 180.0,
    "selling_price": 180.0,
    "cost_price": 72.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Full",
            "price": 180.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-15",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paneer Afgani Momos",
    "code": "DISH-CUH02-015",
    "barcode": "10000014",
    "category": "Paneer Momo's",
    "product_type": "food",
    "mrp": 180.0,
    "selling_price": 180.0,
    "cost_price": 72.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Full",
            "price": 180.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-16",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paneer Chilli Momos",
    "code": "DISH-CUH02-016",
    "barcode": "10000015",
    "category": "Paneer Momo's",
    "product_type": "food",
    "mrp": 180.0,
    "selling_price": 180.0,
    "cost_price": 72.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Full",
            "price": 180.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-17",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Veg. Roll",
    "code": "DISH-CUH02-017",
    "barcode": "10000016",
    "category": "Spring Rolls",
    "product_type": "food",
    "mrp": 90.0,
    "selling_price": 90.0,
    "cost_price": 36.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Kurkure Crispiness",
        "price": 30.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-18",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paneer Roll",
    "code": "DISH-CUH02-018",
    "barcode": "10000017",
    "category": "Spring Rolls",
    "product_type": "food",
    "mrp": 120.0,
    "selling_price": 120.0,
    "cost_price": 48.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "High Margin"
    ],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Kurkure Crispiness",
        "price": 30.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-19",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Mix Roll",
    "code": "DISH-CUH02-019",
    "barcode": "10000018",
    "category": "Spring Rolls",
    "product_type": "food",
    "mrp": 140.0,
    "selling_price": 140.0,
    "cost_price": 56.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Kurkure Crispiness",
        "price": 30.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-20",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Veg. Kathi Roll",
    "code": "DISH-CUH02-020",
    "barcode": "10000019",
    "category": "Kathi Roll",
    "product_type": "food",
    "mrp": 90.0,
    "selling_price": 90.0,
    "cost_price": 36.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-21",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Noodle Roll",
    "code": "DISH-CUH02-021",
    "barcode": "10000020",
    "category": "Kathi Roll",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-22",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paneer Kathi Roll",
    "code": "DISH-CUH02-022",
    "barcode": "10000021",
    "category": "Kathi Roll",
    "product_type": "food",
    "mrp": 120.0,
    "selling_price": 120.0,
    "cost_price": 48.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-23",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Mix Kathi Roll",
    "code": "DISH-CUH02-023",
    "barcode": "10000022",
    "category": "Kathi Roll",
    "product_type": "food",
    "mrp": 140.0,
    "selling_price": 140.0,
    "cost_price": 56.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-24",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Tandoori Chaap Roll",
    "code": "DISH-CUH02-024",
    "barcode": "10000023",
    "category": "Kathi Roll",
    "product_type": "food",
    "mrp": 130.0,
    "selling_price": 130.0,
    "cost_price": 52.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-25",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Tandoori Malai Chaap Roll",
    "code": "DISH-CUH02-025",
    "barcode": "10000024",
    "category": "Kathi Roll",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-26",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Tandoori Afgani Chaap Roll",
    "code": "DISH-CUH02-026",
    "barcode": "10000025",
    "category": "Kathi Roll",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-27",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Tandoori Paneer Tikka Roll",
    "code": "DISH-CUH02-027",
    "barcode": "10000026",
    "category": "Kathi Roll",
    "product_type": "food",
    "mrp": 170.0,
    "selling_price": 170.0,
    "cost_price": 68.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-28",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Veg. Noodles",
    "code": "DISH-CUH02-028",
    "barcode": "10000027",
    "category": "Noodles",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-29",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Schezwan Noodles",
    "code": "DISH-CUH02-029",
    "barcode": "10000028",
    "category": "Noodles",
    "product_type": "food",
    "mrp": 130.0,
    "selling_price": 130.0,
    "cost_price": 52.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-30",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Chilli Garlic Noodles",
    "code": "DISH-CUH02-030",
    "barcode": "10000029",
    "category": "Noodles",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "High Margin"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-31",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Singa-puri Noodles",
    "code": "DISH-CUH02-031",
    "barcode": "10000030",
    "category": "Noodles",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-32",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paneer Noodles",
    "code": "DISH-CUH02-032",
    "barcode": "10000031",
    "category": "Noodles",
    "product_type": "food",
    "mrp": 170.0,
    "selling_price": 170.0,
    "cost_price": 68.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-33",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Hakka Noodles",
    "code": "DISH-CUH02-033",
    "barcode": "10000032",
    "category": "Noodles",
    "product_type": "food",
    "mrp": 200.0,
    "selling_price": 200.0,
    "cost_price": 80.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-34",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Special Veg. Loaded Noodles",
    "code": "DISH-CUH02-034",
    "barcode": "10000033",
    "category": "Noodles",
    "product_type": "food",
    "mrp": 250.0,
    "selling_price": 250.0,
    "cost_price": 100.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-35",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Veg. Hot & Sour Soup",
    "code": "DISH-CUH02-035",
    "barcode": "10000034",
    "category": "Soup",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-36",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Sweet Corn Soup",
    "code": "DISH-CUH02-036",
    "barcode": "10000035",
    "category": "Soup",
    "product_type": "food",
    "mrp": 120.0,
    "selling_price": 120.0,
    "cost_price": 48.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-37",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Manchow Soup",
    "code": "DISH-CUH02-037",
    "barcode": "10000036",
    "category": "Soup",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-38",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Veg Sandwich",
    "code": "DISH-CUH02-038",
    "barcode": "10000037",
    "category": "Sandwich",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Style",
        "options": [
          {
            "name": "Oven",
            "price": 0.0
          },
          {
            "name": "Grilled",
            "price": 20.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-39",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paneer Sandwich",
    "code": "DISH-CUH02-039",
    "barcode": "10000038",
    "category": "Sandwich",
    "product_type": "food",
    "mrp": 120.0,
    "selling_price": 120.0,
    "cost_price": 48.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [
      {
        "name": "Style",
        "options": [
          {
            "name": "Oven",
            "price": 0.0
          },
          {
            "name": "Grilled",
            "price": 20.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-40",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Tandoori Sandwich",
    "code": "DISH-CUH02-040",
    "barcode": "10000039",
    "category": "Sandwich",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Style",
        "options": [
          {
            "name": "Oven",
            "price": 0.0
          },
          {
            "name": "Grilled",
            "price": 20.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-41",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Cheese Sandwich",
    "code": "DISH-CUH02-041",
    "barcode": "10000040",
    "category": "Sandwich",
    "product_type": "food",
    "mrp": 180.0,
    "selling_price": 180.0,
    "cost_price": 72.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Style",
        "options": [
          {
            "name": "Oven",
            "price": 0.0
          },
          {
            "name": "Grilled",
            "price": 20.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-42",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "French Fries",
    "code": "DISH-CUH02-042",
    "barcode": "10000041",
    "category": "Fries",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-43",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Periperi Fries",
    "code": "DISH-CUH02-043",
    "barcode": "10000042",
    "category": "Fries",
    "product_type": "food",
    "mrp": 120.0,
    "selling_price": 120.0,
    "cost_price": 48.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Trending"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-44",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Chilli Potato",
    "code": "DISH-CUH02-044",
    "barcode": "10000043",
    "category": "Fries",
    "product_type": "food",
    "mrp": 140.0,
    "selling_price": 140.0,
    "cost_price": 56.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-45",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Honey Chilli Potato",
    "code": "DISH-CUH02-045",
    "barcode": "10000044",
    "category": "Fries",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-46",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Manchurian Dry",
    "code": "DISH-CUH02-046",
    "barcode": "10000045",
    "category": "Fries",
    "product_type": "food",
    "mrp": 140.0,
    "selling_price": 140.0,
    "cost_price": 56.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-47",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Manchurian Gravy",
    "code": "DISH-CUH02-047",
    "barcode": "10000046",
    "category": "Fries",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-48",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paneer Chilli Dry",
    "code": "DISH-CUH02-048",
    "barcode": "10000047",
    "category": "Fries",
    "product_type": "food",
    "mrp": 250.0,
    "selling_price": 250.0,
    "cost_price": 100.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-49",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paneer Chilli Gravy",
    "code": "DISH-CUH02-049",
    "barcode": "10000048",
    "category": "Fries",
    "product_type": "food",
    "mrp": 280.0,
    "selling_price": 280.0,
    "cost_price": 112.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-50",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Mushroom Chilli Dry",
    "code": "DISH-CUH02-050",
    "barcode": "10000049",
    "category": "Fries",
    "product_type": "food",
    "mrp": 250.0,
    "selling_price": 250.0,
    "cost_price": 100.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-51",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Gobi Chilli Dry",
    "code": "DISH-CUH02-051",
    "barcode": "10000050",
    "category": "Fries",
    "product_type": "food",
    "mrp": 230.0,
    "selling_price": 230.0,
    "cost_price": 92.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-52",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Soya Chilli Dry",
    "code": "DISH-CUH02-052",
    "barcode": "10000051",
    "category": "Fries",
    "product_type": "food",
    "mrp": 200.0,
    "selling_price": 200.0,
    "cost_price": 80.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-53",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Red Sauce Pasta",
    "code": "DISH-CUH02-053",
    "barcode": "10000052",
    "category": "Pasta",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-54",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "White Sauce Pasta",
    "code": "DISH-CUH02-054",
    "barcode": "10000053",
    "category": "Pasta",
    "product_type": "food",
    "mrp": 170.0,
    "selling_price": 170.0,
    "cost_price": 68.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-55",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Mix Sauce Pasta",
    "code": "DISH-CUH02-055",
    "barcode": "10000054",
    "category": "Pasta",
    "product_type": "food",
    "mrp": 170.0,
    "selling_price": 170.0,
    "cost_price": 68.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-56",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Sweet Corn Pasta",
    "code": "DISH-CUH02-056",
    "barcode": "10000055",
    "category": "Pasta",
    "product_type": "food",
    "mrp": 190.0,
    "selling_price": 190.0,
    "cost_price": 76.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-57",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paneer Pasta",
    "code": "DISH-CUH02-057",
    "barcode": "10000056",
    "category": "Pasta",
    "product_type": "food",
    "mrp": 220.0,
    "selling_price": 220.0,
    "cost_price": 88.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-58",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Special Veg. Loaded Pasta",
    "code": "DISH-CUH02-058",
    "barcode": "10000057",
    "category": "Pasta",
    "product_type": "food",
    "mrp": 250.0,
    "selling_price": 250.0,
    "cost_price": 100.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-59",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Veg. Fried Rice",
    "code": "DISH-CUH02-059",
    "barcode": "10000058",
    "category": "Fried Rice",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-60",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Manchurian Fried Rice",
    "code": "DISH-CUH02-060",
    "barcode": "10000059",
    "category": "Fried Rice",
    "product_type": "food",
    "mrp": 120.0,
    "selling_price": 120.0,
    "cost_price": 48.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-61",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paneer Fried Rice",
    "code": "DISH-CUH02-061",
    "barcode": "10000060",
    "category": "Fried Rice",
    "product_type": "food",
    "mrp": 140.0,
    "selling_price": 140.0,
    "cost_price": 56.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-62",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Schezwan Fried Rice",
    "code": "DISH-CUH02-062",
    "barcode": "10000061",
    "category": "Fried Rice",
    "product_type": "food",
    "mrp": 140.0,
    "selling_price": 140.0,
    "cost_price": 56.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-63",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Chilli Garlic Fried Rice",
    "code": "DISH-CUH02-063",
    "barcode": "10000062",
    "category": "Fried Rice",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-64",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Singa-Puri Fried Rice",
    "code": "DISH-CUH02-064",
    "barcode": "10000063",
    "category": "Fried Rice",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-65",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Special Veg. Loaded Fried Rice",
    "code": "DISH-CUH02-065",
    "barcode": "10000064",
    "category": "Fried Rice",
    "product_type": "food",
    "mrp": 200.0,
    "selling_price": 200.0,
    "cost_price": 80.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-66",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Veg Pizza",
    "code": "DISH-CUH02-066",
    "barcode": "10000065",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 170.0,
    "selling_price": 170.0,
    "cost_price": 68.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 170.0
          },
          {
            "name": "Medium",
            "price": 230.0
          },
          {
            "name": "Large",
            "price": 290.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-67",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Tandoori Pizza",
    "code": "DISH-CUH02-067",
    "barcode": "10000066",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 240.0,
    "selling_price": 240.0,
    "cost_price": 96.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Trending"
    ],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 240.0
          },
          {
            "name": "Medium",
            "price": 300.0
          },
          {
            "name": "Large",
            "price": 360.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-68",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Sweetcorn Capsicum Pizza",
    "code": "DISH-CUH02-068",
    "barcode": "10000067",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 150.0
          },
          {
            "name": "Medium",
            "price": 210.0
          },
          {
            "name": "Large",
            "price": 270.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-69",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Margherita Pizza",
    "code": "DISH-CUH02-069",
    "barcode": "10000068",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 170.0,
    "selling_price": 170.0,
    "cost_price": 68.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 170.0
          },
          {
            "name": "Medium",
            "price": 230.0
          },
          {
            "name": "Large",
            "price": 290.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-70",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Black Olive Pizza",
    "code": "DISH-CUH02-070",
    "barcode": "10000069",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 190.0,
    "selling_price": 190.0,
    "cost_price": 76.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 190.0
          },
          {
            "name": "Medium",
            "price": 250.0
          },
          {
            "name": "Large",
            "price": 310.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-71",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Mushroom Pizza",
    "code": "DISH-CUH02-071",
    "barcode": "10000070",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 200.0,
    "selling_price": 200.0,
    "cost_price": 80.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 200.0
          },
          {
            "name": "Medium",
            "price": 260.0
          },
          {
            "name": "Large",
            "price": 320.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-72",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paneer Pizza",
    "code": "DISH-CUH02-072",
    "barcode": "10000071",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 210.0,
    "selling_price": 210.0,
    "cost_price": 84.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 210.0
          },
          {
            "name": "Medium",
            "price": 270.0
          },
          {
            "name": "Large",
            "price": 330.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-73",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Peppy Paneer Pizza",
    "code": "DISH-CUH02-073",
    "barcode": "10000072",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 230.0,
    "selling_price": 230.0,
    "cost_price": 92.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 230.0
          },
          {
            "name": "Medium",
            "price": 290.0
          },
          {
            "name": "Large",
            "price": 350.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-74",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Indi Tandoori Paneer Pizza",
    "code": "DISH-CUH02-074",
    "barcode": "10000073",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 250.0,
    "selling_price": 250.0,
    "cost_price": 100.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 250.0
          },
          {
            "name": "Medium",
            "price": 310.0
          },
          {
            "name": "Large",
            "price": 370.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-75",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Farm House Pizza",
    "code": "DISH-CUH02-075",
    "barcode": "10000074",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 260.0,
    "selling_price": 260.0,
    "cost_price": 104.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 260.0
          },
          {
            "name": "Medium",
            "price": 320.0
          },
          {
            "name": "Large",
            "price": 380.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-76",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Double Decker Pizza",
    "code": "DISH-CUH02-076",
    "barcode": "10000075",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 280.0,
    "selling_price": 280.0,
    "cost_price": 112.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 280.0
          },
          {
            "name": "Medium",
            "price": 340.0
          },
          {
            "name": "Large",
            "price": 400.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-77",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "All in One Pizza",
    "code": "DISH-CUH02-077",
    "barcode": "10000076",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 300.0,
    "selling_price": 300.0,
    "cost_price": 120.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 300.0
          },
          {
            "name": "Medium",
            "price": 360.0
          },
          {
            "name": "Large",
            "price": 420.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-78",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Aloo Tikki Burger",
    "code": "DISH-CUH02-078",
    "barcode": "10000077",
    "category": "Burger",
    "product_type": "food",
    "mrp": 60.0,
    "selling_price": 60.0,
    "cost_price": 24.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Prep Style",
        "options": [
          {
            "name": "Oven",
            "price": 60.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-79",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Veggie Burger",
    "code": "DISH-CUH02-079",
    "barcode": "10000078",
    "category": "Burger",
    "product_type": "food",
    "mrp": 50.0,
    "selling_price": 50.0,
    "cost_price": 20.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [
      {
        "name": "Prep Style",
        "options": [
          {
            "name": "Tawa",
            "price": 50.0
          },
          {
            "name": "Oven",
            "price": 70.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-80",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paneer Burger",
    "code": "DISH-CUH02-080",
    "barcode": "10000079",
    "category": "Burger",
    "product_type": "food",
    "mrp": 70.0,
    "selling_price": 70.0,
    "cost_price": 28.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Trending"
    ],
    "variant_groups": [
      {
        "name": "Prep Style",
        "options": [
          {
            "name": "Tawa",
            "price": 70.0
          },
          {
            "name": "Oven",
            "price": 90.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-81",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Cheese Burger",
    "code": "DISH-CUH02-081",
    "barcode": "10000080",
    "category": "Burger",
    "product_type": "food",
    "mrp": 80.0,
    "selling_price": 80.0,
    "cost_price": 32.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Prep Style",
        "options": [
          {
            "name": "Tawa",
            "price": 80.0
          },
          {
            "name": "Oven",
            "price": 100.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-82",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Melted Cheese Burger",
    "code": "DISH-CUH02-082",
    "barcode": "10000081",
    "category": "Burger",
    "product_type": "food",
    "mrp": 130.0,
    "selling_price": 130.0,
    "cost_price": 52.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Prep Style",
        "options": [
          {
            "name": "Oven",
            "price": 130.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-83",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Maha Raja Burger",
    "code": "DISH-CUH02-083",
    "barcode": "10000082",
    "category": "Burger",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "High Margin"
    ],
    "variant_groups": [
      {
        "name": "Prep Style",
        "options": [
          {
            "name": "Oven",
            "price": 160.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-84",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Aloo Tikki Wrap",
    "code": "DISH-CUH02-084",
    "barcode": "10000083",
    "category": "Wrap",
    "product_type": "food",
    "mrp": 120.0,
    "selling_price": 120.0,
    "cost_price": 48.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-85",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Veggie Wrap",
    "code": "DISH-CUH02-085",
    "barcode": "10000084",
    "category": "Wrap",
    "product_type": "food",
    "mrp": 140.0,
    "selling_price": 140.0,
    "cost_price": 56.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-86",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paneer Wrap",
    "code": "DISH-CUH02-086",
    "barcode": "10000085",
    "category": "Wrap",
    "product_type": "food",
    "mrp": 180.0,
    "selling_price": 180.0,
    "cost_price": 72.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-87",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Melted Cheese Wrap",
    "code": "DISH-CUH02-087",
    "barcode": "10000086",
    "category": "Wrap",
    "product_type": "food",
    "mrp": 220.0,
    "selling_price": 220.0,
    "cost_price": 88.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-88",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Peanut Masala",
    "code": "DISH-CUH02-088",
    "barcode": "10000087",
    "category": "Snacks",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-89",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Sweet Highlight Corn Chaat",
    "code": "DISH-CUH02-089",
    "barcode": "10000088",
    "category": "Snacks",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-90",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Crispy Corn Chaat",
    "code": "DISH-CUH02-090",
    "barcode": "10000089",
    "category": "Snacks",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Trending"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-91",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paav Bhaji",
    "code": "DISH-CUH02-091",
    "barcode": "10000090",
    "category": "Paav Bhaji",
    "product_type": "food",
    "mrp": 120.0,
    "selling_price": 120.0,
    "cost_price": 48.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Paav",
        "price": 30.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-92",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Fried Rice & Manchurian Combo",
    "code": "DISH-CUH02-092",
    "barcode": "10000091",
    "category": "Chinese Combo",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "High Margin"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-93",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Noodle & Manchurian Combo",
    "code": "DISH-CUH02-093",
    "barcode": "10000092",
    "category": "Chinese Combo",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-94",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Extra Loaded Veg Maggie",
    "code": "DISH-CUH02-094",
    "barcode": "10000093",
    "category": "Extra Loaded Veg Maggie",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Trending"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-95",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Banana Shake",
    "code": "DISH-CUH02-095",
    "barcode": "10000094",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 80.0,
    "selling_price": 80.0,
    "cost_price": 32.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-96",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Papaya Shake",
    "code": "DISH-CUH02-096",
    "barcode": "10000095",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 80.0,
    "selling_price": 80.0,
    "cost_price": 32.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-97",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Mango Shake",
    "code": "DISH-CUH02-097",
    "barcode": "10000096",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 80.0,
    "selling_price": 80.0,
    "cost_price": 32.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-98",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Chikoo Shake",
    "code": "DISH-CUH02-098",
    "barcode": "10000097",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 80.0,
    "selling_price": 80.0,
    "cost_price": 32.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-99",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Mix Shake",
    "code": "DISH-CUH02-099",
    "barcode": "10000098",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-100",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Cold Coffee",
    "code": "DISH-CUH02-100",
    "barcode": "10000099",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 80.0,
    "selling_price": 80.0,
    "cost_price": 32.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller",
      "High Margin"
    ],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-101",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Strawberry Shake",
    "code": "DISH-CUH02-101",
    "barcode": "10000100",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 80.0,
    "selling_price": 80.0,
    "cost_price": 32.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-102",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Butterscotch Shake",
    "code": "DISH-CUH02-102",
    "barcode": "10000101",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 80.0,
    "selling_price": 80.0,
    "cost_price": 32.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-103",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Vanilla Shake",
    "code": "DISH-CUH02-103",
    "barcode": "10000102",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 80.0,
    "selling_price": 80.0,
    "cost_price": 32.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-104",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Chocolate Shake",
    "code": "DISH-CUH02-104",
    "barcode": "10000103",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 90.0,
    "selling_price": 90.0,
    "cost_price": 36.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-105",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Chocolate Banana Shake",
    "code": "DISH-CUH02-105",
    "barcode": "10000104",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 90.0,
    "selling_price": 90.0,
    "cost_price": 36.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-106",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Kitkat Shake",
    "code": "DISH-CUH02-106",
    "barcode": "10000105",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 90.0,
    "selling_price": 90.0,
    "cost_price": 36.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Trending"
    ],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-107",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Oreo Shake",
    "code": "DISH-CUH02-107",
    "barcode": "10000106",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 90.0,
    "selling_price": 90.0,
    "cost_price": 36.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Trending"
    ],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-cuh02-108",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Virgin Mojito",
    "code": "DISH-CUH02-108",
    "barcode": "10000107",
    "category": "Mojito",
    "product_type": "food",
    "mrp": 99.0,
    "selling_price": 99.0,
    "cost_price": 39.6,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "High Margin"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-109",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Blue Lagoon Mojito",
    "code": "DISH-CUH02-109",
    "barcode": "10000108",
    "category": "Mojito",
    "product_type": "food",
    "mrp": 99.0,
    "selling_price": 99.0,
    "cost_price": 39.6,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-110",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Green Apple Mojito",
    "code": "DISH-CUH02-110",
    "barcode": "10000109",
    "category": "Mojito",
    "product_type": "food",
    "mrp": 99.0,
    "selling_price": 99.0,
    "cost_price": 39.6,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-111",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Kala Khatta Mojito",
    "code": "DISH-CUH02-111",
    "barcode": "10000110",
    "category": "Mojito",
    "product_type": "food",
    "mrp": 99.0,
    "selling_price": 99.0,
    "cost_price": 39.6,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-112",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Strawberry Mojito",
    "code": "DISH-CUH02-112",
    "barcode": "10000111",
    "category": "Mojito",
    "product_type": "food",
    "mrp": 149.0,
    "selling_price": 149.0,
    "cost_price": 59.6,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-113",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Guava Mojito",
    "code": "DISH-CUH02-113",
    "barcode": "10000112",
    "category": "Mojito",
    "product_type": "food",
    "mrp": 149.0,
    "selling_price": 149.0,
    "cost_price": 59.6,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-114",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Orange Mojito",
    "code": "DISH-CUH02-114",
    "barcode": "10000113",
    "category": "Mojito",
    "product_type": "food",
    "mrp": 139.0,
    "selling_price": 139.0,
    "cost_price": 55.6,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-115",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Pineapple Mojito",
    "code": "DISH-CUH02-115",
    "barcode": "10000114",
    "category": "Mojito",
    "product_type": "food",
    "mrp": 139.0,
    "selling_price": 139.0,
    "cost_price": 55.6,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-116",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Masala Chaap",
    "code": "DISH-CUH02-116",
    "barcode": "10000115",
    "category": "Tandoori Chaap",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Portion",
        "options": [
          {
            "name": "Half",
            "price": 150.0
          },
          {
            "name": "Full",
            "price": 230.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-117",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Achari Chaap",
    "code": "DISH-CUH02-117",
    "barcode": "10000116",
    "category": "Tandoori Chaap",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Portion",
        "options": [
          {
            "name": "Half",
            "price": 150.0
          },
          {
            "name": "Full",
            "price": 230.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-118",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Malai Chaap",
    "code": "DISH-CUH02-118",
    "barcode": "10000117",
    "category": "Tandoori Chaap",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [
      {
        "name": "Portion",
        "options": [
          {
            "name": "Half",
            "price": 160.0
          },
          {
            "name": "Full",
            "price": 250.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-119",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Afgani Chaap",
    "code": "DISH-CUH02-119",
    "barcode": "10000118",
    "category": "Tandoori Chaap",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Portion",
        "options": [
          {
            "name": "Half",
            "price": 160.0
          },
          {
            "name": "Full",
            "price": 250.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-120",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Hara Bhara Kebab",
    "code": "DISH-CUH02-120",
    "barcode": "10000119",
    "category": "Kebab",
    "product_type": "food",
    "mrp": 180.0,
    "selling_price": 180.0,
    "cost_price": 72.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-121",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Veg. Seekh Kebab",
    "code": "DISH-CUH02-121",
    "barcode": "10000120",
    "category": "Kebab",
    "product_type": "food",
    "mrp": 180.0,
    "selling_price": 180.0,
    "cost_price": 72.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-122",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Reshmi Kebab",
    "code": "DISH-CUH02-122",
    "barcode": "10000121",
    "category": "Kebab",
    "product_type": "food",
    "mrp": 200.0,
    "selling_price": 200.0,
    "cost_price": 80.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-123",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Dahi Ke Sholay",
    "code": "DISH-CUH02-123",
    "barcode": "10000122",
    "category": "Kebab",
    "product_type": "food",
    "mrp": 200.0,
    "selling_price": 200.0,
    "cost_price": 80.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-124",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Tandoori Aloo Tikka",
    "code": "DISH-CUH02-124",
    "barcode": "10000123",
    "category": "Tandoori Tikka",
    "product_type": "food",
    "mrp": 140.0,
    "selling_price": 140.0,
    "cost_price": 56.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Portion",
        "options": [
          {
            "name": "Half",
            "price": 140.0
          },
          {
            "name": "Full",
            "price": 220.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-125",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Paneer Tikka",
    "code": "DISH-CUH02-125",
    "barcode": "10000124",
    "category": "Tandoori Tikka",
    "product_type": "food",
    "mrp": 180.0,
    "selling_price": 180.0,
    "cost_price": 72.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [
      {
        "name": "Portion",
        "options": [
          {
            "name": "Half",
            "price": 180.0
          },
          {
            "name": "Full",
            "price": 290.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-126",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Achari Paneer Tikka",
    "code": "DISH-CUH02-126",
    "barcode": "10000125",
    "category": "Tandoori Tikka",
    "product_type": "food",
    "mrp": 180.0,
    "selling_price": 180.0,
    "cost_price": 72.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Portion",
        "options": [
          {
            "name": "Half",
            "price": 180.0
          },
          {
            "name": "Full",
            "price": 290.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-127",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Malai Paneer Tikka",
    "code": "DISH-CUH02-127",
    "barcode": "10000126",
    "category": "Tandoori Tikka",
    "product_type": "food",
    "mrp": 190.0,
    "selling_price": 190.0,
    "cost_price": 76.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Trending"
    ],
    "variant_groups": [
      {
        "name": "Portion",
        "options": [
          {
            "name": "Half",
            "price": 190.0
          },
          {
            "name": "Full",
            "price": 300.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-cuh02-128",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "CUH02",
    "branch_id": "CUH02",
    "name": "Mushroom Tikka",
    "code": "DISH-CUH02-128",
    "barcode": "10000127",
    "category": "Tandoori Tikka",
    "product_type": "food",
    "mrp": 190.0,
    "selling_price": 190.0,
    "cost_price": 76.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Portion",
        "options": [
          {
            "name": "Half",
            "price": 190.0
          },
          {
            "name": "Full",
            "price": 300.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-1",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Veg Steam Momos",
    "code": "DISH-GGN01-001",
    "barcode": "10000000",
    "category": "Veg.Momo's",
    "product_type": "food",
    "mrp": 60.0,
    "selling_price": 60.0,
    "cost_price": 24.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Half",
            "price": 60.0
          },
          {
            "name": "Full",
            "price": 80.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Kurkure Crispiness",
        "price": 30.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-2",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Veg. Fry Momos",
    "code": "DISH-GGN01-002",
    "barcode": "10000001",
    "category": "Veg.Momo's",
    "product_type": "food",
    "mrp": 70.0,
    "selling_price": 70.0,
    "cost_price": 28.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Half",
            "price": 70.0
          },
          {
            "name": "Full",
            "price": 100.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Kurkure Crispiness",
        "price": 30.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-3",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Veg. Butter Momos",
    "code": "DISH-GGN01-003",
    "barcode": "10000002",
    "category": "Veg.Momo's",
    "product_type": "food",
    "mrp": 80.0,
    "selling_price": 80.0,
    "cost_price": 32.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Half",
            "price": 80.0
          },
          {
            "name": "Full",
            "price": 110.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Kurkure Crispiness",
        "price": 30.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-4",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Veg. Kurkure Momos",
    "code": "DISH-GGN01-004",
    "barcode": "10000003",
    "category": "Veg.Momo's",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Trending"
    ],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Half",
            "price": 100.0
          },
          {
            "name": "Full",
            "price": 140.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-5",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Veg. Tandoori Momos",
    "code": "DISH-GGN01-005",
    "barcode": "10000004",
    "category": "Veg.Momo's",
    "product_type": "food",
    "mrp": 140.0,
    "selling_price": 140.0,
    "cost_price": 56.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Full",
            "price": 140.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-6",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Veg. Malai Momos",
    "code": "DISH-GGN01-006",
    "barcode": "10000005",
    "category": "Veg.Momo's",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Full",
            "price": 160.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-7",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Veg. Afgani Momos",
    "code": "DISH-GGN01-007",
    "barcode": "10000006",
    "category": "Veg.Momo's",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Full",
            "price": 160.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-8",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Veg. Chilli Momos",
    "code": "DISH-GGN01-008",
    "barcode": "10000007",
    "category": "Veg.Momo's",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Full",
            "price": 160.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-9",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paneer Steam Momos",
    "code": "DISH-GGN01-009",
    "barcode": "10000008",
    "category": "Paneer Momo's",
    "product_type": "food",
    "mrp": 70.0,
    "selling_price": 70.0,
    "cost_price": 28.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Half",
            "price": 70.0
          },
          {
            "name": "Full",
            "price": 100.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Kurkure Crispiness",
        "price": 30.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-10",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paneer Fry Momos",
    "code": "DISH-GGN01-010",
    "barcode": "10000009",
    "category": "Paneer Momo's",
    "product_type": "food",
    "mrp": 90.0,
    "selling_price": 90.0,
    "cost_price": 36.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Half",
            "price": 90.0
          },
          {
            "name": "Full",
            "price": 120.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Kurkure Crispiness",
        "price": 30.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-11",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paneer Butter Momos",
    "code": "DISH-GGN01-011",
    "barcode": "10000010",
    "category": "Paneer Momo's",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Half",
            "price": 100.0
          },
          {
            "name": "Full",
            "price": 140.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Kurkure Crispiness",
        "price": 30.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-12",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paneer Kurkure Momos",
    "code": "DISH-GGN01-012",
    "barcode": "10000011",
    "category": "Paneer Momo's",
    "product_type": "food",
    "mrp": 120.0,
    "selling_price": 120.0,
    "cost_price": 48.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Trending"
    ],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Half",
            "price": 120.0
          },
          {
            "name": "Full",
            "price": 160.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-13",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paneer Tandoori Momos",
    "code": "DISH-GGN01-013",
    "barcode": "10000012",
    "category": "Paneer Momo's",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Full",
            "price": 160.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-14",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paneer Malai Momos",
    "code": "DISH-GGN01-014",
    "barcode": "10000013",
    "category": "Paneer Momo's",
    "product_type": "food",
    "mrp": 180.0,
    "selling_price": 180.0,
    "cost_price": 72.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Full",
            "price": 180.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-15",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paneer Afgani Momos",
    "code": "DISH-GGN01-015",
    "barcode": "10000014",
    "category": "Paneer Momo's",
    "product_type": "food",
    "mrp": 180.0,
    "selling_price": 180.0,
    "cost_price": 72.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Full",
            "price": 180.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-16",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paneer Chilli Momos",
    "code": "DISH-GGN01-016",
    "barcode": "10000015",
    "category": "Paneer Momo's",
    "product_type": "food",
    "mrp": 180.0,
    "selling_price": 180.0,
    "cost_price": 72.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Full",
            "price": 180.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-17",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Veg. Roll",
    "code": "DISH-GGN01-017",
    "barcode": "10000016",
    "category": "Spring Rolls",
    "product_type": "food",
    "mrp": 90.0,
    "selling_price": 90.0,
    "cost_price": 36.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Kurkure Crispiness",
        "price": 30.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-18",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paneer Roll",
    "code": "DISH-GGN01-018",
    "barcode": "10000017",
    "category": "Spring Rolls",
    "product_type": "food",
    "mrp": 120.0,
    "selling_price": 120.0,
    "cost_price": 48.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "High Margin"
    ],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Kurkure Crispiness",
        "price": 30.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-19",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Mix Roll",
    "code": "DISH-GGN01-019",
    "barcode": "10000018",
    "category": "Spring Rolls",
    "product_type": "food",
    "mrp": 140.0,
    "selling_price": 140.0,
    "cost_price": 56.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Kurkure Crispiness",
        "price": 30.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-20",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Veg. Kathi Roll",
    "code": "DISH-GGN01-020",
    "barcode": "10000019",
    "category": "Kathi Roll",
    "product_type": "food",
    "mrp": 90.0,
    "selling_price": 90.0,
    "cost_price": 36.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-21",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Noodle Roll",
    "code": "DISH-GGN01-021",
    "barcode": "10000020",
    "category": "Kathi Roll",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-22",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paneer Kathi Roll",
    "code": "DISH-GGN01-022",
    "barcode": "10000021",
    "category": "Kathi Roll",
    "product_type": "food",
    "mrp": 120.0,
    "selling_price": 120.0,
    "cost_price": 48.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-23",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Mix Kathi Roll",
    "code": "DISH-GGN01-023",
    "barcode": "10000022",
    "category": "Kathi Roll",
    "product_type": "food",
    "mrp": 140.0,
    "selling_price": 140.0,
    "cost_price": 56.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-24",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Tandoori Chaap Roll",
    "code": "DISH-GGN01-024",
    "barcode": "10000023",
    "category": "Kathi Roll",
    "product_type": "food",
    "mrp": 130.0,
    "selling_price": 130.0,
    "cost_price": 52.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-25",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Tandoori Malai Chaap Roll",
    "code": "DISH-GGN01-025",
    "barcode": "10000024",
    "category": "Kathi Roll",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-26",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Tandoori Afgani Chaap Roll",
    "code": "DISH-GGN01-026",
    "barcode": "10000025",
    "category": "Kathi Roll",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-27",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Tandoori Paneer Tikka Roll",
    "code": "DISH-GGN01-027",
    "barcode": "10000026",
    "category": "Kathi Roll",
    "product_type": "food",
    "mrp": 170.0,
    "selling_price": 170.0,
    "cost_price": 68.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-28",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Veg. Noodles",
    "code": "DISH-GGN01-028",
    "barcode": "10000027",
    "category": "Noodles",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-29",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Schezwan Noodles",
    "code": "DISH-GGN01-029",
    "barcode": "10000028",
    "category": "Noodles",
    "product_type": "food",
    "mrp": 130.0,
    "selling_price": 130.0,
    "cost_price": 52.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-30",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Chilli Garlic Noodles",
    "code": "DISH-GGN01-030",
    "barcode": "10000029",
    "category": "Noodles",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "High Margin"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-31",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Singa-puri Noodles",
    "code": "DISH-GGN01-031",
    "barcode": "10000030",
    "category": "Noodles",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-32",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paneer Noodles",
    "code": "DISH-GGN01-032",
    "barcode": "10000031",
    "category": "Noodles",
    "product_type": "food",
    "mrp": 170.0,
    "selling_price": 170.0,
    "cost_price": 68.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-33",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Hakka Noodles",
    "code": "DISH-GGN01-033",
    "barcode": "10000032",
    "category": "Noodles",
    "product_type": "food",
    "mrp": 200.0,
    "selling_price": 200.0,
    "cost_price": 80.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-34",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Special Veg. Loaded Noodles",
    "code": "DISH-GGN01-034",
    "barcode": "10000033",
    "category": "Noodles",
    "product_type": "food",
    "mrp": 250.0,
    "selling_price": 250.0,
    "cost_price": 100.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-35",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Veg. Hot & Sour Soup",
    "code": "DISH-GGN01-035",
    "barcode": "10000034",
    "category": "Soup",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-36",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Sweet Corn Soup",
    "code": "DISH-GGN01-036",
    "barcode": "10000035",
    "category": "Soup",
    "product_type": "food",
    "mrp": 120.0,
    "selling_price": 120.0,
    "cost_price": 48.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-37",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Manchow Soup",
    "code": "DISH-GGN01-037",
    "barcode": "10000036",
    "category": "Soup",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-38",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Veg Sandwich",
    "code": "DISH-GGN01-038",
    "barcode": "10000037",
    "category": "Sandwich",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Style",
        "options": [
          {
            "name": "Oven",
            "price": 0.0
          },
          {
            "name": "Grilled",
            "price": 20.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-39",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paneer Sandwich",
    "code": "DISH-GGN01-039",
    "barcode": "10000038",
    "category": "Sandwich",
    "product_type": "food",
    "mrp": 120.0,
    "selling_price": 120.0,
    "cost_price": 48.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [
      {
        "name": "Style",
        "options": [
          {
            "name": "Oven",
            "price": 0.0
          },
          {
            "name": "Grilled",
            "price": 20.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-40",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Tandoori Sandwich",
    "code": "DISH-GGN01-040",
    "barcode": "10000039",
    "category": "Sandwich",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Style",
        "options": [
          {
            "name": "Oven",
            "price": 0.0
          },
          {
            "name": "Grilled",
            "price": 20.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-41",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Cheese Sandwich",
    "code": "DISH-GGN01-041",
    "barcode": "10000040",
    "category": "Sandwich",
    "product_type": "food",
    "mrp": 180.0,
    "selling_price": 180.0,
    "cost_price": 72.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Style",
        "options": [
          {
            "name": "Oven",
            "price": 0.0
          },
          {
            "name": "Grilled",
            "price": 20.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-42",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "French Fries",
    "code": "DISH-GGN01-042",
    "barcode": "10000041",
    "category": "Fries",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-43",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Periperi Fries",
    "code": "DISH-GGN01-043",
    "barcode": "10000042",
    "category": "Fries",
    "product_type": "food",
    "mrp": 120.0,
    "selling_price": 120.0,
    "cost_price": 48.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Trending"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-44",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Chilli Potato",
    "code": "DISH-GGN01-044",
    "barcode": "10000043",
    "category": "Fries",
    "product_type": "food",
    "mrp": 140.0,
    "selling_price": 140.0,
    "cost_price": 56.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-45",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Honey Chilli Potato",
    "code": "DISH-GGN01-045",
    "barcode": "10000044",
    "category": "Fries",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-46",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Manchurian Dry",
    "code": "DISH-GGN01-046",
    "barcode": "10000045",
    "category": "Fries",
    "product_type": "food",
    "mrp": 140.0,
    "selling_price": 140.0,
    "cost_price": 56.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-47",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Manchurian Gravy",
    "code": "DISH-GGN01-047",
    "barcode": "10000046",
    "category": "Fries",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-48",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paneer Chilli Dry",
    "code": "DISH-GGN01-048",
    "barcode": "10000047",
    "category": "Fries",
    "product_type": "food",
    "mrp": 250.0,
    "selling_price": 250.0,
    "cost_price": 100.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-49",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paneer Chilli Gravy",
    "code": "DISH-GGN01-049",
    "barcode": "10000048",
    "category": "Fries",
    "product_type": "food",
    "mrp": 280.0,
    "selling_price": 280.0,
    "cost_price": 112.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-50",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Mushroom Chilli Dry",
    "code": "DISH-GGN01-050",
    "barcode": "10000049",
    "category": "Fries",
    "product_type": "food",
    "mrp": 250.0,
    "selling_price": 250.0,
    "cost_price": 100.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-51",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Gobi Chilli Dry",
    "code": "DISH-GGN01-051",
    "barcode": "10000050",
    "category": "Fries",
    "product_type": "food",
    "mrp": 230.0,
    "selling_price": 230.0,
    "cost_price": 92.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-52",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Soya Chilli Dry",
    "code": "DISH-GGN01-052",
    "barcode": "10000051",
    "category": "Fries",
    "product_type": "food",
    "mrp": 200.0,
    "selling_price": 200.0,
    "cost_price": 80.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-53",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Red Sauce Pasta",
    "code": "DISH-GGN01-053",
    "barcode": "10000052",
    "category": "Pasta",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-54",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "White Sauce Pasta",
    "code": "DISH-GGN01-054",
    "barcode": "10000053",
    "category": "Pasta",
    "product_type": "food",
    "mrp": 170.0,
    "selling_price": 170.0,
    "cost_price": 68.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-55",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Mix Sauce Pasta",
    "code": "DISH-GGN01-055",
    "barcode": "10000054",
    "category": "Pasta",
    "product_type": "food",
    "mrp": 170.0,
    "selling_price": 170.0,
    "cost_price": 68.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-56",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Sweet Corn Pasta",
    "code": "DISH-GGN01-056",
    "barcode": "10000055",
    "category": "Pasta",
    "product_type": "food",
    "mrp": 190.0,
    "selling_price": 190.0,
    "cost_price": 76.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-57",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paneer Pasta",
    "code": "DISH-GGN01-057",
    "barcode": "10000056",
    "category": "Pasta",
    "product_type": "food",
    "mrp": 220.0,
    "selling_price": 220.0,
    "cost_price": 88.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-58",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Special Veg. Loaded Pasta",
    "code": "DISH-GGN01-058",
    "barcode": "10000057",
    "category": "Pasta",
    "product_type": "food",
    "mrp": 250.0,
    "selling_price": 250.0,
    "cost_price": 100.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-59",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Veg. Fried Rice",
    "code": "DISH-GGN01-059",
    "barcode": "10000058",
    "category": "Fried Rice",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-60",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Manchurian Fried Rice",
    "code": "DISH-GGN01-060",
    "barcode": "10000059",
    "category": "Fried Rice",
    "product_type": "food",
    "mrp": 120.0,
    "selling_price": 120.0,
    "cost_price": 48.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-61",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paneer Fried Rice",
    "code": "DISH-GGN01-061",
    "barcode": "10000060",
    "category": "Fried Rice",
    "product_type": "food",
    "mrp": 140.0,
    "selling_price": 140.0,
    "cost_price": 56.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-62",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Schezwan Fried Rice",
    "code": "DISH-GGN01-062",
    "barcode": "10000061",
    "category": "Fried Rice",
    "product_type": "food",
    "mrp": 140.0,
    "selling_price": 140.0,
    "cost_price": 56.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-63",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Chilli Garlic Fried Rice",
    "code": "DISH-GGN01-063",
    "barcode": "10000062",
    "category": "Fried Rice",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-64",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Singa-Puri Fried Rice",
    "code": "DISH-GGN01-064",
    "barcode": "10000063",
    "category": "Fried Rice",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-65",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Special Veg. Loaded Fried Rice",
    "code": "DISH-GGN01-065",
    "barcode": "10000064",
    "category": "Fried Rice",
    "product_type": "food",
    "mrp": 200.0,
    "selling_price": 200.0,
    "cost_price": 80.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-66",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Veg Pizza",
    "code": "DISH-GGN01-066",
    "barcode": "10000065",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 170.0,
    "selling_price": 170.0,
    "cost_price": 68.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 170.0
          },
          {
            "name": "Medium",
            "price": 230.0
          },
          {
            "name": "Large",
            "price": 290.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-67",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Tandoori Pizza",
    "code": "DISH-GGN01-067",
    "barcode": "10000066",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 240.0,
    "selling_price": 240.0,
    "cost_price": 96.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Trending"
    ],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 240.0
          },
          {
            "name": "Medium",
            "price": 300.0
          },
          {
            "name": "Large",
            "price": 360.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-68",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Sweetcorn Capsicum Pizza",
    "code": "DISH-GGN01-068",
    "barcode": "10000067",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 150.0
          },
          {
            "name": "Medium",
            "price": 210.0
          },
          {
            "name": "Large",
            "price": 270.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-69",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Margherita Pizza",
    "code": "DISH-GGN01-069",
    "barcode": "10000068",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 170.0,
    "selling_price": 170.0,
    "cost_price": 68.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 170.0
          },
          {
            "name": "Medium",
            "price": 230.0
          },
          {
            "name": "Large",
            "price": 290.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-70",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Black Olive Pizza",
    "code": "DISH-GGN01-070",
    "barcode": "10000069",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 190.0,
    "selling_price": 190.0,
    "cost_price": 76.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 190.0
          },
          {
            "name": "Medium",
            "price": 250.0
          },
          {
            "name": "Large",
            "price": 310.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-71",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Mushroom Pizza",
    "code": "DISH-GGN01-071",
    "barcode": "10000070",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 200.0,
    "selling_price": 200.0,
    "cost_price": 80.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 200.0
          },
          {
            "name": "Medium",
            "price": 260.0
          },
          {
            "name": "Large",
            "price": 320.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-72",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paneer Pizza",
    "code": "DISH-GGN01-072",
    "barcode": "10000071",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 210.0,
    "selling_price": 210.0,
    "cost_price": 84.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 210.0
          },
          {
            "name": "Medium",
            "price": 270.0
          },
          {
            "name": "Large",
            "price": 330.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-73",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Peppy Paneer Pizza",
    "code": "DISH-GGN01-073",
    "barcode": "10000072",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 230.0,
    "selling_price": 230.0,
    "cost_price": 92.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 230.0
          },
          {
            "name": "Medium",
            "price": 290.0
          },
          {
            "name": "Large",
            "price": 350.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-74",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Indi Tandoori Paneer Pizza",
    "code": "DISH-GGN01-074",
    "barcode": "10000073",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 250.0,
    "selling_price": 250.0,
    "cost_price": 100.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 250.0
          },
          {
            "name": "Medium",
            "price": 310.0
          },
          {
            "name": "Large",
            "price": 370.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-75",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Farm House Pizza",
    "code": "DISH-GGN01-075",
    "barcode": "10000074",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 260.0,
    "selling_price": 260.0,
    "cost_price": 104.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 260.0
          },
          {
            "name": "Medium",
            "price": 320.0
          },
          {
            "name": "Large",
            "price": 380.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-76",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Double Decker Pizza",
    "code": "DISH-GGN01-076",
    "barcode": "10000075",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 280.0,
    "selling_price": 280.0,
    "cost_price": 112.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 280.0
          },
          {
            "name": "Medium",
            "price": 340.0
          },
          {
            "name": "Large",
            "price": 400.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-77",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "All in One Pizza",
    "code": "DISH-GGN01-077",
    "barcode": "10000076",
    "category": "Pizza",
    "product_type": "food",
    "mrp": 300.0,
    "selling_price": 300.0,
    "cost_price": 120.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Size",
        "options": [
          {
            "name": "Small",
            "price": 300.0
          },
          {
            "name": "Medium",
            "price": 360.0
          },
          {
            "name": "Large",
            "price": 420.0
          }
        ]
      }
    ],
    "addon_groups": [
      {
        "name": "Cheese Burst",
        "price": 90.0,
        "price_by_size": {
          "Small": 50.0,
          "Medium": 90.0,
          "Large": 120.0
        }
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-78",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Aloo Tikki Burger",
    "code": "DISH-GGN01-078",
    "barcode": "10000077",
    "category": "Burger",
    "product_type": "food",
    "mrp": 60.0,
    "selling_price": 60.0,
    "cost_price": 24.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Prep Style",
        "options": [
          {
            "name": "Oven",
            "price": 60.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-79",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Veggie Burger",
    "code": "DISH-GGN01-079",
    "barcode": "10000078",
    "category": "Burger",
    "product_type": "food",
    "mrp": 50.0,
    "selling_price": 50.0,
    "cost_price": 20.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [
      {
        "name": "Prep Style",
        "options": [
          {
            "name": "Tawa",
            "price": 50.0
          },
          {
            "name": "Oven",
            "price": 70.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-80",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paneer Burger",
    "code": "DISH-GGN01-080",
    "barcode": "10000079",
    "category": "Burger",
    "product_type": "food",
    "mrp": 70.0,
    "selling_price": 70.0,
    "cost_price": 28.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Trending"
    ],
    "variant_groups": [
      {
        "name": "Prep Style",
        "options": [
          {
            "name": "Tawa",
            "price": 70.0
          },
          {
            "name": "Oven",
            "price": 90.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-81",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Cheese Burger",
    "code": "DISH-GGN01-081",
    "barcode": "10000080",
    "category": "Burger",
    "product_type": "food",
    "mrp": 80.0,
    "selling_price": 80.0,
    "cost_price": 32.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Prep Style",
        "options": [
          {
            "name": "Tawa",
            "price": 80.0
          },
          {
            "name": "Oven",
            "price": 100.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-82",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Melted Cheese Burger",
    "code": "DISH-GGN01-082",
    "barcode": "10000081",
    "category": "Burger",
    "product_type": "food",
    "mrp": 130.0,
    "selling_price": 130.0,
    "cost_price": 52.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Prep Style",
        "options": [
          {
            "name": "Oven",
            "price": 130.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-83",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Maha Raja Burger",
    "code": "DISH-GGN01-083",
    "barcode": "10000082",
    "category": "Burger",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "High Margin"
    ],
    "variant_groups": [
      {
        "name": "Prep Style",
        "options": [
          {
            "name": "Oven",
            "price": 160.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-84",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Aloo Tikki Wrap",
    "code": "DISH-GGN01-084",
    "barcode": "10000083",
    "category": "Wrap",
    "product_type": "food",
    "mrp": 120.0,
    "selling_price": 120.0,
    "cost_price": 48.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-85",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Veggie Wrap",
    "code": "DISH-GGN01-085",
    "barcode": "10000084",
    "category": "Wrap",
    "product_type": "food",
    "mrp": 140.0,
    "selling_price": 140.0,
    "cost_price": 56.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-86",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paneer Wrap",
    "code": "DISH-GGN01-086",
    "barcode": "10000085",
    "category": "Wrap",
    "product_type": "food",
    "mrp": 180.0,
    "selling_price": 180.0,
    "cost_price": 72.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-87",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Melted Cheese Wrap",
    "code": "DISH-GGN01-087",
    "barcode": "10000086",
    "category": "Wrap",
    "product_type": "food",
    "mrp": 220.0,
    "selling_price": 220.0,
    "cost_price": 88.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-88",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Peanut Masala",
    "code": "DISH-GGN01-088",
    "barcode": "10000087",
    "category": "Snacks",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-89",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Sweet Highlight Corn Chaat",
    "code": "DISH-GGN01-089",
    "barcode": "10000088",
    "category": "Snacks",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-90",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Crispy Corn Chaat",
    "code": "DISH-GGN01-090",
    "barcode": "10000089",
    "category": "Snacks",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Trending"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-91",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paav Bhaji",
    "code": "DISH-GGN01-091",
    "barcode": "10000090",
    "category": "Paav Bhaji",
    "product_type": "food",
    "mrp": 120.0,
    "selling_price": 120.0,
    "cost_price": 48.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Paav",
        "price": 30.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-92",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Fried Rice & Manchurian Combo",
    "code": "DISH-GGN01-092",
    "barcode": "10000091",
    "category": "Chinese Combo",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "High Margin"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-93",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Noodle & Manchurian Combo",
    "code": "DISH-GGN01-093",
    "barcode": "10000092",
    "category": "Chinese Combo",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-94",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Extra Loaded Veg Maggie",
    "code": "DISH-GGN01-094",
    "barcode": "10000093",
    "category": "Extra Loaded Veg Maggie",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Trending"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-95",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Banana Shake",
    "code": "DISH-GGN01-095",
    "barcode": "10000094",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 80.0,
    "selling_price": 80.0,
    "cost_price": 32.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-96",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Papaya Shake",
    "code": "DISH-GGN01-096",
    "barcode": "10000095",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 80.0,
    "selling_price": 80.0,
    "cost_price": 32.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-97",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Mango Shake",
    "code": "DISH-GGN01-097",
    "barcode": "10000096",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 80.0,
    "selling_price": 80.0,
    "cost_price": 32.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-98",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Chikoo Shake",
    "code": "DISH-GGN01-098",
    "barcode": "10000097",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 80.0,
    "selling_price": 80.0,
    "cost_price": 32.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-99",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Mix Shake",
    "code": "DISH-GGN01-099",
    "barcode": "10000098",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 100.0,
    "selling_price": 100.0,
    "cost_price": 40.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-100",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Cold Coffee",
    "code": "DISH-GGN01-100",
    "barcode": "10000099",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 80.0,
    "selling_price": 80.0,
    "cost_price": 32.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller",
      "High Margin"
    ],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-101",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Strawberry Shake",
    "code": "DISH-GGN01-101",
    "barcode": "10000100",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 80.0,
    "selling_price": 80.0,
    "cost_price": 32.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-102",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Butterscotch Shake",
    "code": "DISH-GGN01-102",
    "barcode": "10000101",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 80.0,
    "selling_price": 80.0,
    "cost_price": 32.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-103",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Vanilla Shake",
    "code": "DISH-GGN01-103",
    "barcode": "10000102",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 80.0,
    "selling_price": 80.0,
    "cost_price": 32.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-104",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Chocolate Shake",
    "code": "DISH-GGN01-104",
    "barcode": "10000103",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 90.0,
    "selling_price": 90.0,
    "cost_price": 36.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-105",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Chocolate Banana Shake",
    "code": "DISH-GGN01-105",
    "barcode": "10000104",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 90.0,
    "selling_price": 90.0,
    "cost_price": 36.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-106",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Kitkat Shake",
    "code": "DISH-GGN01-106",
    "barcode": "10000105",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 90.0,
    "selling_price": 90.0,
    "cost_price": 36.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Trending"
    ],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-107",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Oreo Shake",
    "code": "DISH-GGN01-107",
    "barcode": "10000106",
    "category": "Shakes",
    "product_type": "food",
    "mrp": 90.0,
    "selling_price": 90.0,
    "cost_price": 36.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Trending"
    ],
    "variant_groups": [],
    "addon_groups": [
      {
        "name": "Extra Ice Cream",
        "price": 20.0
      }
    ],
    "images": []
  },
  {
    "id": "prod-ggn01-108",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Virgin Mojito",
    "code": "DISH-GGN01-108",
    "barcode": "10000107",
    "category": "Mojito",
    "product_type": "food",
    "mrp": 99.0,
    "selling_price": 99.0,
    "cost_price": 39.6,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "High Margin"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-109",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Blue Lagoon Mojito",
    "code": "DISH-GGN01-109",
    "barcode": "10000108",
    "category": "Mojito",
    "product_type": "food",
    "mrp": 99.0,
    "selling_price": 99.0,
    "cost_price": 39.6,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-110",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Green Apple Mojito",
    "code": "DISH-GGN01-110",
    "barcode": "10000109",
    "category": "Mojito",
    "product_type": "food",
    "mrp": 99.0,
    "selling_price": 99.0,
    "cost_price": 39.6,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-111",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Kala Khatta Mojito",
    "code": "DISH-GGN01-111",
    "barcode": "10000110",
    "category": "Mojito",
    "product_type": "food",
    "mrp": 99.0,
    "selling_price": 99.0,
    "cost_price": 39.6,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-112",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Strawberry Mojito",
    "code": "DISH-GGN01-112",
    "barcode": "10000111",
    "category": "Mojito",
    "product_type": "food",
    "mrp": 149.0,
    "selling_price": 149.0,
    "cost_price": 59.6,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-113",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Guava Mojito",
    "code": "DISH-GGN01-113",
    "barcode": "10000112",
    "category": "Mojito",
    "product_type": "food",
    "mrp": 149.0,
    "selling_price": 149.0,
    "cost_price": 59.6,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-114",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Orange Mojito",
    "code": "DISH-GGN01-114",
    "barcode": "10000113",
    "category": "Mojito",
    "product_type": "food",
    "mrp": 139.0,
    "selling_price": 139.0,
    "cost_price": 55.6,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-115",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Pineapple Mojito",
    "code": "DISH-GGN01-115",
    "barcode": "10000114",
    "category": "Mojito",
    "product_type": "food",
    "mrp": 139.0,
    "selling_price": 139.0,
    "cost_price": 55.6,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-116",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Masala Chaap",
    "code": "DISH-GGN01-116",
    "barcode": "10000115",
    "category": "Tandoori Chaap",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Portion",
        "options": [
          {
            "name": "Half",
            "price": 150.0
          },
          {
            "name": "Full",
            "price": 230.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-117",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Achari Chaap",
    "code": "DISH-GGN01-117",
    "barcode": "10000116",
    "category": "Tandoori Chaap",
    "product_type": "food",
    "mrp": 150.0,
    "selling_price": 150.0,
    "cost_price": 60.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Portion",
        "options": [
          {
            "name": "Half",
            "price": 150.0
          },
          {
            "name": "Full",
            "price": 230.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-118",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Malai Chaap",
    "code": "DISH-GGN01-118",
    "barcode": "10000117",
    "category": "Tandoori Chaap",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [
      {
        "name": "Portion",
        "options": [
          {
            "name": "Half",
            "price": 160.0
          },
          {
            "name": "Full",
            "price": 250.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-119",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Afgani Chaap",
    "code": "DISH-GGN01-119",
    "barcode": "10000118",
    "category": "Tandoori Chaap",
    "product_type": "food",
    "mrp": 160.0,
    "selling_price": 160.0,
    "cost_price": 64.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Portion",
        "options": [
          {
            "name": "Half",
            "price": 160.0
          },
          {
            "name": "Full",
            "price": 250.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-120",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Hara Bhara Kebab",
    "code": "DISH-GGN01-120",
    "barcode": "10000119",
    "category": "Kebab",
    "product_type": "food",
    "mrp": 180.0,
    "selling_price": 180.0,
    "cost_price": 72.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-121",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Veg. Seekh Kebab",
    "code": "DISH-GGN01-121",
    "barcode": "10000120",
    "category": "Kebab",
    "product_type": "food",
    "mrp": 180.0,
    "selling_price": 180.0,
    "cost_price": 72.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-122",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Reshmi Kebab",
    "code": "DISH-GGN01-122",
    "barcode": "10000121",
    "category": "Kebab",
    "product_type": "food",
    "mrp": 200.0,
    "selling_price": 200.0,
    "cost_price": 80.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-123",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Dahi Ke Sholay",
    "code": "DISH-GGN01-123",
    "barcode": "10000122",
    "category": "Kebab",
    "product_type": "food",
    "mrp": 200.0,
    "selling_price": 200.0,
    "cost_price": 80.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-124",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Tandoori Aloo Tikka",
    "code": "DISH-GGN01-124",
    "barcode": "10000123",
    "category": "Tandoori Tikka",
    "product_type": "food",
    "mrp": 140.0,
    "selling_price": 140.0,
    "cost_price": 56.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Portion",
        "options": [
          {
            "name": "Half",
            "price": 140.0
          },
          {
            "name": "Full",
            "price": 220.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-125",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Paneer Tikka",
    "code": "DISH-GGN01-125",
    "barcode": "10000124",
    "category": "Tandoori Tikka",
    "product_type": "food",
    "mrp": 180.0,
    "selling_price": 180.0,
    "cost_price": 72.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Bestseller"
    ],
    "variant_groups": [
      {
        "name": "Portion",
        "options": [
          {
            "name": "Half",
            "price": 180.0
          },
          {
            "name": "Full",
            "price": 290.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-126",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Achari Paneer Tikka",
    "code": "DISH-GGN01-126",
    "barcode": "10000125",
    "category": "Tandoori Tikka",
    "product_type": "food",
    "mrp": 180.0,
    "selling_price": 180.0,
    "cost_price": 72.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Portion",
        "options": [
          {
            "name": "Half",
            "price": 180.0
          },
          {
            "name": "Full",
            "price": 290.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-127",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Malai Paneer Tikka",
    "code": "DISH-GGN01-127",
    "barcode": "10000126",
    "category": "Tandoori Tikka",
    "product_type": "food",
    "mrp": 190.0,
    "selling_price": 190.0,
    "cost_price": 76.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": true,
    "tags": [
      "Trending"
    ],
    "variant_groups": [
      {
        "name": "Portion",
        "options": [
          {
            "name": "Half",
            "price": 190.0
          },
          {
            "name": "Full",
            "price": 300.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  },
  {
    "id": "prod-ggn01-128",
    "tenant_id": "baithak-demo-tenant",
    "unit_code": "GGN01",
    "branch_id": "GGN01",
    "name": "Mushroom Tikka",
    "code": "DISH-GGN01-128",
    "barcode": "10000127",
    "category": "Tandoori Tikka",
    "product_type": "food",
    "mrp": 190.0,
    "selling_price": 190.0,
    "cost_price": 76.0,
    "unit_of_measure": "plate",
    "track_inventory": true,
    "reorder_level": 10,
    "is_active": true,
    "is_vegetarian": true,
    "is_popular": false,
    "tags": [],
    "variant_groups": [
      {
        "name": "Portion",
        "options": [
          {
            "name": "Half",
            "price": 190.0
          },
          {
            "name": "Full",
            "price": 300.0
          }
        ]
      }
    ],
    "addon_groups": [],
    "images": []
  }
];
const SEED_INVENTORY_STOCKS: any[] = [];
const SEED_ROOMS: any[] = [];
const SEED_TABLES: any[] = [
  {
    "id": "table-cuh02-1",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "CUH02",
    "number": "T1",
    "capacity": 4,
    "status": "free",
    "is_active": true
  },
  {
    "id": "table-cuh02-2",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "CUH02",
    "number": "T2",
    "capacity": 4,
    "status": "free",
    "is_active": true
  },
  {
    "id": "table-cuh02-3",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "CUH02",
    "number": "T3",
    "capacity": 4,
    "status": "free",
    "is_active": true
  },
  {
    "id": "table-cuh02-4",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "CUH02",
    "number": "T4",
    "capacity": 4,
    "status": "free",
    "is_active": true
  },
  {
    "id": "table-cuh02-5",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "CUH02",
    "number": "T5",
    "capacity": 4,
    "status": "free",
    "is_active": true
  },
  {
    "id": "table-cuh02-6",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "CUH02",
    "number": "T6",
    "capacity": 4,
    "status": "free",
    "is_active": true
  },
  {
    "id": "table-cuh02-7",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "CUH02",
    "number": "T7",
    "capacity": 4,
    "status": "free",
    "is_active": true
  },
  {
    "id": "table-cuh02-8",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "CUH02",
    "number": "T8",
    "capacity": 4,
    "status": "free",
    "is_active": true
  },
  {
    "id": "table-cuh02-9",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "CUH02",
    "number": "T9",
    "capacity": 4,
    "status": "free",
    "is_active": true
  },
  {
    "id": "table-cuh02-10",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "CUH02",
    "number": "T10",
    "capacity": 4,
    "status": "free",
    "is_active": true
  },
  {
    "id": "table-ggn01-1",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "GGN01",
    "number": "T1",
    "capacity": 4,
    "status": "free",
    "is_active": true
  },
  {
    "id": "table-ggn01-2",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "GGN01",
    "number": "T2",
    "capacity": 4,
    "status": "free",
    "is_active": true
  },
  {
    "id": "table-ggn01-3",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "GGN01",
    "number": "T3",
    "capacity": 4,
    "status": "free",
    "is_active": true
  },
  {
    "id": "table-ggn01-4",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "GGN01",
    "number": "T4",
    "capacity": 4,
    "status": "free",
    "is_active": true
  },
  {
    "id": "table-ggn01-5",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "GGN01",
    "number": "T5",
    "capacity": 4,
    "status": "free",
    "is_active": true
  },
  {
    "id": "table-ggn01-6",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "GGN01",
    "number": "T6",
    "capacity": 4,
    "status": "free",
    "is_active": true
  },
  {
    "id": "table-ggn01-7",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "GGN01",
    "number": "T7",
    "capacity": 4,
    "status": "free",
    "is_active": true
  },
  {
    "id": "table-ggn01-8",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "GGN01",
    "number": "T8",
    "capacity": 4,
    "status": "free",
    "is_active": true
  },
  {
    "id": "table-ggn01-9",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "GGN01",
    "number": "T9",
    "capacity": 4,
    "status": "free",
    "is_active": true
  },
  {
    "id": "table-ggn01-10",
    "tenant_id": "baithak-demo-tenant",
    "branch_id": "GGN01",
    "number": "T10",
    "capacity": 4,
    "status": "free",
    "is_active": true
  }
];
const SEED_RESIDENTS: any[] = [];
const SEED_EMPLOYEES: any[] = [];
const SEED_INVOICES: any[] = [];
const SEED_ORDERS: any[] = [];
const SEED_AI_INSIGHTS: any[] = [];
const SEED_LOVS: any[] = [];
const SEED_FORM_DEFINITIONS: any[] = [];
const SEED_FORM_SUBMISSIONS: any[] = [];
const SEED_WORKFLOW_TEMPLATES: any[] = [];
const SEED_WORKFLOW_REQUESTS: any[] = [];
const SEED_COMMUNICATION_TEMPLATES: any[] = [];
const SEED_COMMUNICATION_LOGS: any[] = [];
const SEED_CONNECTED_APPS: any[] = [];
const SEED_VENDORS: any[] = [];

class MockDatabase {
  private initKey = "baithak_mock_db_initialized";
  private static readonly IS_DEV = (import.meta as any).env?.DEV ?? false;

  private assertDevOnly(feature: string) {
    if (!MockDatabase.IS_DEV) {
      throw new Error(`Dev-only feature '${feature}' cannot be used in production.`);
    }
  }

  constructor() {
    if (!MockDatabase.IS_DEV) {
      return;
    }

    // Clear out any old business caches so only DB items are utilized
    const keysToClear = [
      "customers", "products", "stocks", "rooms", "tables", "residents", "vendors",
      "employees", "invoices", "orders", "insights", "lovs", "form_submissions",
      "workflow_templates", "workflow_requests", "communication_templates",
      "communication_logs", "connected_apps"
    ];
    for (const key of keysToClear) {
      localStorage.removeItem(`baithak_${key}`);
    }

    const currentVersion = localStorage.getItem("baithak_db_version");
    if (currentVersion !== "7") {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("baithak_") || key === this.initKey)) {
          localStorage.removeItem(key);
        }
      }
      localStorage.setItem("baithak_db_version", "7");
    }

    if (!localStorage.getItem(this.initKey)) {
      this.set("customers", SEED_CUSTOMERS);
      this.set("products", SEED_PRODUCTS);
      this.set("stocks", SEED_INVENTORY_STOCKS);
      this.set("rooms", SEED_ROOMS);
      this.set("tables", SEED_TABLES);
      this.set("residents", SEED_RESIDENTS);
      this.set("vendors", SEED_VENDORS);
      this.set("employees", SEED_EMPLOYEES);
      this.set("invoices", SEED_INVOICES);
      this.set("orders", SEED_ORDERS);
      this.set("insights", SEED_AI_INSIGHTS);
      localStorage.setItem(this.initKey, "true");
    }

    if (!localStorage.getItem("baithak_lovs")) {
      this.set("lovs", SEED_LOVS);
    }
    if (!localStorage.getItem("baithak_form_definitions")) {
      this.set("form_definitions", SEED_FORM_DEFINITIONS);
    }
    if (!localStorage.getItem("baithak_form_submissions")) {
      this.set("form_submissions", SEED_FORM_SUBMISSIONS);
    }
    if (!localStorage.getItem("baithak_workflow_templates")) {
      this.set("workflow_templates", SEED_WORKFLOW_TEMPLATES);
    }
    if (!localStorage.getItem("baithak_workflow_requests")) {
      this.set("workflow_requests", SEED_WORKFLOW_REQUESTS);
    }
    if (!localStorage.getItem("baithak_communication_templates")) {
      this.set("communication_templates", SEED_COMMUNICATION_TEMPLATES);
    }
    if (!localStorage.getItem("baithak_communication_logs")) {
      this.set("communication_logs", SEED_COMMUNICATION_LOGS);
    }
    if (!localStorage.getItem("baithak_connected_apps")) {
      this.set("connected_apps", SEED_CONNECTED_APPS);
    }
    const existingErp = localStorage.getItem("baithak_file_master_erp");
    if (!existingErp || JSON.parse(existingErp).length < SEED_FILE_MASTER_ERP.length) {
      this.set("file_master_erp", SEED_FILE_MASTER_ERP);
    }
    if (!localStorage.getItem("baithak_vendors")) {
      this.set("vendors", SEED_VENDORS);
    }
  }

  // Generic helpers
  public get<T>(key: string): T[] {
    if (!MockDatabase.IS_DEV) {
      return [];
    }

    const val = localStorage.getItem(`baithak_${key}`);
    return val ? JSON.parse(val) : [];
  }

  public set<T>(key: string, data: T[]): void {
    this.assertDevOnly("mockDB.set");
    localStorage.setItem(`baithak_${key}`, JSON.stringify(data));
  }

  public insert<T extends { id: string | number }>(key: string, item: any): T {
    if (!MockDatabase.IS_DEV) {
      console.warn(`mockDB.insert skipped in production for key=${key}`);
      return {
        ...item,
        id: item.id ?? `prod-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as T;
    }

    this.assertDevOnly("mockDB.insert");
    const list = this.get<T>(key);
    let nextId: number = 1;
    if (list.length > 0) {
      const ids = list.map((x: any) => {
        if (typeof x.id === "number") return x.id;
        const num = parseInt(x.id);
        return isNaN(num) ? 0 : num;
      });
      nextId = Math.max(...ids) + 1;
    }
    const newItem = {
      ...item,
      id: item.id !== undefined ? item.id : nextId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as unknown as T;
    list.push(newItem);
    this.set(key, list);
    return newItem;
  }

  public update<T extends { id: string | number }>(key: string, id: string | number, updates: any): T | null {
    if (!MockDatabase.IS_DEV) {
      console.warn(`mockDB.update skipped in production for key=${key} id=${id}`);
      return null;
    }

    this.assertDevOnly("mockDB.update");
    const list = this.get<T>(key);
    const idx = list.findIndex((x) => String(x.id) === String(id));
    if (idx === -1) return null;
    const updatedItem = {
      ...list[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updatedItem;
    this.set(key, list);
    return updatedItem;
  }

  public delete<T extends { id: string | number }>(key: string, id: string | number): boolean {
    if (!MockDatabase.IS_DEV) {
      console.warn(`mockDB.delete skipped in production for key=${key} id=${id}`);
      return false;
    }

    this.assertDevOnly("mockDB.delete");
    const list = this.get<T>(key);
    const filtered = list.filter((x) => String(x.id) !== String(id));
    if (filtered.length === list.length) return false;
    this.set(key, filtered);
    return true;
  }

  public generateDocNumber(unitCode: string | number, docType: string): string {
    if (!MockDatabase.IS_DEV) {
      console.warn(`mockDB.generateDocNumber skipped in production for docType=${docType}`);
      return `2627-${unitCode}-${docType}-${Date.now()}`;
    }

    this.assertDevOnly("mockDB.generateDocNumber");
    const list = this.get<any>(docType === "ORD" ? "orders" : "invoices");
    const seq = String(list.length + 1).padStart(3, "0");
    return `2627-${unitCode}-${docType}-${seq}`;
  }
}

export const mockDB = new MockDatabase();
export default mockDB;
