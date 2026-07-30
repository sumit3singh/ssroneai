import { motion } from "framer-motion";
import type { MenuItem } from "@/data/mockMenu";
import { getVariantDisplayPrice } from "@/data/mockMenu";
import { Plus } from "lucide-react";
import OptimizedImage from "@/components/OptimizedImage";

interface MenuItemCardProps {
  item: MenuItem;
  onAdd: (item: MenuItem, e?: React.MouseEvent) => void;
}

const MenuItemCard = ({ item, onAdd }: MenuItemCardProps) => {
  const hasVariants = item.variantGroups && item.variantGroups.length > 0;
  const lowestPrice = hasVariants
    ? Math.min(...(item.variantGroups || []).flatMap((g) => g.options.map((o) => getVariantDisplayPrice(item.basePrice, o))))
    : item.basePrice;
  const priceLabel = hasVariants ? `₹${lowestPrice}+` : `₹${item.basePrice}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="card-food overflow-hidden cursor-pointer group"
      onClick={(e) => onAdd(item, e)}
    >
      {/* Image */}
      <div className="relative h-24 sm:h-40 overflow-hidden">
        <OptimizedImage
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Veg/Non-veg badge */}
        <span className="absolute top-1 left-1 sm:top-2 sm:left-2 text-[8px] sm:text-xs font-bold px-1 sm:px-2 py-0.5 rounded-full bg-popover/90 backdrop-blur-sm">
          {item.isVeg ? "🟢 Veg" : "🔴 Non-veg"}
        </span>
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex gap-0.5">
          {item.isPopular && (
            <span className="text-[8px] sm:text-xs font-bold px-1 sm:px-2 py-0.5 rounded-full food-gradient text-primary-foreground">
              🔥
            </span>
          )}
          {item.tags?.slice(0, 1).map((tag) => (
            <span
              key={tag.id}
              className="text-[7px] sm:text-[10px] font-bold px-1 py-0.5 rounded-full bg-primary/90 text-primary-foreground"
            >
              {tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="p-1.5 sm:p-3">
        <h3 className="font-semibold text-foreground text-[11px] sm:text-sm leading-tight mb-0.5 line-clamp-1">
          {item.name}
        </h3>
        <p className="text-[9px] sm:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2 mb-1 sm:mb-2">
          {item.description}
        </p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-primary text-xs sm:text-base">{priceLabel}</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onAdd(item, e);
            }}
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuItemCard;
