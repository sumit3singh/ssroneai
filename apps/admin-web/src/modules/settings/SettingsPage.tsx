import { useState, useEffect, useMemo } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Settings as SettingsIcon, Building2, Palette, Bell, Plug, FileText, ArrowLeft, Save,
  ShieldAlert, Plus, Trash2, Edit2, Check, X, RefreshCw, AlertCircle
} from "lucide-react";
import { Card, CardContent } from "@/shared/ui/primitives/Card";
import { FormRenderer } from "@/shared/ui/components/FormRenderer";
import { Button } from "@/shared/ui/primitives/Button";
import { Input } from "@/shared/ui/primitives/Input";
import { toast } from "sonner";
import { isMockSession } from "@/shared/utils/dev-mode";
import { mockDB } from "@/shared/utils/mock-db";
import { useAuthStore } from "@/app/providers/auth-store";
import { api } from "@/shared/utils/api-client";

const FEATURE_MODULES = [
  { value: "pos", label: "Point of Sale" },
  { value: "restaurant", label: "Restaurant Management" },
  { value: "kds", label: "Kitchen Display System" },
  { value: "hotel_pms", label: "Hotel Property Management" },
  { value: "reservations", label: "Reservations" },
  { value: "pg_management", label: "PG / Hostel Management" },
  { value: "inventory", label: "Inventory Management" },
  { value: "billing", label: "Billing & Invoicing" },
  { value: "finance", label: "Finance & Accounting" },
  { value: "crm", label: "Customer Relationship Management" },
  { value: "loyalty", label: "Loyalty & Rewards" },
  { value: "hr", label: "Human Resources" },
  { value: "payroll", label: "Payroll" },
  { value: "ai_copilot", label: "AI Copilot" },
  { value: "reports", label: "Reports & Analytics" },
  { value: "dashboard", label: "Dashboard Builder" },
  { value: "multi_branch", label: "Multi-Branch Management" },
];

const SETTINGS_SECTIONS = [
  { id: "branches", icon: Building2, label: "Company & Branches", desc: "Manage company details, GST, and branch locations" },
  { id: "branding", icon: Palette, label: "Branding & Theme", desc: "Customize logo, colors, and white-label settings" },
  { id: "notifications", icon: Bell, label: "Notifications", desc: "Configure email, SMS, and WhatsApp alerts" },
  { id: "integrations", icon: Plug, label: "Integrations & APIs", desc: "Connect payment gateways, Swiggy, Swiggy/Zomato, Tally" },
  { id: "forms", icon: FileText, label: "Dynamic Forms Builder", desc: "Configure metadata-driven custom fields and dynamic schemas" },
];

