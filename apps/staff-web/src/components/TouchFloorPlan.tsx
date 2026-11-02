import React, { useState } from "react";
import {
  Utensils,
  Users,
  Clock,
  ShoppingBag,
  Plus,
  Receipt,
  Sparkles,
  ChevronRight,
  Filter
} from "lucide-react";
import { sound } from "@/utils/audioFeedback";
import { useStaffPOS, TableItem } from "@/stores/useStaffPOSStore";
import { RunningOrder } from "./ActiveOrdersTracker";

interface TouchFloorPlanProps {
  tables: TableItem[];
  runningOrders: RunningOrder[];
  onSelectTableForOrder: (tableNumber: string) => void;
  onViewTableBill?: (order: RunningOrder) => void;
}

export const TouchFloorPlan: React.FC<TouchFloorPlanProps> = ({
  tables,
  runningOrders,
  onSelectTableForOrder,
  onViewTableBill,
}) => {
  const store = useStaffPOS();
  const [statusFilter, setStatusFilter] = useState<"all" | "free" | "occupied">("all");

  // Build lookup map for active orders by table name/number
  const tableOrderMap = React.useMemo(() => {
    const map = new Map<string, RunningOrder>();
    runningOrders.forEach((o) => {
      const cleanNum = String(o.table_number || "").replace(/\D/g, "");
      if (cleanNum) {
        map.set(cleanNum, o);
      }
      if (o.table_number) {
        map.set(String(o.table_number).toLowerCase(), o);
      }
    });
    return map;
  }, [runningOrders]);

  // Extract unique sections
  const sections = React.useMemo(() => {
    const set = new Set<string>();
    tables.forEach((t) => {
      if (t.section) set.add(t.section);
    });
    return ["All", ...Array.from(set)];
  }, [tables]);

  // Filtered tables
  const filteredTables = React.useMemo(() => {
    return tables.filter((t) => {
      const cleanNum = String(t.number).replace(/\D/g, "");
      const order = tableOrderMap.get(cleanNum) || tableOrderMap.get(String(t.number).toLowerCase());
      const isOccupied = t.status === "occupied" || !!order;

      if (statusFilter === "free" && isOccupied) return false;
      if (statusFilter === "occupied" && !isOccupied) return false;

      if (store.selectedSection !== "All" && t.section && t.section !== store.selectedSection) {
        return false;
      }
      return true;
    });
  }, [tables, tableOrderMap, statusFilter, store.selectedSection]);

  const totalTablesCount = tables.length;
  const occupiedCount = tables.filter((t) => {
    const cleanNum = String(t.number).replace(/\D/g, "");
    return t.status === "occupied" || tableOrderMap.has(cleanNum) || tableOrderMap.has(String(t.number).toLowerCase());
  }).length;
  const freeCount = totalTablesCount - occupiedCount;

  return (
    <div className="space-y-4">
      {/* Top Floor Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
        {/* Total Tables */}
        <div className="p-3.5 sm:p-4 rounded-3xl bg-slate-900 border border-white/10 shadow-lg flex flex-col justify-between">
          <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-400">
            Total Floor Tables
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white">
              {totalTablesCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">Beds/Tables</span>
          </div>
        </div>

        {/* Available Free Tables */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            setStatusFilter(statusFilter === "free" ? "all" : "free");
          }}
          className={`p-3.5 sm:p-4 rounded-3xl border text-left flex flex-col justify-between transition cursor-pointer active:scale-95 ${
            statusFilter === "free"
              ? "bg-emerald-500/20 border-emerald-500 ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/20"
              : "bg-slate-900 border-white/10 hover:border-emerald-500/40"
          }`}
        >
          <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Free & Ready
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-400">
              {freeCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">Available</span>
          </div>
        </button>

        {/* Occupied Dining Tables */}
        <button
          type="button"
          onClick={() => {
            sound.tap();
            setStatusFilter(statusFilter === "occupied" ? "all" : "occupied");
          }}
          className={`p-3.5 sm:p-4 rounded-3xl border text-left flex flex-col justify-between transition cursor-pointer active:scale-95 ${
            statusFilter === "occupied"
              ? "bg-amber-500/20 border-amber-500 ring-2 ring-amber-500 shadow-lg shadow-amber-500/20"
              : "bg-slate-900 border-white/10 hover:border-amber-500/40"
          }`}
        >
          <span className="text-[10px] font-mono font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Active Dining
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400">
              {occupiedCount}
            </span>
            <span className="text-xs text-slate-400 font-medium">Seated</span>
          </div>
        </button>
      </div>

      {/* Sections Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
          Floor Zone:
        </span>
        {sections.map((sec) => (
          <button
            key={sec}
            type="button"
            onClick={() => store.setSelectedSection(sec)}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-2xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 active:scale-95 ${
              store.selectedSection === sec
                ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
                : "bg-slate-900 border border-white/10 text-slate-400 hover:text-white"
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Table Cards Grid */}
      {filteredTables.length === 0 ? (
        <div className="py-20 text-center bg-slate-900 border border-dashed border-white/10 rounded-3xl p-8 space-y-2">
          <Utensils size={36} className="mx-auto text-slate-600" />
          <h4 className="font-extrabold text-sm text-white uppercase tracking-wider">
            No Tables in this view
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try resetting the status filter or floor section.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {filteredTables.map((tbl) => {
            const cleanNum = String(tbl.number).replace(/\D/g, "");
            const runningOrder = tableOrderMap.get(cleanNum) || tableOrderMap.get(String(tbl.number).toLowerCase());
            const isOccupied = tbl.status === "occupied" || !!runningOrder;
            const isSelected = store.selectedTable === tbl.number;

            const runningTotal = runningOrder?.grand_total || tbl.running_total;
            const itemsCount = runningOrder?.items?.length || 0;

            return (
              <div
                key={tbl.id || tbl.number}
                className={`p-4 rounded-3xl border text-left flex flex-col justify-between min-h-[145px] transition shadow-lg relative overflow-hidden group ${
                  isOccupied
                    ? "bg-slate-900 border-amber-500/40 hover:border-amber-400"
                    : "bg-slate-900 border-white/10 hover:border-sky-500/60"
                } ${isSelected ? "ring-2 ring-sky-500 shadow-sky-500/20" : ""}`}
              >
                {/* Card Top: Table # and Status Pill */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        isOccupied ? "bg-amber-400" : "bg-emerald-400"
                      }`}
                    />
                    <h3 className="font-black text-sm sm:text-base text-white">
                      Table {tbl.number}
                    </h3>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full border ${
                      isOccupied
                        ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                        : "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                    }`}
                  >
                    {isOccupied ? "DINING" : "FREE"}
                  </span>
                </div>

                {/* Card Middle: Guests, Items & Running Total */}
                <div className="my-2 space-y-1">
                  {isOccupied ? (
                    <>
                      <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Users size={12} className="text-amber-400" />
                          {tbl.guests || 2} Guests
                        </span>
                        {itemsCount > 0 && (
                          <span className="text-[11px] font-mono text-amber-300 font-bold">
                            {itemsCount} items
                          </span>
                        )}
                      </div>

                      {runningTotal !== undefined && (
                        <div className="pt-1 flex items-baseline justify-between">
                          <span className="text-[10px] font-mono text-slate-400 uppercase">Total Bill:</span>
                          <span className="font-mono text-base font-black text-amber-400">
                            ₹{runningTotal}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Users size={12} className="text-emerald-400" />
                        Capacity: {tbl.capacity || 4} Seats
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {tbl.section || "Main Dining Area"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Bottom: One-Touch Order Button */}
                <div className="pt-2 border-t border-white/5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      sound.tap();
                      onSelectTableForOrder(tbl.number);
                    }}
                    className={`flex-1 min-h-[38px] rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer transition active:scale-95 ${
                      isOccupied
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30"
                        : "bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30"
                    }`}
                  >
                    <Plus size={14} />
                    <span>{isOccupied ? "Add KOT" : "Start Order"}</span>
                  </button>

                  {isOccupied && runningOrder && onViewTableBill && (
                    <button
                      type="button"
                      onClick={() => {
                        sound.tap();
                        onViewTableBill(runningOrder);
                      }}
                      title="View Bill / Thermal KOT"
                      className="min-h-[38px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center cursor-pointer transition active:scale-95 border border-white/10"
                    >
                      <Receipt size={15} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
