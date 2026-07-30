import React, { useState } from "react";
import { Settings, Printer, Percent, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { Input } from "@/shared/ui/primitives/Input";

export const POSSettingsPage: React.FC = () => {
  const [storeName, setStoreName] = useState("BAITHAK CAFE & RESTAURANT");
  const [gstin, setGstin] = useState("07AAAAA0000A1Z5");
  const [defaultTaxPercent, setDefaultTaxPercent] = useState(5);
  const [printerIp, setPrinterIp] = useState("192.168.1.100");
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-card">
        <h2 className="font-display font-extrabold text-base text-foreground uppercase tracking-wider flex items-center gap-2">
          <Settings size={18} className="text-primary" />
          POS System Settings & Thermal Printer Configuration
        </h2>
        <p className="text-3xs text-muted-foreground">
          Configure application behavior, tax engine rates, thermal printer IPs, and receipt branding
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branding & Receipt Setup */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
          <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
            <FileText size={16} className="text-primary" />
            Receipt Layout & Business Metadata
          </h3>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-2xs uppercase font-bold text-muted-foreground">Restaurant / Outlet Name *</label>
              <Input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                required
                className="h-10 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-2xs uppercase font-bold text-muted-foreground">GSTIN / Tax Number</label>
              <Input
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                className="h-10 text-xs font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-2xs uppercase font-bold text-muted-foreground">Default GST Rate (%)</label>
              <Input
                type="number"
                value={defaultTaxPercent}
                onChange={(e) => setDefaultTaxPercent(parseFloat(e.target.value) || 0)}
                className="h-10 text-xs font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Printer & Hardware Setup */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
          <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
            <Printer size={16} className="text-primary" />
            Thermal Kitchen KOT & Receipt Printers
          </h3>

          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-2xs uppercase font-bold text-muted-foreground">Main Counter Printer IP</label>
              <Input
                value={printerIp}
                onChange={(e) => setPrinterIp(e.target.value)}
                placeholder="192.168.1.100"
                className="h-10 text-xs font-mono font-bold"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Auto-Print KOT on Order Confirmation</span>
              <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary h-4 w-4" />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground">Auto-Open Cash Drawer on Cash Settlement</span>
              <input type="checkbox" defaultChecked className="rounded text-primary focus:ring-primary h-4 w-4" />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-between">
            {isSaved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={14} /> Settings Saved Successfully!
              </span>
            )}

            <Button type="submit" className="bg-primary text-white font-bold text-xs uppercase px-6 ml-auto">
              Save Settings
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
