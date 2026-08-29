import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Check, Sparkles } from "lucide-react";
import type { MenuItem, VariantGroup, VariantOption, AddonGroup, AddonOption } from "@/data/mockMenu";
import { getVariantDisplayPrice } from "@/data/mockMenu";
import type { CartItemVariant, CartItemAddon } from "@/stores/cartStore";
import { cn } from "@/lib/utils";

interface ItemDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, variants?: CartItemVariant[], addons?: CartItemAddon[]) => void;
}

interface CustomAddonOption extends AddonOption {
  variant_prices?: Record<string, number>;
  variantPrices?: Record<string, number>;
  price_by_size?: Record<string, number>;
}

const ItemDetailModal = ({ item, onClose, onAddToCart }: ItemDetailModalProps) => {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, VariantOption>>({});
  const [selectedAddons, setSelectedAddons] = useState<Record<string, AddonOption[]>>({});
  const [qty, setQty] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      const initialVariants: Record<string, VariantOption> = {};
      (item.variantGroups || []).forEach((g) => {
        if (g.options && g.options.length > 0) {
          const defaultOpt = g.options.find((o) => o.isDefault) || g.options[0];
          initialVariants[g.id] = defaultOpt;
        }
      });
      setSelectedVariants(initialVariants);
      setSelectedAddons({});
      setQty(1);
      setValidationError(null);
    }
  }, [item]);

  const getSelectedSizeName = () => {
    const sizeOption = Object.values(selectedVariants)[0];
    return sizeOption ? sizeOption.name : null;
  };

  const getAddonEffectivePrice = (addon: CustomAddonOption) => {
    const sizeName = getSelectedSizeName();
    const vp = addon.variant_prices || addon.variantPrices;
    if (sizeName && vp && typeof vp === "object" && vp[sizeName] !== undefined) {
      return Number(vp[sizeName]);
    }
    if (sizeName && addon.price_by_size && addon.price_by_size[sizeName] !== undefined) {
      return Number(addon.price_by_size[sizeName]);
    }
    return Number(addon.price || 0);
  };

  if (!item) return null;

  const selectedVariantList = Object.values(selectedVariants);
  const selectedVariant = selectedVariantList.length > 0 ? selectedVariantList[0] : null;
  const baseCost = selectedVariant ? getVariantDisplayPrice(item.basePrice, selectedVariant) : item.basePrice;
  const addonsTotal = Object.values(selectedAddons).flat().reduce((s, a) => s + getAddonEffectivePrice(a), 0);
  const total = (baseCost + addonsTotal) * qty;

  const selectVariant = (group: VariantGroup, option: VariantOption) => {
    setSelectedVariants((prev) => ({ ...prev, [group.id]: option }));
    setValidationError(null);
  };

  const toggleAddon = (group: AddonGroup, option: AddonOption) => {
    setSelectedAddons((prev) => {
      const current = prev[group.id] || [];
      const exists = current.find((a) => a.id === option.id || a.name === option.name);
      if (exists) {
        return { ...prev, [group.id]: current.filter((a) => a.id !== option.id && a.name !== option.name) };
      }
      if (current.length >= (group.maxSelection || 5)) {
        return { ...prev, [group.id]: [...current.slice(1), option] };
      }
      return { ...prev, [group.id]: [...current, option] };
    });
  };

  const handleAdd = () => {
    const requiredGroups = (item.variantGroups || []).filter((g) => g.isRequired);
    for (const group of requiredGroups) {
      if (!selectedVariants[group.id]) {
        setValidationError(`Please select ${group.name}`);
        return;
      }
    }

    const variants: CartItemVariant[] = Object.entries(selectedVariants).map(([groupId, option]) => {
      const group = item.variantGroups?.find((g) => g.id === groupId);
      return { groupId, groupName: group?.name || "", option };
    });

    const addons: CartItemAddon[] = Object.entries(selectedAddons).flatMap(([groupId, options]) => {
      const group = item.addonGroups?.find((g) => g.id === groupId);
      return options.map((option) => ({ groupId, groupName: group?.name || "", option }));
    });

    for (let i = 0; i < qty; i++) {
      onAddToCart(item, variants, addons);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 350 }}
          className="bg-card text-card-foreground border border-border/80 rounded-2xl md:rounded-3xl w-full max-w-lg p-4 sm:p-5 shadow-2xl overflow-hidden space-y-3.5"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-md border tracking-wider", item.isVeg !== false ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30" : "bg-rose-500/10 text-rose-600 border-rose-500/30")}>
                  {item.isVeg !== false ? "VEG" : "NON-VEG"}
                </span>
                <h2 className="font-display text-base sm:text-lg font-bold text-foreground">{item.name}</h2>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-1">{item.description || "Freshly prepared dining item"}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Portion / Size Variant Groups */}
          {item.variantGroups && item.variantGroups.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block font-mono">
                1. Select Size / Portion ({item.variantGroups[0].name})
              </span>
              <div className="grid grid-cols-3 gap-2">
                {item.variantGroups[0].options
                  .sort((a, b) => (a.sortOrder || 1) - (b.sortOrder || 1))
                  .map((option, idx) => {
                    const isSelected = selectedVariants[item.variantGroups![0].id]?.id === option.id || selectedVariants[item.variantGroups![0].id]?.name === option.name;
                    const price = getVariantDisplayPrice(item.basePrice, option);
                    return (
                      <button
                        key={option.id || option.name}
                        type="button"
                        onClick={() => selectVariant(item.variantGroups![0], option)}
                        className={cn(
                          "flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer relative",
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary shadow-sm scale-[1.02]"
                            : "bg-muted/30 border-border text-foreground hover:border-primary/40 hover:bg-muted/50"
                        )}
                      >
                        <span className="text-xs truncate w-full text-center">{option.name}</span>
                        <span className={cn("font-mono text-xs mt-0.5 font-bold", isSelected ? "text-primary-foreground" : "text-primary")}>
                          ₹{price}
                        </span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Size-Linked Addon Groups */}
          {item.addonGroups && item.addonGroups.length > 0 && (
            <div className="space-y-1.5 pt-1.5 border-t border-border/60">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block font-mono">
                2. Select Extra Addons
              </span>
              {item.addonGroups.map((group) => (
                <div key={group.id} className="space-y-1.5">
                  <div className="grid grid-cols-2 gap-2">
                    {(group.options || []).map((option) => {
                      const groupAddons = selectedAddons[group.id] || [];
                      const isSelected = groupAddons.some((a) => a.id === option.id || a.name === option.name);
                      const dynamicPrice = getAddonEffectivePrice(option);
                      return (
                        <button
                          key={option.id || option.name}
                          type="button"
                          onClick={() => toggleAddon(group, option)}
                          className={cn(
                            "flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer",
                            isSelected
                              ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                              : "bg-muted/30 border-border text-foreground hover:border-emerald-500/40 hover:bg-muted/50"
                          )}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span className={cn("w-4 h-4 rounded flex items-center justify-center border text-[10px]", isSelected ? "bg-emerald-500 border-emerald-500 text-white" : "border-border bg-background")}>
                              {isSelected && <Check className="w-3 h-3" />}
                            </span>
                            <span className="truncate text-xs">{option.name}</span>
                          </span>
                          <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0 ml-1">
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

          {/* Validation error */}
          {validationError && (
            <p className="text-xs text-destructive font-medium">{validationError}</p>
          )}

          {/* Quantity & Order Action Footer */}
          <div className="pt-2 border-t border-border/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 bg-muted/60 border border-border/80 rounded-xl p-1">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition text-foreground cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono font-bold text-sm w-6 text-center text-foreground">{qty}</span>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-background transition text-foreground cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleAdd}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
            >
              <Sparkles size={14} />
              <span>Add to Order · ₹{total}</span>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ItemDetailModal;
