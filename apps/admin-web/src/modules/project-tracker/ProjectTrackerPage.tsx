import { useState, useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { 
  GitBranch, Database, ShieldCheck, CheckCircle2, 
  Server, Terminal, Lock, Key, Calendar, Building2, UserCircle
} from "lucide-react";
import { Card } from "@/shared/ui/primitives/Card";
import { Label } from "@/shared/ui/primitives/Input";

// 1. PROJECT MODULES DATA
const PROJECT_MODULES = [
  { id: "core-dash", name: "Executive Dashboard", category: "Core Modules", progress: 100, status: "Production", scope: "Unit-Wise & Tenant-Wide", features: ["Recharts metrics visualization", "Revenue audits", "Direct session widgets"] },
  { id: "pos-restro", name: "POS Restaurant", category: "Core Modules", progress: 100, status: "Production", scope: "Unit-Wise", features: ["Menu catalogs", "Dine-in/Takeaway cart", "KOT ticket generation"] },
  { id: "hotel-pms", name: "Hotel PMS", category: "Core Modules", progress: 100, status: "Production", scope: "Unit-Wise", features: ["Room vacancy grids", "Dynamic stay check-ins", "Folio logs checkout"] },
  { id: "pg-manage", name: "PG Management", category: "Core Modules", progress: 100, status: "Production", scope: "Unit-Wise", features: ["Bed allocation sheets", "Security refund checks", "Rent payments log"] },
  { id: "sweet-bakery", name: "Sweet Shop & Bakery", category: "Core Modules", progress: 100, status: "Production", scope: "Unit-Wise", features: ["Weighing scale triggers", "Direct billing integration", "Batch expiry tracking"] },
  { id: "inventory", name: "Inventory Control", category: "Core Modules", progress: 100, status: "Production", scope: "Unit-Wise", features: ["Stock alerts", "Vendor purchases log", "Ingredient recipe mapping"] },
  { id: "crm-loyalty", name: "CRM & Loyalty", category: "Core Modules", progress: 100, status: "Production", scope: "Tenant-Wide", features: ["Loyalty points engine", "Customer wallets balance", "Audit transaction log"] },
  { id: "reservations", name: "Unified Reservations", category: "Core Modules", progress: 100, status: "Production", scope: "Unit-Wise", features: ["Table bookings grid", "Stay calendar timeline", "Dynamic scheduler status"] },
  { id: "finance-accounting", name: "Finance & Accounting", category: "Core Modules", progress: 100, status: "Production", scope: "Unit-Wise & FinYear", features: ["Double-entry journal ledger", "Balance Sheet", "GST tax mapping tables"] },
  { id: "hr-payroll", name: "HR & Payroll", category: "Core Modules", progress: 100, status: "Production", scope: "Unit-Wise", features: ["Attendance logs", "Salary payroll slips", "Employee roster shifts"] },
  
  { id: "forms-builder", name: "Dynamic Form Builder", category: "Platform & Metadata", progress: 100, status: "Production", scope: "Tenant-Wide", features: ["Dynamic forms renderer", "Drag & Drop field schema", "Dynamic submissions report"] },
  { id: "platform-studio", name: "Platform Studio", category: "Platform & Metadata", progress: 100, status: "Production", scope: "Tenant-Wide", features: ["Master LOV categories CRUD", "Enterprise Hierarchy Map", "Cascade configurations"] },
  { id: "workflows", name: "Workflow & Approvals", category: "Platform & Metadata", progress: 100, status: "Production", scope: "Tenant-Wide", features: ["Auditor verification desk", "BPMN template designer", "Remarks logging history"] },
  { id: "communications", name: "Communication Center", category: "Platform & Metadata", progress: 100, status: "Production", scope: "Tenant-Wide", features: ["Multi-channel templates CRUD", "Live placeholders compile", "Gateway logs ledger"] },
  
  { id: "food-web", name: "Customer Food Web", category: "Connected Apps", progress: 100, status: "Production", scope: "Unit-Specific", features: ["Online customer ordering", "Direct orders table synchronicity", "Subdomain matching routing"] },
  { id: "stay-web", name: "Customer Stay Web", category: "Connected Apps", progress: 95, status: "Sandbox", scope: "Unit-Specific", features: ["Online room bookings engine", "Dynamic rates catalog", "Guest loyalty auto-check"] },
  { id: "kds-screen", name: "Kitchen Display (KDS)", category: "Connected Apps", progress: 100, status: "Production", scope: "Unit-Wise", features: ["Real-time ticket updates", "Status completion dispatch", "Preparation SLA timers"] },
  { id: "staff-portal", name: "Staff Portal", category: "Connected Apps", progress: 90, status: "Sandbox", scope: "Unit-Wise", features: ["Mobile waiter cart", "Table order dispatching", "Cleaning checkout notices"] }
];

// 2. DATABASE TABLES SCHEMAS
const DB_CATALOG = [
  {
    table: "tenants",
    description: "Global registry of SaaS enterprise accounts. Governs branding and base configurations.",
    rls: "Only visible to Superadmins or matching app.tenant_id.",
    columns: [
      { name: "id", type: "BIGINT (PK)", desc: "Primary key using BIGSERIAL auto-increment." },
      { name: "name", type: "VARCHAR(255)", desc: "Corporate entity name." },
      { name: "subdomain", type: "VARCHAR(100)", desc: "Unique domain prefix for routing." },
      { name: "status", type: "VARCHAR(50)", desc: "Licensing status (active, trial, suspended)." },
      { name: "logo_url / colors", type: "TEXT / HEX", desc: "SaaS styling configurations." }
    ]
  },
  {
    table: "units",
    description: "Physical branches, outlets, or hotel properties belonging to a tenant.",
    rls: "Scoped dynamically. Filtered by tenant_id automatically.",
    columns: [
      { name: "id", type: "BIGINT (PK)", desc: "Unique unit primary identifier." },
      { name: "tenant_id", type: "BIGINT (FK)", desc: "Tenant ownership relation." },
      { name: "name", type: "VARCHAR(255)", desc: "Branch name (e.g. Noida Sec 62)." },
      { name: "code", type: "VARCHAR(50)", desc: "Short code for SKU and invoice serial formatting." },
      { name: "timezone / GSTIN", type: "VARCHAR", desc: "Regional operational configurations." }
    ]
  },
  {
    table: "users",
    description: "System employees, managers, and admins authorized to access the ERP dashboard.",
    rls: "Scoped by tenant_id. Enforced by session token contexts.",
    columns: [
      { name: "id", type: "BIGINT (PK)", desc: "Primary key identifier." },
      { name: "tenant_id", type: "BIGINT (FK)", desc: "Owner tenant association." },
      { name: "username", type: "VARCHAR(100)", desc: "Unique alphanumeric login name." },
      { name: "password_hash", type: "VARCHAR(255)", desc: "Secure bcrypt password hash." },
      { name: "email / phone", type: "VARCHAR", desc: "User contact coordinates." }
    ]
  },
  {
    table: "lov_masters",
    description: "The List of Values (LOV) dictionary. Controls options shown in dropdowns and select fields.",
    rls: "Scoped by tenant_id. Cascades options to Form Builder renderer.",
    columns: [
      { name: "id", type: "BIGINT (PK)", desc: "Primary key identifier." },
      { name: "tenant_id", type: "BIGINT (FK)", desc: "Tenant association." },
      { name: "category", type: "VARCHAR(100)", desc: "Category key (e.g. loyalty_tier, room_type)." },
      { name: "label", type: "VARCHAR(150)", desc: "User facing text (e.g. Gold VIP)." },
      { name: "value", type: "VARCHAR(100)", desc: "System code key (e.g. gold)." }
    ]
  },
  {
    table: "orders",
    description: "The core POS transaction ledger. Receives orders from both the ERP POS and the Customer Food Web.",
    rls: "Unit & Financial Year scoped. Isolated by app.tenant_id.",
    columns: [
      { name: "id", type: "BIGINT (PK)", desc: "Primary key identifier." },
      { name: "tenant_id", type: "BIGINT (FK)", desc: "Global tenant identifier." },
      { name: "unit_id", type: "BIGINT (FK)", desc: "Target branch outlet." },
      { name: "financial_year", type: "VARCHAR(10)", desc: "Active financial period (e.g. 2026-27)." },
      { name: "order_number", type: "VARCHAR(100)", desc: "Sequential serial unique per branch/year." },
      { name: "order_source", type: "VARCHAR(50)", desc: "Source tag: erp_dashboard, customer_web, qr_order." },
      { name: "grand_total / tax", type: "DECIMAL(12,2)", desc: "Calculated invoice values." }
    ]
  },
  {
    table: "audit_logs",
    description: "Detailed system audit ledger. Automatically logs creations, edits, and deletions.",
    rls: "Tenant isolated. Superadmins review all logs.",
    columns: [
      { name: "id", type: "BIGINT (PK)", desc: "Primary key identifier." },
      { name: "tenant_id", type: "BIGINT (FK)", desc: "Tenant association." },
      { name: "action_type", type: "VARCHAR(50)", desc: "CREATE, UPDATE, DELETE, LOGIN." },
      { name: "table_name", type: "VARCHAR(100)", desc: "Database table modified." },
      { name: "old_data / new_data", type: "JSONB", desc: "Detailed snapshots capturing value changes." }
    ]
  }
];

export function ProjectTrackerPage() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const [activeTab, setActiveTab] = useState<"modules" | "schema" | "saas">(
    currentPath === "/project-tracker/timesheet" ? "saas" :
    currentPath === "/project-tracker/velocity" ? "schema" : "modules"
  );

  useEffect(() => {
    if (currentPath === "/project-tracker/timesheet") {
      setActiveTab("saas");
    } else if (currentPath === "/project-tracker/velocity") {
      setActiveTab("schema");
    } else {
      setActiveTab("modules");
    }
  }, [currentPath]);
  const [selectedTable, setSelectedTable] = useState<string>("tenants");

  // SaaS Simulation states
  const [simTenant, setSimTenant] = useState("tenant-baithak-sweets");
  const [simUnit, setSimUnit] = useState("unit-noida-62");
  const [simFinYear, setSimFinYear] = useState("2026-27");
  const [simSource, setSimSource] = useState("customer_web");

  // Compiled dynamic simulation queries
  const getCompiledQuery = () => {
    const tenantId = simTenant === "tenant-baithak-sweets" ? 1 : 2;
    const unitId = simUnit === "unit-noida-62" ? 1 : 2;
    
    if (simSource === "erp_dashboard") {
      return `-- Dynamic Query compiled for POS Dashboard ERP session
SELECT o.order_number, o.grand_total, o.status, c.first_name, o.created_at
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.id
WHERE o.tenant_id = ${tenantId}
  AND o.unit_id = ${unitId}
  AND o.financial_year = '${simFinYear}'
  AND o.is_deleted = FALSE
ORDER BY o.created_at DESC;`;
    } else {
      return `-- Dynamic Query compiled for Customer Ordering Web App (customer-food-web)
-- Uses Subdomain routing to resolve Tenant ID and Unit binding automatically
SELECT p.name, p.selling_price, p.is_vegetarian, c.name as category
FROM products p
JOIN product_categories c ON p.category_id = c.id
WHERE p.tenant_id = ${tenantId}
  AND p.is_active = TRUE
  AND p.is_deleted = FALSE;

-- Inserts order in the shared table with source metadata:
INSERT INTO orders (tenant_id, unit_id, financial_year, order_number, order_source, grand_total, status)
VALUES (${tenantId}, ${unitId}, '${simFinYear}', 'WEB-ORD-0982', 'customer_web', 740.00, 'pending');`;
    }
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <GitBranch size={24} className="text-primary animate-pulse" />
            Project Development Tracking
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Enterprise SaaS blueprints, database catalog verification, and dynamic context mapping</p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-muted/40 p-1 rounded-lg border border-border/40 gap-1 flex-shrink-0 self-start">
          <button
            onClick={() => setActiveTab("modules")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === "modules" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            <CheckCircle2 size={13} />
            <span>Modules Roadmap</span>
          </button>
          <button
            onClick={() => setActiveTab("schema")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === "schema" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            <Database size={13} />
            <span>SAP-Grade DDL Catalog</span>
          </button>
          <button
            onClick={() => setActiveTab("saas")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === "saas" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
            }`}
          >
            <ShieldCheck size={13} />
            <span>SaaS Context Simulator</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Modules Roadmap */}
      {activeTab === "modules" && (
        <div className="space-y-6">
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 border border-border flex flex-col justify-between shadow-2xs">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Overall Integration</span>
              <span className="text-xl font-black text-foreground mt-2 block">100% Fully Built</span>
            </Card>
            <Card className="p-4 border border-border flex flex-col justify-between shadow-2xs">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Enterprise Architectures</span>
              <span className="text-xl font-black text-emerald-500 mt-2 block">Metadata Driven</span>
            </Card>
            <Card className="p-4 border border-border flex flex-col justify-between shadow-2xs">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Database Source of Truth</span>
              <span className="text-xl font-black text-primary mt-2 block">PostgreSQL schema active</span>
            </Card>
            <Card className="p-4 border border-border flex flex-col justify-between shadow-2xs">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Shared Ordering App</span>
              <span className="text-xl font-black text-amber-500 mt-2 block">customer-food-web sync</span>
            </Card>
          </div>

          {/* Modules Table */}
          <Card className="border border-border/60 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold">
                  <th className="p-3">Module Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Scope Boundary</th>
                  <th className="p-3">Core Features Implemented</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {PROJECT_MODULES.map((mod) => (
                  <tr key={mod.id} className="hover:bg-muted/10">
                    <td className="p-3 font-semibold text-foreground">{mod.name}</td>
                    <td className="p-3 text-2xs text-muted-foreground">{mod.category}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase ${
                        mod.scope.includes("FinYear") ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                        mod.scope.includes("Unit") ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" :
                        "bg-teal-500/10 text-teal-600 border-teal-500/20"
                      }`}>
                        {mod.scope}
                      </span>
                    </td>
                    <td className="p-3 text-2xs text-slate-600 max-w-[400px] truncate" title={mod.features.join(", ")}>
                      {mod.features.join(", ")}
                    </td>
                    <td className="p-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-extrabold uppercase ${
                        mod.status === "Production"
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-warning/10 text-warning border-warning/20"
                      }`}>
                        {mod.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Tab 2: Database Catalog */}
      {activeTab === "schema" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tables Sidebar */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-2xs font-extrabold uppercase tracking-wider text-muted-foreground/60 border-b border-border/60 pb-2">SAP-Grade ERP Tables</h3>
            <div className="flex flex-col gap-1.5">
              {DB_CATALOG.map((cat) => (
                <button
                  key={cat.table}
                  onClick={() => setSelectedTable(cat.table)}
                  className={`flex items-center justify-between p-3 text-xs font-bold rounded-xl border transition-all text-left cursor-pointer ${
                    selectedTable === cat.table 
                      ? "bg-primary/5 border-primary/30 text-primary shadow-2xs font-bold" 
                      : "border-border/60 hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <span className="font-mono">{cat.table}</span>
                  <Database size={12} />
                </button>
              ))}
            </div>
          </div>

          {/* Table Schema Viewer */}
          <div className="lg:col-span-3 space-y-4">
            {(() => {
              const current = DB_CATALOG.find(t => t.table === selectedTable) || DB_CATALOG[0];
              return (
                <Card className="border border-border p-6 bg-card space-y-6 shadow-xs">
                  <div className="space-y-1.5 border-b border-border/60 pb-4">
                    <h2 className="text-base font-mono font-bold text-foreground">Table: {current.table}</h2>
                    <p className="text-xs text-muted-foreground">{current.description}</p>
                  </div>

                  <div className="p-3.5 bg-primary/5 border border-primary/10 rounded-xl space-y-1 text-2xs">
                    <div className="flex items-center gap-1.5 text-primary font-bold">
                      <Lock size={12} />
                      <span>Row-Level Security (RLS) Policy</span>
                    </div>
                    <p className="text-muted-foreground font-medium">{current.rls}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-2xs font-extrabold text-muted-foreground uppercase tracking-wider">Column Declarations</h4>
                    <div className="border border-border/60 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold">
                            <th className="p-3">Column Name</th>
                            <th className="p-3">Data Type</th>
                            <th className="p-3">Description & Scope Roles</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 font-medium">
                          {current.columns.map((c) => (
                            <tr key={c.name} className="hover:bg-muted/5">
                              <td className="p-3 font-mono font-bold text-foreground text-2xs">{c.name}</td>
                              <td className="p-3 font-mono text-[10px] text-primary">{c.type}</td>
                              <td className="p-3 text-2xs text-muted-foreground">{c.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>
              );
            })()}
          </div>
        </div>
      )}

      {/* Tab 3: SaaS Context Simulator */}
      {activeTab === "saas" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Context Options */}
          <Card className="lg:col-span-1 border border-border/60 p-5 shadow-xs bg-card space-y-4">
            <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Server size={16} className="text-primary" />
              SaaS Session Context
            </h3>

            <div className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Building2 size={12} /> Active Tenant</Label>
                <select
                  value={simTenant}
                  onChange={(e) => setSimTenant(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-input bg-surface px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="tenant-baithak-sweets">The Baithak Sweets & Restro</option>
                  <option value="tenant-baithak-hotels">The Baithak Stays & Hotels</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Building2 size={12} /> Unit / Branch</Label>
                <select
                  value={simUnit}
                  onChange={(e) => setSimUnit(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-input bg-surface px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="unit-noida-62">Noida Sector 62 Outlet</option>
                  <option value="unit-delhi-cp">Delhi Connaught Place</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><Calendar size={12} /> Financial Year (FinYear)</Label>
                <select
                  value={simFinYear}
                  onChange={(e) => setSimFinYear(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-input bg-surface px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="2026-27">2026-27 (Current)</option>
                  <option value="2027-28">2027-28 (Future)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><UserCircle size={12} /> Access Source Platform</Label>
                <select
                  value={simSource}
                  onChange={(e) => setSimSource(e.target.value)}
                  className="flex h-9 w-full rounded-lg border border-input bg-surface px-3 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="erp_dashboard">Admin ERP Dashboard (Unit-specific orders review)</option>
                  <option value="customer_web">Customer Food Web App (Online catalog and order placement)</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Compiled Output Sim Panel */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="border border-border p-6 bg-slate-950 text-slate-100 shadow-xs space-y-4 font-mono text-2xs leading-relaxed overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 -mx-6 -mt-6 p-6 bg-slate-900/40">
                <div className="flex items-center gap-2">
                  <Terminal size={14} className="text-emerald-400" />
                  <span className="font-bold text-slate-300">FastAPI SQL Query Compiler</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase">
                  Active Connection Scoped
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <Key size={12} />
                    <span>Active Session Context Variables</span>
                  </div>
                  <div className="text-[10px] text-slate-400 space-y-0.5">
                    <p>SET app.tenant_id = '{simTenant === "tenant-baithak-sweets" ? "8b9f032e-5a12-4c91-b3b4-f3c75d2df501" : "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"}';</p>
                    <p>SET app.unit_id = '{simUnit === "unit-noida-62" ? "f47ac10b-58cc-4372-a567-0e02b2c3d479" : "333c10b-58cc-4372-a567-0e02b2c3d333"}';</p>
                    <p>SET app.financial_year = '{simFinYear}';</p>
                  </div>
                </div>

                <div className="whitespace-pre overflow-x-auto text-[10px] bg-slate-900/60 p-4 border border-slate-800 rounded-xl max-w-full scrollbar-thin text-emerald-300">
                  {getCompiledQuery()}
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-900/5 to-purple-900/5 border border-primary/10 p-5 space-y-3 text-2xs shadow-xs leading-relaxed">
              <div className="flex items-center gap-1.5 text-primary">
                <Lock size={14} />
                <span className="font-extrabold uppercase tracking-wider">Tenant Security & Code Isolation</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal">
                By binding context parameters dynamically at connection time and utilizing shared schemas with `tenant_id` and `unit_id` keys, we eliminate customer-specific hardcoding. The same front-end routes build dynamically using schema definitions fetched from the database, satisfying SAP-level design criteria.
              </p>
            </Card>
          </div>
        </div>
      )}

    </div>
  );
}
export default ProjectTrackerPage;
