import { POSMenuItem } from "../types/menu";

export const validateMenuItem = (item: Partial<POSMenuItem>): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!item.name || !item.name.trim()) {
    errors.push("Item name is mandatory");
  }

  const hasVariants = item.variant_groups && item.variant_groups.length > 0 && item.variant_groups.some((g) => g.options.length > 0);
  if (!hasVariants && (!item.base_price || item.base_price <= 0)) {
    errors.push("Base price is required when no portion variants exist");
  }

  return {
    valid: errors.length === 0,
    errors
  };
};
