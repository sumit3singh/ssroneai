import React, { useState, useEffect } from "react";
import { Settings, Printer, Percent, ShieldCheck, FileText, CheckCircle2, Save } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { toast } from "sonner";

export const POSSettingsPage: React.FC = () => {
  const [storeName, setStoreName] = useState("");
  const [gstin, setGstin] = useState("");
  const [defaultTaxPercent, setDefaultTaxPercent] = useState(5);
  const [printerIp, setPrinterIp] = useState("192.168.1.100");
  const [autoPrintKOT, setAutoPrintKOT] = useState(true);
  const [autoOpenDrawer, setAutoOpenDrawer] = useState(true);
  const [receiptFooter, setReceiptFooter] = useState("Thank you for your business! Please visit again.");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ssr_pos_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.storeName) setStoreName(parsed.storeName);
        if (parsed.gstin) setGstin(parsed.gstin);
        if (parsed.defaultTaxPercent !== undefined) setDefaultTaxPercent(parsed.defaultTaxPercent);
        if (parsed.printerIp) setPrinterIp(parsed.printerIp);
        if (parsed.autoPrintKOT !== undefined) setAutoPrintKOT(parsed.autoPrintKOT);
        if (parsed.autoOpenDrawer !== undefined) setAutoOpenDrawer(parsed.autoOpenDrawer);
        if (parsed.receiptFooter) setReceiptFooter(parsed.receiptFooter);
      }
    } catch (e) {
      console.error("Failed to load settings from storage", e);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const settingsData = {
        storeName,
        gstin,
        defaultTaxPercent,
        printerIp,
        autoPrintKOT,
        autoOpenDrawer,
        receiptFooter
      };
      localStorage.setItem("ssr_pos_settings", JSON.stringify(settingsData));
      toast.success("POS System Settings & Thermal Printer Configuration Saved!");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
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
          Configure outlet branding, tax rules, thermal printer IP addresses, and receipt footer templates
        </p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branding & Receipt Setup */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4">
          <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
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
              <label className="text-2xs uppercase font-bold text-muted-foreground">GSTIN / Tax Registration Number</label>
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
                step="0.1"
                value={defaultTaxPercent}
                onChange={(e) => setDefaultTaxPercent(parseFloat(e.target.value) || 0)}
                className="h-10 text-xs font-mono font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-2xs uppercase font-bold text-muted-foreground">Receipt Footer Custom Message</label>
              <textarea
                value={receiptFooter}
                onChange={(e) => setReceiptFooter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-medium focus:outline-none focus:border-primary resize-none h-20"
              />
            </div>
          </div>
        </div>

        {/* Printer & Hardware Setup */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-card space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-2 border-b border-border pb-3">
              <Printer size={16} className="text-primary" />
              Thermal Kitchen KOT & Cash Drawer Setup
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-2xs uppercase font-bold text-muted-foreground">Main Billing Thermal Printer IP</label>
                <Input
                  value={printerIp}
                  onChange={(e) => setPrinterIp(e.target.value)}
                  placeholder="192.168.1.100"
                  className="h-10 text-xs font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-muted/30 border border-border rounded-xl space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-foreground">Auto-Print KOT on Kitchen Dispatch</span>
                  <input
                    type="checkbox"
                    checked={autoPrintKOT}
                    onChange={(e) => setAutoPrintKOT(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-foreground">Auto-Pop Cash Drawer on Cash Settlement</span>
                  <input
                    type="checkbox"
                    checked={autoOpenDrawer}
                    onChange={(e) => setAutoOpenDrawer(e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-4 w-4"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end">
            <Button type="submit" disabled={isSaving} className="bg-primary text-white font-bold text-xs uppercase px-6 gap-1.5 shadow-md shadow-primary/20">
              <Save size={15} /> Save POS Settings
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
