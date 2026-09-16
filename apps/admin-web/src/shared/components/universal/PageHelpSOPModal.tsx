import React, { useState } from "react";
import { HelpCircle, X, BookOpen, GitFork, Database, CheckCircle2, ChevronRight, Sparkles, Terminal, Code, Cpu } from "lucide-react";

interface PageHelpSOPModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPath: string;
}

interface PageSOPContent {
  title: string;
  module: string;
  sopSteps: { step: number; title: string; description: string }[];
  dataFlowSteps: { stage: string; action: string; tech: string }[];
  dbTables: { name: string; description: string; keys: string }[];
  keyboardShortcuts?: { key: string; action: string }[];
}

const SOP_KNOWLEDGE_BASE: Record<string, PageSOPContent> = {
  "/pos/transaction/billing": {
    title: "POS Counter Billing & Order Serialization",
    module: "Point of Sale (POS)",
    sopSteps: [
      { step: 1, title: "Order Mode & Table Selection", description: "Select order mode (Dine-In, Takeaway, Delivery). For Dine-In, pick an active dining table or waiter." },
      { step: 2, title: "Menu Item Customization", description: "Click category tabs or search items. Click item tiles directly to add to cart or open size variants & extra addons modal." },
      { step: 3, title: "Cart Quantity & Item Discounting", description: "Adjust item quantities directly with [+] [-] or type bulk quantity. Apply overall bill discount or GST toggle." },
      { step: 4, title: "Hold Bill or Send KOT to Kitchen", description: "Press [F1] to hold current cart in memory. Press [F2] to send Kitchen Order Ticket (KOT) to KDS stations." },
      { step: 5, title: "Settle Payment & Thermal Printing", description: "Press [F3] to settle bill via Cash, UPI, Card, or CRM Credit. Calculate change due and print invoice." }
    ],
    dataFlowSteps: [
      { stage: "Frontend Cart State", action: "Zustand & React State manage POSCartItem[] with variant_name and addons array", tech: "React 19, TypeScript" },
      { stage: "Order Number Generation", action: "GET /api/v1/orders/next-number fetches atomic DDMMYY001 preview from PostgreSQL sequence", tech: "FastAPI, PostgreSQL" },
      { stage: "Backend Order Service", action: "POST /api/v1/orders calculates subtotal, tax, discount, creates Order & OrderItems", tech: "SQLAlchemy AsyncSession" },
      { stage: "KDS Event Bus Dispatch", action: "Emits order.created event to EventBus, routing items to designated KitchenStation queues", tech: "Async Event Bus" },
      { stage: "Thermal Printing & Audit", action: "Generates ESC/POS thermal text preview and records transaction in platform audit logs", tech: "Thermal Receipt Engine" }
    ],
    dbTables: [
      { name: "orders", description: "Master order lifecycle record storing grand totals, payment status, and order mode", keys: "id (PK), tenant_id (FK), order_number (UQ)" },
      { name: "order_items", description: "Line items storing product_id, quantity, variant_name, selected_addons (JSONB)", keys: "id (PK), order_id (FK), menu_item_id" },
      { name: "daily_order_sequences", description: "Daily atomic counter resetting to 001 every midnight per tenant & branch", keys: "tenant_id, branch_id, sequence_date" },
      { name: "kots", description: "Kitchen Order Tickets dispatched to specific kitchen preparation stations", keys: "id (PK), order_id (FK), station_id" }
    ],
    keyboardShortcuts: [
      { key: "F1", action: "Hold Current Bill" },
      { key: "F2", action: "Send Order & Print KOT to KDS" },
      { key: "F3", action: "Pay & Complete Settlement" },
      { key: "F11", action: "Toggle POS Fullscreen Workspace" },
      { key: "1, 2, 3", action: "Select Variant Size in Customization Modal" }
    ]
  },
  "/pos/transaction/tables": {
    title: "Dining Table Floor Plan & Seat Management",
    module: "Tables Operations",
    sopSteps: [
      { step: 1, title: "Floor Plan Monitoring", description: "View live floor sections (Main Hall, AC Section, Terrace). Table colors reflect status (Free, Occupied, Reserved)." },
      { step: 2, title: "Table Order Initiation", description: "Click any free table to immediately open POS Billing cart pre-assigned to that table." },
      { step: 3, title: "Table Transfer & Merging", description: "Click 'Table Operations' modal to move active orders between tables or merge multiple tables into one bill." },
      { step: 4, title: "Waiter Reassignment", description: "Reassign running table servers when shifts change without losing active order items." }
    ],
    dataFlowSteps: [
      { stage: "Table Grid Fetch", action: "GET /api/v1/pos/tables fetches tables with current_order_id and active seat capacity", tech: "TanStack Query" },
      { stage: "Status Synchronization", action: "Table status switches automatically from 'free' to 'occupied' upon KOT dispatch", tech: "FastAPI WebSockets" },
      { stage: "Table Transfer Execution", action: "POST /api/v1/pos/tables/transfer updates table_id on Order and frees source table", tech: "SQLAlchemy Transaction" }
    ],
    dbTables: [
      { name: "dining_tables", description: "Physical dining table master with floor, section, capacity, and current order link", keys: "id (PK), table_number, branch_id" },
      { name: "orders", description: "Active running order assigned to table_id", keys: "id (PK), table_id (FK)" }
    ]
  },
  "/pos/transaction/orders": {
    title: "Live Order Tracker & Transaction History",
    module: "Order Management",
    sopSteps: [
      { step: 1, title: "Order List Filtering", description: "Filter running orders by status (All, KOT Sent, In Kitchen, Ready, Settled) or search by Order # or Customer." },
      { step: 2, title: "Bill Recall & Modification", description: "Click 'Edit Order' on un-settled orders to recall items back into the billing cart for item additions or voids." },
      { step: 3, title: "Reprint Thermal Receipts", description: "Click 'Print Bill' on any past transaction to regenerate thermal tax invoices." }
    ],
    dataFlowSteps: [
      { stage: "Order List Retrieval", action: "GET /api/v1/orders fetches orders eagerly loading order_items, variants, and addons JSONB", tech: "selectinload(Order.items)" },
      { stage: "Order Recall to Cart", action: "Converts order.items array to POSCartItem[] format in localStorage", tech: "React State" }
    ],
    dbTables: [
      { name: "orders", description: "Historical and active order records", keys: "id (PK), order_number, status" },
      { name: "order_items", description: "Line items with variants, addons, and void status", keys: "id (PK), order_id (FK)" }
    ]
  },
  "/pos/transaction/kds": {
    title: "Kitchen Display System (KDS) & Expo Station",
    module: "Kitchen Operations",
    sopSteps: [
      { step: 1, title: "Station Queue Monitoring", description: "Monitor incoming KOT tickets routed to designated kitchen stations (Main Prep, Tandoor, Beverages)." },
      { step: 2, title: "Prep Status Transitions", description: "Click 'Start Prep' when chef begins cooking. Click 'Mark Ready' when dish is complete." },
      { step: 3, title: "Bump Ticket & Audio Alerts", description: "Bumping a ticket marks all items as served and alerts waiters on the floor." }
    ],
    dataFlowSteps: [
      { stage: "KDS Live Stream", action: "GET /api/v1/orders/kds/live streams active kitchen orders grouped by station", tech: "FastAPI REST / EventBus" },
      { stage: "Item Status Update", action: "PATCH /api/v1/orders/kds/items/{id}/status updates kds_status in database", tech: "PostgreSQL Row Lock" }
    ],
    dbTables: [
      { name: "kots", description: "Kitchen Order Ticket master", keys: "id (PK), order_id (FK), station_id" },
      { name: "kds_order_tickets", description: "Station specific preparation checklist items", keys: "id (PK), kot_id (FK)" }
    ]
  },
  "/master/menu": {
    title: "Category Master & Menu Item Catalog",
    module: "Master Data",
    sopSteps: [
      { step: 1, title: "Category Structure", description: "Create top-level categories (e.g. Starters, Main Course, Drinks) with sort order and tax rules." },
      { step: 2, title: "Product & Price Master", description: "Add items with base selling price, tax rate (GST 5%), food type (Veg/Non-Veg), and kitchen routing station." },
      { step: 3, title: "Variants & Addon Groups", description: "Attach size portion variants (Half/Full) and size-linked addon groups (Extra Cheese, Dips)." }
    ],
    dataFlowSteps: [
      { stage: "Menu Master Fetch", action: "GET /api/v1/menu-items loads menu items with category, variant_groups, and addon_groups", tech: "PostgreSQL JSONB" },
      { stage: "Master Single Source of Truth", action: "Changes sync immediately across POS Counter, Online Portals, and QR Menus", tech: "Cache Invalidation" }
    ],
    dbTables: [
      { name: "categories", description: "Menu category master hierarchy", keys: "id (PK), name, tenant_id" },
      { name: "menu_items", description: "Master product catalog storing base_price, variant_groups (JSONB), addon_groups (JSONB)", keys: "id (PK), category_id (FK)" }
    ]
  }
};

