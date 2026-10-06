import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Check } from "lucide-react";
import type { MenuItem, VariantGroup, VariantOption, AddonGroup, AddonOption } from "@/data/mockMenu";
import { getVariantDisplayPrice } from "@/data/mockMenu";
import type { CartItemVariant, CartItemAddon } from "@/stores/cartStore";
import { cn } from "@/lib/utils";
import { FoodTypeBadge } from "@/components/MenuItemCard";
import { getDishPhoto } from "@/lib/foodImageHelper";
import OptimizedImage from "@/components/OptimizedImage";

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

export const ItemDetailModal = ({ item, onClose, onAddToCart }: ItemDetailModalProps) => {
  const [selectedVariants, setSelectedVariants] = useState<Record<string, VariantOption>>({});
  const [selectedAddons, setSelectedAddons] = useState<Record<string, AddonOption[]>>({});
  const [qty, setQty] = useState<number>(1);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (item) {
      const initialVariants: Record<string, VariantOption> = {};
      const distinctGroups = (item.variantGroups || []).filter(
        (g, idx, arr) => arr.findIndex((x) => x.name.toLowerCase() === g.name.toLowerCase()) === idx
      );
      distinctGroups.forEach((g) => {
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

  const isNonVeg = Boolean(
    (item as any).is_non_veg ||
    (item as any).food_type === "non_veg" ||
    item.tags?.some(
      (t) =>
        t.name.toLowerCase().includes("non-veg") ||
        t.name.toLowerCase().includes("chicken") ||
        t.name.toLowerCase().includes("mutton")
    )
  );

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
      return options.map((option) => ({
        groupId,
        groupName: group?.name || "",
        option: {
          ...option,
          price: getAddonEffectivePrice(option),
        },
      }));
    });

    for (let i = 0; i < qty; i++) {
      onAddToCart(item, variants, addons);
    }
    onClose();
  };

  const dishImage = getDishPhoto(item.name, undefined, item.imageUrl);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 select-none font-sans">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* Modal: Fitted to Screen with Zero Scrollbars */}
        <motion.div
          initial={{ y: "100%", opacity: 0.5 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 340 }}
          className="relative bg-card text-card-foreground border-t sm:border border-border rounded-t-[24px] sm:rounded-3xl w-full max-w-sm max-h-[96dvh] shadow-2xl overflow-hidden flex flex-col z-10"
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={`Customize ${item.name}`}
        >
          {/* Top Floating Close Button */}
          <button
            onClick={onClose}
            className="absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer shadow-md active:scale-95"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Dish Compact Hero Banner */}
          {dishImage && (
            <div className="relative w-full h-28 sm:h-32 bg-muted/30 overflow-hidden shrink-0">
              <OptimizedImage
                src={dishImage}
                alt={item.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent pointer-events-none" />
            </div>
          )}

          {/* Non-scrolling Compact Content Body */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-2.5">
            {/* Title, Badges & Price Row */}
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5">
                  <FoodTypeBadge isNonVeg={isNonVeg} />
                  {item.isPopular && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                      Bestseller
                    </span>
                  )}
                </div>
                <div className="text-base font-black text-foreground">
                  ₹{baseCost}
                </div>
              </div>

              <h2 className="font-serif text-sm sm:text-base font-bold text-foreground leading-snug line-clamp-2">
                {item.name}
              </h2>

              {item.description && (
                <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2 mt-1">
                  {item.description}
                </p>
              )}
            </div>

            {/* Portion / Size Variant Options */}
            {item.variantGroups && item.variantGroups.length > 0 && (
              <div className="space-y-1.5 pt-1.5 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground">
                    Select Size ({item.variantGroups[0].name})
                  </span>
                  <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                    Required
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {item.variantGroups[0].options
                    .sort((a, b) => (a.sortOrder || 1) - (b.sortOrder || 1))
                    .map((option) => {
                      const isSelected =
                        selectedVariants[item.variantGroups![0].id]?.id === option.id ||
                        selectedVariants[item.variantGroups![0].id]?.name === option.name;
                      const price = getVariantDisplayPrice(item.basePrice, option);
                      return (
                        <button
                          key={option.id || option.name}
                          type="button"
                          onClick={() => selectVariant(item.variantGroups![0], option)}
                          className={cn(
                            "flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer min-h-[38px]",
                            isSelected
                              ? "bg-primary/10 border-primary text-primary font-bold shadow-2xs scale-[1.01]"
                              : "bg-card border-border text-foreground hover:border-primary/40"
                          )}
                        >
                          <span className="text-xs truncate">{option.name}</span>
                          <span className="text-xs font-black text-foreground ml-1">
                            ₹{price}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Extra Addons (Compact) */}
            {item.addonGroups && item.addonGroups.length > 0 && (
              <div className="space-y-1.5 pt-1.5 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-foreground">
                    Extra Add-ons
                  </span>
                  <span className="text-[9px] text-muted-foreground font-medium">
                    Optional
                  </span>
                </div>

                {item.addonGroups.map((group) => (
                  <div key={group.id} className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
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
                            "flex items-center justify-between px-2 py-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer min-h-[36px]",
                            isSelected
                              ? "bg-primary/10 border-primary text-primary font-bold shadow-2xs"
                              : "bg-card border-border text-foreground hover:border-primary/30"
                          )}
                        >
                          <span className="flex items-center gap-1.5 min-w-0">
                            <span
                              className={cn(
                                "w-3.5 h-3.5 rounded-full flex items-center justify-center border text-[8px] shrink-0",
                                isSelected
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-border bg-card"
                              )}
                            >
                              {isSelected && <Check className="w-2 h-2 stroke-[3]" />}
                            </span>
                            <span className="text-xs truncate">{option.name}</span>
                          </span>
                          <span className="text-xs font-extrabold text-primary shrink-0 ml-1">
                            +₹{dynamicPrice}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}

            {/* Validation error */}
            {validationError && (
              <p className="text-[11px] text-destructive font-bold bg-destructive/10 border border-destructive/20 rounded-xl p-2 text-center">
                {validationError}
              </p>
            )}
          </div>

          {/* Sticky Bottom Actions */}
          <div className="p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-border bg-card shrink-0 flex items-center justify-between gap-2.5">
            <div className="flex items-center bg-muted border border-border rounded-full px-1.5 py-0.5">
              <button
                type="button"
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-card transition text-foreground cursor-pointer active:scale-90"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3 stroke-[2.5]" />
              </button>
              <span className="font-extrabold text-xs w-6 text-center text-foreground">{qty}</span>
              <button
                type="button"
                onClick={() => setQty(qty + 1)}
                className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-card transition text-foreground cursor-pointer active:scale-90"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAdd}
              className="flex-1 h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold rounded-full text-xs sm:text-sm shadow-md flex items-center justify-between px-4 cursor-pointer transition-all active:scale-95"
            >
              <span>Add to Order</span>
              <span className="font-black text-sm">₹{total}</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ItemDetailModal;
