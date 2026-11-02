import React, { useState, useEffect } from "react";
import {
  Users,
  Clock,
  Lock,
  ChevronRight,
  Armchair,
  ChefHat,
  Sparkles,
  Maximize2
} from "lucide-react";
import { sound } from "@/utils/audioFeedback";
import { useStaffPOS, TableItem } from "@/stores/useStaffPOSStore";
import { RunningOrder } from "./ActiveOrdersTracker";

/**
 * ============================================================================
 * CREATIVE ARCHITECTURE CONSTITUTION (DIRECTIVE FOR THE AGENT'S MIND):
 * "Act as a world-class luxury hospitality product designer and senior UI/UX
 * architect. Never build flat, generic, corporate, or boring wireframes.
 * Treat every touch surface like a bespoke Michelin-star / luxury cafe terminal:
 * 1. Warm organic materiality (warm ivory canvas, deep rich forest green brand anchor).
 * 2. High-impact 3D tactile visual metaphors for every primary operational intent.
 * 3. Clean, scannable numbers with soft jewel-toned category badges.
 * 4. Zero clutter, zero redundant text, instant recognition from 3 feet away."
 * ============================================================================
 */

interface StaffDashboardHubProps {
  authName: string;
  branchName: string;
  tables: TableItem[];
  runningOrders: RunningOrder[];
  onOpenIndent: () => void;
  onOpenLedger: () => void;
  onLock?: () => void;
  isRefreshing?: boolean;
  onRefresh?: () => void;
}

