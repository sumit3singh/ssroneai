import { useState } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import {
  Settings as SettingsIcon, Palette, Bell, Plug, FileText, ArrowLeft, Save
} from "lucide-react";
import { Card, CardContent } from "@ssrone/ui";
import { FormRenderer } from "@ssrone/ui";
import { Button } from "@ssrone/ui";
import { toast } from "sonner";

const SETTINGS_SECTIONS = [
  { id: "branding", icon: Palette, label: "Branding & Theme Studio", desc: "Customize tenant logo, HSL color palette, and store title" },
  { id: "notifications", icon: Bell, label: "Notifications & Alerts", desc: "Configure email, SMS, and WhatsApp notification templates" },
  { id: "integrations", icon: Plug, label: "Integrations & Payment Gateways", desc: "Connect UPI QR code, Razorpay, food aggregators, Tally" },
  { id: "forms", icon: FileText, label: "Dynamic Forms Builder", desc: "Configure metadata-driven custom fields and dynamic schemas" },
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

  if (activeSection === "forms") {
    return (
      <div className="p-6 max-w-[900px] mx-auto space-y-6 animate-in fade-in slide-in-from-left-3 duration-250">
        <div>
          <button
            onClick={handleBack}
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

  if (activeSection === "branding") {
    return (
      <div className="p-6 max-w-[600px] mx-auto space-y-6 animate-in fade-in slide-in-from-left-3 duration-250">
        <div>
          <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-primary font-medium mb-4">
            <ArrowLeft size={16} /> Back to Settings
          </button>
          <h1 className="text-2xl font-display font-bold text-foreground">Branding & White Label Studio</h1>
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
              <p className="text-3xs text-muted-foreground">Mask "Powered by SSR One AI" logo in invoices & stay pages.</p>
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
          <button onClick={handleBack} className="flex items-center gap-1.5 text-sm text-primary font-medium mb-4">
            <ArrowLeft size={16} /> Back to Settings
          </button>
          <h1 className="text-2xl font-display font-bold text-foreground">{isNotify ? "Notification Alerts" : "Third Party Integration APIs"}</h1>
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
        <p className="text-muted-foreground text-sm mt-1">Configure your tenant workspace preferences</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SETTINGS_SECTIONS.map((section) => (
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
