import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/shared/ui/primitives/Input";
import { Button } from "@/shared/ui/primitives/Button";

export interface AddonOption {
  id: number | string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface AddonGroup {
  id: number | string;
  name: string;
  isRequired: boolean;
  maxSelection: number;
  options: AddonOption[];
}

interface AddonEditorProps {
  addonGroups: AddonGroup[];
  onChange: (groups: AddonGroup[]) => void;
}

export const AddonEditor: React.FC<AddonEditorProps> = ({ addonGroups, onChange }) => {
  const handleAddGroup = () => {
    const newGroup: AddonGroup = {
      id: `ag-${Date.now()}`,
      name: "Add Extra Toppings",
      isRequired: false,
      maxSelection: 5,
      options: [{ id: `ao-${Date.now()}`, name: "Extra Cheese", price: 60, isAvailable: true }]
    };
    onChange([...addonGroups, newGroup]);
  };

  const handleRemoveGroup = (gIdx: number) => {
    onChange(addonGroups.filter((_, idx) => idx !== gIdx));
  };

  const handleUpdateGroupName = (gIdx: number, name: string) => {
    onChange(
      addonGroups.map((ag, idx) => (idx === gIdx ? { ...ag, name } : ag))
    );
  };

  const handleAddOption = (gIdx: number) => {
    onChange(
      addonGroups.map((ag, idx) => {
        if (idx !== gIdx) return ag;
        const newOpt: AddonOption = {
          id: `ao-${Date.now()}-${Math.random().toString().slice(-4)}`,
          name: "New Addon Option",
          price: 30,
          isAvailable: true
        };
        return { ...ag, options: [...ag.options, newOpt] };
      })
    );
  };

  const handleUpdateOption = (gIdx: number, oIdx: number, field: string, value: any) => {
    onChange(
      addonGroups.map((ag, idx) => {
        if (idx !== gIdx) return ag;
        const updatedOpts = ag.options.map((opt, oKey) => {
          if (oKey !== oIdx) return opt;
          if (field === "price") {
            return { ...opt, price: parseFloat(value) || 0 };
          }
          return { ...opt, [field]: value };
        });
        return { ...ag, options: updatedOpts };
      })
    );
  };

  const handleRemoveOption = (gIdx: number, oIdx: number) => {
    onChange(
      addonGroups.map((ag, idx) => {
        if (idx !== gIdx) return ag;
        return { ...ag, options: ag.options.filter((_, oKey) => oKey !== oIdx) };
      })
    );
  };

  return (
    <div className="bg-muted/20 border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div>
          <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
            <Plus size={16} className="text-primary" />
            Addon Groups & Extra Customizations
          </h3>
          <p className="text-3xs text-muted-foreground mt-0.5">
            Configure extra toppings, dips, and side add-ons
          </p>
        </div>
        <Button
          type="button"
          onClick={handleAddGroup}
          className="text-white bg-primary hover:bg-primary/90 text-2xs px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider"
        >
          + Add Addon Group
        </Button>
      </div>

      {addonGroups.length === 0 ? (
        <div className="p-6 text-center border-2 border-dashed border-border rounded-xl">
          <p className="text-xs text-muted-foreground font-semibold">
            No addon groups configured for this item.
          </p>
        </div>
      ) : (
        addonGroups.map((ag, gIdx) => (
          <div key={ag.id || gIdx} className="bg-card border border-border rounded-xl p-4 space-y-4 relative shadow-card">
            <button
              type="button"
              onClick={() => handleRemoveGroup(gIdx)}
              className="absolute top-3 right-3 text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"
            >
              <Trash2 size={15} />
            </button>

            <div className="grid grid-cols-2 gap-4 max-w-[85%]">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Addon Group Title</label>
                <Input
                  value={ag.name}
                  onChange={(e) => handleUpdateGroupName(gIdx, e.target.value)}
                  placeholder="e.g. Extra Toppings & Dips"
                  className="h-9 text-xs font-bold"
                />
              </div>
            </div>

            <div className="space-y-2.5 pl-4 border-l-2 border-primary/40 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-extrabold text-foreground uppercase tracking-wider">
                  Addon Options & Additional Prices (₹)
                </span>
                <button
                  type="button"
                  onClick={() => handleAddOption(gIdx)}
                  className="text-primary hover:underline text-2xs font-bold uppercase tracking-wider bg-transparent border-none cursor-pointer flex items-center gap-1"
                >
                  <Plus size={12} /> Add Addon Option
                </button>
              </div>

              <div className="space-y-2">
                {ag.options.map((opt, oIdx) => (
                  <div key={opt.id || oIdx} className="flex items-center gap-3 bg-muted/30 p-2 rounded-xl border border-border/60">
                    <Input
                      value={opt.name}
                      onChange={(e) => handleUpdateOption(gIdx, oIdx, "name", e.target.value)}
                      placeholder="e.g. Cheese Dip / Extra Paneer"
                      className="h-8 text-xs flex-1 font-bold"
                    />
                    <div className="relative w-32">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={opt.price}
                        onChange={(e) => handleUpdateOption(gIdx, oIdx, "price", e.target.value)}
                        placeholder="Addon Price"
                        className="w-full bg-background border border-border rounded-lg pl-6 pr-2 py-1 text-xs focus:ring-1 focus:ring-primary focus:outline-none font-bold h-8"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(gIdx, oIdx)}
                      className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};
