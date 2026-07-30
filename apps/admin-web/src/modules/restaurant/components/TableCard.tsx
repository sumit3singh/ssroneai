import React from "react";
import { Users, User, Clock, CheckCircle2, AlertCircle, Ban } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";

export interface Table {
  id: string | number;
  table_number: string;
  capacity: number;
  section?: string;
  status: "free" | "occupied" | "reserved" | "billing";
  guests?: number;
  waiter?: string;
  is_active?: boolean;
}

interface TableCardProps {
  table: Table;
  onEdit: (table: Table) => void;
}

export const TableCard: React.FC<TableCardProps> = ({ table, onEdit }) => {
  const getStatusBadge = () => {
    switch (table.status) {
      case "free":
        return {
          bg: "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400",
          icon: <CheckCircle2 size={13} />,
          label: "FREE"
        };
      case "occupied":
        return {
          bg: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
          icon: <Clock size={13} />,
          label: "OCCUPIED"
        };
      case "reserved":
        return {
          bg: "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400",
          icon: <Ban size={13} />,
          label: "RESERVED"
        };
      case "billing":
        return {
          bg: "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400",
          icon: <AlertCircle size={13} />,
          label: "BILLING"
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div
      onClick={() => onEdit(table)}
      className="bg-card border border-border rounded-2xl p-4 space-y-3 cursor-pointer hover:border-primary/50 hover:shadow-card-hover transition-all relative group shadow-card"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display font-black text-lg text-foreground">
            {table.table_number}
          </span>
          {table.section && (
            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-md uppercase">
              {table.section}
            </span>
          )}
        </div>

        <span
          className={`inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full border ${badge.bg}`}
        >
          {badge.icon}
          {badge.label}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold pt-1 border-t border-border/60">
        <span className="flex items-center gap-1">
          <Users size={13} className="text-primary" />
          {table.guests || 0} / {table.capacity} Seats
        </span>
        {table.waiter && (
          <span className="flex items-center gap-1 text-2xs font-bold text-foreground">
            <User size={12} className="text-muted-foreground" />
            {table.waiter}
          </span>
        )}
      </div>
    </div>
  );
};
