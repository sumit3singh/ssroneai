import React, { useState, useEffect } from "react";
import { Zap, Star, Keyboard, ChevronDown, ChevronUp, X, Settings2 } from "lucide-react";
import { POSMenuItem } from "../types";
import { IndianLiveClock } from "./IndianLiveClock";
import { POSSyncStatusBar } from "./POSSyncStatusBar";
import { POSKeyboardCheatSheetModal } from "./POSKeyboardCheatSheetModal";
import { usePOSQuickBar, POSBarMode } from "../utils/posHotbarStorage";
import { POSFavoritesConfigModal } from "../pages/master/favorites/POSFavoritesConfigModal";

interface POSExpressHotbarProps {
  menuItems: POSMenuItem[];
  orders?: any[];
  branchId?: number | string;
  onAddToCart: (item: POSMenuItem) => void;
}

export const POSExpressHotbar: React.FC<POSExpressHotbarProps> = ({
  menuItems,
  orders,
  branchId,
  onAddToCart,
}) => {
  const [isCheatSheetOpen, setIsCheatSheetOpen] = useState(false);
  const [isFavoritesConfigOpen, setIsFavoritesConfigOpen] = useState(false);

  const {
    barMode,
    setBarMode,
    favoriteItems,
    hotbarItems,
    activeItems,
  } = usePOSQuickBar(menuItems, orders, branchId);

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

  const isHidden = barMode === "hidden";

  return (
    <div className="bg-card/95 border border-primary/20 rounded-lg p-1.5 shadow-2xs transition-all">
      {/* Top Header Bar: 3-Way Mode Selector (Favorites | Hotbar | Hide) + Live Clock + Sync Status */}
      <div
        className={`flex items-center justify-between px-1 flex-wrap gap-2 ${!isHidden ? "mb-1.5" : ""
          }`}
      >
        {/* Left Side: 3-Way Toggle Segmented Controller */}
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center p-0.5 rounded-lg bg-muted/80 border border-border/80 shadow-2xs">
            {/* 1. ⭐ Favorites Bar (Default) */}
            <button
              type="button"
              onClick={() => setBarMode("favorites")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all active:scale-95 ${barMode === "favorites"
                ? "bg-amber-500 text-amber-950 shadow-xs font-extrabold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                }`}
              title="Activate Top 12 Favorites Bar (Shift+F1 – Shift+F12)"
            >
              <Star
                size={13}
                className={barMode === "favorites" ? "text-amber-950 fill-amber-950" : "text-amber-500"}
              />
              <span>Favorites Bar</span>
              {barMode === "favorites" && favoriteItems.length > 0 && (
                <span className="text-[9px] px-1 rounded-full bg-amber-900/20 text-amber-950 font-mono">
                  {favoriteItems.length}
                </span>
              )}
            </button>

            {/* 2. ⚡ Top 12 Hotbar */}
            <button
              type="button"
              onClick={() => setBarMode("hotbar")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all active:scale-95 ${barMode === "hotbar"
                ? "bg-primary text-primary-foreground shadow-xs font-extrabold"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                }`}
              title="Activate Top 12 Bestsellers Hotbar (Shift+F1 – Shift+F12)"
            >
              <Zap
                size={13}
                className={
                  barMode === "hotbar"
                    ? "text-primary-foreground fill-primary-foreground"
                    : "text-amber-500"
                }
              />
              <span>Hotbar</span>
              {barMode === "hotbar" && hotbarItems.length > 0 && (
                <span className="text-[9px] px-1 rounded-full bg-primary-foreground/20 text-primary-foreground font-mono">
                  {hotbarItems.length}
                </span>
              )}
            </button>

            {/* 3. ✕ Hide Bar */}
            <button
              type="button"
              onClick={() => setBarMode("hidden")}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-all active:scale-95 ${barMode === "hidden"
                ? "bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                }`}
              title="Hide top bar for maximum dish catalog area"
            >
              <X size={12} />
              <span>Hide Bar</span>
            </button>
          </div>

          {/* Quick Setup Link for Favorites when active */}
          {barMode === "favorites" && (
            <button
              type="button"
              onClick={() => setIsFavoritesConfigOpen(true)}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-muted hover:bg-amber-500/15 text-muted-foreground hover:text-amber-700 dark:hover:text-amber-300 text-[10px] font-semibold border border-border transition-colors cursor-pointer"
              title="Configure Favorite Menu Dishes"
            >
              <Settings2 size={11} className="text-amber-500" />
              <span className="hidden sm:inline">Configure</span>
            </button>
          )}



        </div>

        {/* Right Side: Sync Status + Shortcuts Cheat Sheet + Real Indian Clock */}
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

          {/* Real Live Indian Clock */}
          <IndianLiveClock compact className="hidden sm:inline-flex" />


        </div>
      </div>

      {/* Expanded Grid: Rendered only when NOT hidden */}
      {!isHidden && (
        <div className="pt-1.5 border-t border-border/40 animate-in fade-in slide-in-from-top-1 duration-150">
          {barMode === "favorites" ? (
            // Favorites Mode
            favoriteItems.length === 0 ? (
              <div className="flex items-center justify-between p-2.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs">
                <div className="flex items-center gap-2">
                  <Star size={15} className="text-amber-500 fill-amber-500 shrink-0" />
                  <span>No favorite dishes selected yet. Pick your top 12 favorite items for instant speed billing!</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFavoritesConfigOpen(true)}
                  className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold text-xs cursor-pointer transition-all shadow-xs shrink-0"
                >
                  ⭐ Configure Top 12 Favorites
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
                {favoriteItems.map((item, idx) => {
                  const keyLabel = `⇧F${idx + 1}`;
                  const isVeg = item.is_veg;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onAddToCart(item)}
                      title={`[Shift+F${idx + 1}] 1-Touch Favorite: ${item.name}`}
                      className="group relative flex flex-col justify-between p-1.5 rounded-md bg-background hover:bg-amber-500/10 border border-border hover:border-amber-500/60 transition-all text-left cursor-pointer active:scale-95 shadow-2xs h-[58px] overflow-hidden select-none"
                    >
                      {/* Top Row: Clean Key Badge + Veg/Non-Veg */}
                      <div className="flex items-center justify-between w-full">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[9px] font-mono font-black border border-amber-500/30">
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

                      {/* Title */}
                      <p className="text-[10px] font-medium text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight line-clamp-2 mt-0.5">
                        {item.name}
                      </p>
                    </button>
                  );
                })}
              </div>
            )
          ) : (
            // Hotbar Mode (Top 12 Bestsellers)
            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
              {hotbarItems.map((item, idx) => {
                const keyLabel = `⇧F${idx + 1}`;
                const isVeg = item.is_veg;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onAddToCart(item)}
                    title={`[Shift+F${idx + 1}] 1-Touch Hotbar: ${item.name}`}
                    className="group relative flex flex-col justify-between p-1.5 rounded-md bg-background hover:bg-primary/10 border border-border hover:border-primary/50 transition-all text-left cursor-pointer active:scale-95 shadow-2xs h-[58px] overflow-hidden select-none"
                  >
                    {/* Top Row: Key Badge */}
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

                    {/* Title */}
                    <p className="text-[10px] font-medium text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2 mt-0.5">
                      {item.name}
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Cashier Keyboard Shortcuts Cheat Sheet Overlay */}
      <POSKeyboardCheatSheetModal
        isOpen={isCheatSheetOpen}
        onClose={() => setIsCheatSheetOpen(false)}
      />

      {/* Favorites Bar 2-Column Configuration Modal */}
      <POSFavoritesConfigModal
        isOpen={isFavoritesConfigOpen}
        onClose={() => setIsFavoritesConfigOpen(false)}
        menuItems={menuItems}
        orders={orders}
        branchId={branchId}
      />
    </div>
  );
};
