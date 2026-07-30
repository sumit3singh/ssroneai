import { POSMenuItem, POSVariantOption } from "../types/menu";

export const getEffectiveSellingPrice = (item: POSMenuItem, variant?: POSVariantOption): number => {
  if (variant) {
    return Number(variant.sellingPrice ?? variant.price ?? item.base_price);
  }
  return Number(item.selling_price || item.base_price || 0);
};
