import React from "react";
import type { MenuItem } from "@/data/mockMenu";
import { getVariantDisplayPrice } from "@/data/mockMenu";
import { Plus, Minus, Sparkles } from "lucide-react";
import OptimizedImage from "@/components/OptimizedImage";
import { useCartStore } from "@/stores/cartStore";
import { getDishPhoto } from "@/lib/foodImageHelper";
import { cn } from "@/lib/utils";

interface MenuItemCardProps {
  item: MenuItem;
  categoryName?: string;
  onAdd: (item: MenuItem, e?: React.MouseEvent) => void;
}

export const FoodTypeBadge: React.FC<{ isNonVeg: boolean; className?: string }> = ({ isNonVeg, className }) => {
  return (
    <div
      className={cn(
        "w-3 h-3 rounded-[3px] border-[1.5px] flex items-center justify-center shrink-0 bg-white",
        isNonVeg ? "border-rose-600 text-rose-600" : "border-emerald-700 text-emerald-700",
        className
      )}
      title={isNonVeg ? "Non-Vegetarian" : "Pure Vegetarian"}
      aria-label={isNonVeg ? "Non-Vegetarian" : "Pure Vegetarian"}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          isNonVeg ? "bg-rose-600" : "bg-emerald-700"
        )}
      />
    </div>
  );
};

