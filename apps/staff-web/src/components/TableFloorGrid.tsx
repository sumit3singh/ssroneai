import React from "react";
import { Users, Utensils, CheckCircle2, ShoppingBag } from "lucide-react";
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
    <div className="space-y-4 font-sans">
      {/* Floor Plan Header Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-mono font-extrabold uppercase text-slate-500 tracking-wider">Total Tables</span>
          <span className="font-sans text-2xl font-black text-slate-900 dark:text-white mt-1">{totalCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-900 text-sky-800 dark:text-sky-300 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-sky-800 dark:text-sky-400">Available Free</span>
          <span className="font-sans text-2xl font-black text-sky-800 dark:text-sky-300 mt-1">{availableCount}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-400">Active Dining</span>
          <span className="font-sans text-2xl font-black text-amber-800 dark:text-amber-300 mt-1">{occupiedCount}</span>
        </div>
      </div>

      {/* Interactive Table Cards Grid */}
      {displayTables.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 p-8 space-y-2 shadow-2xs">
          <Utensils size={36} className="mx-auto text-slate-400 dark:text-slate-600" />
          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider">NO DINING TABLES PROVISIONED</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
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

            let cardStyle = "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-sky-500";
            let badgeBg = "bg-sky-50 text-sky-800 border-sky-200";
            let badgeText = "FREE";

            if (isOccupied) {
              cardStyle = "bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-100";
              badgeBg = "bg-amber-100 text-amber-800 border-amber-300";
              badgeText = "DINING";
            }

            if (isSelected) {
              cardStyle += " ring-2 ring-sky-600 shadow-xs";
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
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative min-h-[125px] shadow-2xs ${cardStyle}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between w-full">
                  <span className="font-sans font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Utensils size={15} className="text-sky-600 dark:text-sky-400" />
                    Table {t.number}
                  </span>
                  <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${badgeBg}`}>
                    {badgeText}
                  </span>
                </div>

                {/* Middle details */}
                <div className="my-2 space-y-1">
                  {isOccupied ? (
                    <>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1"><Users size={12} /> {t.guests || 2} Guests</span>
                        {runningOrder && (
                          <span className="flex items-center gap-1 font-mono text-[10px] text-amber-800 font-bold">
                            <ShoppingBag size={11} /> {itemCount} Items
                          </span>
                        )}
                      </div>
                      {runningTotal && (
                        <p className="font-mono text-sm font-black text-amber-900 dark:text-amber-300 mt-1">
                          ₹{runningTotal}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 my-1">
                      <Users size={12} /> Capacity: {t.capacity || 4} seats
                    </p>
                  )}
                </div>

                {/* Selection footer label */}
                <div className="w-full pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono font-bold uppercase text-slate-500">
                  <span>{isSelected ? "SELECTED" : (isOccupied ? "VIEW ORDER" : "START ORDER")}</span>
                  {isSelected && <CheckCircle2 size={14} className="text-sky-600 dark:text-sky-400" />}
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
