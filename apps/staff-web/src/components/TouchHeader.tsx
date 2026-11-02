import React from "react";
import {
  Store,
  Tablet,
  Volume2,
  VolumeX,
  RefreshCw,
  Lock,
  Moon,
  Sun,
  Vibrate,
  Wifi,
  Users,
  ChevronDown
} from "lucide-react";
import { sound } from "@/utils/audioFeedback";
import { useStaffPOS } from "@/stores/useStaffPOSStore";

interface TouchHeaderProps {
  authName?: string;
  branchName?: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onLock: () => void;
  totalTables: number;
  openKotsCount: number;
}

export const TouchHeader: React.FC<TouchHeaderProps> = ({
  authName,
  branchName,
  isRefreshing,
  onRefresh,
  onLock,
  totalTables,
  openKotsCount,
}) => {
  const store = useStaffPOS();

  return (
    <header className="sticky top-0 z-40 px-3 sm:px-6 py-2.5 bg-slate-950/90 dark:bg-slate-950/90 border-b border-white/10 backdrop-blur-md flex items-center justify-between gap-2 transition-colors">
      {/* Left: Brand & Terminal Info */}
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-sky-600/30 shrink-0">
          <Store size={22} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-1.5">
              <span>{branchName || "SSR One Cafe"}</span>
              <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                <Tablet size={11} /> Touch POS
              </span>
            </h1>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            Floor Staff: <span className="text-slate-200 font-bold">{authName || "Captain Waiter"}</span>
          </p>
        </div>
      </div>

      {/* Center: Table & Order Stats Pill */}
      <div className="hidden lg:flex items-center gap-2 bg-slate-900/80 border border-white/10 px-3 py-1.5 rounded-2xl shadow-inner">
        <button
          onClick={() => store.setActiveTab("floor")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
            store.activeTab === "floor"
              ? "bg-sky-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>Floor Plan</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px] font-mono">
            {totalTables}
          </span>
        </button>

        <div className="w-px h-4 bg-slate-800" />

        <button
          onClick={() => store.setActiveTab("order")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
            store.activeTab === "order"
              ? "bg-sky-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span className="text-sky-400">●</span>
          <span>Table {store.selectedTable}</span>
          {store.cart.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-md bg-emerald-500 text-slate-950 font-black text-[10px] font-mono">
              {store.cart.length}
            </span>
          )}
        </button>

        <div className="w-px h-4 bg-slate-800" />

        <button
          onClick={() => store.setActiveTab("kots")}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
            store.activeTab === "kots"
              ? "bg-sky-600 text-white shadow-sm"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>Kitchen KOTs</span>
          <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
            {openKotsCount}
          </span>
        </button>
      </div>

      {/* Right Controls: Ergonomic touch buttons (44px min) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Sound Feedback Toggle */}
        <button
          type="button"
          onClick={() => store.toggleSound()}
          title={store.isSoundEnabled ? "Touch Audio ON" : "Touch Audio MUTED"}
          className={`min-h-[44px] min-w-[44px] rounded-2xl border transition flex items-center justify-center cursor-pointer ${
            store.isSoundEnabled
              ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
              : "bg-slate-900 text-slate-500 border-white/5 hover:bg-slate-800"
          }`}
        >
          {store.isSoundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>

        {/* Database Refresh */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            onRefresh();
          }}
          disabled={isRefreshing}
          title="Refresh Tables & Menu Data"
          className="min-h-[44px] min-w-[44px] rounded-2xl border border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800 flex items-center justify-center transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={18} className={isRefreshing ? "animate-spin text-sky-400" : ""} />
        </button>

        {/* Dark/Light Theme Toggle */}
        <button
          type="button"
          onClick={() => store.toggleTheme()}
          title="Toggle Dark/Light Mode"
          className="min-h-[44px] min-w-[44px] rounded-2xl border border-white/10 bg-slate-900 text-slate-300 hover:bg-slate-800 flex items-center justify-center transition cursor-pointer"
        >
          {store.isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-sky-400" />}
        </button>

        {/* Lock / Switch Staff */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            onLock();
          }}
          title="Lock Terminal / Switch Staff"
          className="min-h-[44px] px-3.5 py-2 rounded-2xl border border-white/10 bg-gradient-to-r from-slate-900 to-slate-800 hover:border-sky-500 text-slate-200 flex items-center gap-2 text-xs font-bold shadow-md cursor-pointer transition active:scale-95"
        >
          <Lock size={15} className="text-sky-400" />
          <span className="hidden sm:inline">Switch</span>
        </button>
      </div>
    </header>
  );
};
