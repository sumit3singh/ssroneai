import React from "react";
import { Edit2, Trash2, Tag as TagIcon, ChefHat } from "lucide-react";
import { Button } from "@/shared/ui/primitives/Button";
import { VariantGroup } from "./VariantEditor";
import { AddonGroup } from "./AddonEditor";

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string;
  base_price: number;
  image_url: string;
  is_veg: boolean;
  is_popular: boolean;
  is_available: boolean;
  gst_percent: number;
  tags: string[];
  variant_groups: VariantGroup[];
  addon_groups: AddonGroup[];
  branch_id?: string | null;
  kds_station?: string;
}

interface MenuItemCardProps {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
  onToggleAvailability: (item: MenuItem) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  onToggleAvailability
}) => {
  // Compute display price: if item has variants, pick lowest sellingPrice
  const hasVariants = item.variant_groups && item.variant_groups.length > 0;
  const variantPrices = hasVariants
    ? item.variant_groups.flatMap((vg) => (vg.options || []).map((o) => Number(o.sellingPrice ?? o.price ?? 0)))
    : [];
  const minVariantPrice = variantPrices.length > 0 ? Math.min(...variantPrices) : item.base_price;

  return (
    <div
      className={`bg-card border rounded-2xl p-4 flex flex-col justify-between transition-all shadow-card hover:shadow-card-hover ${
        !item.is_available ? "opacity-60 border-dashed" : "border-border"
      }`}
    >
      <div className="space-y-3">
        {/* Card Header & Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`h-4 w-4 border-2 rounded-sm flex items-center justify-center p-0.5 ${
                item.is_veg ? "border-green-600" : "border-red-600"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  item.is_veg ? "bg-green-600" : "bg-red-600"
                }`}
              />
            </span>
            <h3 className="font-display font-extrabold text-sm text-foreground line-clamp-1">
              {item.name}
            </h3>
          </div>
          {item.is_popular && (
            <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
              Popular
            </span>
          )}
        </div>

        <p className="text-2xs text-muted-foreground line-clamp-2 min-h-[32px]">
          {item.description || "No description provided."}
        </p>

        {/* Tags & KDS Station Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {item.kds_station && (
            <span className="inline-flex items-center gap-1 bg-muted/60 text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-md">
              <ChefHat size={11} className="text-primary" />
              {item.kds_station}
            </span>
          )}
          {item.tags?.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-md"
            >
              <TagIcon size={10} />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Price & Actions Footer */}
      <div className="pt-4 mt-3 border-t border-border/80 flex items-center justify-between">
        <div>
          <span className="text-[10px] text-muted-foreground font-semibold block">
            {hasVariants ? "Starts From" : "Selling Price"}
          </span>
          <span className="text-sm font-black text-foreground font-mono">
            ₹{minVariantPrice}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onToggleAvailability(item)}
            className={`h-8 px-2 text-2xs font-bold ${
              item.is_available
                ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {item.is_available ? "In Stock" : "Out of Stock"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(item)}
            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
          >
            <Edit2 size={14} />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDelete(item.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </div>
  );
};