export function SettingsPage() {
  const { user } = useAuthStore();
  const tenantId = user?.tenant_id;
  const isMock = isMockSession();

  const sections = useMemo(() => {
    const list = [...SETTINGS_SECTIONS];
    if (user?.is_superadmin) {
      list.push({
        id: "licensing",
        icon: ShieldAlert,
        label: "Feature Licensing",
        desc: "Configure active tenant feature modules, branch limits, and user limits"
      });
    }
    return list;
  }, [user]);

  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const [activeSection, setActiveSection] = useState<string | null>(
    currentPath === "/settings/outlets" ? "branches" : null
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (currentPath === "/settings/outlets") {
      setActiveSection("branches");
    }
  }, [currentPath]);

  const handleBack = () => {
    setActiveSection(null);
    if (currentPath.startsWith("/settings/")) {
      navigate({ to: "/settings" });
    }
  };

  // Licensing states
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingLicId, setEditingLicId] = useState<number | null>(null);
  const [editMaxUsers, setEditMaxUsers] = useState<number>(10);
  const [editMaxBranches, setEditMaxBranches] = useState<number>(5);

  const [showGrantForm, setShowGrantForm] = useState(false);
  const [newFeatureCode, setNewFeatureCode] = useState("pos");
  const [newMaxUsers, setNewMaxUsers] = useState<number>(10);
  const [newMaxBranches, setNewMaxBranches] = useState<number>(5);
  const [newIsActive, setNewIsActive] = useState(true);

  const fetchLicenses = async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await api.get<any[]>(`/licensing/licenses?tenant_id=${tenantId}`);
      setLicenses(data);
    } catch (err: any) {
      toast.error("Failed to load feature licenses: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection === "licensing") {
      fetchLicenses();
    }
  }, [activeSection, tenantId]);

  const handleToggleActive = async (lic: any) => {
    try {
      const updated = await api.patch<any>(`/licensing/licenses/${lic.id}`, {
        is_active: !lic.is_active
      });
      setLicenses(prev => prev.map(item => item.id === lic.id ? updated : item));
      toast.success(`License for ${lic.feature_code} ${updated.is_active ? 'enabled' : 'disabled'} successfully.`);
    } catch (err: any) {
      toast.error("Failed to update license: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleSaveQuotas = async (lic: any) => {
    try {
      const updated = await api.patch<any>(`/licensing/licenses/${lic.id}`, {
        max_users: editMaxUsers,
        max_branches: editMaxBranches
      });
      setLicenses(prev => prev.map(item => item.id === lic.id ? updated : item));
      setEditingLicId(null);
      toast.success(`Quotas updated for ${lic.feature_code}.`);
    } catch (err: any) {
      toast.error("Failed to update quotas: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleRevokeLicense = async (licId: number, code: string) => {
    if (!confirm(`Are you sure you want to revoke the license for '${code}'? This will disable the feature for all users immediately.`)) return;
    try {
      await api.delete(`/licensing/licenses/${licId}`);
      setLicenses(prev => prev.filter(item => item.id !== licId));
      toast.success(`License for ${code} revoked.`);
    } catch (err: any) {
      toast.error("Failed to revoke license: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleGrantLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await api.post<any>("/licensing/licenses", {
        tenant_id: parseInt(tenantId || "1"),
        feature_code: newFeatureCode,
        is_active: newIsActive,
        max_users: newMaxUsers,
        max_branches: newMaxBranches,
        config: {}
      });
      setLicenses(prev => [...prev, data]);
      setShowGrantForm(false);
      toast.success(`License for '${newFeatureCode}' granted successfully.`);
    } catch (err: any) {
      toast.error("Failed to grant license: " + (err.response?.data?.detail || err.message));
    }
  };

  const handleInvalidateCache = async () => {
    try {
      await api.post(`/licensing/cache/invalidate?tenant_id=${tenantId}`);
      toast.success("License cache invalidated successfully.");
    } catch (err: any) {
      toast.error("Failed to invalidate cache: " + (err.response?.data?.detail || err.message));
    }
  };

  // Branches list dynamically loaded
  const [branches, setBranches] = useState<any[]>(() => {
    if (!isMock) {
      return [];
    }

    let list = mockDB.get<any>("branches") || [];
    if (list.length === 0) {
      list = [
        { id: "b-1", name: "Connaught Place Outlet", code: "CUH02", type: "outlet", email: "cp@baithak.com", phone: "9876543201", address: "Radial 3, Connaught Place, New Delhi", is_active: true },
        { id: "b-2", name: "Gurgaon CyberCity Hub", code: "GGN01", type: "outlet", email: "cyber@baithak.com", phone: "9876543202", address: "DLF CyberCity, Sector 24, Gurgaon", is_active: true }
      ];
      mockDB.set("branches", list);
    }
    return list;
  });

  // New Branch Form States
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchCode, setNewBranchCode] = useState("");
  const [newBranchType, setNewBranchType] = useState("outlet");
  const [newBranchEmail, setNewBranchEmail] = useState("");
  const [newBranchPhone, setNewBranchPhone] = useState("");
  const [newBranchAddress, setNewBranchAddress] = useState("");

  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isMock) {
      toast.error("Branch management is only available in mock sessions.");
      return;
    }
    if (!newBranchName || !newBranchCode) {
      toast.error("Branch Name and Code are required.");
      return;
    }
    const newBranch = {
      id: `b-${Date.now()}`,
      name: newBranchName.trim(),
      code: newBranchCode.toUpperCase().trim(),
      type: newBranchType,
      email: newBranchEmail.trim() || `${newBranchCode.toLowerCase()}@baithak.com`,
      phone: newBranchPhone.trim() || "9876543210",
      address: newBranchAddress.trim(),
      is_active: true
    };
    const updated = [...branches, newBranch];
    if (isMock) {
      mockDB.set("branches", updated);
    }
    setBranches(updated);
    toast.success(`Branch "${newBranchName}" added successfully to database!`);
    setNewBranchName("");
    setNewBranchCode("");
    setNewBranchEmail("");
    setNewBranchPhone("");
    setNewBranchAddress("");
  };

  if (currentPath === "/settings/backup") {
    return (
      <div className="p-6 max-w-xl mx-auto space-y-6 bg-background text-foreground min-h-[calc(100vh-60px)] transition-colors duration-300">
        <h1 className="text-xl font-display font-extrabold text-foreground">Cloud Backups Configuration</h1>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-foreground">Auto Daily Backups</span>
            <span className="bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full text-[9px] uppercase font-black font-semibold">Enabled</span>
          </div>
          <p className="text-xs text-muted-foreground">Local Spanner mock state snapshots are automatically backed up to remote storage at 02:00 AM daily.</p>
          <Button onClick={() => toast.success("Manual backup snapshot triggered successfully!")} className="w-full bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg">Trigger Backup Now</Button>
        </div>
      </div>
    );
  }

  if (currentPath === "/settings/audit") {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6 bg-background text-foreground min-h-[calc(100vh-60px)] transition-colors duration-300">
        <h1 className="text-xl font-display font-extrabold text-foreground">System Audit Log</h1>
        <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border/80 text-[10px] font-black uppercase text-muted-foreground">
                <th className="py-2.5">Date</th>
                <th className="py-2.5">IP Address</th>
                <th className="py-2.5">User Role</th>
                <th className="py-2.5">Event Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-semibold text-muted-foreground">
              {[
                { date: "2026-07-13 14:15", ip: "192.168.1.51", role: "Super Admin", action: "Switch active outlet to DELHOT" },
                { date: "2026-07-13 14:02", ip: "192.168.1.12", role: "Owner", action: "Modify loyalty points rules settings" },
              ].map((l, idx) => (
                <tr key={idx} className="hover:bg-muted/10">
                  <td className="py-3 font-mono text-[10px] text-foreground">{l.date}</td>
                  <td className="py-3 text-foreground">{l.ip}</td>
                  <td className="py-3 text-foreground">{l.role}</td>
                  <td className="py-3 text-right text-foreground">{l.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Mock Form States
  const [branchDetails, setBranchDetails] = useState({
    name: "The Baithak – Sector 62 Noida",
    gstin: "09AAAAA1111A1Z1",
    address: "B-23, Sector 62, Noida, Uttar Pradesh - 201301",
    prefix: "INV-2026",
  });

  const [branding, setBranding] = useState({
    color: "#1A3C34",
    darkMode: false,
    whiteLabel: true,
  });

  const [toggles, setToggles] = useState({
    whatsapp: true,
    sms: false,
    email: true,
    swiggy: true,
    zomato: false,
  });

  const handleSave = (sectionName: string) => {
    toast.success(`${sectionName} configurations saved locally!`);
    setActiveSection(null);
  };

  if (activeSection === "licensing") {
    return (
      <div className="p-6 max-w-[1200px] mx-auto space-y-6 animate-in fade-in slide-in-from-left-3 duration-250 text-foreground">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <button onClick={handleBack} className="flex items-center gap-1.5 text-xs text-primary font-bold mb-2 hover:underline cursor-pointer">
              <ArrowLeft size={14} /> Back to Settings
            </button>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <ShieldAlert size={24} className="text-primary" />
              Feature Licensing
            </h1>
            <p className="text-muted-foreground text-xs mt-1">Configure active tenant modules, branch limits, and user limits.</p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={handleInvalidateCache}
              className="text-xs font-bold px-3 py-2 flex items-center gap-1.5 bg-card hover:bg-muted border border-border text-foreground"
            >
              <RefreshCw size={14} />
              Invalidate Cache
            </Button>
            <Button
              onClick={() => setShowGrantForm(true)}
              className="bg-primary text-white text-xs font-bold px-3 py-2 flex items-center gap-1.5"
            >
              <Plus size={14} />
              Grant License
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground font-semibold text-xs">
            Loading feature licenses...
          </div>
        ) : licenses.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-card space-y-3">
            <AlertCircle size={32} className="mx-auto text-muted-foreground/60" />
            <p className="text-xs font-bold text-foreground">No active licenses found</p>
            <p className="text-3xs text-muted-foreground">Click "Grant License" above to activate a feature module for this tenant.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {licenses.map((lic) => {
              const isEditing = editingLicId === lic.id;
              const moduleLabel = FEATURE_MODULES.find(m => m.value === lic.feature_code)?.label || lic.feature_code;

              return (
                <Card key={lic.id} className="border border-border/80 p-5 space-y-4 hover:shadow-card-hover transition-all bg-card/60 backdrop-blur-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="min-w-0">
                        <h3 className="font-bold text-foreground text-sm truncate">{moduleLabel}</h3>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase leading-none mt-1">{lic.feature_code}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${lic.is_active
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500/90"
                        : "bg-danger/10 text-danger dark:text-danger/90"
                        }`}>
                        {lic.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="space-y-2 border-t border-border/40 pt-3 text-xs font-semibold text-muted-foreground">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground">Max Users</label>
                              <Input
                                type="number"
                                value={editMaxUsers}
                                onChange={(e) => setEditMaxUsers(parseInt(e.target.value) || 0)}
                                className="h-8 text-xs text-foreground"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-muted-foreground">Max Branches</label>
                              <Input
                                type="number"
                                value={editMaxBranches}
                                onChange={(e) => setEditMaxBranches(parseInt(e.target.value) || 0)}
                                className="h-8 text-xs text-foreground"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-center">
                            <span>Max Users:</span>
                            <span className="font-bold text-foreground">{lic.max_users ?? "Unlimited"}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Max Branches:</span>
                            <span className="font-bold text-foreground">{lic.max_branches ?? "Unlimited"}</span>
                          </div>
                          {lic.expires_at && (
                            <div className="flex justify-between items-center">
                              <span>Expires:</span>
                              <span className="font-bold text-foreground">{new Date(lic.expires_at).toLocaleDateString()}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-1.5 pt-4 border-t border-border/40 mt-4">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => setEditingLicId(null)}
                          className="px-2.5 py-1.5 hover:bg-muted border border-border text-muted-foreground rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveQuotas(lic)}
                          className="px-2.5 py-1.5 bg-primary text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 border-none"
                        >
                          <Check size={12} />
                          Save
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleToggleActive(lic)}
                          className="px-2.5 py-1.5 hover:bg-muted border border-border text-foreground rounded-lg text-xs font-bold transition-all cursor-pointer"
                        >
                          {lic.is_active ? "Disable" : "Enable"}
                        </button>
                        <button
                          onClick={() => {
                            setEditingLicId(lic.id);
                            setEditMaxUsers(lic.max_users ?? 10);
                            setEditingLicId(lic.id);
                            setEditMaxBranches(lic.max_branches ?? 5);
                          }}
                          className="p-1.5 hover:bg-muted border border-border text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                          title="Edit Quotas"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleRevokeLicense(lic.id, lic.feature_code)}
                          className="p-1.5 hover:bg-danger/10 border border-border text-muted-foreground hover:text-danger rounded-lg transition-colors cursor-pointer"
                          title="Revoke License"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Grant License Modal */}
        {showGrantForm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-card w-full max-w-md rounded-2xl shadow-elevated border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
                <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-1.5">
                  <ShieldAlert size={16} className="text-primary" />
                  Grant New License
                </h3>
                <button onClick={() => setShowGrantForm(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleGrantLicense}>
                <div className="p-5 space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-bold text-muted-foreground">Select Feature Module</label>
                    <select
                      value={newFeatureCode}
                      onChange={(e) => setNewFeatureCode(e.target.value)}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground font-semibold"
                    >
                      {FEATURE_MODULES.map((f) => (
                        <option key={f.value} value={f.value}>{f.label} ({f.value})</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="font-bold text-muted-foreground">Max Users</label>
                      <Input
                        type="number"
                        required
                        value={newMaxUsers}
                        onChange={(e) => setNewMaxUsers(parseInt(e.target.value) || 0)}
                        placeholder="e.g. 10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-muted-foreground">Max Branches</label>
                      <Input
                        type="number"
                        required
                        value={newMaxBranches}
                        onChange={(e) => setNewMaxBranches(parseInt(e.target.value) || 0)}
                        placeholder="e.g. 5"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted/30 border border-border/40 rounded-xl">
                    <div>
                      <p className="text-xs font-bold text-foreground">Set Active Immediately</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Activate the module immediately for users.</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={newIsActive}
                      onChange={(e) => setNewIsActive(e.target.checked)}
                      className="w-4 h-4 accent-primary"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 p-4 border-t border-border bg-muted/20">
                  <button
                    type="button"
                    onClick={() => setShowGrantForm(false)}
                    className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-muted text-muted-foreground cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-primary text-white hover:bg-primary/95 shadow-md cursor-pointer border-none"
                  >
                    <Plus size={13} />
                    Grant License
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (activeSection === "forms") {
    return (
      <div className="p-6 max-w-[900px] mx-auto space-y-6 animate-in fade-in slide-in-from-left-3 duration-250">
        <div>
          <button
            onClick={() => setActiveSection(null)}
            className="flex items-center gap-1.5 text-sm text-primary font-medium hover:underline mb-4 cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Settings
          </button>

          <h1 className="text-2xl font-display font-bold text-foreground">Dynamic Forms Configurer</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Test the live metadata-driven dynamic form engine. This form renders elements and validates inputs on the fly by reading from database tables.
          </p>
        </div>

        <Card className="border border-border/80 p-6 bg-card/60 backdrop-blur-sm">
          <FormRenderer formKey="customer_registration" />
        </Card>
      </div>
    );
  }

  if (activeSection === "branches") {
    if (!isMock) {
      return (
        <div className="p-6 max-w-4xl mx-auto space-y-6 bg-background text-foreground min-h-[calc(100vh-60px)]">
          <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
            <h2 className="text-xl font-display font-extrabold text-foreground">Branch management is available only in development mock mode.</h2>
            <p className="mt-3 text-sm text-muted-foreground">This feature relies on local mock branch data and is disabled for production sessions.</p>
          </div>
        </div>
      );
    }

    return (
      <div className="p-6 max-w-[800px] mx-auto space-y-6 animate-in fade-in slide-in-from-left-3 duration-250 text-foreground">
        <div>
          <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-primary font-medium mb-4 cursor-pointer">
            <ArrowLeft size={16} /> Back to Settings
          </button>
          <h1 className="text-2xl font-display font-bold text-foreground">Branches & Outlets</h1>
          <p className="text-muted-foreground text-xs mt-1">Manage active outlet locations and register new branches.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active branches list */}
          <Card className="p-5 space-y-4">
            <h2 className="text-xs font-black uppercase text-muted-foreground tracking-wider border-b border-border pb-2">Active Branch List</h2>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {branches.map((b) => (
                <div key={b.id} className="p-3 border border-border rounded-xl bg-background/50 flex flex-col gap-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-foreground">{b.name}</span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[9px] uppercase font-black">{b.code}</span>
                  </div>
                  <p className="text-muted-foreground text-[10px]">Type: <span className="capitalize text-foreground font-semibold">{b.type}</span></p>
                  <p className="text-muted-foreground text-[10px] truncate">{b.address}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Create branch form */}
          <Card className="p-5">
            <h2 className="text-xs font-black uppercase text-muted-foreground tracking-wider border-b border-border pb-2 mb-4">Add New Branch</h2>
            <form onSubmit={handleAddBranch} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Branch Name</label>
                <Input
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="e.g. Noida Sector 62 Cloud Kitchen"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Code</label>
                  <Input
                    value={newBranchCode}
                    onChange={(e) => setNewBranchCode(e.target.value)}
                    placeholder="e.g. NDA01"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-muted-foreground">Branch Type</label>
                  <select
                    value={newBranchType}
                    onChange={(e) => setNewBranchType(e.target.value)}
                    className="w-full h-9 px-3 bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold animate-none"
                  >
                    <option value="outlet">Restaurant Outlet</option>
                    <option value="kitchen">Cloud Kitchen</option>
                    <option value="hotel">Hotel / PMS</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Email</label>
                <Input
                  type="email"
                  value={newBranchEmail}
                  onChange={(e) => setNewBranchEmail(e.target.value)}
                  placeholder="noida@baithak.com"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Phone Number</label>
                <Input
                  value={newBranchPhone}
                  onChange={(e) => setNewBranchPhone(e.target.value)}
                  placeholder="9876543203"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-muted-foreground">Address</label>
                <Input
                  value={newBranchAddress}
                  onChange={(e) => setNewBranchAddress(e.target.value)}
                  placeholder="Street address details"
                />
              </div>
              <button type="submit" className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2 rounded-xl text-xs cursor-pointer shadow-xs mt-4 border-none">
                Add Branch Location
              </button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  if (activeSection === "branding") {
    return (
      <div className="p-6 max-w-[600px] mx-auto space-y-6 animate-in fade-in slide-in-from-left-3 duration-250">
        <div>
          <button onClick={() => setActiveSection(null)} className="flex items-center gap-1.5 text-sm text-primary font-medium mb-4">
            <ArrowLeft size={16} /> Back to Settings
          </button>
          <h1 className="text-2xl font-display font-bold text-foreground">Branding & White Label</h1>
        </div>

        <Card className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Accent Primary Theme Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={branding.color}
                onChange={(e) => setBranding({ ...branding, color: e.target.value })}
                className="w-10 h-10 rounded border border-border cursor-pointer bg-transparent"
              />
              <span className="font-mono text-sm">{branding.color}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/30 border border-border/40 rounded-xl">
            <div>
              <p className="text-xs font-bold text-foreground">Enterprise White Label Settings</p>
              <p className="text-3xs text-muted-foreground">Mask "Powered by The Baithak" logo in invoices & stay pages.</p>
            </div>
            <input
              type="checkbox"
              checked={branding.whiteLabel}
              onChange={(e) => setBranding({ ...branding, whiteLabel: e.target.checked })}
              className="w-4 h-4 accent-primary"
            />
          </div>

          <Button onClick={() => handleSave("Branding")} className="w-full bg-primary text-white">
            <Save size={14} className="mr-1.5" /> Save Branding Preferences
          </Button>
        </Card>
      </div>
    );
  }

  if (activeSection === "notifications" || activeSection === "integrations") {
    const isNotify = activeSection === "notifications";
    return (
      <div className="p-6 max-w-[600px] mx-auto space-y-6 animate-in fade-in slide-in-from-left-3 duration-250">
        <div>
          <button onClick={() => setActiveSection(null)} className="flex items-center gap-1.5 text-sm text-primary font-medium mb-4">
            <ArrowLeft size={16} /> Back to Settings
          </button>
          <h1 className="text-2xl font-display font-bold text-foreground">{isNotify ? "Notification Alerts" : "Third Party APIs"}</h1>
        </div>

        <Card className="p-6 space-y-4">
          {isNotify ? (
            <>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <div>
                  <p className="text-xs font-bold">WhatsApp Billing Alerts</p>
                  <p className="text-3xs text-muted-foreground">Send digital invoice receipts to customer WhatsApp contact.</p>
                </div>
                <input type="checkbox" checked={toggles.whatsapp} onChange={(e) => setToggles({ ...toggles, whatsapp: e.target.checked })} />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <div>
                  <p className="text-xs font-bold">SMS Backup fallbacks</p>
                  <p className="text-3xs text-muted-foreground">Send SMS notifications if WhatsApp channels are busy.</p>
                </div>
                <input type="checkbox" checked={toggles.sms} onChange={(e) => setToggles({ ...toggles, sms: e.target.checked })} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs font-bold">Email Audit Statements</p>
                  <p className="text-3xs text-muted-foreground">Dispatch weekly P&L reports to workspace owner email.</p>
                </div>
                <input type="checkbox" checked={toggles.email} onChange={(e) => setToggles({ ...toggles, email: e.target.checked })} />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between py-2 border-b border-border/50">
                <div>
                  <p className="text-xs font-bold">Swiggy POS Sync</p>
                  <p className="text-3xs text-muted-foreground">Pull menu order items dynamically from Swiggy Merchant API.</p>
                </div>
                <input type="checkbox" checked={toggles.swiggy} onChange={(e) => setToggles({ ...toggles, swiggy: e.target.checked })} />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs font-bold">Zomato POS Sync</p>
                  <p className="text-3xs text-muted-foreground">Pull menu order items dynamically from Zomato Merchant API.</p>
                </div>
                <input type="checkbox" checked={toggles.zomato} onChange={(e) => setToggles({ ...toggles, zomato: e.target.checked })} />
              </div>
            </>
          )}

          <Button onClick={() => handleSave(isNotify ? "Notification" : "Integration")} className="w-full bg-primary text-white">
            <Save size={14} className="mr-1.5" /> Save Configuration
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* Main Settings Menu */}
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
          <SettingsIcon size={24} className="text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Configure your workspace and platform preferences</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => (
          <Card
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className="hover:shadow-card-hover hover:border-primary/40 transition-all cursor-pointer border border-border/60"
          >
            <CardContent className="pt-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <section.icon size={18} className="text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{section.label}</h3>
              <p className="text-2xs text-muted-foreground leading-relaxed">{section.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
export default SettingsPage;
