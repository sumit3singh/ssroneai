import React from "react";
import { Layers, Trash2, Plus } from "lucide-react";
import { Input } from "@/shared/ui/primitives/Input";
import { Button } from "@/shared/ui/primitives/Button";

export interface VariantOption {
  id: number | string;
  name: string;
  sellingPrice: number;
  price?: number;
  sortOrder: number;
}

export interface VariantGroup {
  id: number | string;
  name: string;
  isRequired: boolean;
  maxSelection: number;
  options: VariantOption[];
}

interface VariantEditorProps {
  variantGroups: VariantGroup[];
  defaultBasePrice: number;
  onChange: (groups: VariantGroup[]) => void;
}

export const VariantEditor: React.FC<VariantEditorProps> = ({
  variantGroups,
  defaultBasePrice,
  onChange
}) => {
  const handleAddGroup = () => {
    const newGroup: VariantGroup = {
      id: `vg-${Date.now()}`,
      name: "Choose Size / Portion",
      isRequired: true,
      maxSelection: 1,
      options: [
        {
          id: `vo-${Date.now()}-1`,
          name: "Small",
          sellingPrice: defaultBasePrice > 0 ? defaultBasePrice : 200,
          price: defaultBasePrice > 0 ? defaultBasePrice : 200,
          sortOrder: 1
        },
        {
          id: `vo-${Date.now()}-2`,
          name: "Medium",
          sellingPrice: defaultBasePrice > 0 ? defaultBasePrice + 50 : 250,
          price: defaultBasePrice > 0 ? defaultBasePrice + 50 : 250,
          sortOrder: 2
        },
        {
          id: `vo-${Date.now()}-3`,
          name: "Large",
          sellingPrice: defaultBasePrice > 0 ? defaultBasePrice + 100 : 300,
          price: defaultBasePrice > 0 ? defaultBasePrice + 100 : 300,
          sortOrder: 3
        }
      ]
    };
    onChange([...variantGroups, newGroup]);
  };

  const handleRemoveGroup = (gIdx: number) => {
    onChange(variantGroups.filter((_, idx) => idx !== gIdx));
  };

  const handleUpdateGroupName = (gIdx: number, name: string) => {
    onChange(
      variantGroups.map((vg, idx) => (idx === gIdx ? { ...vg, name } : vg))
    );
  };

  const handleToggleRequired = (gIdx: number, isRequired: boolean) => {
    onChange(
      variantGroups.map((vg, idx) => (idx === gIdx ? { ...vg, isRequired } : vg))
    );
  };

  const handleAddOption = (gIdx: number) => {
    onChange(
      variantGroups.map((vg, idx) => {
        if (idx !== gIdx) return vg;
        const newOpt: VariantOption = {
          id: `vo-${Date.now()}-${Math.random().toString().slice(-4)}`,
          name: "New Portion Option",
          sellingPrice: defaultBasePrice > 0 ? defaultBasePrice : 150,
          price: defaultBasePrice > 0 ? defaultBasePrice : 150,
          sortOrder: vg.options.length + 1
        };
        return { ...vg, options: [...vg.options, newOpt] };
      })
    );
  };

  const handleUpdateOption = (gIdx: number, oIdx: number, field: "name" | "sellingPrice", value: any) => {
    onChange(
      variantGroups.map((vg, idx) => {
        if (idx !== gIdx) return vg;
        const updatedOpts = vg.options.map((opt, oKey) => {
          if (oKey !== oIdx) return opt;
          if (field === "sellingPrice") {
            const numVal = parseFloat(value) || 0;
            return { ...opt, sellingPrice: numVal, price: numVal };
          }
          return { ...opt, [field]: value };
        });
        return { ...vg, options: updatedOpts };
      })
    );
  };

  const handleRemoveOption = (gIdx: number, oIdx: number) => {
    onChange(
      variantGroups.map((vg, idx) => {
        if (idx !== gIdx) return vg;
        return { ...vg, options: vg.options.filter((_, oKey) => oKey !== oIdx) };
      })
    );
  };

  return (
    <div className="bg-muted/20 border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        <div>
          <h3 className="font-display font-extrabold text-sm text-foreground uppercase tracking-wider flex items-center gap-2">
            <Layers size={16} className="text-primary" />
            Portion / Size Variant Groups
          </h3>
          <p className="text-3xs text-muted-foreground mt-0.5">
            Absolute selling prices (e.g. Small = ₹200, Medium = ₹250, Large = ₹300)
          </p>
        </div>
        <Button
          type="button"
          onClick={handleAddGroup}
          className="text-white bg-primary hover:bg-primary/90 text-2xs px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider"
        >
          + Add Variant Group
        </Button>
      </div>

      {variantGroups.length === 0 ? (
        <div className="p-6 text-center border-2 border-dashed border-border rounded-xl">
          <p className="text-xs text-muted-foreground font-semibold">
            No variant groups defined. Item will be sold at flat base price.
          </p>
        </div>
      ) : (
        variantGroups.map((vg, gIdx) => (
          <div key={vg.id || gIdx} className="bg-card border border-border rounded-xl p-4 space-y-3 relative shadow-card">
            <button
              type="button"
              onClick={() => handleRemoveGroup(gIdx)}
              className="absolute top-3 right-3 text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50"
            >
              <Trash2 size={15} />
            </button>

            <div className="grid grid-cols-2 gap-4 max-w-[85%]">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-muted-foreground">Variant Group Title</label>
                <Input
                  value={vg.name}
                  onChange={(e) => handleUpdateGroupName(gIdx, e.target.value)}
                  placeholder="e.g. Choose Size / Portion"
                  className="h-9 text-xs font-bold"
                />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <label className="flex items-center gap-2 font-bold text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={vg.isRequired}
                    onChange={(e) => handleToggleRequired(gIdx, e.target.checked)}
                    className="rounded text-primary focus:ring-primary h-3.5 w-3.5"
                  />
                  Mandatory Selection
                </label>
              </div>
            </div>

            {/* Variant Options Grid */}
            <div className="space-y-2.5 pl-4 border-l-2 border-primary/40 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-2xs font-extrabold text-foreground uppercase tracking-wider">
                  Portion Options & Selling Prices (₹)
                </span>
                <button
                  type="button"
                  onClick={() => handleAddOption(gIdx)}
                  className="text-primary hover:underline text-2xs font-bold uppercase tracking-wider bg-transparent border-none cursor-pointer flex items-center gap-1"
                >
                  <Plus size={12} /> Add Option
                </button>
              </div>

              <div className="space-y-2">
                {vg.options.map((opt, oIdx) => (
                  <div key={opt.id || oIdx} className="flex items-center gap-3 bg-muted/30 p-2 rounded-xl border border-border/60">
                    <Input
                      value={opt.name}
                      onChange={(e) => handleUpdateOption(gIdx, oIdx, "name", e.target.value)}
                      placeholder="e.g. Small / Medium / Large"
                      className="h-8 text-xs flex-1 font-bold"
                    />
                    <div className="relative w-36">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">₹</span>
                      <input
                        type="number"
                        value={opt.sellingPrice ?? opt.price ?? 0}
                        onChange={(e) => handleUpdateOption(gIdx, oIdx, "sellingPrice", e.target.value)}
                        placeholder="Selling Price"
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
