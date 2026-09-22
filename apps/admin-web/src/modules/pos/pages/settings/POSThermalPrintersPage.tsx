import React, { useState, useEffect } from "react";
import {
  Printer,
  Receipt,
  ChefHat,
  Save,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Laptop,
  Wifi,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button, Input, PageHeader, PageContainer } from "@ssrone/ui";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { api } from "@ssrone/api-client";
import { usePOSPrinterStore } from "../../store/printer.store";
import { POSPrintPortal, CustomerReceiptPayload, StationKOTSlip } from "../../components/POSPrintPortal";
import { safePrintWithFullscreenRestore } from "../../utils/printUtils";

export const POSThermalPrintersPage: React.FC = () => {
  const { settings, updateSettings, resetDefaults } = usePOSPrinterStore();
  const navigate = useNavigate();

  // Local form state cloned from store
  const [formState, setFormState] = useState(settings);
  const [kitchenStations, setKitchenStations] = useState<any[]>([]);
  const [isLoadingStations, setIsLoadingStations] = useState(false);

  // Test Print Portal state
  const [testPrintType, setTestPrintType] = useState<"KOT" | "RECEIPT" | null>(null);
  const [testKOTSlips, setTestKOTSlips] = useState<StationKOTSlip[]>([]);
  const [testReceiptData, setTestReceiptData] = useState<CustomerReceiptPayload | null>(null);

  useEffect(() => {
    setFormState(settings);
  }, [settings]);

  useEffect(() => {
    setIsLoadingStations(true);
    api
      .get<any[]>("/restaurant/kitchen-stations")
      .then((res) => {
        if (Array.isArray(res)) {
          setKitchenStations(res);
        }
      })
      .catch((err) => {
        console.warn("Could not load stations for printer overview:", err);
      })
      .finally(() => {
        setIsLoadingStations(false);
      });
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formState);
    toast.success("Thermal Printer & Receipt Configuration Saved!");
  };

  // Test Print: Customer Receipt
  const handleTestPrintCustomerReceipt = () => {
    const sampleReceipt: CustomerReceiptPayload = {
      orderNumber: "TEST-1001",
      orderType: "DINE-IN",
      tableName: "C1 (Cabin)",
      waiterName: "Ramesh Sharma",
      customerName: "Rahul Verma",
      customerPhone: "+91 98765 43210",
      items: [
        { name: "Crispy Plain Dosa", quantity: 2, selling_price: 90 },
        { name: "Paneer Tikka Classic", quantity: 1, selling_price: 250, variant_name: "Full Portion" },
        { name: "Masala Chai (Cutting)", quantity: 2, selling_price: 30 },
      ],
      subtotal: 490,
      packagingChargeTotal: 0,
      discountAmount: 20,
      taxAmount: 23.5,
      netAmount: 493.5,
      paymentMethod: "CASH",
      timestamp: new Date().toLocaleString(),
    };

    setTestReceiptData(sampleReceipt);
    setTestPrintType("RECEIPT");

    setTimeout(() => {
      safePrintWithFullscreenRestore();
    }, 100);

    setTimeout(() => {
      setTestPrintType(null);
      setTestReceiptData(null);
    }, 3000);
  };

  // Test Print: Station KOT Slip
  const handleTestPrintKOTSlip = () => {
    const sampleSlips: StationKOTSlip[] = [
      {
        stationName: "Indian Kitchen",
        stationCode: "INDIAN",
        printerName: formState.kotDefaultPrinterName || "RETSOL RPT82",
        orderNumber: "TEST-1001",
        orderType: "DINE-IN",
        tableName: "C1",
        waiterName: "Ramesh Sharma",
        kotType: "NEW",
        timestamp: new Date().toLocaleString(),
        items: [
          { name: "Crispy Plain Dosa", quantity: 2, notes: "Extra crispy, sambar separate" },
          { name: "Masala Chai (Cutting)", quantity: 2 },
        ],
      },
      {
        stationName: "Tandoor & Charcoal",
        stationCode: "TANDOOR",
        printerName: formState.kotDefaultPrinterName || "RETSOL RPT82",
        orderNumber: "TEST-1001",
        orderType: "DINE-IN",
        tableName: "C1",
        waiterName: "Ramesh Sharma",
        kotType: "NEW",
        timestamp: new Date().toLocaleString(),
        items: [
          { name: "Paneer Tikka Classic", quantity: 1, variant_name: "Full Portion", notes: "Medium spicy" },
        ],
      },
    ];

    setTestKOTSlips(sampleSlips);
    setTestPrintType("KOT");

    setTimeout(() => {
      safePrintWithFullscreenRestore();
    }, 100);

    setTimeout(() => {
      setTestPrintType(null);
      setTestKOTSlips([]);
    }, 3000);
  };

  return (
    <PageContainer>
      {/* Printable portal mounted in body */}
      <POSPrintPortal
        printType={testPrintType}
        kotSlips={testKOTSlips}
        receiptData={testReceiptData}
      />

      {/* Page Header */}
      <PageHeader
        title="POS & Thermal Printer Hub"
        description="Configure Cashier Customer Receipts, Multi-Station KOT Thermal Routing, and Hardware Diagnostics"
        icon={<Printer size={18} />}
        badge="Hardware Routing"
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetDefaults}
              className="text-xs cursor-pointer"
            >
              Reset Defaults
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              size="sm"
              className="bg-primary text-white font-bold text-xs gap-1.5 shadow-xs cursor-pointer"
            >
              <Save size={14} /> Save Printer Preferences
            </Button>
          </div>
        }
      />

      {/* Main Settings Grid */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SECTION 1: CUSTOMER RECEIPT / CASHIER PRINTER */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Receipt size={18} />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-sm text-foreground">
                      Customer Receipt Printer
                    </h3>
                    <p className="text-2xs text-muted-foreground">
                      Cashier counter invoice & final bill settlement printer
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTestPrintCustomerReceipt}
                  className="px-2.5 py-1 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Printer size={12} /> Test Print Bill
                </button>
              </div>

              {/* Printer Name & Paper Width */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-2xs uppercase font-bold text-muted-foreground">
                    Cashier Printer Name / Device
                  </label>
                  <Input
                    value={formState.customerPrinterName}
                    onChange={(e) =>
                      setFormState({ ...formState, customerPrinterName: e.target.value })
                    }
                    placeholder="e.g. RETSOL RPT82, POS-80"
                    className="h-9 text-xs font-mono font-bold"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Matches Windows printer driver name
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs uppercase font-bold text-muted-foreground">
                    Paper Roll Width
                  </label>
                  <select
                    value={formState.customerPaperWidth}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        customerPaperWidth: e.target.value as "80mm" | "58mm",
                      })
                    }
                    className="w-full h-9 px-3 rounded-xl border border-border bg-card text-foreground text-xs font-bold focus:outline-none focus:border-primary"
                  >
                    <option value="80mm">80mm Roll (Standard 3-inch POS)</option>
                    <option value="58mm">58mm Roll (Compact 2-inch POS)</option>
                  </select>
                  <span className="text-[10px] text-muted-foreground">
                    Thermal paper roll width in mm
                  </span>
                </div>
              </div>

              {/* Auto-Print & Copies Switches */}
              <div className="p-3.5 bg-muted/30 border border-border rounded-xl space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-foreground">
                      Auto-Print on Settle Bill
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Automatically opens print preview when cashier clicks "Pay & Print" or settles bill
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formState.customerAutoPrintOnSettle}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        customerAutoPrintOnSettle: e.target.checked,
                      })
                    }
                    className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                  />
                </label>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div>
                    <div className="text-xs font-bold text-foreground">Print Copies</div>
                    <div className="text-[10px] text-muted-foreground">
                      1 copy for customer, or 2 copies (Customer + Merchant audit)
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[1, 2].map((copies) => (
                      <button
                        key={copies}
                        type="button"
                        onClick={() =>
                          setFormState({ ...formState, customerPrintCopies: copies })
                        }
                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          formState.customerPrintCopies === copies
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border text-foreground hover:bg-muted"
                        }`}
                      >
                        {copies} {copies === 1 ? "Copy" : "Copies"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metadata Toggles */}
              <div className="space-y-2">
                <label className="text-2xs uppercase font-bold text-muted-foreground">
                  Receipt Fields to Print
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.customerShowGstin}
                      onChange={(e) =>
                        setFormState({ ...formState, customerShowGstin: e.target.checked })
                      }
                      className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <span className="font-semibold text-foreground">GSTIN & Taxes</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.customerShowFssai}
                      onChange={(e) =>
                        setFormState({ ...formState, customerShowFssai: e.target.checked })
                      }
                      className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <span className="font-semibold text-foreground">FSSAI Number</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.customerShowTableWaiter}
                      onChange={(e) =>
                        setFormState({
                          ...formState,
                          customerShowTableWaiter: e.target.checked,
                        })
                      }
                      className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <span className="font-semibold text-foreground">Table & Server</span>
                  </label>

                  <label className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formState.customerShowUpiQr}
                      onChange={(e) =>
                        setFormState({ ...formState, customerShowUpiQr: e.target.checked })
                      }
                      className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <span className="font-semibold text-foreground">UPI Payment QR</span>
                  </label>
                </div>
              </div>

              {/* Receipt Footer Message */}
              <div className="space-y-1">
                <label className="text-2xs uppercase font-bold text-muted-foreground">
                  Custom Receipt Footer Message
                </label>
                <textarea
                  value={formState.customerReceiptFooter}
                  onChange={(e) =>
                    setFormState({ ...formState, customerReceiptFooter: e.target.value })
                  }
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-card text-foreground text-xs font-medium focus:outline-none focus:border-primary resize-none"
                  placeholder="Thank you for dining with us! Please visit again."
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: KITCHEN STATIONS & KOT ROUTING */}
          <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    <ChefHat size={18} />
                  </div>
                  <div>
                    <h3 className="font-display font-extrabold text-sm text-foreground">
                      Kitchen Stations & KOT Routing
                    </h3>
                    <p className="text-2xs text-muted-foreground">
                      Automatic routing of order items to designated kitchen preparation printers
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleTestPrintKOTSlip}
                  className="px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <ChefHat size={12} /> Test Print KOT
                </button>
              </div>

              {/* KOT Auto-Print Switch */}
              <div className="p-3.5 bg-muted/30 border border-border rounded-xl space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <div className="text-xs font-bold text-foreground">
                      Auto-Print KOT on "Send KOT"
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Dispatches kitchen slips to printer immediately when order is sent
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formState.kotAutoPrintOnSend}
                    onChange={(e) =>
                      setFormState({
                        ...formState,
                        kotAutoPrintOnSend: e.target.checked,
                      })
                    }
                    className="rounded text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                  />
                </label>

                {/* Dispatch Mode Selector */}
                <div className="pt-2 border-t border-border space-y-1.5">
                  <label className="text-2xs uppercase font-bold text-muted-foreground">
                    KOT Print Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormState({ ...formState, kotPrintMode: "separate_slips" })
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        formState.kotPrintMode === "separate_slips"
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-card border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="font-bold text-xs">Separate Slips Per Station</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Each station gets its own cut ticket with its specific items (Recommended)
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormState({
                          ...formState,
                          kotPrintMode: "single_consolidated",
                        })
                      }
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        formState.kotPrintMode === "single_consolidated"
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-card border-border text-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="font-bold text-xs">Consolidated Kitchen Ticket</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Single master slip with items grouped under station headers
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Station Printers Summary Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-2xs uppercase font-bold text-muted-foreground">
                    Configured Kitchen Stations ({kitchenStations.length})
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate({ to: "/pos/master/kitchen-stations" })}
                    className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Manage Stations <ArrowRight size={12} />
                  </button>
                </div>

                {isLoadingStations ? (
                  <div className="text-xs text-muted-foreground italic py-3 text-center">
                    Loading kitchen stations...
                  </div>
                ) : kitchenStations.length === 0 ? (
                  <div className="text-xs text-muted-foreground italic py-3 text-center border border-dashed border-border rounded-xl">
                    No kitchen stations found. Click "Manage Stations" to add preparation stations.
                  </div>
                ) : (
                  <div className="border border-border rounded-xl overflow-hidden text-xs">
                    <div className="grid grid-cols-3 bg-muted/50 p-2 font-bold text-muted-foreground text-[10px] uppercase border-b border-border">
                      <span>Station Name</span>
                      <span>Assigned Printer</span>
                      <span>Status</span>
                    </div>
                    <div className="divide-y divide-border max-h-40 overflow-y-auto">
                      {kitchenStations.map((st) => (
                        <div
                          key={st.id || st.code}
                          className="grid grid-cols-3 p-2 items-center hover:bg-muted/20"
                        >
                          <span className="font-bold text-foreground truncate">
                            {st.name}
                          </span>
                          <span className="font-mono text-muted-foreground truncate">
                            {st.printer_name || formState.kotDefaultPrinterName || "RETSOL RPT82"}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold w-max ${
                              st.is_active !== false
                                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                : "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {st.is_active !== false ? "Active" : "Inactive"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: CONNECTION GUIDE & HARDWARE DIAGNOSTICS */}
        <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-3">
          <div className="flex items-center gap-2">
            <HelpCircle size={17} className="text-primary" />
            <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wider">
              Hardware Connection & Diagnostics Guide
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Laptop size={15} className="text-primary" />
                <span>Windows USB Thermal Printers (e.g. RETSOL RPT82)</span>
              </div>
              <p className="text-muted-foreground text-2xs leading-relaxed">
                Plug your thermal printer via USB and install manufacturer drivers. In Windows, ensure the printer name is set (e.g. <strong>RETSOL RPT82</strong>). When Send KOT or Settle is clicked, choose this destination in the print preview.
              </p>
              <div className="text-[10px] text-primary font-mono pt-1">
                Tip: For 100% silent, dialog-free instant printing, launch Chrome with: <code className="bg-muted px-1.5 py-0.5 rounded border border-border">--kiosk-printing</code>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/30 border border-border space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <Wifi size={15} className="text-primary" />
                <span>Network / LAN Thermal Printers (Ethernet / WiFi)</span>
              </div>
              <p className="text-muted-foreground text-2xs leading-relaxed">
                Connect each kitchen station printer to your local restaurant router via Ethernet cable. Assign a static IP (e.g. <strong>192.168.1.101</strong> for Kitchen, <strong>192.168.1.102</strong> for Bar). In Station Master, enter the IP in the printer field.
              </p>
              <div className="text-[10px] text-muted-foreground pt-1">
                Both USB counter printers and remote LAN kitchen printers work simultaneously.
              </div>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={resetDefaults}
            className="text-xs cursor-pointer"
          >
            Reset All to Defaults
          </Button>
          <Button
            type="submit"
            className="bg-primary text-white font-bold text-xs uppercase px-6 gap-1.5 shadow-md shadow-primary/20 cursor-pointer"
          >
            <Save size={15} /> Save Printer Preferences
          </Button>
        </div>
      </form>
    </PageContainer>
  );
};
