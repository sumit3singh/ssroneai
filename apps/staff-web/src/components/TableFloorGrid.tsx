import React from "react";
import { Users, Clock, Utensils, CheckCircle, ShoppingBag } from "lucide-react";
import { RunningOrder } from "./ActiveOrdersTracker";

export interface TableInfo {
  id: string | number;
  number: string;
  capacity?: number;
  status?: "available" | "occupied" | "billed" | "reserved";
  active_order_id?: string;
  running_total?: number;
  guests?: number;
  seated_time?: string;
}

interface TableFloorGridProps {
  tables: TableInfo[];
  runningOrders?: RunningOrder[];
  selectedTable: string;
  onSelectTable: (tableNumber: string) => void;
  onOpenTableOrder?: (table: TableInfo) => void;
}

export const TableFloorGrid: React.FC<TableFloorGridProps> = ({
  tables,
  runningOrders = [],
  selectedTable,
  onSelectTable,
  onOpenTableOrder,
}) => {
  const displayTables: TableInfo[] = tables;

  // Build real-time map of running orders per table
  const tableOrderMap = new Map<string, RunningOrder>();
  runningOrders.forEach((o) => {
    if (o.table_name) {
      const key = String(o.table_name).replace(/\D/g, "");
      tableOrderMap.set(key, o);
    }
  });

  const totalCount = displayTables.length;
  const occupiedTables = displayTables.filter((t) => {
    const numKey = String(t.number).replace(/\D/g, "");
    return t.status === "occupied" || tableOrderMap.has(numKey);
  });
  const occupiedCount = occupiedTables.length;
  const availableCount = totalCount - occupiedCount;

  return (
    <div className="space-y-4">
      {/* Floor Plan Header Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">Total Tables</span>
          <span className="font-mono text-xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider font-mono">Available Free</span>
          <span className="font-mono text-xl font-black mt-1">{availableCount}</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider font-mono">Active Dining</span>
          <span className="font-mono text-xl font-black mt-1">{occupiedCount}</span>
        </div>
      </div>

      {/* Interactive Table Cards Grid */}
      {displayTables.length === 0 ? (
        <div className="py-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
          <Utensils size={36} className="mx-auto text-slate-300 dark:text-slate-700" />
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">NO DINING TABLES PROVISIONED</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No active dining tables exist in PostgreSQL database for this branch. Add tables in POS Admin Workspace (`/pos/master/tables`).
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          {displayTables.map((t) => {
            const numKey = String(t.number).replace(/\D/g, "");
            const runningOrder = tableOrderMap.get(numKey);
            const isOccupied = t.status === "occupied" || !!runningOrder;
            const isSelected = selectedTable === t.number;

            let cardBg = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50";
            let badgeBg = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
            let badgeText = "FREE";

            if (isOccupied) {
              cardBg = "bg-rose-500/5 dark:bg-rose-950/20 border-rose-500/30 text-rose-900 dark:text-rose-100";
              badgeBg = "bg-rose-500/10 text-rose-600 border-rose-500/20";
              badgeText = "DINING";
            }

            if (isSelected) {
              cardBg += " ring-2 ring-indigo-600 dark:ring-indigo-500 shadow-md scale-[1.02]";
            }

            const runningTotal = runningOrder?.net_amount || t.running_total;
            const itemCount = runningOrder?.items?.length || 0;

            return (
              <button
                key={t.id || t.number}
                type="button"
                onClick={() => {
                  onSelectTable(t.number);
                  if (onOpenTableOrder) onOpenTableOrder(t);
                }}
                className={`p-4 rounded-3xl border text-left flex flex-col justify-between transition-all cursor-pointer relative min-h-[125px] ${cardBg}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between w-full">
                  <span className="font-mono font-black text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Utensils size={15} className="text-indigo-600 dark:text-indigo-400" />
                    Table {t.number}
                  </span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border tracking-wider font-mono ${badgeBg}`}>
                    {badgeText}
                  </span>
                </div>

                {/* Middle details */}
                <div className="my-2 space-y-1">
                  {isOccupied ? (
                    <>
                      <div className="flex items-center justify-between text-2xs font-bold text-slate-600 dark:text-slate-300">
                        <span className="flex items-center gap-1"><Users size={12} /> {t.guests || 2} Guests</span>
                        {runningOrder && (
                          <span className="flex items-center gap-1 font-mono text-[9px] text-rose-600 dark:text-rose-400 font-black">
                            <ShoppingBag size={11} /> {itemCount} Items
                          </span>
                        )}
                      </div>
                      {runningTotal && (
                        <p className="font-mono text-sm font-black text-rose-600 dark:text-rose-400 mt-1">
                          ₹{runningTotal}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 my-1">
                      <Users size={12} /> Capacity: {t.capacity || 4} seats
                    </p>
                  )}
                </div>

                {/* Selection footer label */}
                <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[9px] font-black uppercase text-slate-400 font-mono">
                  <span>{isSelected ? "SELECTED TABLE" : (isOccupied ? "VIEW ORDER" : "START ORDER")}</span>
                  {isSelected && <CheckCircle size={13} className="text-indigo-600 dark:text-indigo-400" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TableFloorGrid;
