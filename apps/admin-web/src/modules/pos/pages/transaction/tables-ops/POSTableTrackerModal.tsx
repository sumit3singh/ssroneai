import React, { useState } from "react";
import { LayoutGrid, X, Check, Users, Utensils, Sparkles } from "lucide-react";
import { POSTable } from "../../types";

interface POSTableTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: POSTable[];
  selectedTableId: number | string;
  onSelectTable: (tableId: number | string) => void;
}

export const POSTableTrackerModal: React.FC<POSTableTrackerModalProps> = ({
  isOpen,
  onClose,
  tables,
  selectedTableId,
  onSelectTable
}) => {
  const [filterSection, setFilterSection] = useState<string>("ALL");

  if (!isOpen) return null;

  const sections = Array.from(new Set(tables.map((t) => t.section || "Main Hall").filter(Boolean)));
  const filteredTables = filterSection === "ALL"
    ? tables
    : tables.filter((t) => (t.section || "Main Hall") === filterSection);

  const getStatusColor = (status: string, isSelected: boolean) => {
    if (isSelected) return "border-primary bg-primary/10 ring-2 ring-primary text-primary shadow-lg";
    switch (status?.toLowerCase()) {
      case "occupied":
      case "busy":
        return "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400 hover:bg-rose-500/20";
      case "reserved":
        return "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20";
      default:
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl p-6 space-y-4 shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
              <LayoutGrid size={22} />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
                Dining Table Floor Selector
                <span className="font-mono text-xs font-black px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {tables.length} Tables
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select active table for order billing or table switching.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Section Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-thin">
          <button
            onClick={() => setFilterSection("ALL")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              filterSection === "ALL"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            All Floors & Sections
          </button>
          {sections.map((sec) => (
            <button
              key={sec}
              onClick={() => setFilterSection(sec)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                filterSection === sec
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 overflow-y-auto pr-1 flex-1 scrollbar-thin">
          {filteredTables.map((t) => {
            const isSelected = String(t.id) === String(selectedTableId);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  onSelectTable(t.id);
                  onClose();
                }}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between items-start transition-all cursor-pointer text-left relative group ${getStatusColor(
                  t.status,
                  isSelected
                )}`}
              >
                {isSelected && (
                  <span className="absolute top-2 right-2 p-1 rounded-full bg-primary text-white">
                    <Check size={12} />
                  </span>
                )}
                <div>
                  <span className="font-mono font-black text-sm block">
                    Table {t.table_number}
                  </span>
                  <span className="text-[10px] font-semibold opacity-75 block">
                    {t.section || "Main Floor"}
                  </span>
                </div>

                <div className="mt-3 w-full flex items-center justify-between text-2xs font-bold pt-2 border-t border-black/10 dark:border-white/10">
                  <span className="flex items-center gap-1">
                    <Users size={11} /> {t.capacity} Seats
                  </span>
                  <span className="uppercase font-mono text-[9px] font-black px-1.5 py-0.2 rounded bg-black/10 dark:bg-white/10">
                    {t.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
