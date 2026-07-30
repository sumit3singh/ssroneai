import React, { useState, useEffect } from "react";
import { LayoutGrid, X } from "lucide-react";
import { Input } from "@/shared/ui/primitives/Input";
import { Button } from "@/shared/ui/primitives/Button";
import { POSTable } from "../../types";

interface TableFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tableNumber: string, capacity: number, section: string) => Promise<void>;
  editingTable?: POSTable | null;
}

export const TableFormDialog: React.FC<TableFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTable
}) => {
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState(4);
  const [section, setSection] = useState("Main Hall");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingTable) {
      setTableNumber(editingTable.table_number || "");
      setCapacity(editingTable.capacity || 4);
      setSection(editingTable.section || "Main Hall");
    } else {
      setTableNumber("");
      setCapacity(4);
      setSection("Main Hall");
    }
  }, [editingTable, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableNumber.trim()) return;
    setIsSaving(true);
    try {
      await onSave(tableNumber, capacity, section);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-4 shadow-modal">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h3 className="font-display font-extrabold text-base text-foreground">
            {editingTable ? "Edit Dining Table" : "Add New Dining Table"}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-muted">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-2xs uppercase font-bold text-muted-foreground">Table Code / Number *</label>
            <Input
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="e.g. T12 or VIP-1"
              required
              className="h-10 text-xs font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-2xs uppercase font-bold text-muted-foreground">Seating Capacity</label>
            <Input
              type="number"
              value={capacity}
              onChange={(e) => setCapacity(parseInt(e.target.value) || 4)}
              className="h-10 text-xs font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-2xs uppercase font-bold text-muted-foreground">Floor Section / Area</label>
            <Input
              value={section}
              onChange={(e) => setSection(e.target.value)}
              placeholder="e.g. Main Hall, Terrace, VIP Lounge"
              className="h-10 text-xs font-bold"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-primary text-white font-bold">
              {isSaving ? "Saving..." : editingTable ? "Update Table" : "Create Table"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
