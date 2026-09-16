import React from "react";
import { Keyboard, X, Zap, LayoutGrid, Search, Hash, Printer } from "lucide-react";
import { Button } from "@ssrone/ui";

interface POSKeyboardCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const POSKeyboardCheatSheetModal: React.FC<POSKeyboardCheatSheetModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      group: "1-Touch Speed Items",
      items: [
        { key: "Shift+F1 to Shift+F12", desc: "Instant 1-touch add for Top 12 Express Bestsellers", icon: <Zap size={14} className="text-amber-500" /> },
      ],
    },
    {
      group: "Smart Numpad & Code Parser",
      items: [
        { key: "1*1.1 + Enter", desc: "Add 1 qty of item code 1.1 (or Category 1, Item 1)", icon: <Hash size={14} className="text-sky-500" /> },
        { key: "5*1 + Enter", desc: "Add 5 qty of item #1", icon: <Hash size={14} className="text-sky-500" /> },
        { key: "1*1.1m + Enter", desc: "Add 1 qty of item 1.1 with Medium size variant", icon: <Hash size={14} className="text-sky-500" /> },
      ],
    },
    {
      group: "Navigation & Floor Management",
      items: [
        { key: "Alt+T", desc: "Open Table Floor Grid & Live Seating layout", icon: <LayoutGrid size={14} className="text-amber-500" /> },
        { key: "Ctrl+K or /", desc: "Focus Item Search / Numpad input bar", icon: <Search size={14} className="text-primary" /> },
        { key: "Arrow Up / Down", desc: "Navigate filtered dishes in grid", icon: <Keyboard size={14} className="text-muted-foreground" /> },
        { key: "Enter ↵", desc: "Select highlighted item into active cart", icon: <Keyboard size={14} className="text-emerald-500" /> },
      ],
    },
    {
      group: "Billing & Settlement",
      items: [
        { key: "F9 or Alt+P", desc: "Trigger Fast Bill Settlement & Print Modal", icon: <Printer size={14} className="text-primary" /> },
        { key: "Esc", desc: "Close any open dialog or return to main POS view", icon: <Keyboard size={14} className="text-muted-foreground" /> },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
      <div className="bg-card border border-border rounded-2xl w-full max-w-md p-5 space-y-4 shadow-modal flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <Keyboard size={18} />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-foreground">Cashier Keyboard Shortcuts</h3>
              <p className="text-[11px] text-muted-foreground">High-speed keyboard commands for 0-mouse operation</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Shortcuts Content */}
        <div className="space-y-3.5 overflow-y-auto pr-1 text-xs">
          {shortcuts.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <h4 className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
                {group.group}
              </h4>
              <div className="space-y-1 bg-muted/40 rounded-xl p-2 border border-border/60">
                {group.items.map((item, iIdx) => (
                  <div key={iIdx} className="flex items-center justify-between gap-2 py-1 border-b border-border/30 last:border-0">
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className="text-foreground text-[11.5px] font-medium">{item.desc}</span>
                    </div>
                    <kbd className="px-2 py-0.5 rounded bg-background border border-border shadow-2xs font-mono font-bold text-[10px] text-foreground shrink-0">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-[10px] text-muted-foreground font-mono">Press ? anytime to open</span>
          <Button size="sm" onClick={onClose} className="text-xs font-bold">
            Got it (Esc)
          </Button>
        </div>
      </div>
    </div>
  );
};