const DEFAULT_FALLBACK_SOP: PageSOPContent = {
  title: "Platform Workspace & Core Module SOP",
  module: "SSR One AI Platform",
  sopSteps: [
    { step: 1, title: "Module Navigation", description: "Use the left sidebar or top command palette [Ctrl+K] to navigate between POS, Master Data, Reports, and Settings." },
    { step: 2, title: "Multi-Tenant & Branch Context", description: "Check active tenant and branch selector in the top navbar before executing operational transactions." },
    { step: 3, title: "Audit Trail & Compliance", description: "All create, update, and delete actions are recorded in immutable platform audit logs with tenant boundaries." }
  ],
  dataFlowSteps: [
    { stage: "Client App Shell", action: "React 19 Single Page App renders module components inside multi-tenant wrapper", tech: "TanStack Router" },
    { stage: "API Gateway & Auth", action: "Requests carry JWT Bearer Token evaluated against tenant_id Row-Level Security (RLS)", tech: "FastAPI, PostgreSQL RLS" },
    { stage: "Data Persistence", action: "State changes persist in PostgreSQL with BigInteger primary keys and audit mixins", tech: "AsyncSQLAlchemy" }
  ],
  dbTables: [
    { name: "tenants", description: "Platform multi-tenant organization boundaries", keys: "id (PK), domain, status" },
    { name: "users", description: "Staff user profiles with role-based access control (RBAC)", keys: "id (PK), tenant_id (FK), email" }
  ]
};

