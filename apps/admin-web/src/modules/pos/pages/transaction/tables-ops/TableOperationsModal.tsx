import React, { useState } from "react";
import { ArrowRightLeft, Users, X, Layers, Split } from "lucide-react";
import { Button } from "@ssrone/ui";
import { POSTable, POSWaiter } from "../../../types";

interface TableOperationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables: POSTable[];
  waiters: POSWaiter[];
}

export const TableOperationsModal: React.FC<TableOperationsModalProps> = ({
  isOpen,
  onClose,
  tables,
  waiters
}) => {
  const [opType, setOpType] = useState<"transfer_table" | "merge_table" | "transfer_waiter" | "split_bill">("transfer_table");
  const [sourceTable, setSourceTable] = useState("");
  const [targetTable, setTargetTable] = useState("");
  const [targetWaiter, setTargetWaiter] = useState("");

  if (!isOpen) return null;

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Operation [${opType}] executed successfully!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-4 shadow-modal">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-display font-extrabold text-base text-foreground flex items-center gap-2">
            <ArrowRightLeft size={18} className="text-primary" />
            Table & Floor Operations
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
            <X size={18} />
          </button>
        </div>

        {/* Operation Selector Tabs */}
        <div className="grid grid-cols-2 gap-1.5 bg-muted/60 p-1 rounded-xl border border-border">
          <button
            onClick={() => setOpType("transfer_table")}
            className={`py-1.5 px-2 rounded-lg text-2xs font-extrabold transition-all ${
              opType === "transfer_table" ? "bg-primary text-white shadow-sm" : "text-muted-foreground"
            }`}
          >
            Transfer Table
          </button>
          <button
            onClick={() => setOpType("merge_table")}
            className={`py-1.5 px-2 rounded-lg text-2xs font-extrabold transition-all ${
              opType === "merge_table" ? "bg-primary text-white shadow-sm" : "text-muted-foreground"
            }`}
          >
            Merge Tables
          </button>
          <button
            onClick={() => setOpType("transfer_waiter")}
            className={`py-1.5 px-2 rounded-lg text-2xs font-extrabold transition-all ${
              opType === "transfer_waiter" ? "bg-primary text-white shadow-sm" : "text-muted-foreground"
            }`}
          >
            Transfer Waiter
          </button>
          <button
            onClick={() => setOpType("split_bill")}
            className={`py-1.5 px-2 rounded-lg text-2xs font-extrabold transition-all ${
              opType === "split_bill" ? "bg-primary text-white shadow-sm" : "text-muted-foreground"
            }`}
          >
            Split Bill
          </button>
        </div>

        <form onSubmit={handleExecute} className="space-y-4">
          <div className="space-y-1">
            <label className="text-2xs uppercase font-bold text-muted-foreground">Source Table *</label>
            <select
              value={sourceTable}
              onChange={(e) => setSourceTable(e.target.value)}
              required
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold"
            >
              <option value="">Select Occupied Table</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.table_number} ({t.status})
                </option>
              ))}
            </select>
          </div>

          {opType === "transfer_table" || opType === "merge_table" ? (
            <div className="space-y-1">
              <label className="text-2xs uppercase font-bold text-muted-foreground">Target Destination Table *</label>
              <select
                value={targetTable}
                onChange={(e) => setTargetTable(e.target.value)}
                required
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold"
              >
                <option value="">Select Destination Table</option>
                {tables.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.table_number} ({t.status})
                  </option>
                ))}
              </select>
            </div>
          ) : opType === "transfer_waiter" ? (
            <div className="space-y-1">
              <label className="text-2xs uppercase font-bold text-muted-foreground">Reassign to Waiter *</label>
              <select
                value={targetWaiter}
                onChange={(e) => setTargetWaiter(e.target.value)}
                required
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold"
              >
                <option value="">Select New Waiter</option>
                {waiters.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.code})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-2xs uppercase font-bold text-muted-foreground">Split Mode</label>
              <select className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs font-bold">
                <option value="equal">Split Equally by Guests</option>
                <option value="by_items">Split Custom by Items</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary text-white font-bold">
              Execute Operation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
