import React, { useState, useEffect } from "react";
import { ChefHat, X } from "lucide-react";
import { Input, Button } from "@ssrone/ui";

export interface KitchenStationData {
  id?: number | string;
  name: string;
  code: string;
  printer_name?: string;
  station_type?: string;
  is_active?: boolean;
}

interface KitchenStationFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: KitchenStationData) => Promise<void>;
  editingStation?: KitchenStationData | null;
}

const STATION_TYPES = [
  { label: "Main Kitchen", value: "main" },
  { label: "Chinese & Tandoor", value: "chinese" },
  { label: "Beverages & Bar", value: "bar" },
  { label: "Bakery & Desserts", value: "bakery" },
  { label: "Pizzeria & Oven", value: "pizzeria" },
  { label: "Pantry & Cold Cuts", value: "pantry" },
];

export const KitchenStationFormDialog: React.FC<KitchenStationFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  editingStation
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [printerName, setPrinterName] = useState("192.168.1.101");
  const [stationType, setStationType] = useState("main");
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (editingStation) {
      setName(editingStation.name || "");
      setCode(editingStation.code || "");
      setPrinterName(editingStation.printer_name || "192.168.1.101");
      setStationType(editingStation.station_type || "main");
      setIsActive(editingStation.is_active !== false);
    } else {
      setName("");
      setCode("");
      setPrinterName("192.168.1.101");
      setStationType("main");
      setIsActive(true);
    }
  }, [editingStation, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      const generatedCode = code.trim().toUpperCase() || name.trim().substring(0, 6).toUpperCase();
      await onSave({
        id: editingStation?.id,
        name: name.trim(),
        code: generatedCode,
        printer_name: printerName.trim() || "192.168.1.101",
        station_type: stationType,
        is_active: isActive
      });
      onClose();
    } catch (err) {
      console.error("Error saving kitchen station:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-3xl w-full max-w-md p-6 space-y-4 shadow-modal">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h3 className="font-display font-extrabold text-base text-foreground flex items-center gap-2">
              <ChefHat size={18} className="text-primary" />
              {editingStation ? "Edit Kitchen Station" : "Add Kitchen Display Station"}
            </h3>
            <p className="text-3xs text-muted-foreground">
              Configure KDS preparation station and thermal printer IP routing
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-2xs uppercase font-bold text-muted-foreground">Station Name *</label>
            <Input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editingStation && !code) {
                  setCode(e.target.value.substring(0, 6).toUpperCase());
                }
              }}
              placeholder="e.g. Main Kitchen, Beverage Bar, Pizza Station"
              required
              className="h-10 text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-2xs uppercase font-bold text-muted-foreground">Station Code *</label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. MAIN, BAR, PIZZA"
                required
                className="h-10 text-xs font-bold font-mono uppercase"
              />
            </div>

            <div className="space-y-1">
              <label className="text-2xs uppercase font-bold text-muted-foreground">Station Category</label>
              <select
                value={stationType}
                onChange={(e) => setStationType(e.target.value)}
                className="w-full h-10 bg-muted/40 border border-border rounded-xl px-3 text-xs font-bold text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
              >
                {STATION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-2xs uppercase font-bold text-muted-foreground">Thermal Printer IP / Name</label>
            <Input
              value={printerName}
              onChange={(e) => setPrinterName(e.target.value)}
              placeholder="e.g. 192.168.1.101 or POS-Kitchen-01"
              className="h-10 text-xs font-bold font-mono"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border">
            <span className="text-xs font-bold text-foreground">Station Operational Status</span>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-3 py-1 rounded-lg text-2xs font-bold uppercase transition-all ${
                isActive ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
              }`}
            >
              {isActive ? "🟢 Active" : "🔴 Inactive"}
            </button>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-primary text-white font-bold">
              {isSaving ? "Saving..." : editingStation ? "Update Station" : "Create Station"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