const MenuItemCardComponent: React.FC<MenuItemCardProps> = ({ item, categoryName, onAdd }) => {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const addItem = useCartStore((s) => s.addItem);
  const cartQty = useCartStore((s) =>
    (s.items || [])
      .filter((ci) => String(ci.menuItem.id) === String(item.id))
      .reduce((acc, ci) => acc + (ci.quantity || 0), 0)
  );

  const hasVariants =
    Boolean(item.variantGroups && item.variantGroups.length > 0) ||
    Boolean(item.addonGroups && item.addonGroups.length > 0);

  const basePriceNum =
    typeof item.basePrice === "number"
      ? item.basePrice
      : typeof (item as any).price === "number"
      ? (item as any).price
      : 100;

  const lowestPrice =
    hasVariants && item.variantGroups && item.variantGroups.length > 0
      ? Math.min(
          ...item.variantGroups.flatMap((g) =>
            (g.options || []).map((o) => getVariantDisplayPrice(basePriceNum, o))
          )
        )
      : basePriceNum;

  const safePrice = isNaN(lowestPrice) ? basePriceNum : lowestPrice;
  const formattedPrice = `₹${safePrice.toLocaleString("en-IN", {
    minimumFractionDigits: Number.isInteger(safePrice) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

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

  const triggerHaptic = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(15);
      } catch {
        // Safe ignore
      }
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic();
    if (hasVariants) {
      onAdd(item, e);
    } else {
      const currentItems = useCartStore.getState().items || [];
      const match = currentItems.find((ci) => String(ci.menuItem.id) === String(item.id));
      if (match) {
        updateQuantity(match.id, match.quantity + 1);
      } else {
        addItem(item);
      }
    }
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic();
    const currentItems = useCartStore.getState().items || [];
    const matching = currentItems.filter((ci) => String(ci.menuItem.id) === String(item.id));
    if (matching.length > 0) {
      const target = matching[matching.length - 1];
      if (target.quantity > 1) {
        updateQuantity(target.id, target.quantity - 1);
      } else {
        removeItem(target.id);
      }
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic();
    if (hasVariants) {
      onAdd(item, e);
    } else {
      addItem(item);
    }
  };

  const dishImage = getDishPhoto(item.name, categoryName, item.imageUrl);
  const descriptionText = item.description || item.short_description || "";

  return (
    <article
      className="bg-card rounded-2xl py-2 px-3 border border-border/70 shadow-2xs hover:border-[#8C5E35]/40 hover:shadow-xs transition-all cursor-pointer group flex items-center justify-between gap-2.5 relative overflow-hidden w-full max-w-full"
      onClick={(e) => {
        if (hasVariants) {
          onAdd(item, e);
        } else if (cartQty === 0) {
          handleAddClick(e);
        }
      }}
      aria-label={`${item.name}, Price: ${formattedPrice}`}
    >
      {/* ── Left Column: Compact Title, Price, Description ── */}
      <div className="flex-1 min-w-0 pr-2 flex flex-col justify-center">
        {/* Row 1: Veg/Non-Veg dot + Dish Name */}
        <div className="flex items-start gap-1.5 min-w-0">
          <div className="mt-0.5 shrink-0">
            <FoodTypeBadge isNonVeg={isNonVeg} />
          </div>
          <h3 className="font-sans text-xs sm:text-sm font-bold text-foreground leading-snug group-hover:text-[#8C5E35] transition-colors break-words">
            {item.name}
          </h3>
          {item.isPopular && (
            <span className="inline-flex items-center gap-0.5 px-1 py-0.5 rounded text-[9px] font-bold text-amber-700 bg-amber-500/10 border border-amber-500/20 shrink-0 mt-0.5">
              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
            </span>
          )}
        </div>

        {/* Row 2: Price */}
        <div className="flex items-baseline gap-1 mt-0.5">
          <span className="font-extrabold text-xs sm:text-[13px] text-foreground tracking-tight">
            {formattedPrice}
          </span>
          {hasVariants && (
            <span className="text-[9px] text-[#9E6B38] font-bold">
              • Customisable
            </span>
          )}
        </div>

        {/* Row 3: Short Description */}
        {descriptionText ? (
          <p className="text-[10px] text-muted-foreground leading-snug mt-0.5 break-words">
            {descriptionText}
          </p>
        ) : null}
      </div>

      {/* ── Right Column: Compact Photo + Integrated ADD Pill ── */}
      <div className="relative shrink-0 flex items-center gap-2">
        {/* Exact 56x56 Thumbnail Photo (Strict bounds) */}
        <div className="w-14 h-14 min-w-[56px] min-h-[56px] max-w-[56px] max-h-[56px] rounded-xl overflow-hidden bg-muted/40 border border-border/80 shadow-2xs relative shrink-0">
          <OptimizedImage
            src={dishImage}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Compact Add Button or Quantity Stepper */}
        <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
          {cartQty > 0 ? (
            <div
              className="h-7 w-[68px] min-w-[68px] bg-gradient-to-r from-[#9E6B38] to-[#8C5E35] text-white rounded-lg shadow-xs flex items-center justify-between px-1.5 transition-all border border-[#8C5E35] shrink-0"
            >
              <button
                type="button"
                onClick={handleDecrement}
                className="w-4 h-4 flex items-center justify-center hover:bg-white/20 rounded transition cursor-pointer active:scale-90"
                aria-label={`Decrease ${item.name} quantity`}
              >
                <Minus className="w-2.5 h-2.5 stroke-[2.5]" />
              </button>
              <span className="font-sans text-[11px] font-black text-white px-0.5 select-none" aria-live="polite">
                {cartQty}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-4 h-4 flex items-center justify-center hover:bg-white/20 rounded transition cursor-pointer active:scale-90"
                aria-label={`Increase ${item.name} quantity`}
              >
                <Plus className="w-2.5 h-2.5 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleAddClick}
              className="h-7 w-[64px] min-w-[64px] px-2 bg-[#FBF8F3] hover:bg-[#9E6B38] text-[#9E6B38] hover:text-white border border-[#9E6B38]/40 hover:border-[#9E6B38] text-[11px] font-extrabold uppercase rounded-lg shadow-2xs active:scale-95 transition-all flex items-center justify-center gap-0.5 cursor-pointer shrink-0"
              aria-label={`Add ${item.name} to cart`}
            >
              <span>ADD</span>
              <Plus className="w-2.5 h-2.5 stroke-[3]" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export const MenuItemCard = React.memo(MenuItemCardComponent);
export default MenuItemCard;
