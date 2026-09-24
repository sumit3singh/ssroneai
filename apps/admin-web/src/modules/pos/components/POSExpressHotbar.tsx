import React, { useState, useEffect } from "react";
import { Zap, HelpCircle, Keyboard } from "lucide-react";
import { POSMenuItem } from "../types";
import { IndianLiveClock } from "./IndianLiveClock";
import { POSSyncStatusBar } from "./POSSyncStatusBar";
import { POSKeyboardCheatSheetModal } from "./POSKeyboardCheatSheetModal";

import { useExpressHotbar } from "../utils/posHotbarStorage";

interface POSExpressHotbarProps {
  menuItems: POSMenuItem[];
  onAddToCart: (item: POSMenuItem) => void;
}

export const POSExpressHotbar: React.FC<POSExpressHotbarProps> = ({
  menuItems,
  onAddToCart,
}) => {
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const { expressItems } = useExpressHotbar(menuItems);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "?" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsCheatSheetOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (expressItems.length === 0) return null;

  return (
    <div className="bg-card/90 border border-primary/20 rounded-lg p-1.5 shadow-2xs">
      <div className="flex items-center justify-between mb-1.5 px-1 flex-wrap gap-1.5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-primary uppercase tracking-wider">
            <Zap size={13} className="text-amber-500 fill-amber-500 animate-pulse" />
            <span>Top 12 Express Bestseller Hotbar</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground hidden md:inline">
            (<kbd className="px-1 py-0.2 rounded bg-muted border border-border text-[9px]">Shift+F1</kbd> – <kbd className="px-1 py-0.2 rounded bg-muted border border-border text-[9px]">Shift+F12</kbd>)
          </span>
        </div>

        {/* Right Controls: Sync Status Bar + Shortcuts Button + Real Indian Live Clock */}
        <div className="flex items-center gap-2">
          <POSSyncStatusBar />

          <button
            type="button"
            onClick={() => setIsCheatSheetOpen(true)}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] font-mono font-bold border border-border transition-colors cursor-pointer"
            title="Keyboard Shortcuts Cheat Sheet (Press ?)"
          >
            <Keyboard size={11} className="text-primary" />
            <span className="hidden sm:inline">Shortcuts</span>
            <kbd className="px-1 rounded bg-background border border-border text-[9px]">?</kbd>
          </button>

          <IndianLiveClock compact className="hidden sm:inline-flex" />
        </div>
      </div>

      <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
        {expressItems.map((item, idx) => {
          const keyLabel = `⇧F${idx + 1}`;
          const isVeg = item.is_veg;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onAddToCart(item)}
              title={`[Shift+F${idx + 1}] 1-Touch Add: ${item.name}`}
              className="group relative flex flex-col justify-between p-1.5 rounded-md bg-background hover:bg-primary/10 border border-border hover:border-primary/50 transition-all text-left cursor-pointer active:scale-95 shadow-2xs h-[58px] overflow-hidden select-none"
            >
              {/* Top Row: Clean Key Badge */}
              <div className="flex items-center justify-between w-full">
                <span className="px-1.5 py-0.5 rounded bg-primary/15 text-primary text-[9px] font-mono font-black">
                  {keyLabel}
                </span>
                {!isVeg && (
                  <span
                    title="Non-Vegetarian"
                    className="h-2.5 w-2.5 rounded-xs border border-rose-600 bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center p-0.5"
                  >
                    <span className="h-1 w-1 rounded-full bg-rose-600" />
                  </span>
                )}
              </div>

              {/* Title with full width and breathing room */}
              <p className="text-[10px] font-bold text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2 mt-1">
                {item.short_description || item.name}
              </p>
            </button>
          );
        })}
      </div>

      {/* Cashier Keyboard Shortcuts Overlay */}
      <POSKeyboardCheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />
    </div>
  );
};

