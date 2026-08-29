import React, { useState } from "react";
import { LayoutGrid, Plus, Users, Edit2, Trash2 } from "lucide-react";
import { Button } from "@ssrone/ui";
import { POSTable } from "../../../types";

interface TableListPageProps {
  tables: POSTable[];
  onOpenCreate: () => void;
  onOpenEdit: (table: POSTable) => void;
  onDeleteTable?: (tableId: number | str) => void;
  isLoading?: boolean;
}

export const TableListPage: React.FC<TableListPageProps> = ({
  tables,
  onOpenCreate,
  onOpenEdit,
  onDeleteTable,
  isLoading = false
}) => {
  const [selectedSection, setSelectedSection] = useState<string>("ALL");

  const totalCapacity = tables.reduce((acc, t) => acc + (t.capacity || 0), 0);
  const freeTables = tables.filter((t) => t.status === "free" || !t.status).length;
  const occupiedTables = tables.filter((t) => t.status === "occupied" || t.status === "billing").length;

  const sections = Array.from(new Set(tables.map((t) => t.section).filter(Boolean))) as string[];

  const filteredTables = selectedSection === "ALL"
    ? tables
    : tables.filter((t) => t.section === selectedSection);

  return (
    <div className="space-y-4">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="text-3xs uppercase font-bold tracking-wider text-muted-foreground">Total Tables</p>
            <h4 className="font-display font-black text-xl text-foreground mt-0.5">{tables.length}</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
            <LayoutGrid size={18} />
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="text-3xs uppercase font-bold tracking-wider text-muted-foreground">Total Seating</p>
            <h4 className="font-display font-black text-xl text-emerald-500 mt-0.5">{totalCapacity} Guests</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
            <Users size={18} />
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="text-3xs uppercase font-bold tracking-wider text-muted-foreground">Free / Available</p>
            <h4 className="font-display font-black text-xl text-emerald-600 mt-0.5">{freeTables}</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            ⚡
          </div>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl p-4 shadow-card flex items-center justify-between">
          <div>
            <p className="text-3xs uppercase font-bold tracking-wider text-muted-foreground">Occupied / Billing</p>
            <h4 className="font-display font-black text-xl text-amber-500 mt-0.5">{occupiedTables}</h4>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
            🔥
          </div>
        </div>
      </div>

      {/* Table Master List Container */}
      <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h3 className="font-display font-extrabold text-base text-foreground uppercase tracking-wider flex items-center gap-2">
              <LayoutGrid size={18} className="text-primary" />
              Dining Floor & Table Layout Master ({tables.length})
            </h3>
            <p className="text-3xs text-muted-foreground">
              Configure floor sections, table numbers, seating capacities, and active floor status
            </p>
          </div>

          <Button
            onClick={onOpenCreate}
            className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2 rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-primary/20"
          >
            <Plus size={16} /> + Add Table
          </Button>
        </div>

        {/* Section Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedSection("ALL")}
            className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
              selectedSection === "ALL"
                ? "bg-primary text-white border-primary shadow-xs"
                : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            All Sections ({tables.length})
          </button>
          {sections.map((sec) => {
            const count = tables.filter((t) => t.section === sec).length;
            return (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                  selectedSection === sec
                    ? "bg-primary text-white border-primary shadow-xs"
                    : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                }`}
              >
                {sec} ({count})
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTables.length === 0 && (
          <div className="text-center py-10 border border-dashed border-border rounded-2xl space-y-2">
            <LayoutGrid size={32} className="mx-auto text-muted-foreground/50" />
            <p className="font-bold text-sm text-foreground">No dining tables found</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Click "+ Add Table" above to add your first dining table or select a different floor section.
            </p>
          </div>
        )}

        {/* Table Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
          {filteredTables.map((table) => (
            <div
              key={table.id}
              className="bg-card border border-border hover:border-primary/50 rounded-2xl p-4 flex flex-col justify-between h-28 transition-all shadow-card hover:shadow-card-hover group relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-display font-black text-base text-foreground group-hover:text-primary transition-colors">
                    {table.table_number}
                  </span>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                    {table.section || "Main Dining"}
                  </p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                  table.status === "occupied" || table.status === "billing"
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                }`}>
                  {table.status || "Free"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground pt-2 border-t border-border/50">
                <span className="flex items-center gap-1.5 text-foreground">
                  <Users size={14} className="text-primary" />
                  {table.capacity} Seater
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenEdit(table)}
                    className="p-1 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                    title="Edit Table"
                  >
                    <Edit2 size={14} />
                  </button>
                  {onDeleteTable && (
                    <button
                      onClick={() => onDeleteTable(table.id)}
                      className="p-1 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Delete Table"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
