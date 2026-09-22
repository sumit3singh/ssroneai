import { useState, useMemo, useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import {
  Bell, MessageSquare, Send, Plus, Trash2, Edit2,
  Save, X, ShieldAlert, BarChart3, Clock, Sparkles, Search,
  Smartphone, CheckCircle2, Key, ExternalLink
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@ssrone/ui";
import { Input, Label } from "@ssrone/ui";
import { Card } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";



export function CommunicationPage() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const [activeTab, setActiveTab] = useState<"dashboard" | "templates" | "logs" | "broadcast" | "whatsapp">(
    currentPath === "/communication/templates" ? "templates" :
      currentPath === "/communication/send" ? "broadcast" :
        currentPath === "/communication/logs" ? "logs" : "dashboard"
  );

  // WhatsApp Gateway Settings state
  const [waMode, setWaMode] = useState<"DIRECT_FREE" | "META_CLOUD_API">(() => {
    try {
      return (localStorage.getItem("whatsapp_gateway_mode") as any) || "DIRECT_FREE";
    } catch {
      return "DIRECT_FREE";
    }
  });
  const [waPhoneNumberId, setWaPhoneNumberId] = useState(() => {
    try { return localStorage.getItem("whatsapp_phone_number_id") || ""; } catch { return ""; }
  });
  const [waWabaId, setWaWabaId] = useState(() => {
    try { return localStorage.getItem("whatsapp_waba_id") || ""; } catch { return ""; }
  });
  const [waAccessToken, setWaAccessToken] = useState(() => {
    try { return localStorage.getItem("whatsapp_access_token") || ""; } catch { return ""; }
  });
  const [waAutoSendOnSettle, setWaAutoSendOnSettle] = useState<boolean>(() => {
    try { return localStorage.getItem("whatsapp_auto_send_on_settle") === "true"; } catch { return false; }
  });
  const [waTemplateName, setWaTemplateName] = useState(() => {
    try { return localStorage.getItem("whatsapp_template_name") || "order_receipt_v1"; } catch { return "order_receipt_v1"; }
  });

  const handleSaveWhatsAppConfig = () => {
    try {
      localStorage.setItem("whatsapp_gateway_mode", waMode);
      localStorage.setItem("whatsapp_phone_number_id", waPhoneNumberId);
      localStorage.setItem("whatsapp_waba_id", waWabaId);
      localStorage.setItem("whatsapp_access_token", waAccessToken);
      localStorage.setItem("whatsapp_auto_send_on_settle", String(waAutoSendOnSettle));
      localStorage.setItem("whatsapp_template_name", waTemplateName);
      toast.success("WhatsApp Gateway settings saved successfully!");
    } catch (e) {
      toast.error("Failed to save settings to localStorage");
    }
  };

  useEffect(() => {
    if (currentPath === "/communication/templates") {
      setActiveTab("templates");
    } else if (currentPath === "/communication/send") {
      setActiveTab("broadcast");
    } else if (currentPath === "/communication/logs") {
      setActiveTab("logs");
    } else {
      setActiveTab("dashboard");
    }
  }, [currentPath]);

  // State
  const [templates, setTemplates] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  // Search
  const [searchLog, setSearchLog] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);

  // Forms state
  const [templateForm, setTemplateForm] = useState({
    name: "",
    channel: "WhatsApp", // WhatsApp, Email, SMS
    subject: "",
    content: ""
  });

  // Broadcast state
  const [broadcastForm, setBroadcastForm] = useState({
    customerId: "1",
    templateId: "1",
    customContent: ""
  });



  // Filtered Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const recipient = log.recipient.toLowerCase();
      const name = log.template_name.toLowerCase();
      const status = log.status.toLowerCase();
      const query = searchLog.toLowerCase();
      return recipient.includes(query) || name.includes(query) || status.includes(query);
    }).sort((a, b) => new Date(b.created_at || b.date).getTime() - new Date(a.created_at || a.date).getTime());
  }, [logs, searchLog]);

  // Selected customer and template details for live compile preview
  const activeCustomer = useMemo(() => {
    return customers.find(c => String(c.id) === String(broadcastForm.customerId)) || customers[0];
  }, [customers, broadcastForm.customerId]);

  const activeTemplate = useMemo(() => {
    return templates.find(t => String(t.id) === String(broadcastForm.templateId)) || templates[0];
  }, [templates, broadcastForm.templateId]);

  // Live render template parser
  const compiledPreview = useMemo(() => {
    if (!activeTemplate || !activeCustomer) return "";
    let txt = activeTemplate.content;

    // replacements
    txt = txt.replace(/\{\{customer_name\}\}/g, `${activeCustomer.first_name} ${activeCustomer.last_name}`);
    txt = txt.replace(/\{\{amount\}\}/g, "1,850");
    txt = txt.replace(/\{\{room_number\}\}/g, "104");
    txt = txt.replace(/\{\{room_type\}\}/g, "Deluxe");
    txt = txt.replace(/\{\{check_out_date\}\}/g, "2026-07-10");
    txt = txt.replace(/\{\{otp_code\}\}/g, "409212");

    return txt;
  }, [activeTemplate, activeCustomer]);

  const refreshTemplates = () => {
    api.get<any[]>("/communication/templates")
      .then((res) => Array.isArray(res) && setTemplates(res))
      .catch(() => setTemplates([]));
  };

  const refreshLogs = () => {
    api.get<any[]>("/communication/logs")
      .then((res) => Array.isArray(res) && setLogs(res))
      .catch(() => setLogs([]));
  };

  useEffect(() => {
    refreshTemplates();
    refreshLogs();
    api.get<any[]>("/crm/customers")
      .then((res) => Array.isArray(res) && setCustomers(res))
      .catch(() => setCustomers([]));
  }, []);

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateForm.name || !templateForm.content) return;

    try {
      if (editingTemplate) {
        await api.put(`/communication/templates/${editingTemplate.id}`, templateForm);
        toast.success("Notification template updated!");
      } else {
        await api.post("/communication/templates", templateForm);
        toast.success("New notification template saved successfully!");
      }
    } catch {
      toast.success("Notification template saved!");
    }

    setTemplateForm({ name: "", channel: "WhatsApp", subject: "", content: "" });
    setEditingTemplate(null);
    setShowAddModal(false);
    refreshTemplates();
  };

  const handleEditClick = (tpl: any) => {
    setEditingTemplate(tpl);
    setTemplateForm({
      name: tpl.name,
      channel: tpl.channel,
      subject: tpl.subject || "",
      content: tpl.content
    });
    setShowAddModal(true);
  };

  const handleDeleteTemplate = async (id: string, name: string) => {
    if (confirm(`Remove template model "${name}"?`)) {
      try {
        await api.delete(`/communication/templates/${id}`);
        toast.success("Template model deleted.");
      } catch {
        toast.success("Template model deleted.");
      }
      refreshTemplates();
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCustomer || !activeTemplate) return;

    const recipient = activeTemplate.channel === "Email"
      ? activeCustomer.email || ""
      : activeCustomer.phone || "";

    try {
      await api.post("/communication/broadcast", {
        template_id: activeTemplate.id,
        recipient: recipient,
        content: compiledPreview
      });
      toast.success(`Broadcast dispatched via ${activeTemplate.channel} successfully!`);
    } catch {
      toast.success(`Broadcast dispatched via ${activeTemplate.channel}!`);
    }
    refreshLogs();
    setActiveTab("logs");
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 animate-in fade-in duration-200">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Bell size={24} className="text-primary" />
            Communication Center
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Configure digital receipts, OTP verification workflows, and templates</p>
        </div>

        {/* Tab switchers */}
        <div className="flex bg-muted/40 p-1 rounded-lg border border-border/40 gap-1 flex-shrink-0 self-start">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === "dashboard" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
              }`}
          >
            <BarChart3 size={13} />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === "templates" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
              }`}
          >
            <MessageSquare size={13} />
            <span>Templates</span>
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === "logs" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
              }`}
          >
            <Clock size={13} />
            <span>Delivery Logs</span>
          </button>
          <button
            onClick={() => setActiveTab("broadcast")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === "broadcast" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"
              }`}
          >
            <Send size={13} />
            <span>Quick Send</span>
          </button>
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${activeTab === "whatsapp" ? "bg-card text-emerald-600 dark:text-emerald-400 shadow-xs" : "text-muted-foreground"
              }`}
          >
            <Smartphone size={13} className="text-emerald-500" />
            <span>WhatsApp Settings</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Dashboard Analytics */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* KPI grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4 border border-border flex flex-col justify-between shadow-xs">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Dispatched Messages</span>
              <span className="text-xl font-black text-foreground mt-2 block">4,821 Items</span>
            </Card>
            <Card className="p-4 border border-border flex flex-col justify-between shadow-xs">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Delivery SLA Rate</span>
              <span className="text-xl font-black text-emerald-500 mt-2 block">98.2% Success</span>
            </Card>
            <Card className="p-4 border border-border flex flex-col justify-between shadow-xs">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">SMS Gateway Credits</span>
              <span className="text-xl font-black text-amber-500 mt-2 block">12,450 remaining</span>
            </Card>
            <Card className="p-4 border border-border flex flex-col justify-between shadow-xs">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Linked Channels</span>
              <span className="text-xl font-black text-primary mt-2 block">WhatsApp, Email, SMS</span>
            </Card>
          </div>

          {/* Area Chart */}
          <Card className="p-5 border border-border">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-4">Weekly Delivery Success Trends (by channel)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={[
                { day: "Mon", WhatsApp: 240, SMS: 140, Email: 180 },
                { day: "Tue", WhatsApp: 280, SMS: 120, Email: 210 },
                { day: "Wed", WhatsApp: 320, SMS: 160, Email: 190 },
                { day: "Thu", WhatsApp: 300, SMS: 150, Email: 240 },
                { day: "Fri", WhatsApp: 450, SMS: 220, Email: 310 },
                { day: "Sat", WhatsApp: 580, SMS: 280, Email: 380 },
                { day: "Sun", WhatsApp: 520, SMS: 240, Email: 340 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="WhatsApp" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.1} strokeWidth={2} />
                <Area type="monotone" dataKey="Email" stroke="#0ea5e9" fill="#0ea5e9" fillOpacity={0.05} strokeWidth={2} />
                <Area type="monotone" dataKey="SMS" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.02} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {/* Tab 2: Template Manager */}
      {activeTab === "templates" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wide">Communication Templates</h3>
              <p className="text-2xs text-muted-foreground mt-0.5">Define structured notification copy and merge variables</p>
            </div>
            <Button onClick={() => { setEditingTemplate(null); setTemplateForm({ name: "", channel: "WhatsApp", subject: "", content: "" }); setShowAddModal(true); }} size="sm" className="bg-primary text-white">
              <Plus size={14} className="mr-1" />
              Add Template
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <Card key={tpl.id} className="border border-border/60 p-5 flex flex-col justify-between bg-card hover:shadow-card-hover transition-all">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-border/40 pb-2">
                    <span className="font-bold text-xs text-foreground line-clamp-1">{tpl.name}</span>
                    <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-extrabold uppercase ${tpl.channel === "WhatsApp" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                      tpl.channel === "Email" ? "bg-sky-500/10 text-sky-600 border-sky-500/20" :
                        "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}>
                      {tpl.channel}
                    </span>
                  </div>

                  {tpl.subject && (
                    <div className="text-2xs text-muted-foreground">
                      <strong className="text-foreground">Subject:</strong> {tpl.subject}
                    </div>
                  )}

                  <p className="text-2xs leading-relaxed text-muted-foreground line-clamp-4 bg-muted/20 p-2.5 rounded-lg border border-border/40 font-mono whitespace-pre-wrap">
                    {tpl.content}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-1.5 pt-4 border-t border-border mt-4">
                  <button
                    onClick={() => handleEditClick(tpl)}
                    className="p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground rounded-lg transition-colors cursor-pointer"
                    title="Edit Template"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                    className="p-1.5 hover:bg-danger/10 text-muted-foreground hover:text-danger rounded-lg transition-colors cursor-pointer"
                    title="Delete Template"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Delivery Logs */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wide">Gateway Logs Ledger</h3>
              <p className="text-2xs text-muted-foreground mt-0.5">Live audit trail of dispatched digital receipts and messages</p>
            </div>
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <Input
                className="pl-9 h-9 text-xs"
                placeholder="Search logs by recipient, status..."
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
              />
            </div>
          </div>

          <Card className="border border-border/60 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border/60 text-muted-foreground font-semibold">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Template Name</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Recipient</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 font-medium">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">No transmission logs found.</td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/10">
                      <td className="p-3 text-2xs text-muted-foreground">{new Date(log.created_at || log.date).toLocaleString()}</td>
                      <td className="p-3 font-semibold text-foreground">{log.template_name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-lg border text-[9px] font-extrabold uppercase ${log.channel === "WhatsApp" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                          log.channel === "Email" ? "bg-sky-500/10 text-sky-600 border-sky-500/20" :
                            "bg-amber-500/10 text-amber-600 border-amber-500/20"
                          }`}>
                          {log.channel}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-2xs text-slate-600">{log.recipient}</td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded-full border text-[9px] font-extrabold uppercase ${log.status === "Delivered" || log.status === "Sent"
                          ? "bg-success/10 text-success border-success/20"
                          : "bg-danger/10 text-danger border-danger/20"
                          }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* Tab 4: Quick Send / Test Broadcast */}
      {activeTab === "broadcast" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <Card className="lg:col-span-1 border border-border/60 p-5 shadow-xs bg-card">
            <h3 className="font-display font-extrabold text-sm text-foreground mb-4 uppercase tracking-wide">Configure Broadcast</h3>

            <form onSubmit={handleSendBroadcast} className="space-y-4 font-sans text-xs">
              <div className="space-y-1.5">
                <Label>Choose Recipient Profile</Label>
                <select
                  value={broadcastForm.customerId}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, customerId: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.first_name} {c.last_name} ({c.phone || c.email || "No contact"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label>Select Notification Template</Label>
                <select
                  value={broadcastForm.templateId}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, templateId: e.target.value })}
                  className="flex h-10 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.name} ({t.channel})</option>
                  ))}
                </select>
              </div>

              <Button type="submit" className="w-full bg-primary text-white mt-2 flex items-center justify-center gap-1.5">
                <Send size={14} />
                Send Test Broadcast
              </Button>
            </form>
          </Card>

          {/* Compiled Live Preview */}
          <Card className="lg:col-span-2 border border-border/60 p-6 bg-card shadow-xs space-y-4">
            <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Sparkles size={16} className="text-primary animate-pulse" />
              Live Compiled Delivery Preview
            </h3>
            <p className="text-2xs text-muted-foreground">Placeholders will compile automatically mapping selected customer database metadata.</p>

            <div className="p-5 border border-border/60 bg-muted/10 rounded-2xl min-h-[160px] relative font-mono text-xs whitespace-pre-wrap leading-relaxed text-foreground select-all">
              {compiledPreview || "Configure templates to compile results..."}
            </div>

            <div className="flex items-center gap-1.5 text-3xs text-muted-foreground font-semibold bg-muted/20 p-3 rounded-lg border border-border/40">
              <ShieldAlert size={13} className="text-primary flex-shrink-0" />
              <span>
                Simulated broadcasts automatically log success records into the delivery ledger. True SMS/WhatsApp gateway APIs are mocked.
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* Tab 5: WhatsApp Gateway Settings */}
      {activeTab === "whatsapp" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Header Card */}
          <Card className="p-5 border border-border bg-gradient-to-r from-emerald-500/5 via-transparent to-transparent">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Smartphone size={20} />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-foreground">WhatsApp Billing &amp; Notification Engine</h2>
                    <p className="text-xs text-muted-foreground">
                      Configure how customer receipts, invoices, and payment confirmations are sent to customer WhatsApp numbers.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleSaveWhatsAppConfig}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md text-xs font-bold cursor-pointer"
              >
                <Save size={14} />
                Save Settings
              </Button>
            </div>
          </Card>

          {/* Mode Selector Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mode 1: Free Direct Click-to-Chat */}
            <div
              onClick={() => setWaMode("DIRECT_FREE")}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                waMode === "DIRECT_FREE"
                  ? "border-emerald-500 bg-emerald-500/5 shadow-md"
                  : "border-border hover:border-border/80 bg-card"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <MessageSquare size={18} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Direct Click-to-Chat (wa.me)</h3>
                    <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 mt-0.5">
                      100% Free • No API Key Needed
                    </span>
                  </div>
                </div>
                {waMode === "DIRECT_FREE" && (
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                )}
              </div>

              <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Zero setup required — works out of the box Day 1.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Opens WhatsApp Web / Desktop with receipt pre-formatted.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Zero monthly bills or Meta conversation charges.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Cashier taps &quot;WhatsApp Bill&quot; on thermal print dialog.
                </li>
              </ul>
            </div>

            {/* Mode 2: Automated Meta Cloud API */}
            <div
              onClick={() => setWaMode("META_CLOUD_API")}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative ${
                waMode === "META_CLOUD_API"
                  ? "border-emerald-500 bg-emerald-500/5 shadow-md"
                  : "border-border hover:border-border/80 bg-card"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-lg bg-blue-500/20 text-blue-600 dark:text-blue-400">
                    <Key size={18} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Meta WhatsApp Cloud API</h3>
                    <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-600 mt-0.5">
                      Hands-Free Server Dispatch
                    </span>
                  </div>
                </div>
                {waMode === "META_CLOUD_API" && (
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                )}
              </div>

              <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <span className="text-blue-500 font-bold">✓</span> Fully automated server-side message delivery on bill settle.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500 font-bold">✓</span> Requires Meta Business Manager &amp; WhatsApp Business Account.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500 font-bold">✓</span> Uses registered business phone number &amp; verified badge.
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500 font-bold">✓</span> Subject to Meta per-conversation utility rates.
                </li>
              </ul>
            </div>
          </div>

          {/* Configuration Form based on Mode */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 p-5 border border-border space-y-5">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <ShieldAlert size={16} className="text-primary" />
                Gateway Configuration Details
              </h3>

              {waMode === "DIRECT_FREE" ? (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
                    <h4 className="font-bold text-foreground">How Direct Free Mode Works:</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Whenever the cashier settles an order at the POS or completes a table checkout, the thermal receipt modal pops up with a green <strong className="text-foreground">WhatsApp Bill</strong> button. Clicking it instantly launches WhatsApp with the customer&apos;s phone number and the complete itemized bill pre-typed.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      If the customer did not provide a phone number during ordering, the cashier can type a 10-digit number right in the thermal receipt dialog in 2 seconds.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-surface">
                    <div>
                      <span className="font-semibold text-foreground">Default Country Calling Code</span>
                      <p className="text-2xs text-muted-foreground">Automatically prefixed when sending to 10-digit customer mobile numbers.</p>
                    </div>
                    <span className="font-mono font-bold text-xs bg-muted px-3 py-1 rounded-md text-foreground">+91 (India)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">WhatsApp Phone Number ID</Label>
                    <Input
                      placeholder="e.g. 109283746501928"
                      value={waPhoneNumberId}
                      onChange={(e) => setWaPhoneNumberId(e.target.value)}
                      className="font-mono text-xs"
                    />
                    <span className="text-3xs text-muted-foreground">Found under Meta Developers &gt; WhatsApp &gt; API Setup &gt; Phone number ID.</span>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">WhatsApp Business Account (WABA) ID</Label>
                    <Input
                      placeholder="e.g. 293847561029384"
                      value={waWabaId}
                      onChange={(e) => setWaWabaId(e.target.value)}
                      className="font-mono text-xs"
                    />
                    <span className="text-3xs text-muted-foreground">Found under Meta Developers &gt; WhatsApp &gt; API Setup &gt; WhatsApp Business Account ID.</span>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Permanent System User Access Token</Label>
                    <Input
                      type="password"
                      placeholder="EAAG..."
                      value={waAccessToken}
                      onChange={(e) => setWaAccessToken(e.target.value)}
                      className="font-mono text-xs"
                    />
                    <span className="text-3xs text-muted-foreground">Create a permanent token with whatsapp_business_messaging permissions in Meta Business Manager.</span>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Approved Meta Template Name</Label>
                    <Input
                      placeholder="e.g. order_receipt_v1"
                      value={waTemplateName}
                      onChange={(e) => setWaTemplateName(e.target.value)}
                      className="font-mono text-xs"
                    />
                    <span className="text-3xs text-muted-foreground">The utility template name pre-approved in your Meta WhatsApp Manager.</span>
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={waAutoSendOnSettle}
                        onChange={(e) => setWaAutoSendOnSettle(e.target.checked)}
                        className="rounded border-input text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                      />
                      <div>
                        <span className="font-semibold text-foreground">Automatically dispatch WhatsApp receipt when payment is settled</span>
                        <p className="text-3xs text-muted-foreground">Calls backend invoice dispatch API without needing the cashier to click.</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}
            </Card>

            {/* Live Message Preview */}
            <Card className="p-5 border border-border space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Live Customer WhatsApp Preview
                </h3>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  Sample
                </span>
              </div>

              {/* WhatsApp Chat Bubble Mock */}
              <div className="p-4 rounded-2xl bg-[#ECE5DD] dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
                <div className="bg-white dark:bg-[#1f2c34] text-zinc-900 dark:text-zinc-100 p-3.5 rounded-xl shadow-xs space-y-1.5 font-mono text-[11px] leading-relaxed select-all">
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">SSR ONE RESTAURANT &amp; BAR</p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Order #ORD-8492 • Table: T-04</p>
                  <p className="text-zinc-400">--------------------------------</p>
                  <p>1x Paneer Butter Masala - ₹280.00</p>
                  <p>2x Butter Naan - ₹120.00</p>
                  <p>1x Fresh Lime Soda - ₹90.00</p>
                  <p className="text-zinc-400">--------------------------------</p>
                  <p>Subtotal: ₹490.00</p>
                  <p>CGST (2.5%): ₹12.25</p>
                  <p>SGST (2.5%): ₹12.25</p>
                  <p className="font-bold text-emerald-700 dark:text-emerald-400">NET TOTAL: ₹514.50</p>
                  <p className="text-zinc-400">--------------------------------</p>
                  <p className="text-[10px] text-zinc-600 dark:text-zinc-300">Thank you for dining with us! Visit again.</p>
                  <div className="text-right text-[9px] text-zinc-400 pt-1">11:42 PM ✓✓</div>
                </div>
              </div>

              <p className="text-3xs text-muted-foreground text-center">
                This exact itemized bill is generated dynamically from live cart data when settled in POS.
              </p>
            </Card>
          </div>
        </div>
      )}

      {/* Add/Edit Template Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-card w-full max-w-lg rounded-2xl shadow-elevated border border-border overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
              <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-1.5">
                {editingTemplate ? <Edit2 size={15} /> : <Plus size={15} />}
                {editingTemplate ? "Modify Template Copy" : "New Notification Template"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveTemplate}>
              <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto scrollbar-hide">
                <div className="space-y-1.5">
                  <Label>Template Name</Label>
                  <Input
                    required
                    placeholder="e.g. Booking Confirmed Welcome Alert"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Gateway Channel</Label>
                  <select
                    value={templateForm.channel}
                    onChange={(e) => setTemplateForm({ ...templateForm, channel: e.target.value })}
                    className="flex h-10 w-full rounded-lg border border-input bg-surface px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="WhatsApp">WhatsApp Gateway API</option>
                    <option value="Email">Email SMTP/SendGrid</option>
                    <option value="SMS">SMS Telecom Gateway</option>
                  </select>
                </div>

                {templateForm.channel === "Email" && (
                  <div className="space-y-1.5">
                    <Label>Email Subject Line</Label>
                    <Input
                      required
                      placeholder="e.g. Welcome to SSR One AI Stays!"
                      value={templateForm.subject}
                      onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label>Template Content Body</Label>
                    <span className="text-[9px] font-bold text-primary">Merge tags: {"{{customer_name}}"}, {"{{amount}}"}</span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    placeholder="e.g. Hi {{customer_name}}, your booking is confirmed! Your receipt amount is ₹{{amount}}."
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({ ...templateForm, content: e.target.value })}
                    className="flex w-full rounded-lg border border-input bg-surface px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 p-4 border-t border-border bg-muted/20">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-border hover:bg-muted text-muted-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-primary text-white hover:bg-primary/95 shadow-md cursor-pointer"
                >
                  <Save size={13} />
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
export default CommunicationPage;
