import React from "react";
import { Store, RefreshCw, Circle } from "lucide-react";
import { Button } from "@ssrone/ui";

interface POSHeaderProps {
  branchName?: string;
  counterName?: string;
  cashierName?: string;
  isShiftOpen?: boolean;
  onRefresh: () => void;
  isLoading?: boolean;
}

export const POSHeader: React.FC<POSHeaderProps> = ({
  branchName = "",
  counterName = "",
  cashierName = "",
  isShiftOpen = true,
  onRefresh,
  isLoading = false
}) => {
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-2 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3 text-xs font-bold text-foreground">
        <div className="flex items-center gap-1.5 text-primary font-black uppercase tracking-wider font-display">
          <Store size={16} />
          <span>POS Terminal</span>
        </div>

        <span className="text-muted-foreground/40">•</span>
        <span className="text-muted-foreground">{branchName}</span>

        <span className="text-muted-foreground/40">•</span>
        <span className="text-muted-foreground">{counterName}</span>

        <span className="text-muted-foreground/40">•</span>
        <span className="flex items-center gap-1">
          <span className="text-muted-foreground">Shift:</span>
          <span className={isShiftOpen ? "text-emerald-600 font-extrabold" : "text-destructive font-extrabold"}>
            {isShiftOpen ? "OPEN" : "CLOSED"}
          </span>
        </span>

        <span className="text-muted-foreground/40">•</span>
        <span className="flex items-center gap-1">
          <span className="text-muted-foreground">Cashier:</span>
          <span className="text-foreground">{cashierName}</span>
        </span>

        <span className="text-muted-foreground/40">•</span>
        <span className="text-2xs font-mono font-semibold text-muted-foreground">
          {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
          <Circle size={8} className="fill-emerald-500" /> Online
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="h-7 text-2xs font-bold gap-1 px-2.5"
        >
          <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} /> Sync DB
        </Button>
      </div>
    </div>
  );
};
