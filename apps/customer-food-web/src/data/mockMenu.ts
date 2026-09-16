/**
 * Single Source of Truth (SSOT) Domain Models & Helpers.
 * Live menu items and categories are fetched dynamically from PostgreSQL via API.
 * Static mock data fallbacks are disabled.
 */

export interface VariantOption {
  id: string;
  name: string;
  price: number;
  priceAdjustment?: number;
  sortOrder: number;
}

export function getVariantDisplayPrice(basePrice: number, option: VariantOption): number {
  if (option.price !== undefined && option.price > 0) {
    return option.price;
  }
  if (option.priceAdjustment !== undefined && option.priceAdjustment > 0) {
    if (option.priceAdjustment >= basePrice) {
      return option.priceAdjustment;
    }
    return basePrice + option.priceAdjustment;
  }
  return basePrice + (option.priceAdjustment || 0);
}

export function getVariantPriceAdjustment(basePrice: number, option: VariantOption): number {
  if (option.price !== undefined && option.price > 0) {
    return option.price >= basePrice ? option.price - basePrice : option.price;
  }
  if (option.priceAdjustment !== undefined && option.priceAdjustment >= basePrice) {
    return option.priceAdjustment - basePrice;
  }
  return option.priceAdjustment || 0;
}

export interface VariantGroup {
  id: string;
  name: string;
  isRequired: boolean;
  maxSelection: number;
  options: VariantOption[];
}

export interface AddonOption {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
}

export interface AddonGroup {
  id: string;
  name: string;
  isRequired: boolean;
  maxSelection: number;
  options: AddonOption[];
}

export interface Tag {
  id: string;
  name: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  imageUrl: string;
  categoryId: string;
  isVeg: boolean;
  isPopular?: boolean;
  isAvailable?: boolean;
  gstPercent?: number;
  tags?: Tag[];
  variantGroups?: VariantGroup[];
  addonGroups?: AddonGroup[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  slug?: string;
  parentId?: string;
  level?: number;
  sortOrder?: number;
}

// ── Keep backward-compatible aliases ──
export type Variant = VariantOption;
export type Addon = AddonOption;

// ── Tags ──
export const productTags: Tag[] = [];

// ── Categories ──
export const categories: Category[] = [];
export const menuItems: MenuItem[] = [];