export const StaffDashboardHub: React.FC<StaffDashboardHubProps> = ({
  authName,
  branchName,
  tables,
  runningOrders,
  onOpenIndent,
  onOpenLedger,
  onLock,
  isRefreshing,
  onRefresh,
}) => {
  const store = useStaffPOS();
  const [timeStr, setTimeStr] = useState("");
  const [dateStr, setDateStr] = useState("");

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
          weekday: "short",
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

  const totalTables = tables.length || 28;
  const occupiedTables = tables.filter((t) => t.status === "occupied").length;
  const freeTables = Math.max(0, totalTables - occupiedTables);
  const firstAvailableTable = tables.find((t) => t.status === "available")?.number || "C-1";

  return (
    <div className="flex-1 p-2 sm:p-4 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full space-y-3 sm:space-y-4 select-none bg-[#F8F6F0] min-h-full">
      {/* ------------------------------------------------------------------ */}
      {/* 1. TOP BOUTIQUE STATUS HEADER                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-2xl sm:rounded-3xl px-3 sm:px-6 py-2.5 sm:py-3 shadow-xs border border-[#EBE7DF] flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0B3B2C] text-[#E5A93C] flex items-center justify-center shrink-0 shadow-sm border border-[#082D22]">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 fill-current text-[#E5A93C]"
              viewBox="0 0 24 24"
            >
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm sm:text-base lg:text-lg font-black text-slate-900 leading-tight tracking-tight">
              {branchName || "Baithak Cafe"}
            </h1>
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500">
              CUH Mahendragarh
            </p>
          </div>
        </div>

        {/* Header Right Group: Staff, Shift, Clock, Lock */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Staff Info */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
              <Users size={15} />
            </div>
            <div className="text-left hidden xs:block">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Staff
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900 block leading-none">
                {authName || "Aman"}
              </span>
            </div>
          </div>

          {/* Shift Active Pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#E9F3EC] px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border border-[#D5E8DB]">
            <span className="w-2 h-2 rounded-full bg-[#27AE60] animate-pulse" />
            <span className="text-[11px] sm:text-xs font-black text-[#0B3B2C] leading-none">
              Shift Active
            </span>
          </div>

          {/* Live Chronometer (Hidden on mobile) */}
          <div className="hidden lg:flex items-center gap-2 text-slate-800">
            <Clock size={16} className="text-slate-700" />
            <div className="text-left font-mono">
              <span className="text-xs font-black text-slate-900 block">
                {timeStr || "03:17:53 PM"}
              </span>
            </div>
          </div>

          {/* Lock Terminal Button */}
          {onLock && (
            <button
              type="button"
              onClick={() => {
                sound.tap();
                onLock();
              }}
              title="Lock Terminal"
              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-[#0B3B2C] hover:bg-[#072B20] text-white text-xs font-black flex items-center gap-1.5 cursor-pointer transition active:scale-95 shadow-xs"
            >
              <Lock size={13} className="text-amber-400" />
              <span className="hidden sm:inline">Lock</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. OPERATIONAL COUNTERS (RESPONSIVE 4-BOX CARDS)                   */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3.5">
        {/* Stat 1: Occupied */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3.5 shadow-xs border border-[#EBE7DF] flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#FCE8E6] text-[#C0392B] flex items-center justify-center shrink-0">
            <Users size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-none font-mono">
              {occupiedTables}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block truncate mt-0.5">
              Occupied
            </span>
          </div>
        </div>

        {/* Stat 2: Available */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3.5 shadow-xs border border-[#EBE7DF] flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#E8F4EC] text-[#27AE60] flex items-center justify-center shrink-0">
            <Armchair size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-none font-mono">
              {freeTables}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block truncate mt-0.5">
              Available
            </span>
          </div>
        </div>

        {/* Stat 3: Kitchen KOTs */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3.5 shadow-xs border border-[#EBE7DF] flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#FEF5E7] text-[#D35400] flex items-center justify-center shrink-0">
            <ChefHat size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-none font-mono">
              {runningOrders.length || 0}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block truncate mt-0.5">
              Kitchen KOTs
            </span>
          </div>
        </div>

        {/* Stat 4: Tables */}
        <div className="bg-white rounded-2xl p-2.5 sm:p-3.5 shadow-xs border border-[#EBE7DF] flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#F6EFE5] text-[#8E6E53] flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
              <path d="M4 8h16M4 8v10M20 8v10M8 8v6M16 8v6" />
            </svg>
          </div>
          <div className="min-w-0">
            <span className="text-xl sm:text-2xl font-black text-slate-900 block leading-none font-mono">
              {totalTables}
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 block truncate mt-0.5">
              Total Tables
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. THE 6 MASTER 3D TACTILE CARDS (RESPONSIVE 2-COL MOBILE, 3-COL TAB) */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-5 pb-4">
        {/* CARD 1: FLOOR & TABLES (Dark Forest Green) */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setActiveTab("floor");
          }}
          className="group relative h-[155px] sm:h-[190px] md:h-[220px] lg:h-[250px] rounded-2xl sm:rounded-3xl bg-[#0B3B2C] hover:bg-[#072E22] transition-all duration-300 cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 flex flex-col justify-between p-2.5 sm:p-4 overflow-hidden text-left"
        >
          <div className="w-full flex-1 flex items-center justify-center relative px-1 sm:px-2 min-h-0">
            <img
              src="/hub/floor_tables.jpg"
              alt="Floor & Tables"
              className="max-h-[85px] sm:max-h-[120px] md:max-h-[140px] lg:max-h-[160px] w-auto object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#124B39] group-hover:bg-[#1B614A] text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
              <ChevronRight size={16} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-center pb-0.5 sm:pb-1">
            <span className="text-xs sm:text-base md:text-lg font-black tracking-wider text-white uppercase font-sans">
              FLOOR &amp; TABLES
            </span>
          </div>
        </button>

        {/* CARD 2: NEW ORDER (Dark Forest Green) */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setSelectedTable(firstAvailableTable);
            store.setOrderType("dine_in");
            store.setActiveTab("pos");
          }}
          className="group relative h-[155px] sm:h-[190px] md:h-[220px] lg:h-[250px] rounded-2xl sm:rounded-3xl bg-[#0B3B2C] hover:bg-[#072E22] transition-all duration-300 cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 flex flex-col justify-between p-2.5 sm:p-4 overflow-hidden text-left"
        >
          <div className="w-full flex-1 flex items-center justify-center relative px-1 sm:px-2 min-h-0">
            <img
              src="/hub/new_order.jpg"
              alt="New Order"
              className="max-h-[85px] sm:max-h-[120px] md:max-h-[140px] lg:max-h-[160px] w-auto object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#124B39] group-hover:bg-[#1B614A] text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
              <ChevronRight size={16} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-center pb-0.5 sm:pb-1">
            <span className="text-xs sm:text-base md:text-lg font-black tracking-wider text-white uppercase font-sans">
              NEW ORDER
            </span>
          </div>
        </button>

        {/* CARD 3: KITCHEN KOT */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setActiveTab("kots");
          }}
          className="group relative h-[155px] sm:h-[190px] md:h-[220px] lg:h-[250px] rounded-2xl sm:rounded-3xl bg-[#EDF3EE] hover:bg-[#E4ECE5] transition-all duration-300 cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 flex flex-col justify-between p-2.5 sm:p-4 overflow-hidden text-left border border-[#DCE6DE]"
        >
          <div className="w-full flex-1 flex items-center justify-center relative px-1 sm:px-2 min-h-0">
            <img
              src="/hub/kitchen_kot.jpg"
              alt="Kitchen KOT"
              className="max-h-[85px] sm:max-h-[120px] md:max-h-[140px] lg:max-h-[160px] w-auto object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#E5A93C] group-hover:bg-[#D4952B] text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
              <ChevronRight size={16} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-center pb-0.5 sm:pb-1">
            <span className="text-xs sm:text-base md:text-lg font-black tracking-wider text-[#0B3B2C] uppercase font-sans">
              KITCHEN KOT
            </span>
          </div>
        </button>

        {/* CARD 4: TAKEAWAY */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setOrderType("takeaway");
            store.setSelectedTable("Takeaway");
            store.setActiveTab("pos");
          }}
          className="group relative h-[155px] sm:h-[190px] md:h-[220px] lg:h-[250px] rounded-2xl sm:rounded-3xl bg-[#EDF3EE] hover:bg-[#E4ECE5] transition-all duration-300 cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 flex flex-col justify-between p-2.5 sm:p-4 overflow-hidden text-left border border-[#DCE6DE]"
        >
          <div className="w-full flex-1 flex items-center justify-center relative px-1 sm:px-2 min-h-0">
            <img
              src="/hub/takeaway.jpg"
              alt="Takeaway"
              className="max-h-[85px] sm:max-h-[120px] md:max-h-[140px] lg:max-h-[160px] w-auto object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#A2C4AF] group-hover:bg-[#8FB89E] text-[#0B3B2C] flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
              <ChevronRight size={16} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-center pb-0.5 sm:pb-1">
            <span className="text-xs sm:text-base md:text-lg font-black tracking-wider text-[#0B3B2C] uppercase font-sans">
              TAKEAWAY
            </span>
          </div>
        </button>

        {/* CARD 5: DELIVERY */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setOrderType("delivery");
            store.setSelectedTable("Delivery");
            store.setActiveTab("pos");
          }}
          className="group relative h-[155px] sm:h-[190px] md:h-[220px] lg:h-[250px] rounded-2xl sm:rounded-3xl bg-[#EDF3EE] hover:bg-[#E4ECE5] transition-all duration-300 cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 flex flex-col justify-between p-2.5 sm:p-4 overflow-hidden text-left border border-[#DCE6DE]"
        >
          <div className="w-full flex-1 flex items-center justify-center relative px-1 sm:px-2 min-h-0">
            <img
              src="/hub/delivery.jpg"
              alt="Delivery"
              className="max-h-[85px] sm:max-h-[120px] md:max-h-[140px] lg:max-h-[160px] w-auto object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#A2C4AF] group-hover:bg-[#8FB89E] text-[#0B3B2C] flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
              <ChevronRight size={16} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-center pb-0.5 sm:pb-1">
            <span className="text-xs sm:text-base md:text-lg font-black tracking-wider text-[#0B3B2C] uppercase font-sans">
              DELIVERY
            </span>
          </div>
        </button>

        {/* CARD 6: STAFF */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            onOpenLedger();
          }}
          className="group relative h-[155px] sm:h-[190px] md:h-[220px] lg:h-[250px] rounded-2xl sm:rounded-3xl bg-[#EDF3EE] hover:bg-[#E4ECE5] transition-all duration-300 cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 flex flex-col justify-between p-2.5 sm:p-4 overflow-hidden text-left border border-[#DCE6DE]"
        >
          <div className="w-full flex-1 flex items-center justify-center relative px-1 sm:px-2 min-h-0">
            <img
              src="/hub/staff.jpg"
              alt="Staff"
              className="max-h-[85px] sm:max-h-[120px] md:max-h-[140px] lg:max-h-[160px] w-auto object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 w-7 h-7 sm:w-10 sm:h-10 rounded-full bg-[#A2C4AF] group-hover:bg-[#8FB89E] text-[#0B3B2C] flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
              <ChevronRight size={16} strokeWidth={2.5} className="sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="text-center pb-0.5 sm:pb-1">
            <span className="text-xs sm:text-base md:text-lg font-black tracking-wider text-[#0B3B2C] uppercase font-sans">
              STAFF
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
