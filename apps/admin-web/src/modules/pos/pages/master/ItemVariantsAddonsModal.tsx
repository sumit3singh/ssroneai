import React, { useState, useEffect } from "react";
import { X, Layers, Plus, Trash2, CheckCircle2, ChevronRight, Sparkles, Tag } from "lucide-react";
import { Button, Input } from "@ssrone/ui";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";
import { POSMenuItem } from "../../types";

interface VariantOption {
  name: string;
  price: number;
  selling_price?: number;
  is_default?: boolean;
}

interface VariantGroup {
  id: number;
  name: string;
  min_selection: number;
  max_selection: number;
  is_required: boolean;
  options: {
    id: number;
    name: string;
    price: number;
    selling_price: number;
    is_default: boolean;
  }[];
}

interface AddonOption {
  name: string;
  price: number;
  is_available?: boolean;
}

interface AddonGroup {
  id: number;
  name: string;
  min_selection: number;
  max_selection: number;
  options: {
    id: number;
    name: string;
    price: number;
    is_available: boolean;
  }[];
}

interface ItemVariantsAddonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItem: POSMenuItem | null;
  onUpdated?: () => void;
}

export const ItemVariantsAddonsModal: React.FC<ItemVariantsAddonsModalProps> = ({
  isOpen,
  onClose,
  menuItem,
  onUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<"variants" | "addons">("variants");
  const [loading, setLoading] = useState(false);

  // Data lists
  const [variantGroups, setVariantGroups] = useState<VariantGroup[]>([]);
  const [addonGroups, setAddonGroups] = useState<AddonGroup[]>([]);

  // Variant Form state
  const [vgName, setVgName] = useState("Portion Size");
  const [vgRequired, setVgRequired] = useState(true);
  const [vOptions, setVOptions] = useState<VariantOption[]>([
    { name: "Small", price: 0, is_default: false },
    { name: "Medium", price: 0, is_default: false },
    { name: "Large", price: 0, is_default: false },
  ]);

  // Addon Form state
  const [agName, setAgName] = useState("Add-ons / Extras");
  const [agMin, setAgMin] = useState(0);
  const [agMax, setAgMax] = useState(3);
  const [aOptions, setAOptions] = useState<AddonOption[]>([
    { name: "Extra Cheese", price: 30 },
    { name: "Special Dip", price: 20 },
  ]);

  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    if (!menuItem) return;
    try {
      setLoading(true);
      const [vRes, aRes] = await Promise.all([
        api.get<VariantGroup[]>(`/restaurant/menu-items/${menuItem.id}/variants`),
        api.get<AddonGroup[]>(`/restaurant/menu-items/${menuItem.id}/addons`),
      ]);
      setVariantGroups(Array.isArray(vRes) ? vRes : []);
      setAddonGroups(Array.isArray(aRes) ? aRes : []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load variants/addons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && menuItem) {
      loadData();
    }
  }, [isOpen, menuItem]);

  // Variant handlers
  const handleAddVariantOption = () => {
    setVOptions([...vOptions, { name: "", price: 0, is_default: false }]);
  };

  const handleRemoveVariantOption = (idx: number) => {
    setVOptions(vOptions.filter((_, i) => i !== idx));
  };

  const handleCreateVariantGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuItem) return;
    if (!vgName.trim()) {
      toast.error("Group name required");
      return;
    }
    const validOpts = vOptions.filter((o) => o.name.trim());
    if (validOpts.length === 0) {
      toast.error("At least one option with name is required");
      return;
    }

    try {
      setSaving(true);
      await api.post(`/restaurant/menu-items/${menuItem.id}/variants`, {
        name: vgName.trim(),
        min_selection: vgRequired ? 1 : 0,
        max_selection: 1,
        is_required: vgRequired,
        sort_order: 1,
        options: validOpts.map((o, idx) => ({
          name: o.name.trim(),
          price: Number(o.price) || 0,
          selling_price: Number(o.price) || 0,
          is_default: idx === 0,
          sort_order: idx + 1,
        })),
      });
      toast.success(`Variant group "${vgName}" saved!`);
      loadData();
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to create variant group");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVariantGroup = async (groupId: number) => {
    if (!confirm("Are you sure you want to remove this variant group?")) return;
    try {
      await api.delete(`/restaurant/variants/groups/${groupId}`);
      toast.success("Variant group removed");
      loadData();
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete variant group");
    }
  };

  // Addon handlers
  const handleAddAddonOption = () => {
    setAOptions([...aOptions, { name: "", price: 0, is_available: true }]);
  };

  const handleRemoveAddonOption = (idx: number) => {
    setAOptions(aOptions.filter((_, i) => i !== idx));
  };

  const handleCreateAddonGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menuItem) return;
    if (!agName.trim()) {
      toast.error("Addon group name required");
      return;
    }
    const validOpts = aOptions.filter((o) => o.name.trim());
    if (validOpts.length === 0) {
      toast.error("At least one option with name is required");
      return;
    }

    try {
      setSaving(true);
      await api.post(`/restaurant/menu-items/${menuItem.id}/addons`, {
        name: agName.trim(),
        min_selection: Number(agMin) || 0,
        max_selection: Number(agMax) || 1,
        sort_order: 1,
        options: validOpts.map((o, idx) => ({
          name: o.name.trim(),
          price: Number(o.price) || 0,
          is_available: true,
          sort_order: idx + 1,
        })),
      });
      toast.success(`Addon group "${agName}" saved!`);
      loadData();
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to create addon group");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAddonGroup = async (groupId: number) => {
    if (!confirm("Are you sure you want to remove this addon group?")) return;
    try {
      await api.delete(`/restaurant/addons/groups/${groupId}`);
      toast.success("Addon group removed");
      loadData();
      onUpdated?.();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete addon group");
    }
  };

  if (!isOpen || !menuItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-card border border-border w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/40">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Layers size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Portion Sizes & Modifiers: {menuItem.name}
              </h2>
              <p className="text-xs text-muted-foreground font-mono">
                Item Code: {menuItem.item_code || `#${menuItem.id}`} | Base Price: ₹{menuItem.selling_price || menuItem.base_price}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-border bg-muted/20 px-6">
          <button
            onClick={() => setActiveTab("variants")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "variants"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers size={14} /> Portion Sizes ({variantGroups.length})
          </button>
          <button
            onClick={() => setActiveTab("addons")}
            className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === "addons"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles size={14} /> Add-ons & Modifiers ({addonGroups.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {activeTab === "variants" ? (
            <div className="space-y-5">
              {/* Existing Groups */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-foreground">Active Portion Sizes</div>
                {loading ? (
                  <div className="h-16 bg-muted/40 animate-pulse rounded-lg" />
                ) : variantGroups.length === 0 ? (
                  <div className="text-xs text-muted-foreground p-3 border border-dashed border-border rounded-lg text-center">
                    No portion size variants configured. The dish sells at its default price.
                  </div>
                ) : (
                  variantGroups.map((vg) => (
                    <div key={vg.id} className="p-3 border border-border rounded-lg bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                          <Layers size={13} className="text-primary" /> {vg.name}
                        </span>
                        <button
                          onClick={() => handleDeleteVariantGroup(vg.id)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors cursor-pointer border-none bg-transparent"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {vg.options.map((opt) => (
                          <div key={opt.id} className="p-2 border border-border bg-card rounded flex justify-between items-center text-xs">
                            <span className="font-medium">{opt.name}</span>
                            <span className="font-mono font-bold text-primary">₹{opt.selling_price || opt.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Variant Group Form */}
              <form onSubmit={handleCreateVariantGroup} className="p-4 border border-border rounded-lg bg-card space-y-3">
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Plus size={14} className="text-primary" /> Add New Portion Variant Group
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">Group Name</label>
                    <Input
                      value={vgName}
                      onChange={(e) => setVgName(e.target.value)}
                      placeholder="e.g. Size, Half/Full"
                      className="text-xs h-8"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-5">
                    <input
                      type="checkbox"
                      id="vgReq"
                      checked={vgRequired}
                      onChange={(e) => setVgRequired(e.target.checked)}
                      className="cursor-pointer"
                    />
                    <label htmlFor="vgReq" className="text-xs font-medium cursor-pointer">
                      Required Selection (Cashier must pick a size)
                    </label>
                  </div>
                </div>

                {/* Options List */}
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-semibold uppercase text-muted-foreground">Options & Prices:</div>
                  {vOptions.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder="Option name (e.g. Small, Half)"
                        value={opt.name}
                        onChange={(e) => {
                          const updated = [...vOptions];
                          updated[idx].name = e.target.value;
                          setVOptions(updated);
                        }}
                        className="text-xs h-8 flex-1"
                      />
                      <div className="flex items-center gap-1 w-28">
                        <span className="text-xs text-muted-foreground">₹</span>
                        <Input
                          type="number"
                          placeholder="Price"
                          value={opt.price}
                          onChange={(e) => {
                            const updated = [...vOptions];
                            updated[idx].price = Number(e.target.value);
                            setVOptions(updated);
                          }}
                          className="text-xs h-8 font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveVariantOption(idx)}
                        className="p-1 text-muted-foreground hover:text-destructive cursor-pointer border-none bg-transparent"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddVariantOption}
                    className="text-xs gap-1 h-7 cursor-pointer"
                  >
                    <Plus size={12} /> Add Size Option
                  </Button>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" size="sm" disabled={saving} className="text-xs gap-1 cursor-pointer">
                    <CheckCircle2 size={13} /> Save Portion Group
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Existing Add-on Groups */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-foreground">Active Add-on Groups</div>
                {loading ? (
                  <div className="h-16 bg-muted/40 animate-pulse rounded-lg" />
                ) : addonGroups.length === 0 ? (
                  <div className="text-xs text-muted-foreground p-3 border border-dashed border-border rounded-lg text-center">
                    No custom modifiers/addons configured for this dish.
                  </div>
                ) : (
                  addonGroups.map((ag) => (
                    <div key={ag.id} className="p-3 border border-border rounded-lg bg-muted/20 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                          <Sparkles size={13} className="text-primary" /> {ag.name} (Max {ag.max_selection})
                        </span>
                        <button
                          onClick={() => handleDeleteAddonGroup(ag.id)}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors cursor-pointer border-none bg-transparent"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {ag.options.map((opt) => (
                          <div key={opt.id} className="p-2 border border-border bg-card rounded flex justify-between items-center text-xs">
                            <span className="font-medium">{opt.name}</span>
                            <span className="font-mono font-bold text-primary">+₹{opt.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Addon Group Form */}
              <form onSubmit={handleCreateAddonGroup} className="p-4 border border-border rounded-lg bg-card space-y-3">
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Plus size={14} className="text-primary" /> Add New Addon / Modifier Group
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">Group Name</label>
                    <Input
                      value={agName}
                      onChange={(e) => setAgName(e.target.value)}
                      placeholder="e.g. Extra Cheese, Dips"
                      className="text-xs h-8"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">Min Selection</label>
                    <Input
                      type="number"
                      value={agMin}
                      onChange={(e) => setAgMin(Number(e.target.value))}
                      className="text-xs h-8 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-muted-foreground">Max Selection</label>
                    <Input
                      type="number"
                      value={agMax}
                      onChange={(e) => setAgMax(Number(e.target.value))}
                      className="text-xs h-8 font-mono"
                    />
                  </div>
                </div>

                {/* Options List */}
                <div className="space-y-2 pt-2">
                  <div className="text-[11px] font-semibold uppercase text-muted-foreground">Addon Items:</div>
                  {aOptions.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input
                        placeholder="Addon name (e.g. Peri Peri Spice)"
                        value={opt.name}
                        onChange={(e) => {
                          const updated = [...aOptions];
                          updated[idx].name = e.target.value;
                          setAOptions(updated);
                        }}
                        className="text-xs h-8 flex-1"
                      />
                      <div className="flex items-center gap-1 w-28">
                        <span className="text-xs text-muted-foreground">+₹</span>
                        <Input
                          type="number"
                          placeholder="Price"
                          value={opt.price}
                          onChange={(e) => {
                            const updated = [...aOptions];
                            updated[idx].price = Number(e.target.value);
                            setAOptions(updated);
                          }}
                          className="text-xs h-8 font-mono"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAddonOption(idx)}
                        className="p-1 text-muted-foreground hover:text-destructive cursor-pointer border-none bg-transparent"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleAddAddonOption}
                    className="text-xs gap-1 h-7 cursor-pointer"
                  >
                    <Plus size={12} /> Add Addon Option
                  </Button>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button type="submit" size="sm" disabled={saving} className="text-xs gap-1 cursor-pointer">
                    <CheckCircle2 size={13} /> Save Modifier Group
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-muted/20 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs cursor-pointer">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
