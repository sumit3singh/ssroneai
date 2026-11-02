import React, { useState, useEffect, useRef } from "react";
import {
  Utensils,
  ShoppingBag,
  Bike,
  Globe,
  Search,
  Keyboard,
  Settings,
  User,
  Crown,
  Maximize2,
  Minimize2,
  Lock,
  X
} from "lucide-react";
import { sound } from "@/utils/audioFeedback";
import { useStaffPOS } from "@/stores/useStaffPOSStore";

interface PosTerminalHeaderProps {
  authName?: string;
  branchName?: string;
  openKotsCount?: number;
  onOpenSettings?: () => void;
  onBackToFloor?: () => void;
  onLockTerminal?: () => void;
}

export const PosTerminalHeader: React.FC<PosTerminalHeaderProps> = ({
  authName,
  branchName,
  openKotsCount = 0,
  onOpenSettings,
  onBackToFloor,
  onLockTerminal,
}) => {
  const store = useStaffPOS();
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleFullscreen = () => {
    sound.tap();
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        }
        setIsFullscreen(false);
      }
    } catch (_) {}
  };

  return (
    <header className="h-14 bg-[#141b27] border-b border-slate-800 px-3 sm:px-4 flex items-center justify-between gap-3 text-white shrink-0 z-40 select-none shadow-md">
      {/* 1. BRAND LOGO (Matching Reference Screenshot) */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={() => {
            sound.tap();
            if (onBackToFloor) onBackToFloor();
            else store.setActiveTab("floor");
          }}
          className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition text-left group"
          title="Click to view Table Floor"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 shadow-xs">
            <Crown size={18} />
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight leading-none text-white">
              {branchName || "The Baithak"}
            </h1>
            <span className="text-[9px] font-mono tracking-widest uppercase text-slate-400 font-bold block mt-0.5">
              RESTAURANT &amp; CAFÉ
            </span>
          </div>
        </button>
      </div>

      {/* 2. ORDER CHANNELS (Exact Theme Matching Reference Screenshot) */}
      <div className="hidden md:flex items-center gap-1.5">
        {/* Dine In (Active Amber) */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setOrderType("dine_in");
          }}
          className={`min-h-[34px] px-3.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            store.orderType === "dine_in"
              ? "bg-[#f59e0b] text-slate-950 font-black shadow-xs"
              : "bg-[#20293a] text-slate-200 hover:bg-[#2b374d]"
          }`}
        >
          <Utensils size={13} />
          <span>Dine In</span>
        </button>

        {/* Take Away */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setOrderType("takeaway");
            store.setSelectedTable("Takeaway");
          }}
          className={`min-h-[34px] px-3.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            store.orderType === "takeaway"
              ? "bg-[#f59e0b] text-slate-950 font-black shadow-xs"
              : "bg-[#20293a] text-slate-200 hover:bg-[#2b374d]"
          }`}
        >
          <ShoppingBag size={13} />
          <span>Take Away</span>
        </button>

        {/* Delivery */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setOrderType("delivery");
            store.setSelectedTable("Delivery");
          }}
          className={`min-h-[34px] px-3.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            store.orderType === "delivery"
              ? "bg-[#f59e0b] text-slate-950 font-black shadow-xs"
              : "bg-[#20293a] text-slate-200 hover:bg-[#2b374d]"
          }`}
        >
          <Bike size={13} />
          <span>Delivery</span>
        </button>

        {/* Online Orders */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setActiveTab("kots");
          }}
          className="min-h-[34px] px-3.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 bg-[#20293a] text-slate-200 hover:bg-[#2b374d]"
        >
          <Globe size={13} />
          <span>Online Orders</span>
        </button>
      </div>

      {/* 3. CENTER SEARCH BAR (Matching Reference Screenshot) */}
      <div className="relative flex-1 max-w-xs lg:max-w-md">
        <div className="relative flex items-center">
          <Search size={14} className="absolute left-3 text-slate-400" />
          <input
            ref={searchInputRef}
            type="text"
            value={store.searchQuery}
            onChange={(e) => store.setSearchQuery(e.target.value)}
            placeholder="Search menu items..."
            className="w-full h-8 pl-8 pr-8 rounded-lg bg-white text-slate-800 text-xs font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
          />
          {store.searchQuery ? (
            <button
              type="button"
              onClick={() => store.setSearchQuery("")}
              className="absolute right-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={13} />
            </button>
          ) : (
            <div className="absolute right-2 text-slate-400 pointer-events-none">
              <Keyboard size={14} />
            </div>
          )}
        </div>
      </div>

      {/* 4. CONTROLS, PROFILE & CLOCK (Matching Reference Screenshot) */}
      <div className="flex items-center gap-2.5 shrink-0">
        {/* Settings Button */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            if (onOpenSettings) onOpenSettings();
            else store.setActiveTab("dashboard");
          }}
          title="Settings / Staff Hub"
          className="w-8 h-8 rounded-lg bg-[#20293a] hover:bg-[#2b374d] text-slate-300 flex items-center justify-center cursor-pointer transition border border-slate-700/60"
        >
          <Settings size={15} />
        </button>

        {/* Cashier Profile */}
        <div className="flex items-center gap-2 pl-1 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-[#20293a] border border-slate-700 text-slate-300 flex items-center justify-center shrink-0">
            <User size={15} />
          </div>
          <div className="hidden sm:block text-left text-xs leading-tight">
            <span className="font-bold text-white block">
              {authName || "Cashier"}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              Main Branch
            </span>
          </div>
        </div>

        {/* Live Date & Time */}
        <div className="hidden lg:block text-right text-xs leading-tight font-mono text-slate-300 pl-2 border-l border-slate-800">
          <span className="text-[10px] text-slate-400 block">{dateStr}</span>
          <span className="font-extrabold text-white block">{timeStr}</span>
        </div>

        {/* Lock Terminal */}
        {onLockTerminal && (
          <button
            type="button"
            onClick={() => {
              sound.tap();
              onLockTerminal();
            }}
            title="Lock Terminal"
            className="w-8 h-8 rounded-lg bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center cursor-pointer transition active:scale-95 shadow-xs ml-0.5"
          >
            <Lock size={13} />
          </button>
        )}
      </div>
    </header>
  );
};
