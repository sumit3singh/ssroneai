import React, { useState, useEffect } from "react";
import { ChefHat, X, Printer, Layers, Check } from "lucide-react";
import { Input, Button } from "@ssrone/ui";
import { api } from "@ssrone/api-client";
import { toast } from "sonner";

export interface KitchenStationData {
  id?: number | string;
  name: string;
  code: string;
  printer_name?: string;
  station_type?: string;
  categories?: (string | number)[];
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
  { label: "Tandoor & Charcoal", value: "tandoor" },
  { label: "Chinese & Asian Wok", value: "chinese" },
  { label: "Beverages & Bar", value: "bar" },
  { label: "Bakery & Desserts", value: "bakery" },
  { label: "Pizzeria & Oven", value: "pizzeria" },
  { label: "Fast Food & Fryer", value: "fast_food" },
  { label: "Pantry & Cold Cuts", value: "pantry" },
];

const PRINTER_PRESETS = [
  { label: "RETSOL RPT82", value: "RETSOL RPT82" },
  { label: "POS-80 Thermal", value: "POS-80" },
  { label: "EPSON TM-T82", value: "EPSON TM-T82" },
  { label: "Kitchen LAN IP (192.168.1.101)", value: "192.168.1.101" },
  { label: "Bar LAN IP (192.168.1.102)", value: "192.168.1.102" },
];

