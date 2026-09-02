import { useState } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Settings as SettingsIcon, Palette, Bell, Plug, FileText, ArrowLeft, Save, Printer, Clock
} from "lucide-react";
import { Card, CardContent, Button, PageHeader, PageContainer } from "@ssrone/ui";
import { FormRenderer } from "@ssrone/ui";
import { toast } from "sonner";

const SETTINGS_SECTIONS = [
  { id: "branding", icon: Palette, label: "Branding & Theme Studio", desc: "Customize tenant logo, HSL color palette, and store title" },
  { id: "notifications", icon: Bell, label: "Notifications & Alerts", desc: "Configure email, SMS, and WhatsApp notification templates" },
  { id: "integrations", icon: Plug, label: "Integrations & Payment Gateways", desc: "Connect UPI QR code, Razorpay, food aggregators, Tally" },
  { id: "forms", icon: FileText, label: "Dynamic Forms Builder", desc: "Configure metadata-driven custom fields and dynamic schemas" },
  { id: "printers", icon: Printer, label: "POS & Thermal Printers", desc: "Configure USB, LAN, & Bluetooth KOT receipt thermal printers" },
];

export function SettingsPage() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const [activeSection, setActiveSection] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleBack = () => {
    setActiveSection(null);
    if (currentPath.startsWith("/settings/")) {
      navigate({ to: "/settings" });
    }
  };

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
    toast.success(`${sectionName} preferences updated successfully!`);
    setActiveSection(null);
  };

  if (activeSection === "printers") {
    return (
      <PageContainer>
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Settings
        </button>

        <PageHeader
          title="POS & Thermal Printers"
          description="Configure USB, LAN & Bluetooth KOT receipt thermal printers"
          icon={<Printer size={18} />}
          badge="Coming Soon"
        />

        <div className="py-16 text-center border border-dashed border-border rounded-md bg-muted/20 space-y-2">
          <Clock size={32} className="mx-auto text-muted-foreground/50" />
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Module Under Development</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Hardware printer driver integrations are currently being enhanced for direct ESC/POS network thermal printing.
          </p>
        </div>
      </PageContainer>
    );
  }

  if (activeSection === "forms") {
    return (
      <PageContainer>
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Settings
        </button>

        <PageHeader
          title="Dynamic Forms Configurer"
          description="Test live metadata-driven dynamic form engine rendering from database schemas"
          icon={<FileText size={18} />}
        />

        <div className="bg-card border border-border rounded-md p-5 space-y-4">
          <FormRenderer formKey="customer_registration" />
        </div>
      </PageContainer>
    );
  }

  if (activeSection === "branding") {
    return (
      <PageContainer>
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Settings
        </button>

        <PageHeader
          title="Branding & White Label Studio"
          description="Customize tenant logo, primary HSL color palette, and store white-label settings"
          icon={<Palette size={18} />}
        />

        <div className="bg-card border border-border rounded-md p-5 space-y-4 max-w-xl">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground">Accent Primary Theme Color</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={branding.color}
                onChange={(e) => setBranding({ ...branding, color: e.target.value })}
                className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
              />
              <span className="font-mono text-xs font-semibold">{branding.color}</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/40 border border-border rounded-md">
            <div>
              <p className="text-xs font-semibold text-foreground">Enterprise White Label Settings</p>
              <p className="text-[11px] text-muted-foreground">Mask default platform logo in receipts & guest stay pages.</p>
            </div>
            <input
              type="checkbox"
              checked={branding.whiteLabel}
              onChange={(e) => setBranding({ ...branding, whiteLabel: e.target.checked })}
              className="w-4 h-4 accent-primary cursor-pointer"
            />
          </div>

          <Button onClick={() => handleSave("Branding")} size="sm" className="w-full text-xs font-semibold">
            <Save size={14} className="mr-1.5" /> Save Branding Preferences
          </Button>
        </div>
      </PageContainer>
    );
  }

  if (activeSection === "notifications" || activeSection === "integrations") {
    const isNotify = activeSection === "notifications";
    return (
      <PageContainer>
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Settings
        </button>

        <PageHeader
          title={isNotify ? "Notification & Alert Rules" : "Third-Party Integration APIs"}
          description={isNotify ? "Configure automated SMS, WhatsApp, and email billing triggers" : "Connect Swiggy, Zomato, Razorpay, and Tally ERP integrations"}
          icon={isNotify ? <Bell size={18} /> : <Plug size={18} />}
        />

        <div className="bg-card border border-border rounded-md p-5 space-y-4 max-w-xl">
          {isNotify ? (
            <>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="text-xs font-semibold text-foreground">WhatsApp Billing Alerts</p>
                  <p className="text-[11px] text-muted-foreground">Send digital invoice receipts to customer WhatsApp contact.</p>
                </div>
                <input type="checkbox" checked={toggles.whatsapp} onChange={(e) => setToggles({ ...toggles, whatsapp: e.target.checked })} className="w-4 h-4 accent-primary cursor-pointer" />
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="text-xs font-semibold text-foreground">SMS Backup Fallbacks</p>
                  <p className="text-[11px] text-muted-foreground">Send SMS notifications if WhatsApp channels are busy.</p>
                </div>
                <input type="checkbox" checked={toggles.sms} onChange={(e) => setToggles({ ...toggles, sms: e.target.checked })} className="w-4 h-4 accent-primary cursor-pointer" />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs font-semibold text-foreground">Email Audit Statements</p>
                  <p className="text-[11px] text-muted-foreground">Dispatch weekly P&L reports to workspace owner email.</p>
                </div>
                <input type="checkbox" checked={toggles.email} onChange={(e) => setToggles({ ...toggles, email: e.target.checked })} className="w-4 h-4 accent-primary cursor-pointer" />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <div>
                  <p className="text-xs font-semibold text-foreground">Swiggy POS Sync</p>
                  <p className="text-[11px] text-muted-foreground">Pull menu order items dynamically from Swiggy Merchant API.</p>
                </div>
                <input type="checkbox" checked={toggles.swiggy} onChange={(e) => setToggles({ ...toggles, swiggy: e.target.checked })} className="w-4 h-4 accent-primary cursor-pointer" />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-xs font-semibold text-foreground">Zomato POS Sync</p>
                  <p className="text-[11px] text-muted-foreground">Pull menu order items dynamically from Zomato Merchant API.</p>
                </div>
                <input type="checkbox" checked={toggles.zomato} onChange={(e) => setToggles({ ...toggles, zomato: e.target.checked })} className="w-4 h-4 accent-primary cursor-pointer" />
              </div>
            </>
          )}

          <Button onClick={() => handleSave(isNotify ? "Notification" : "Integration")} size="sm" className="w-full text-xs font-semibold">
            <Save size={14} className="mr-1.5" /> Save Configuration
          </Button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      {/* Standardized Enterprise Page Header */}
      <PageHeader
        title="Settings"
        description="Configure your tenant workspace preferences"
        icon={<SettingsIcon size={18} />}
        badge="Tenant Preferences"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {SETTINGS_SECTIONS.map((section) => (
          <div
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className="bg-card border border-border rounded-md p-4 hover:border-primary/40 transition-all cursor-pointer shadow-2xs group"
          >
            <div className="w-8 h-8 rounded bg-primary/10 border border-primary/20 flex items-center justify-center mb-2.5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <section.icon size={16} />
            </div>
            <h3 className="font-semibold text-foreground text-xs">{section.label}</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{section.desc}</p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}

export default SettingsPage;
