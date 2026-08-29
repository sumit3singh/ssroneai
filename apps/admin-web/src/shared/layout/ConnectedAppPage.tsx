import React, { useState } from "react";
import { 
  Globe, Hotel, ChefHat, Smartphone, Settings, Save, Check, ExternalLink, 
  Palette, ShieldCheck, Bell, Wifi, Sliders, Layers, RefreshCw, Eye
} from "lucide-react";
import { Button } from "@ssrone/ui";
import { toast } from "sonner";

interface ConnectedAppPageProps {
  appKey: "food" | "stay" | "kds" | "staff" | "mobile" | "admin";
}

export const ConnectedAppPage: React.FC<ConnectedAppPageProps> = ({ appKey }) => {
  const [isSaved, setIsSaved] = useState(false);

  // App Configurations
  const appConfigMap = {
    food: {
      name: "Customer Food Ordering Web",
      port: 3000,
      url: "http://localhost:3000",
      icon: Globe,
      color: "text-amber-600 bg-amber-500/10 border-amber-500/30",
      description: "Customize your customer-facing digital menu, table QR ordering, and home delivery website."
    },
    stay: {
      name: "Customer Hotel Stay Web",
      port: 3001,
      url: "http://localhost:3001",
      icon: Hotel,
      color: "text-indigo-600 bg-indigo-500/10 border-indigo-500/30",
      description: "Customize your guest self-service portal, online room tariff cards, check-in rules, and room service."
    },
    kds: {
      name: "Kitchen Display System (KDS)",
      port: 8083,
      url: "http://localhost:8083",
      icon: ChefHat,
      color: "text-red-600 bg-red-500/10 border-red-500/30",
      description: "Configure kitchen station order tickets (KOT), prep timers, station routing, and cook alerts."
    },
    staff: {
      name: "Staff & Waiter Captain Portal",
      port: 8084,
      url: "http://localhost:8084",
      icon: Smartphone,
      color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
      description: "Configure waiter captain PINs, mobile table ordering, Bluetooth printer settings, and shift controls."
    },
    mobile: {
      name: "Staff & Waiter Portal",
      port: 8084,
      url: "http://localhost:8084",
      icon: Smartphone,
      color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
      description: "Configure waiter captain PINs, mobile table ordering, Bluetooth printer settings, and shift controls."
    },
    admin: {
      name: "System Settings",
      port: 5173,
      url: "http://localhost:5173/settings",
      icon: Settings,
      color: "text-purple-600 bg-purple-500/10 border-purple-500/30",
      description: "Configure system preferences and API integrations."
    }
  };

  const currentApp = appConfigMap[appKey] || appConfigMap.food;
  const IconComp = currentApp.icon;

  // Form Customization States
  const [accentColor, setAccentColor] = useState("#4F46E5");
  const [portalTitle, setPortalTitle] = useState(`${currentApp.name}`);
  const [allowGuestCheckout, setAllowGuestCheckout] = useState(true);
  const [requireIdProof, setRequireIdProof] = useState(true);
  const [prepSlaMinutes, setPrepSlaMinutes] = useState(15);
  const [audioAlerts, setAudioAlerts] = useState(true);

  const handleSave = () => {
    setIsSaved(true);
    toast.success(`Updated ${currentApp.name} configuration in PostgreSQL!`);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="h-full max-w-5xl mx-auto p-6 space-y-6 select-none overflow-y-auto">
      
      {/* Header Banner */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`p-3.5 rounded-2xl ${currentApp.color} border shrink-0`}>
            <IconComp size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xl text-foreground tracking-tight">{currentApp.name}</h1>
              <span className="text-2xs font-extrabold bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-mono">
                Port {currentApp.port}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{currentApp.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={currentApp.url}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-muted border border-border text-foreground font-bold text-xs hover:bg-muted/80 transition flex items-center gap-2"
          >
            <Eye size={14} />
            <span>Launch Live Portal</span>
            <ExternalLink size={12} className="text-muted-foreground" />
          </a>

          <Button onClick={handleSave} variant="primary" size="sm" className="flex items-center gap-2">
            {isSaved ? <Check size={14} /> : <Save size={14} />}
            <span>{isSaved ? "Saved" : "Save Changes"}</span>
          </Button>
        </div>
      </div>

      {/* Admin Customization Studio Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Section 1: Branding & Appearance */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2 font-mono">
            <Palette size={16} className="text-indigo-500" />
            <span>Branding & Appearance Studio</span>
          </h2>

          <div className="space-y-3 text-xs font-semibold">
            <div>
              <label className="text-muted-foreground">Application Title</label>
              <input
                type="text"
                value={portalTitle}
                onChange={(e) => setPortalTitle(e.target.value)}
                className="w-full mt-1 bg-background border border-border rounded-xl px-3 py-2 text-foreground font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-muted-foreground">Primary Theme Accent Color</label>
              <div className="flex items-center gap-3 mt-1">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="h-9 w-12 bg-transparent cursor-pointer rounded border border-border"
                />
                <span className="font-mono text-foreground font-bold">{accentColor}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Operational Controls */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2 font-mono">
            <Sliders size={16} className="text-emerald-500" />
            <span>Operational Controls & SLA</span>
          </h2>

          <div className="space-y-3 text-xs font-semibold">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
              <div>
                <p className="text-foreground font-bold">Allow Instant Guest Checkout</p>
                <p className="text-[10px] text-muted-foreground">Guests can pay bills directly without staff confirmation.</p>
              </div>
              <input
                type="checkbox"
                checked={allowGuestCheckout}
                onChange={(e) => setAllowGuestCheckout(e.target.checked)}
                className="h-4 w-4 accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border">
              <div>
                <p className="text-foreground font-bold">Require Govt ID Proof Check</p>
                <p className="text-[10px] text-muted-foreground">Enforces Aadhaar / Passport upload before room check-in.</p>
              </div>
              <input
                type="checkbox"
                checked={requireIdProof}
                onChange={(e) => setRequireIdProof(e.target.checked)}
                className="h-4 w-4 accent-primary cursor-pointer"
              />
            </div>

            {appKey === "kds" && (
              <div>
                <div className="flex justify-between text-xs font-bold text-foreground">
                  <span>Kitchen SLA Alarm Threshold</span>
                  <span className="text-amber-500 font-mono">{prepSlaMinutes} minutes</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  value={prepSlaMinutes}
                  onChange={(e) => setPrepSlaMinutes(Number(e.target.value))}
                  className="w-full mt-2 accent-primary cursor-pointer"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