export const KitchenStationFormDialog: React.FC<KitchenStationFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  editingStation,
}) => {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [printerName, setPrinterName] = useState("RETSOL RPT82");
  const [stationType, setStationType] = useState("main");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [availableCategories, setAvailableCategories] = useState<Array<{ id: number | string; name: string }>>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Fetch menu categories to let user toggle routing rules directly
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    setIsLoadingCategories(true);
    api
      .get<any[]>("/restaurant/categories")
      .then((res) => {
        if (!isMounted) return;
        if (Array.isArray(res)) {
          setAvailableCategories(
            res.map((c) => ({
              id: c.id,
              name: c.name || `Category #${c.id}`,
            }))
          );
        }
      })
      .catch((err) => {
        console.warn("Could not load categories for routing selector:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingCategories(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  useEffect(() => {
    if (editingStation) {
      setName(editingStation.name || "");
      setCode(editingStation.code || "");
      setPrinterName(editingStation.printer_name || "RETSOL RPT82");
      setStationType(editingStation.station_type || "main");
      setIsActive(editingStation.is_active !== false);

      // Parse existing categories
      if (Array.isArray(editingStation.categories)) {
        setSelectedCategories(editingStation.categories.map((c) => String(c)));
      } else {
        setSelectedCategories([]);
      }
    } else {
      setName("");
      setCode("");
      setPrinterName("RETSOL RPT82");
      setStationType("main");
      setSelectedCategories([]);
      setIsActive(true);
    }
  }, [editingStation, isOpen]);

  if (!isOpen) return null;

  const toggleCategory = (catName: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catName) ? prev.filter((c) => c !== catName) : [...prev, catName]
    );
  };

  const selectAllCategories = () => {
    setSelectedCategories(availableCategories.map((c) => c.name));
  };

  const clearAllCategories = () => {
    setSelectedCategories([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Station name is required");
      return;
    }
    setIsSaving(true);
    try {
      const generatedCode =
        code.trim().toUpperCase() ||
        name.trim().replace(/[^a-zA-Z0-9]/g, "").substring(0, 8).toUpperCase();

      await onSave({
        id: editingStation?.id,
        name: name.trim(),
        code: generatedCode,
        printer_name: printerName.trim() || "RETSOL RPT82",
        station_type: stationType,
        categories: selectedCategories,
        is_active: isActive,
      });
      onClose();
    } catch (err: any) {
      console.error("Error saving kitchen station:", err);
      toast.error(err?.message || "Failed to save kitchen station");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border rounded-3xl w-full max-w-xl p-6 space-y-4 shadow-modal max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20">
              <ChefHat size={20} />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-foreground">
                {editingStation ? `Edit Kitchen Station: ${editingStation.name}` : "Add Kitchen Display Station"}
              </h3>
              <p className="text-2xs text-muted-foreground">
                Configure station type, KOT thermal printer, and mapped menu categories
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
          {/* Station Name & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-2xs uppercase font-bold text-muted-foreground">
                Station Name *
              </label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingStation && !code) {
                    setCode(
                      e.target.value
                        .replace(/[^a-zA-Z0-9]/g, "")
                        .substring(0, 8)
                        .toUpperCase()
                    );
                  }
                }}
                placeholder="e.g. Indian Kitchen, Tandoor & Charcoal, Drinks Bar"
                required
                className="h-10 text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-2xs uppercase font-bold text-muted-foreground">
                Station Code *
              </label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. MAIN, BAR"
                required
                className="h-10 text-xs font-bold font-mono uppercase"
              />
            </div>
          </div>

          {/* Station Type */}
          <div className="space-y-1">
            <label className="text-2xs uppercase font-bold text-muted-foreground">
              Station Preparation Type
            </label>
            <select
              value={stationType}
              onChange={(e) => setStationType(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-card text-foreground text-xs font-bold focus:outline-none focus:border-primary"
            >
              {STATION_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Thermal Printer Assignment */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-muted/30 border border-border">
            <div className="flex items-center justify-between">
              <label className="text-2xs uppercase font-bold text-foreground flex items-center gap-1.5">
                <Printer size={14} className="text-primary" />
                Assigned Thermal Printer (Device / IP) *
              </label>
              <span className="text-[10px] text-muted-foreground">
                Windows Printer Name or LAN IP
              </span>
            </div>

            <Input
              value={printerName}
              onChange={(e) => setPrinterName(e.target.value)}
              placeholder="e.g. RETSOL RPT82 or 192.168.1.101"
              required
              className="h-9 text-xs font-mono font-bold"
            />

            {/* Quick Printer Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-muted-foreground font-semibold">Quick pick:</span>
              {PRINTER_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPrinterName(p.value)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border font-mono transition-all cursor-pointer ${
                    printerName === p.value
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card hover:bg-muted border-border text-foreground"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Routed Menu Categories */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-muted/30 border border-border">
            <div className="flex items-center justify-between">
              <label className="text-2xs uppercase font-bold text-foreground flex items-center gap-1.5">
                <Layers size={14} className="text-primary" />
                Routed Menu Categories
              </label>
              <div className="flex items-center gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={selectAllCategories}
                  className="text-primary font-bold hover:underline cursor-pointer"
                >
                  Select All
                </button>
                <span className="text-muted-foreground">•</span>
                <button
                  type="button"
                  onClick={clearAllCategories}
                  className="text-muted-foreground hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Orders containing items from selected categories will automatically dispatch KOTs to this station
            </p>

            {isLoadingCategories ? (
              <div className="text-xs text-muted-foreground py-2 italic">Loading categories...</div>
            ) : availableCategories.length === 0 ? (
              <div className="text-xs text-muted-foreground py-2 italic">
                No menu categories found. You can add categories in Master &gt; Menu Categories.
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pt-1">
                {availableCategories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.name);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.name)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-primary/15 text-primary border-primary/40 font-bold shadow-xs"
                          : "bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground"
                      }`}
                    >
                      {isSelected && <Check size={12} className="text-primary" />}
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Operational Status Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
            <div>
              <div className="text-xs font-bold text-foreground">Station Operational Status</div>
              <div className="text-[10px] text-muted-foreground">
                Active stations receive orders and appear in KDS & KOT dispatch
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className={`px-3 py-1.5 rounded-xl text-2xs font-bold uppercase transition-all cursor-pointer ${
                isActive
                  ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
              }`}
            >
              {isActive ? "🟢 Active" : "🔴 Inactive"}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSaving} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving} className="bg-primary text-white font-bold cursor-pointer">
              {isSaving ? "Saving..." : editingStation ? "Save Changes" : "Create Kitchen Station"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