export const PageHelpSOPModal: React.FC<PageHelpSOPModalProps> = ({
  isOpen,
  onClose,
  currentPath
}) => {
  const [activeTab, setActiveTab] = useState<"sop" | "dataflow" | "tables">("sop");

  if (!isOpen) return null;

  // Resolve matching SOP content or fallback
  const matchedKey = Object.keys(SOP_KNOWLEDGE_BASE).find((path) => currentPath.startsWith(path));
  const content = matchedKey ? SOP_KNOWLEDGE_BASE[matchedKey] : DEFAULT_FALLBACK_SOP;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl p-6 space-y-5 shadow-2xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400">
              <HelpCircle size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                  {content.module}
                </span>
                <span className="text-[10px] font-mono text-slate-400">Path: {currentPath}</span>
              </div>
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white mt-0.5">
                {content.title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-2xl shrink-0">
          <button
            onClick={() => setActiveTab("sop")}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "sop"
                ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <BookOpen size={15} />
            <span>Operational SOP</span>
          </button>
          <button
            onClick={() => setActiveTab("dataflow")}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "dataflow"
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <GitFork size={15} />
            <span>System Data Flow</span>
          </button>
          <button
            onClick={() => setActiveTab("tables")}
            className={`py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === "tables"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Database size={15} />
            <span>DB Schemas & Tables</span>
          </button>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin">
          {activeTab === "sop" && (
            <div className="space-y-4">
              <div className="bg-sky-500/10 border border-sky-500/20 p-3.5 rounded-2xl text-xs text-sky-900 dark:text-sky-300 font-medium">
                💡 <strong>Standard Operating Procedure (SOP)</strong>: Follow these verified steps for error-free transactions and daily store operations.
              </div>

              <div className="space-y-3">
                {content.sopSteps.map((step) => (
                  <div
                    key={step.step}
                    className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-start gap-3.5"
                  >
                    <span className="w-7 h-7 rounded-xl bg-sky-600 text-white font-mono font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                      {step.step}
                    </span>
                    <div className="space-y-0.5">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        {step.title}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {content.keyboardShortcuts && content.keyboardShortcuts.length > 0 && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                  <h4 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                    ⚡ Keyboard Shortcuts Reference
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {content.keyboardShortcuts.map((sc, i) => (
                      <div key={i} className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <kbd className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 font-mono font-black text-2xs text-slate-900 dark:text-white border shadow-2xs">
                          {sc.key}
                        </kbd>
                        <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate">{sc.action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "dataflow" && (
            <div className="space-y-4">
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-3.5 rounded-2xl text-xs text-indigo-900 dark:text-indigo-300 font-medium">
                ⚡ <strong>Technical System Lifecycle & Data Flow</strong>: End-to-end trace from UI user interactions down to backend services, PostgreSQL database persistence, and external events.
              </div>

              <div className="relative border-l-2 border-indigo-500/30 ml-4 space-y-4 py-1">
                {content.dataFlowSteps.map((df, i) => (
                  <div key={i} className="relative pl-6 space-y-1 group">
                    <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-indigo-600 border-4 border-white dark:border-slate-900 group-hover:scale-110 transition-transform" />
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                        {df.stage}
                      </span>
                      <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-600 border border-indigo-500/20">
                        {df.tech}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {df.action}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "tables" && (
            <div className="space-y-4">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl text-xs text-emerald-900 dark:text-emerald-300 font-medium">
                🗄️ <strong>Database Schemas & Multi-Tenant Boundaries</strong>: Primary PostgreSQL database tables and relationships utilized by this module.
              </div>

              <div className="space-y-3">
                {content.dbTables.map((tbl, i) => (
                  <div key={i} className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                        <Database size={15} />
                        {tbl.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                        Keys: {tbl.keys}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {tbl.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex items-center justify-between shrink-0">
          <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
            <Sparkles size={11} className="text-sky-500" />
            SSR One AI Platform Enterprise V2.0 Documentation Engine
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black hover:opacity-90 transition-opacity cursor-pointer"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
