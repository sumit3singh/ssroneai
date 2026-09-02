import React, { useState } from "react";
import { LayoutGrid, Plus, Users, Edit2, Trash2 } from "lucide-react";
import { Button, PageHeader, PageContainer } from "@ssrone/ui";
import { POSTable } from "../../../types";

interface TableListPageProps {
  tables: POSTable[];
  onOpenCreate: () => void;
  onOpenEdit: (table: POSTable) => void;
  onDeleteTable?: (tableId: number | string) => void;
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
    <PageContainer>
      {/* Standardized Enterprise Page Header */}
      <PageHeader
        title="Dining Floor & Table Layout Master"
        description="Configure floor sections, table numbers, seating capacities, and floor status"
        icon={<LayoutGrid size={18} />}
        badge={`${tables.length} Tables`}
        actions={
          <Button
            onClick={onOpenCreate}
            size="sm"
            className="text-xs font-semibold gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus size={14} /> Add Table
          </Button>
        }
      />

      {/* Top KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-md p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Tables</span>
            <div className="p-1 rounded bg-muted text-muted-foreground"><LayoutGrid size={15} /></div>
          </div>
          <div className="text-xl font-bold font-mono text-foreground">{tables.length}</div>
        </div>

        <div className="bg-card border border-border rounded-md p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Seating</span>
            <div className="p-1 rounded bg-muted text-muted-foreground"><Users size={15} /></div>
          </div>
          <div className="text-xl font-bold font-mono text-foreground">{totalCapacity} Guests</div>
        </div>

        <div className="bg-card border border-border rounded-md p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Free / Available</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{freeTables}</div>
        </div>

        <div className="bg-card border border-border rounded-md p-3.5 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Occupied / Billing</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">{occupiedTables}</div>
        </div>
      </div>

      {/* Section Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedSection("ALL")}
          className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
            selectedSection === "ALL"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
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
              className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
                selectedSection === sec
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              {sec} ({count})
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTables.length === 0 && (
        <div className="text-center py-8 border border-dashed border-border rounded-md space-y-2">
          <LayoutGrid size={28} className="mx-auto text-muted-foreground/50" />
          <p className="font-semibold text-xs text-foreground">No dining tables found</p>
          <p className="text-[11px] text-muted-foreground max-w-xs mx-auto">
            Click "+ Add Table" above to add your first dining table or select a different floor section.
          </p>
        </div>
      )}

      {/* Table Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {filteredTables.map((table) => {
          const isFree = table.status === "free" || !table.status;
          return (
            <div
              key={table.id}
              className="bg-card border border-border hover:border-primary/40 rounded-md p-3 flex flex-col justify-between h-24 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-semibold text-sm text-foreground">
                    {table.table_number}
                  </span>
                  <p className="text-[10px] text-muted-foreground uppercase font-mono">
                    {table.section || "Main Dining"}
                  </p>
                </div>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                  isFree
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                }`}>
                  {table.status || "Free"}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-1.5 border-t border-border">
                <span className="flex items-center gap-1 text-foreground font-medium text-[11px]">
                  <Users size={13} className="text-muted-foreground" />
                  {table.capacity} Seater
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenEdit(table)}
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer border-none bg-transparent"
                    title="Edit Table"
                  >
                    <Edit2 size={13} />
                  </button>
                  {onDeleteTable && (
                    <button
                      onClick={() => onDeleteTable(table.id)}
                      className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-muted transition-colors cursor-pointer border-none bg-transparent"
                      title="Delete Table"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
};
