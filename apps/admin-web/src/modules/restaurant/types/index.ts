/**
 * Restaurant Module Types
 */

export interface RestaurantCategory {
  id: number;
  name: string;
  icon: string;
  slug: string;
  item_count?: number;
}

export interface RestaurantMenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  is_available: boolean;
  is_vegetarian: boolean;
  image_url?: string;
}

export interface RestaurantTable {
  id: number;
  table_number: string;
  capacity: number;
  status: "AVAILABLE" | "OCCUPIED" | "RESERVED" | "BILL_PRINTED";
  section: string;
}
