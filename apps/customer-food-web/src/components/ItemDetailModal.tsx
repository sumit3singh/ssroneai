import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, Check } from "lucide-react";
import type { MenuItem, VariantGroup, VariantOption, AddonGroup, AddonOption } from "@/data/mockMenu";
import { getVariantDisplayPrice, getVariantPriceAdjustment } from "@/data/mockMenu";
import type { CartItemVariant, CartItemAddon } from "@/stores/cartStore";
import { cn } from "@/lib/utils";

interface ItemDetailModalProps {
  item: MenuItem | null;
  onClose: () => void;
  onAddToCart: (item: MenuItem, variants?: CartItemVariant[], addons?: CartItemAddon[]) => void;
}

interface CustomAddonOption extends AddonOption {
  variant_prices?: Record<string, number>;
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
        if (g.isRequired && g.options.length > 0) {
          initialVariants[g.id] = g.options[0];
        }
      });
      setSelectedVariants(initialVariants);
      setSelectedAddons({});
      setQty(1);
      setValidationError(null);
    }
  }, [item]);

  const getSelectedSizeName = () => {
    const sizeOption = Object.values(selectedVariants).find((v) =>
      ["Small", "Medium", "Large"].includes(v.name)
    );
    return sizeOption ? sizeOption.name : null;
  };

  const getAddonEffectivePrice = (addon: CustomAddonOption) => {
    const sizeName = getSelectedSizeName();
    if (sizeName && addon.variant_prices && addon.variant_prices[sizeName] !== undefined) {
      return Number(addon.variant_prices[sizeName]);
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
      const exists = current.find((a) => a.id === option.id);
      if (exists) {
        return { ...prev, [group.id]: current.filter((a) => a.id !== option.id) };
      }
      if (current.length >= group.maxSelection) {
        return { ...prev, [group.id]: [...current.slice(1), option] };
      }
      return { ...prev, [group.id]: [...current, option] };
    });
  };


  const handleAdd = () => {
    // Validate required variant groups
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
        className="fixed inset-0 z-50 bg-foreground/50 flex items-end md:items-center justify-center p-0 md:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-popover rounded-t-3xl md:rounded-3xl w-full md:max-w-lg max-h-[85vh] overflow-y-auto overflow-x-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image */}
          <div className="relative h-40 sm:h-52 md:h-64">
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover rounded-t-3xl md:rounded-t-3xl" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-popover/80 backdrop-blur flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-3 left-3 flex gap-1.5">
              <span className="text-sm font-bold px-3 py-1 rounded-full bg-popover/90 backdrop-blur-sm">
                {item.isVeg ? "🟢 Veg" : "🔴 Non-veg"}
              </span>
              {item.tags?.map((tag) => (
                <span
                  key={tag.id}
                  className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary/90 text-primary-foreground backdrop-blur-sm"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
            <div>
              <h2 className="font-display text-lg sm:text-xl font-bold">{item.name}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{item.description}</p>
              <p className="text-sm font-bold text-primary mt-1">Starting ₹{item.basePrice}</p>
            </div>

            {/* Variant Groups */}
            {item.variantGroups?.map((group) => (
              <div key={group.id}>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  {group.name}
                  {group.isRequired && (
                    <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-bold">
                      Required
                    </span>
                  )}
                  {group.maxSelection > 1 && (
                    <span className="text-[10px] text-muted-foreground">(Select up to {group.maxSelection})</span>
                  )}
                </h3>
                <div className="space-y-2">
                  {group.options
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((option) => {
                      const isSelected = selectedVariants[group.id]?.id === option.id;
                      return (
                        <button
                          key={option.id}
                          onClick={() => selectVariant(group, option)}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all",
                            isSelected
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border hover:border-primary/40"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                            {option.name}
                          </span>
                          <span className="font-bold text-foreground">
                            ₹{getVariantDisplayPrice(item.basePrice, option)}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>
            ))}


            {/* Addon Groups */}
            {item.addonGroups?.map((group) => (
              <div key={group.id}>
                <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  {group.name}
                  {group.isRequired && (
                    <span className="text-[10px] bg-destructive/10 text-destructive px-1.5 py-0.5 rounded-full font-bold">
                      Required
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    (Max {group.maxSelection})
                  </span>
                </h3>
                <div className="space-y-2">
                  {group.options
                    .filter((o) => o.isAvailable)
                    .map((option) => {
                      const groupAddons = selectedAddons[group.id] || [];
                      const isSelected = groupAddons.some((a) => a.id === option.id);
                      return (
                        <button
                          key={option.id}
                          onClick={() => toggleAddon(group, option)}
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all",
                            isSelected
                              ? "border-accent bg-accent/10"
                              : "border-border hover:border-accent/40"
                          )}
                        >
                          <span className="flex items-center gap-2">
                            {isSelected && <Check className="w-3.5 h-3.5 text-accent" />}
                            {option.name}
                          </span>
                          <span className="font-bold">+₹{getAddonEffectivePrice(option)}</span>

                        </button>
                      );
                    })}
                </div>
              </div>
            ))}

            {/* Validation error */}
            {validationError && (
              <p className="text-xs text-destructive font-medium">{validationError}</p>
            )}

            {/* Quantity + Add */}
            <div className="flex items-center justify-between pt-2 gap-2">
              <div className="flex items-center gap-2 bg-muted rounded-xl px-2 py-1">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-background transition">
                  <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <span className="font-bold text-base sm:text-lg w-5 sm:w-6 text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-background transition">
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
                className="btn-order px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold"
              >
                Add · ₹{total}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ItemDetailModal;
