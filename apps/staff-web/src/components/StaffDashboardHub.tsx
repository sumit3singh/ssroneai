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
    <div className="flex-1 p-3 sm:p-5 lg:p-6 overflow-y-auto max-w-7xl mx-auto w-full space-y-4 select-none bg-[#F8F6F0] min-h-full">
      {/* ------------------------------------------------------------------ */}
      {/* 1. TOP BOUTIQUE STATUS HEADER                                       */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-3xl px-4 sm:px-6 py-3 shadow-xs border border-[#EBE7DF] flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#0B3B2C] text-[#E5A93C] flex items-center justify-center shrink-0 shadow-sm border border-[#082D22]">
            {/* Elegant Golden Leaf/Wheat Icon */}
            <svg
              className="w-6 h-6 fill-current text-[#E5A93C]"
              viewBox="0 0 24 24"
            >
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight tracking-tight">
              {branchName || "Baithak Cafe"}
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              CUH Mahendragarh
            </p>
          </div>
        </div>

        {/* Header Right Group: Staff, Shift, Clock, Lock */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          {/* Staff Info */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
              <Users size={17} />
            </div>
            <div className="text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Staff
              </span>
              <span className="text-xs sm:text-sm font-black text-slate-900 block leading-none">
                {authName || "Aman"}
              </span>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-slate-200" />

          {/* Shift Active Pill */}
          <div className="flex items-center gap-2 bg-[#E9F3EC] px-3.5 py-1.5 rounded-2xl border border-[#D5E8DB]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#27AE60] animate-pulse" />
            <div>
              <span className="text-xs font-black text-[#0B3B2C] block leading-tight">
                Shift Active
              </span>
              <span className="text-[10px] font-medium text-slate-500 block">
                Since 08:00 AM
              </span>
            </div>
          </div>

          <div className="hidden sm:block h-8 w-px bg-slate-200" />

          {/* Live Chronometer */}
          <div className="hidden md:flex items-center gap-2.5 text-slate-800">
            <Clock size={19} className="text-slate-700" />
            <div className="text-left">
              <span className="text-[10px] font-medium text-slate-500 block leading-tight">
                {dateStr || "Sat, 31 Oct 2026"}
              </span>
              <span className="text-xs sm:text-sm font-black font-mono text-slate-900 block">
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
              className="px-5 py-2.5 rounded-2xl bg-[#0B3B2C] hover:bg-[#072B20] text-white text-xs font-black flex items-center gap-2 cursor-pointer transition active:scale-95 shadow-sm"
            >
              <Lock size={14} className="text-amber-400" />
              <span>Lock</span>
            </button>
          )}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 2. OPERATIONAL COUNTERS (EXACT METRICS BAR)                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white rounded-3xl p-3 sm:p-5 shadow-xs border border-[#EBE7DF] grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {/* Stat 1: Occupied */}
        <div className="flex items-center gap-3.5 px-2 sm:px-4 py-1">
          <div className="w-13 h-13 rounded-full bg-[#FCE8E6] text-[#C0392B] flex items-center justify-center shrink-0">
            <Users size={22} />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block leading-none font-mono">
              {occupiedTables}
            </span>
            <span className="text-xs font-semibold text-slate-500 block mt-1">
              Occupied
            </span>
          </div>
        </div>

        {/* Stat 2: Available */}
        <div className="flex items-center gap-3.5 px-2 sm:px-4 py-1">
          <div className="w-13 h-13 rounded-full bg-[#E8F4EC] text-[#27AE60] flex items-center justify-center shrink-0">
            <Armchair size={22} />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block leading-none font-mono">
              {freeTables}
            </span>
            <span className="text-xs font-semibold text-slate-500 block mt-1">
              Available
            </span>
          </div>
        </div>

        {/* Stat 3: Kitchen KOTs */}
        <div className="flex items-center gap-3.5 px-2 sm:px-4 py-1">
          <div className="w-13 h-13 rounded-full bg-[#FEF5E7] text-[#D35400] flex items-center justify-center shrink-0">
            <ChefHat size={22} />
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block leading-none font-mono">
              {runningOrders.length || 50}
            </span>
            <span className="text-xs font-semibold text-slate-500 block mt-1">
              Kitchen KOTs
            </span>
          </div>
        </div>

        {/* Stat 4: Tables */}
        <div className="flex items-center gap-3.5 px-2 sm:px-4 py-1">
          <div className="w-13 h-13 rounded-full bg-[#F6EFE5] text-[#8E6E53] flex items-center justify-center shrink-0">
            {/* Table icon */}
            <svg className="w-6 h-6 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
              <path d="M4 8h16M4 8v10M20 8v10M8 8v6M16 8v6" />
            </svg>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 block leading-none font-mono">
              {totalTables}
            </span>
            <span className="text-xs font-semibold text-slate-500 block mt-1">
              Tables
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 3. THE 6 MASTER 3D TACTILE CARDS (EXACT VISUAL REPLICA)            */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {/* CARD 1: FLOOR & TABLES (Dark Forest Green) */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setActiveTab("floor");
          }}
          className="group relative h-[240px] sm:h-[260px] rounded-[32px] bg-[#0B3B2C] hover:bg-[#072E22] transition-all duration-300 cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 flex flex-col justify-between p-4 overflow-hidden text-left"
        >
          {/* 3D Realistic Dining Table Visual */}
          <div className="w-full flex-1 flex items-center justify-center relative px-2">
            <img
              src="/hub/floor_tables.jpg"
              alt="Floor & Tables"
              className="max-h-[160px] w-auto object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
            />

            {/* Floating Arrow Badge */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#124B39] group-hover:bg-[#1B614A] text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
              <ChevronRight size={22} strokeWidth={2.5} />
            </div>
          </div>

          {/* Title */}
          <div className="text-center pb-1">
            <span className="text-lg sm:text-xl font-black tracking-wider text-white uppercase font-sans">
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
          className="group relative h-[240px] sm:h-[260px] rounded-[32px] bg-[#0B3B2C] hover:bg-[#072E22] transition-all duration-300 cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 flex flex-col justify-between p-4 overflow-hidden text-left"
        >
          {/* 3D Realistic Gourmet Food Visual */}
          <div className="w-full flex-1 flex items-center justify-center relative px-2">
            <img
              src="/hub/new_order.jpg"
              alt="New Order"
              className="max-h-[160px] w-auto object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
            />

            {/* Floating Arrow Badge */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#124B39] group-hover:bg-[#1B614A] text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
              <ChevronRight size={22} strokeWidth={2.5} />
            </div>
          </div>

          {/* Title */}
          <div className="text-center pb-1">
            <span className="text-lg sm:text-xl font-black tracking-wider text-white uppercase font-sans">
              NEW ORDER
            </span>
          </div>
        </button>

        {/* CARD 3: KITCHEN KOT (Soft Cream / Sage with Amber Arrow) */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setActiveTab("kots");
          }}
          className="group relative h-[240px] sm:h-[260px] rounded-[32px] bg-[#EDF3EE] hover:bg-[#E4ECE5] transition-all duration-300 cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 flex flex-col justify-between p-4 overflow-hidden text-left border border-[#DCE6DE]"
        >
          {/* 3D Realistic Thermal KOT Printer Visual */}
          <div className="w-full flex-1 flex items-center justify-center relative px-2">
            <img
              src="/hub/kitchen_kot.jpg"
              alt="Kitchen KOT"
              className="max-h-[160px] w-auto object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
            />

            {/* Floating Golden-Amber Arrow Badge */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#E5A93C] group-hover:bg-[#D4952B] text-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
              <ChevronRight size={22} strokeWidth={2.5} />
            </div>
          </div>

          {/* Title */}
          <div className="text-center pb-1">
            <span className="text-lg sm:text-xl font-black tracking-wider text-[#0B3B2C] uppercase font-sans">
              KITCHEN KOT
            </span>
          </div>
        </button>

        {/* CARD 4: TAKEAWAY (Soft Cream / Sage with Green Arrow) */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setOrderType("takeaway");
            store.setSelectedTable("Takeaway");
            store.setActiveTab("pos");
          }}
          className="group relative h-[240px] sm:h-[260px] rounded-[32px] bg-[#EDF3EE] hover:bg-[#E4ECE5] transition-all duration-300 cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 flex flex-col justify-between p-4 overflow-hidden text-left border border-[#DCE6DE]"
        >
          {/* 3D Realistic Takeaway Bag Visual */}
          <div className="w-full flex-1 flex items-center justify-center relative px-2">
            <img
              src="/hub/takeaway.jpg"
              alt="Takeaway"
              className="max-h-[160px] w-auto object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
            />

            {/* Floating Sage Green Arrow Badge */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#A2C4AF] group-hover:bg-[#8FB89E] text-[#0B3B2C] flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
              <ChevronRight size={22} strokeWidth={2.5} />
            </div>
          </div>

          {/* Title */}
          <div className="text-center pb-1">
            <span className="text-lg sm:text-xl font-black tracking-wider text-[#0B3B2C] uppercase font-sans">
              TAKEAWAY
            </span>
          </div>
        </button>

        {/* CARD 5: DELIVERY (Soft Cream / Sage with Green Arrow) */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            store.setOrderType("delivery");
            store.setSelectedTable("Delivery");
            store.setActiveTab("pos");
          }}
          className="group relative h-[240px] sm:h-[260px] rounded-[32px] bg-[#EDF3EE] hover:bg-[#E4ECE5] transition-all duration-300 cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 flex flex-col justify-between p-4 overflow-hidden text-left border border-[#DCE6DE]"
        >
          {/* 3D Realistic Delivery Scooter Visual */}
          <div className="w-full flex-1 flex items-center justify-center relative px-2">
            <img
              src="/hub/delivery.jpg"
              alt="Delivery"
              className="max-h-[160px] w-auto object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
            />

            {/* Floating Sage Green Arrow Badge */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#A2C4AF] group-hover:bg-[#8FB89E] text-[#0B3B2C] flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
              <ChevronRight size={22} strokeWidth={2.5} />
            </div>
          </div>

          {/* Title */}
          <div className="text-center pb-1">
            <span className="text-lg sm:text-xl font-black tracking-wider text-[#0B3B2C] uppercase font-sans">
              DELIVERY
            </span>
          </div>
        </button>

        {/* CARD 6: STAFF (Soft Cream / Sage with Green Arrow) */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            onOpenLedger();
          }}
          className="group relative h-[240px] sm:h-[260px] rounded-[32px] bg-[#EDF3EE] hover:bg-[#E4ECE5] transition-all duration-300 cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 flex flex-col justify-between p-4 overflow-hidden text-left border border-[#DCE6DE]"
        >
          {/* 3D Realistic Staff Characters Visual */}
          <div className="w-full flex-1 flex items-center justify-center relative px-2">
            <img
              src="/hub/staff.jpg"
              alt="Staff"
              className="max-h-[160px] w-auto object-contain drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
            />

            {/* Floating Sage Green Arrow Badge */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-[#A2C4AF] group-hover:bg-[#8FB89E] text-[#0B3B2C] flex items-center justify-center shadow-md transition-transform group-hover:scale-110">
              <ChevronRight size={22} strokeWidth={2.5} />
            </div>
          </div>

          {/* Title */}
          <div className="text-center pb-1">
            <span className="text-lg sm:text-xl font-black tracking-wider text-[#0B3B2C] uppercase font-sans">
              STAFF
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
