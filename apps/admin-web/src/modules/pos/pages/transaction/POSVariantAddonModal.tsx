import React from "react";
import { ChefHat, Sparkles, X, Check, Keyboard } from "lucide-react";
import { Button } from "@ssrone/ui";
import { POSMenuItem, getParsedVariantGroups, getParsedAddonGroups } from "../../types";

interface POSVariantAddonModalProps {
  selectedItem: POSMenuItem;
  selectedVariantOption?: any;
  setSelectedVariantOption?: (option: any) => void;
  selectedAddonOptions: any[];
  toggleAddonSelection: (addon: any) => void;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  confirmLabel?: string;
}

export const POSVariantAddonModal: React.FC<POSVariantAddonModalProps> = ({
  selectedItem,
  selectedVariantOption,
  setSelectedVariantOption,
  selectedAddonOptions,
  toggleAddonSelection,
  onCancel,
  onConfirm,
  title,
  confirmLabel = "Apply Addons"
}) => {
  const variantGroups = React.useMemo(() => getParsedVariantGroups(selectedItem), [selectedItem]);
  const addonGroups = React.useMemo(() => getParsedAddonGroups(selectedItem), [selectedItem]);

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

  const mountTimeRef = React.useRef<number>(Date.now());
  const lastConfirmTimeRef = React.useRef<number>(0);

  const handleSafeConfirm = React.useCallback(() => {
    const now = Date.now();
    if (now - lastConfirmTimeRef.current < 250) {
      return;
    }
    lastConfirmTimeRef.current = now;
    onConfirm();
  }, [onConfirm]);

  // Keyboard Listener for Ultra-Fast POS Customization (1, 2, 3 for size, A, B, C for addons, Enter, Esc)
  React.useEffect(() => {
    mountTimeRef.current = Date.now();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent bleeding of the search input's Enter key into modal confirmation on mount
      if (Date.now() - mountTimeRef.current < 200) {
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        handleSafeConfirm();
        return;
      }

      // Handle number keys 1..9 for Size Variants
      const num = parseInt(e.key, 10);
      if (
        setSelectedVariantOption &&
        !isNaN(num) &&
        num >= 1 &&
        variantGroups.length > 0 &&
        variantGroups[0]?.options?.[num - 1]
      ) {
        e.preventDefault();
        e.stopPropagation();
        setSelectedVariantOption(variantGroups[0].options[num - 1]);
        return;
      }

      // Handle letter keys A..Z for Extra Addons
      if (e.key.length === 1 && addonGroups.length > 0) {
        const charCode = e.key.toUpperCase().charCodeAt(0);
        if (charCode >= 65 && charCode <= 90) {
          const index = charCode - 65; // A=0, B=1, C=2...
          const allAddonOptions = addonGroups.flatMap((ag: any) => ag.options || []);
          if (allAddonOptions[index]) {
            e.preventDefault();
            e.stopPropagation();
            const targetAddon = allAddonOptions[index];
            const dynamicPrice = getAddonPrice(targetAddon);
            toggleAddonSelection({ ...targetAddon, calculatedPrice: dynamicPrice });
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [selectedItem, variantGroups, addonGroups, onCancel, onConfirm, setSelectedVariantOption, selectedAddonOptions, toggleAddonSelection]);

  // Flatten all addon options across groups for letter badge mapping [A], [B], [C]
  const allFlatAddonOptions = React.useMemo(() => {
    return addonGroups.flatMap((ag: any) => ag.options || []);
  }, [addonGroups]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 space-y-4 shadow-2xl max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-primary/10 border border-primary/20 text-primary">
              <ChefHat size={20} />
            </div>
            <div>
              <h3 className="font-display font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                {title || `Customize Addons: ${selectedItem.name}`}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                <Keyboard size={11} /> Keys <kbd className="px-1 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">A, B, C</kbd> for addons, <kbd className="px-1 py-0.2 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700">Enter</kbd> to save
              </p>
            </div>
          </div>
          <span className={`text-[9px] font-mono font-black px-2 py-0.5 rounded-full border ${selectedItem.is_veg ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"}`}>
            {selectedItem.is_veg ? "VEG" : "NON-VEG"}
          </span>
        </div>

        {/* Selected Size Badge if size is already set */}
        {selectedVariantOption && (
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Base Portion / Size:</span>
            <span className="text-xs font-mono font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
              {selectedVariantOption.name} • ₹{basePrice}
            </span>
          </div>
        )}

        {/* Size / Portion Variants (Only shown if selectable) */}
        {setSelectedVariantOption && variantGroups.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 block">
              1. Select Size / Portion ({variantGroups[0].name})
            </span>
            <div className="grid grid-cols-3 gap-2">
              {variantGroups[0].options.map((opt: any, idx: number) => {
                const isSelected = selectedVariantOption?.id === opt.id || selectedVariantOption?.name === opt.name;
                const price = opt.sellingPrice ?? opt.price ?? 0;
                return (
                  <button
                    key={opt.id || opt.name || idx}
                    type="button"
                    onClick={() => setSelectedVariantOption(opt)}
                    className={`flex flex-col items-center justify-between p-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-primary text-primary-foreground border-primary shadow-md scale-[1.02]"
                        : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span className="absolute top-1.5 left-2 text-[9px] font-mono opacity-60 font-bold">[{idx + 1}]</span>
                    <span className="mt-2 text-xs font-bold truncate w-full text-center">{opt.name}</span>
                    <span className={`font-mono font-black text-xs mt-1 ${isSelected ? "text-primary-foreground" : "text-primary"}`}>₹{price}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Size-Linked Addon Groups */}
        {addonGroups.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-black uppercase font-mono tracking-wider text-slate-500 dark:text-slate-400 block">
              {setSelectedVariantOption ? "2. Select Extra Addons (Press A, B, C keys)" : "Select Extra Addons (Press A, B, C keys)"}
            </span>
            {addonGroups.map((ag: any) => (
              <div key={ag.id || ag.name} className="space-y-1.5">
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 block">{ag.name}</span>
                <div className="grid grid-cols-2 gap-2">
                  {ag.options.map((opt: any) => {
                    const isSelected = selectedAddonOptions.some((a) => a.id === opt.id || a.name === opt.name);
                    const dynamicPrice = getAddonPrice(opt);
                    const flatIdx = allFlatAddonOptions.findIndex((o: any) => (o.id || o.name) === (opt.id || opt.name));
                    const letterTag = flatIdx >= 0 && flatIdx < 26 ? String.fromCharCode(65 + flatIdx) : null;

                    return (
                      <button
                        key={opt.id || opt.name}
                        type="button"
                        onClick={() => toggleAddonSelection({ ...opt, calculatedPrice: dynamicPrice })}
                        className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer relative ${
                          isSelected
                            ? "bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-300 shadow-2xs"
                            : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span className="flex items-center gap-2 truncate">
                          {letterTag && (
                            <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                              [{letterTag}]
                            </span>
                          )}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                          />
                          <span className="truncate font-bold">{opt.name}</span>
                        </span>
                        <span className="font-mono font-black text-2xs text-amber-600 dark:text-amber-400">
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
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-mono font-bold block">Total Customized Price</span>
            <span className="font-mono font-black text-xl text-slate-900 dark:text-white">₹{totalPrice}</span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel [Esc]
            </button>
            <Button variant="primary" size="sm" onClick={handleSafeConfirm} className="h-9 px-4 text-xs font-bold gap-1.5 rounded-xl cursor-pointer">
              <span>{confirmLabel}</span>
              <span className="px-1.5 py-0.2 rounded bg-white/20 font-mono text-[9px]">↵ Enter</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
