import React, { useState, useEffect } from "react";
import {
  Store,
  Tablet,
  Volume2,
  VolumeX,
  RefreshCw,
  Lock,
  Clock,
  LayoutGrid,
  Utensils,
  ChefHat,
  Home,
  Maximize,
  Minimize,
  Wallet,
  Users
} from "lucide-react";
import { sound } from "@/utils/audioFeedback";
import { useStaffPOS } from "@/stores/useStaffPOSStore";

interface PosTopBarProps {
  authName?: string;
  branchName?: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onLock: () => void;
  totalTables: number;
  openKotsCount: number;
  onOpenIndent?: () => void;
  onOpenLedger?: () => void;
}

export const PosTopBar: React.FC<PosTopBarProps> = ({
  authName,
  branchName,
  isRefreshing,
  onRefresh,
  onLock,
  totalTables,
  openKotsCount,
  onOpenIndent,
  onOpenLedger,
}) => {
  const store = useStaffPOS();
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
      setDateStr(
        now.toLocaleDateString("en-IN", {
          day: "2-digit",
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
    <header className="h-14 bg-white border-b border-slate-200 px-3 sm:px-5 flex items-center justify-between gap-3 shrink-0 z-40 shadow-xs select-none">
      {/* Left: Thin Brand & Location */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setActiveTab("dashboard");
          }}
          className="flex items-center gap-2 text-left cursor-pointer hover:opacity-85 transition"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black shadow-xs shrink-0">
            <Store size={17} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight">
                {branchName || "Baithak Cafe"}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Staff: <strong className="text-slate-800">{authName || "Aman"}</strong>
            </p>
          </div>
        </button>
      </div>

      {/* Center: Thin Navigation Bar */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
        {/* Home Hub Button */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setActiveTab("dashboard");
          }}
          className={`min-h-[32px] px-3 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            store.activeTab === "dashboard"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Home size={14} />
          <span className="hidden sm:inline">Hub</span>
        </button>

        {/* Table Floor Button (Primary operational view) */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setActiveTab("floor");
          }}
          className={`min-h-[32px] px-3.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            store.activeTab === "floor"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-700 hover:bg-white"
          }`}
        >
          <LayoutGrid size={14} />
          <span>Table Floor</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              store.activeTab === "floor"
                ? "bg-white/25 text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {totalTables}
          </span>
        </button>

        {/* Order Pad Button (Shows active table badge when open) */}
        {store.activeTab === "pos" && (
          <button
            type="button"
            className="min-h-[32px] px-3.5 rounded-lg text-xs font-bold bg-amber-500 text-white shadow-xs flex items-center gap-1.5"
          >
            <Utensils size={14} />
            <span>POS ({store.selectedTable})</span>
            {store.cart.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black bg-white text-amber-900">
                {store.cart.length}
              </span>
            )}
          </button>
        )}

        {/* KOTs Button */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setActiveTab("kots");
          }}
          className={`min-h-[32px] px-3 rounded-lg text-xs font-bold transition cursor-pointer hidden md:flex items-center gap-1.5 ${
            store.activeTab === "kots"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-700 hover:bg-white"
          }`}
        >
          <ChefHat size={14} />
          <span>KOTs</span>
          {openKotsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800">
              {openKotsCount}
            </span>
          )}
        </button>
      </div>

      {/* Right: Live Clock & Quick Controls */}
      <div className="flex items-center gap-1.5">
        {/* Date & Time */}
        <div className="hidden lg:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 font-mono text-xs font-semibold">
          <Clock size={12} className="text-emerald-600" />
          <span>{dateStr}</span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-800 font-bold">{timeStr}</span>
        </div>

        {/* Kiosk Fullscreen Mode */}
        <button
          type="button"
          onClick={handleToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Kiosk Fullscreen (F11)"}
          className="min-h-[34px] px-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer transition active:scale-95"
        >
          {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          <span className="hidden xl:inline">{isFullscreen ? "Exit Kiosk" : "Kiosk"}</span>
        </button>

        {/* Sound Toggle */}
        <button
          type="button"
          onClick={() => store.toggleSound()}
          title={store.isSoundEnabled ? "Sound ON" : "Sound MUTED"}
          className={`min-h-[34px] min-w-[34px] rounded-lg border transition flex items-center justify-center cursor-pointer ${
            store.isSoundEnabled
              ? "bg-amber-50 text-amber-800 border-amber-300"
              : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
          }`}
        >
          {store.isSoundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>

        {/* Refresh Sync */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            onRefresh();
          }}
          disabled={isRefreshing}
          title="Refresh Data"
          className="min-h-[34px] min-w-[34px] rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin text-emerald-600" : ""} />
        </button>

        {/* Switch Staff / Lock */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            onLock();
          }}
          title="Lock / Switch Staff"
          className="min-h-[34px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1 text-xs font-bold cursor-pointer transition active:scale-95 shadow-xs"
        >
          <Lock size={12} />
          <span className="hidden sm:inline">Lock</span>
        </button>
      </div>
    </header>
  );
};
