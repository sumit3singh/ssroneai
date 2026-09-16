/**
 * SSR One AI - POS Keyboard Shortcuts & Peripheral Scanner Reference Modal
 */

import React from "react";
import { Keyboard, X, Search, Command, Zap, Barcode, CheckCircle2, ShieldCheck } from "lucide-react";

interface POSKeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const POSKeyboardShortcutsModal: React.FC<POSKeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Bar */}
        <div className="p-4 border-b border-border bg-muted/40 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <Keyboard size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                <span>POS Keyboard Shortcuts & Hardware Wedge Guide</span>
                <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  0 ms HYPER-SPEED
                </span>
              </h2>
              <p className="text-xs text-muted-foreground">
                Master 100% mouse-free cashier billing and instant item search
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto font-sans text-xs">
          {/* Quick Search Highlight Banner */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-primary text-xs">
              <Search size={14} />
              <span>How to Search, Navigate & Customize Menu Items via Keyboard:</span>
            </div>
            <ul className="space-y-1 text-muted-foreground pl-5 list-disc text-xs">
              <li>
                Press <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono font-bold text-foreground">/</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono font-bold text-foreground">Ctrl + K</kbd> to focus search bar.
              </li>
              <li>
                Type item name/code (e.g. <span className="font-mono text-foreground font-bold">p4</span> or <span className="font-mono text-foreground font-bold">chai</span>) → Use <kbd className="px-1 py-0.2 rounded bg-muted border font-mono font-bold text-foreground">← → ↑ ↓ Arrow Keys</kbd> to move the glowing selection ring → Press <kbd className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono font-bold">Enter ↵</kbd> to select!
              </li>
              <li>
                <strong className="text-foreground">Customizing Size Variants & Extra Addons</strong>: In customization modal:
                <div className="mt-0.5 flex flex-wrap gap-1 font-mono text-[11px]">
                  <span className="px-1.5 py-0.5 rounded bg-muted border font-bold text-foreground">1, 2, 3</span> = Select Portion Size &nbsp;|&nbsp;
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/30">A, B, C</span> = Toggle Extra Addons &nbsp;|&nbsp;
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">Enter ↵</span> = Add to Cart!
                </div>
              </li>
              <li>
                <strong className="text-foreground">USB Barcode Scanner Wedge</strong>: Point hardware scanner at any item barcode—adds directly to cart with audio chime without needing focus!
              </li>
            </ul>
          </div>

          {/* Shortcut Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Action Hotkeys */}
            <div className="bg-background border border-border rounded-lg p-3 space-y-2">
              <h3 className="font-bold text-foreground flex items-center gap-1.5 text-xs pb-1 border-b border-border">
                <Zap size={13} className="text-amber-500" />
                <span>Primary Operational Actions</span>
              </h3>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-sans">Hold Active Bill</span>
                  <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-bold text-foreground">F1</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-sans">Send / Update KOT</span>
                  <kbd className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold">F2</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-sans">Pay & Settle Bill</span>
                  <kbd className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold">F3</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-sans">Focus Discount Input</span>
                  <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-bold text-foreground">F4</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-sans">Toggle Fullscreen Kiosk</span>
                  <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-bold text-foreground">F11</kbd>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-border/60">
                  <span className="text-primary font-sans font-semibold">Express Hotbar 1-Touch Add</span>
                  <kbd className="px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/30 font-bold">Shift + F1..F12</kbd>
                </div>
              </div>
            </div>

            {/* Navigation & Cart Controls Hotkeys */}
            <div className="bg-background border border-border rounded-lg p-3 space-y-2">
              <h3 className="font-bold text-foreground flex items-center gap-1.5 text-xs pb-1 border-b border-border">
                <Command size={13} className="text-indigo-500" />
                <span>Cart Controls & Order Modes</span>
              </h3>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-sans">Switch Dine-In Mode</span>
                  <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-bold text-foreground">Alt + 1</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-sans">Switch Takeaway Mode</span>
                  <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-bold text-foreground">Alt + 2</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-sans">Switch Delivery Mode</span>
                  <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-bold text-foreground">Alt + 3</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-sans">Focus Customer Column</span>
                  <kbd className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold">Alt + C</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-sans">Focus Kitchen Order Remark</span>
                  <kbd className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold">Alt + R</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-sans">Cycle Payment (Cash/UPI/Card)</span>
                  <kbd className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 font-bold">Alt + P</kbd>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground font-sans">Close Modal / Unfocus</span>
                  <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-bold text-foreground">Esc</kbd>
                </div>
              </div>
            </div>

            {/* Cart Items Hotkeys */}
            <div className="bg-background border border-border rounded-lg p-3 space-y-2 md:col-span-2">
              <h3 className="font-bold text-foreground flex items-center gap-1.5 text-xs pb-1 border-b border-border">
                <Barcode size={13} className="text-emerald-500" />
                <span>Cart Item Quantity & Line Item Controls</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                <div className="flex justify-between items-center bg-muted/30 p-1.5 rounded border border-border">
                  <span className="text-muted-foreground font-sans">Increase Qty</span>
                  <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-bold text-foreground">+</kbd>
                </div>
                <div className="flex justify-between items-center bg-muted/30 p-1.5 rounded border border-border">
                  <span className="text-muted-foreground font-sans">Decrease Qty</span>
                  <kbd className="px-2 py-0.5 rounded bg-muted border border-border font-bold text-foreground">-</kbd>
                </div>
                <div className="flex justify-between items-center bg-muted/30 p-1.5 rounded border border-border">
                  <span className="text-muted-foreground font-sans">Remove Cart Item</span>
                  <kbd className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-600 border border-rose-500/30 font-bold">Delete</kbd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border bg-muted/40 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck size={14} />
            <span>Zero-Wait Engine Active: All hotkeys trigger 0ms instant mutations</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-primary text-primary-foreground font-semibold rounded hover:bg-primary/90 transition-colors cursor-pointer"
          >
            Got it (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};
