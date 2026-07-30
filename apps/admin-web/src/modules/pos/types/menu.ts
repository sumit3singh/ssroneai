export interface POSCategory {
  id: number;
  name: string;
  slug?: string;
  icon?: string;
  sort_order?: number;
}

export interface POSVariantOption {
  id: number | string;
  name: string;
  sellingPrice: number;
  price?: number;
  is_default?: boolean;
  sortOrder?: number;
}

export interface POSVariantGroup {
  id: number | string;
  name: string;
  isRequired: boolean;
  maxSelection: number;
  options: POSVariantOption[];
}

export interface POSAddonOption {
  id: number | string;
  name: string;
  price: number;
  isAvailable?: boolean;
}

export interface POSAddonGroup {
  id: number | string;
  name: string;
  options: POSAddonOption[];
}

export interface POSMenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string;
  base_price: number;
  selling_price?: number;
  image_url: string;
  is_veg: boolean;
  is_popular: boolean;
  is_available: boolean;
  gst_percent: number;
  tags: string[];
  variant_groups?: POSVariantGroup[];
  addon_groups?: POSAddonGroup[];
  kds_station?: string;
}
