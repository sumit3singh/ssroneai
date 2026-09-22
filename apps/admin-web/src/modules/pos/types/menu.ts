export interface POSCategory {
  id: number;
  name: string;
  slug?: string;
  icon?: string;
  sort_order?: number;
  parent_id?: number | null;
  level?: number;
  company_id?: number | null;
  branch_id?: number | null;
  tenant_id?: number;
  is_deleted?: boolean;
}

export interface POSVariantOption {
  id: number | string;
  name: string;
  sellingPrice: number;
  selling_price?: number;
  price?: number;
  is_default?: boolean;
  sortOrder?: number;
}

export interface POSVariantGroup {
  id: number | string;
  name: string;
  isRequired?: boolean;
  is_required?: boolean;
  maxSelection?: number;
  max_selection?: number;
  min_selection?: number;
  minSelection?: number;
  options: POSVariantOption[];
}

export interface POSAddonOption {
  id: number | string;
  name: string;
  price: number;
  variantPrices?: Record<string, number>;
  variant_prices?: Record<string, number>;
  isAvailable?: boolean;
}

export interface POSAddonGroup {
  id: number | string;
  name: string;
  min_selection?: number;
  minSelection?: number;
  max_selection?: number;
  maxSelection?: number;
  options: POSAddonOption[];
}

export interface POSMenuItem {
  id: number;
  category_id: number;
  category_name?: string;
  category?: string | any;
  item_code?: string;
  name: string;
  description: string;
  base_price: number;
  price?: number;
  selling_price?: number;
  packaging_charge?: number;
  image_url: string;
  is_veg: boolean;
  is_popular: boolean;
  is_available: boolean;
  is_deleted?: boolean;
  branch_id?: number | string;
  barcode?: string;
  sku?: string;
  shortcode?: string;
  short_description?: string;
  gst_percent: number;
  tags: string[];
  variant_groups?: POSVariantGroup[];
  addon_groups?: POSAddonGroup[];
  kds_station?: string;
}

export function getParsedVariantGroups(item: any): POSVariantGroup[] {
  if (!item) return [];
  const raw = item.variant_groups || item.variantGroups;
  let list: any[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      list = Array.isArray(parsed) ? parsed : [];
    } catch {
      list = [];
    }
  }
  if (list.length === 0) return [];

  // If already structured as groups with an options array
  if (list.some((g) => g && Array.isArray(g.options))) {
    return list.map((g) => ({
      ...g,
      options: Array.isArray(g.options) ? g.options : []
    }));
  }

  // Flat list of variant options
  return [
    {
      id: "default-variants",
      name: "Size / Portion",
      min_selection: 1,
      max_selection: 1,
      is_required: true,
      options: list
    }
  ];
}

export function getParsedAddonGroups(item: any): POSAddonGroup[] {
  if (!item) return [];
  const raw = item.addon_groups || item.addonGroups;
  let list: any[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      list = Array.isArray(parsed) ? parsed : [];
    } catch {
      list = [];
    }
  }
  if (list.length === 0) return [];

  // If already structured as groups with an options array
  if (list.some((g) => g && Array.isArray(g.options))) {
    return list.map((g) => ({
      ...g,
      options: Array.isArray(g.options) ? g.options : []
    }));
  }

  // Flat list of addon options
  return [
    {
      id: "default-addons",
      name: "Addons & Extras",
      min_selection: 0,
      max_selection: 5,
      options: list
    }
  ];
}

