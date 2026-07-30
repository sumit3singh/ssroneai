import React, { useState } from "react";
import { LayoutGrid, Plus, Users, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { POSTable } from "../../types";

interface TableListPageProps {
  tables: POSTable[];
  onOpenCreate: () => void;
  onOpenEdit: (table: POSTable) => void;
  isLoading?: boolean;
}

export const TableListPage: React.FC<TableListPageProps> = ({
  tables,
  onOpenCreate,
  onOpenEdit,
  isLoading = false
}) => {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h3 className="font-display font-extrabold text-base text-foreground uppercase tracking-wider flex items-center gap-2">
            <LayoutGrid size={18} className="text-primary" />
            Dining Floor & Table Layout Master ({tables.length})
          </h3>
          <p className="text-3xs text-muted-foreground">
            Configure dining floor sections, table numbers, seating capacities, and default waiters
          </p>
        </div>

        <Button
          onClick={onOpenCreate}
          className="bg-primary hover:bg-primary/90 text-white font-bold text-xs px-4 py-2 rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-primary/20"
        >
          <Plus size={16} /> + Add Table
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {tables.map((table) => (
          <div
            key={table.id}
            onClick={() => onOpenEdit(table)}
            className="bg-muted/30 border border-border/70 hover:border-primary/50 rounded-xl p-4 flex flex-col justify-between h-24 cursor-pointer transition-all shadow-card hover:shadow-card-hover"
          >
            <div className="flex items-center justify-between">
              <span className="font-display font-black text-sm text-foreground">{table.table_number}</span>
              <span className="text-[10px] font-bold text-muted-foreground bg-card border border-border px-2 py-0.5 rounded-md uppercase">
                {table.section || "Main Hall"}
              </span>
            </div>

            <div className="flex items-center justify-between text-2xs font-semibold text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users size={12} className="text-primary" />
                {table.capacity} Seater
              </span>
              <span className="text-primary font-bold">Edit</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
