import React from "react";
import { ChefHat, Sparkles } from "lucide-react";
import { Button } from "@ssrone/ui";
import { POSMenuItem } from "../../types";

interface POSVariantAddonModalProps {
  selectedItem: POSMenuItem;
  selectedVariantOption: any;
  setSelectedVariantOption: (option: any) => void;
  selectedAddonOptions: any[];
  toggleAddonSelection: (addon: any) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

export const POSVariantAddonModal: React.FC<POSVariantAddonModalProps> = ({
  selectedItem,
  selectedVariantOption,
  setSelectedVariantOption,
  selectedAddonOptions,
  toggleAddonSelection,
  onCancel,
  onConfirm
}) => {
  const basePrice = selectedVariantOption
    ? Number(selectedVariantOption.sellingPrice ?? selectedVariantOption.price ?? selectedItem.base_price)
    : Number(selectedItem.selling_price || selectedItem.base_price);

  // Function to resolve price of an addon based on the selected size variant
  const getAddonPrice = (addonOpt: any): number => {
    if (selectedVariantOption && selectedVariantOption.name) {
      const variantName = selectedVariantOption.name;
      const vp = addonOpt.variantPrices || addonOpt.variant_prices;
      if (vp && typeof vp === "object" && vp[variantName] !== undefined) {
        return Number(vp[variantName]);
      }
    }
    return Number(addonOpt.price || 0);
  };

  const addonsPrice = selectedAddonOptions.reduce((sum, a) => sum + getAddonPrice(a), 0);
  const totalPrice = basePrice + addonsPrice;

  // Keyboard Listener for Ultra-Fast POS Customization (1, 2, 3, Enter, Esc)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        onConfirm();
        return;
      }
      const num = parseInt(e.key, 10);
      if (
        !isNaN(num) &&
        num >= 1 &&
        selectedItem.variant_groups &&
        selectedItem.variant_groups[0]?.options?.[num - 1]
      ) {
        setSelectedVariantOption(selectedItem.variant_groups[0].options[num - 1]);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedItem, onCancel, onConfirm, setSelectedVariantOption]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-150">
      <div className="bg-card text-foreground border border-border rounded-lg w-full max-w-lg p-4 space-y-3 shadow-md max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-150">
        {/* Header */}
        <div className="border-b border-border pb-2 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-xs md:text-sm text-foreground flex items-center gap-1.5">
              <ChefHat className="text-primary" size={16} /> Quick Customize: {selectedItem.name}
            </h3>
            <p className="text-[10px] text-muted-foreground font-mono">Use keys [1,2,3] for size, [Enter] to add, [Esc] to cancel</p>
          </div>
          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-sm ${selectedItem.is_veg ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border border-rose-500/20"}`}>
            {selectedItem.is_veg ? "VEG" : "NON-VEG"}
          </span>
        </div>

        {/* Size / Portion Variants */}
        {selectedItem.variant_groups && selectedItem.variant_groups.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-muted-foreground block">
              1. Select Size / Portion ({selectedItem.variant_groups[0].name})
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {selectedItem.variant_groups[0].options.map((opt: any, idx: number) => {
                const isSelected = selectedVariantOption?.id === opt.id || selectedVariantOption?.name === opt.name;
                const price = opt.sellingPrice ?? opt.price ?? 0;
                return (
                  <button
                    key={opt.id || opt.name || idx}
                    type="button"
                    onClick={() => setSelectedVariantOption(opt)}
                    className={`flex flex-col items-center justify-between p-2 rounded-md border text-xs font-semibold transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-2xs scale-[1.01]"
                        : "bg-muted/30 border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="absolute top-1 left-1.5 text-[9px] font-mono opacity-60 font-bold">[{idx + 1}]</span>
                    <span className="mt-2 text-xs truncate w-full text-center">{opt.name}</span>
                    <span className={`font-mono font-bold text-xs mt-0.5 ${isSelected ? "text-primary-foreground" : "text-primary"}`}>₹{price}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Size-Linked Addon Groups */}
        {selectedItem.addon_groups && selectedItem.addon_groups.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-border">
            <span className="text-[10px] font-bold uppercase font-mono tracking-wider text-muted-foreground block">
              2. Select Extra Addons
            </span>
            {selectedItem.addon_groups.map((ag: any) => (
              <div key={ag.id || ag.name} className="space-y-1">
                <span className="text-xs font-semibold text-foreground block">{ag.name}</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {ag.options.map((opt: any) => {
                    const isSelected = selectedAddonOptions.some((a) => a.id === opt.id || a.name === opt.name);
                    const dynamicPrice = getAddonPrice(opt);
                    return (
                      <button
                        key={opt.id || opt.name}
                        type="button"
                        onClick={() => toggleAddonSelection({ ...opt, calculatedPrice: dynamicPrice })}
                        className={`flex items-center justify-between p-2 rounded-md border text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-300"
                            : "bg-muted/30 border-border text-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="w-3.5 h-3.5 rounded accent-amber-500"
                          />
                          <span className="truncate">{opt.name}</span>
                        </span>
                        <span className="font-mono font-bold text-[10px] text-amber-600 dark:text-amber-400">
                          +₹{dynamicPrice}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total Price Summary & Confirm Button */}
        <div className="pt-2 border-t border-border flex items-center justify-between gap-3">
          <div>
            <span className="text-[9px] text-muted-foreground uppercase font-mono font-bold block">Total Price</span>
            <span className="font-mono font-bold text-base text-foreground">₹{totalPrice}</span>
          </div>

          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" onClick={onCancel} className="h-8 text-xs">
              Cancel [Esc]
            </Button>
            <Button variant="primary" size="sm" onClick={onConfirm} className="h-8 text-xs font-bold gap-1">
              <span>Add to Cart</span>
              <span className="px-1 py-0.2 rounded-xs bg-white/20 font-mono text-[9px]">↵ Enter</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
