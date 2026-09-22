/**
 * SSR One AI - POS Thermal Printer & Hardware Routing Store
 * Manages Cashier Customer Receipt and Kitchen Station KOT Thermal Printer settings.
 * Persists locally for 0ms retrieval with full reactive subscription.
 */

import { create } from "zustand";

export interface POSPrinterSettings {
  // Cashier / Customer Receipt Printer
  customerPrinterName: string;
  customerPaperWidth: "80mm" | "58mm";
  customerAutoPrintOnSettle: boolean;
  customerPrintCopies: number;
  customerShowGstin: boolean;
  customerShowFssai: boolean;
  customerShowTableWaiter: boolean;
  customerShowUpiQr: boolean;
  customerReceiptHeader: string;
  customerReceiptFooter: string;

  // Kitchen Station KOT Printer
  kotAutoPrintOnSend: boolean;
  kotPrintMode: "separate_slips" | "single_consolidated";
  kotPaperWidth: "80mm" | "58mm";
  kotDefaultPrinterName: string;
  kotShowAddons: boolean;
  kotShowNotes: boolean;
}

export const DEFAULT_PRINTER_SETTINGS: POSPrinterSettings = {
  // Cashier / Customer Receipt Defaults
  customerPrinterName: "RETSOL RPT82",
  customerPaperWidth: "80mm",
  customerAutoPrintOnSettle: true,
  customerPrintCopies: 1,
  customerShowGstin: true,
  customerShowFssai: true,
  customerShowTableWaiter: true,
  customerShowUpiQr: false,
  customerReceiptHeader: "",
  customerReceiptFooter: "Thank You For Dining With Us! Please Visit Again.",

  // Kitchen Station KOT Defaults
  kotAutoPrintOnSend: true,
  kotPrintMode: "separate_slips",
  kotPaperWidth: "80mm",
  kotDefaultPrinterName: "RETSOL RPT82",
  kotShowAddons: true,
  kotShowNotes: true,
};

const STORAGE_KEY = "ssr_pos_printer_settings";

function loadInitialSettings(): POSPrinterSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PRINTER_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.warn("[PrinterStore] Failed to parse stored printer settings:", err);
  }
  return DEFAULT_PRINTER_SETTINGS;
}

interface POSPrinterState {
  settings: POSPrinterSettings;
  updateSettings: (partial: Partial<POSPrinterSettings>) => void;
  resetDefaults: () => void;
}

export const usePOSPrinterStore = create<POSPrinterState>((set) => ({
  settings: loadInitialSettings(),

  updateSettings: (partial) =>
    set((state) => {
      const updated = { ...state.settings, ...partial };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("[PrinterStore] Failed to write settings to localStorage:", e);
      }
      return { settings: updated };
    }),

  resetDefaults: () =>
    set(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRINTER_SETTINGS));
      } catch (e) {
        console.error("[PrinterStore] Failed to write default settings:", e);
      }
      return { settings: DEFAULT_PRINTER_SETTINGS };
    }),
}));
