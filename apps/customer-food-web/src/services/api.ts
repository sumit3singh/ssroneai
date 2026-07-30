/**
 * API Service Layer — Connected to ERP Supabase database with seamless local mock fallback.
 */

import { supabase } from "@/integrations/supabase/client";
import { MenuItem, Category, VariantGroup, AddonGroup, categories as mockCategories, menuItems as mockMenuItems } from "@/data/mockMenu";
import type { PastOrder } from "@/stores/authStore";

/* ── Menu ─────────────────────────────────────────── */

interface RawCategory {
  id?: string | number;
  name: string;
  icon?: string;
  slug?: string;
  sort_order?: number;
  parent_id?: string | number;
  level?: number;
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch("http://localhost:8000/api/v1/restaurant/categories");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((c: RawCategory) => ({
          id: String(c.id || c.name.toLowerCase()),
          name: c.name,
          icon: c.icon || "🍽️",
          slug: c.slug || c.name.toLowerCase(),
          sortOrder: c.sort_order || 0
        }));
      }
    }
  } catch (e) {
    console.warn("Backend categories call failed, attempting Supabase", e);
  }

  try {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (error || !data || data.length === 0) throw error || new Error("No categories");

    return data.map((c: RawCategory) => ({
      id: String(c.id),
      name: c.name,
      icon: c.icon || "🍽️",
      slug: c.slug,
      parentId: c.parent_id ? String(c.parent_id) : undefined,
      level: c.level,
      sortOrder: c.sort_order || 0,
    }));
  } catch (err) {
    console.warn("Supabase fetchCategories failed or empty, using local mock data", err);
    return mockCategories;
  }
}

interface RawOption {
  id?: string | number;
  name: string;
  price_adjustment?: number;
  price?: number;
  sort_order?: number;
  variant_prices?: Record<string, number>;
  price_by_size?: Record<string, number>;
  is_available?: boolean;
}

interface RawVariantGroup {
  id?: string | number;
  name?: string;
  is_required?: boolean;
  max_selection?: number;
  options?: RawOption[];
}

interface RawAddonGroup {
  id?: string | number;
  name: string;
  is_required?: boolean;
  max_selection?: number;
  options?: RawOption[];
}

interface RawMenuItem {
  id: string | number;
  name: string;
  description?: string;
  base_price: number;
  image_url?: string;
  category_id?: string | number;
  is_veg?: boolean;
  is_popular?: boolean;
  is_available?: boolean;
  gst_percent?: number;
  variant_groups?: RawVariantGroup[];
  addon_groups?: RawAddonGroup[];
}

export async function fetchMenuItems(categoryId?: string): Promise<MenuItem[]> {
  try {
    const res = await fetch("http://localhost:8000/api/v1/restaurant/menu-items");
    if (res.ok) {
      const data = await res.json();
      const itemsList: RawMenuItem[] = Array.isArray(data) ? data : data.items || [];
      return itemsList.map((item: RawMenuItem) => {
        // Consolidate variant groups by name (e.g. merge separate 'Size' entries)
        const normalizedGroups: Record<string, VariantGroup> = {};
        (item.variant_groups || []).forEach((vg: RawVariantGroup) => {
          const nameKey = (vg.name || "Variant").toLowerCase();
          if (!normalizedGroups[nameKey]) {
            normalizedGroups[nameKey] = {
              id: String(vg.id || nameKey),
              name: vg.name || "Variant",
              isRequired: vg.is_required ?? true,
              maxSelection: vg.max_selection ?? 1,
              options: []
            };
          }
          (vg.options || []).forEach((opt: RawOption) => {
            const rawPrice = opt.price !== undefined && opt.price !== null ? Number(opt.price) : undefined;
            const rawAdj = opt.price_adjustment !== undefined && opt.price_adjustment !== null ? Number(opt.price_adjustment) : 0;
            normalizedGroups[nameKey].options.push({
              id: String(opt.id || opt.name),
              name: opt.name,
              price: rawPrice,
              priceAdjustment: rawAdj || (rawPrice ?? 0),
              sortOrder: opt.sort_order || 0
            });
          });
        });

        return {
          id: String(item.id),
          name: item.name,
          description: item.description || "",
          basePrice: item.base_price,
          imageUrl: item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
          categoryId: String(item.category_id || "pizza"),
          isVeg: item.is_veg ?? true,
          isPopular: item.is_popular || false,
          isAvailable: item.is_available ?? true,
          gstPercent: item.gst_percent || 5,
          variantGroups: Object.values(normalizedGroups),
          addonGroups: (item.addon_groups || []).map((ag: RawAddonGroup) => ({
            id: String(ag.id || ag.name),
            name: ag.name,
            isRequired: ag.is_required || false,
            maxSelection: ag.max_selection || 1,
            options: (ag.options || []).map((ao: RawOption) => ({
              id: String(ao.id || ao.name),
              name: ao.name,
              price: Number(ao.price || 0),
              variant_prices: ao.variant_prices || ao.price_by_size || {},
              isAvailable: ao.is_available ?? true
            }))
          }))
        };
      });
    }
  } catch (e) {
    console.warn("Backend menu-items API failed, attempting Supabase", e);
  }

  try {
    let query = supabase
      .from("menu_items")
      .select("*")
      .is("deleted_at", null)
      .eq("is_available", true)
      .order("sort_order");

    if (categoryId && categoryId !== "all") {
      query = query.eq("category_id", Number(categoryId));
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) throw error || new Error("No menu items");

    // Fetch variant groups and addon groups for all items
    const itemIds = (data || []).map((i: { id: number }) => i.id);

    const [variantGroups, addonGroups] = await Promise.all([
      fetchVariantGroupsForItems(itemIds),
      fetchAddonGroupsForItems(itemIds),
    ]);

    return data.map((item: RawMenuItem) => ({
      id: String(item.id),
      name: item.name,
      description: item.description || "",
      basePrice: item.base_price,
      imageUrl: item.image_url || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
      categoryId: String(item.category_id),
      isVeg: item.is_veg ?? true,
      isPopular: item.is_popular || false,
      isAvailable: item.is_available ?? true,
      gstPercent: item.gst_percent,
      variantGroups: variantGroups[Number(item.id)] || [],
      addonGroups: addonGroups[Number(item.id)] || [],
    }));
  } catch (err) {
    console.warn("Supabase fetchMenuItems failed or empty, using local mock data", err);
    if (categoryId && categoryId !== "all") {
      return mockMenuItems.filter((item) => item.categoryId === categoryId);
    }
    return mockMenuItems;
  }
}


interface DbVariantGroup {
  id: number;
  name: string;
  is_required: boolean;
  max_selection: number;
  menu_item_id: number;
}

interface DbVariantOption {
  id: number;
  name: string;
  price_adjustment?: number;
  price?: number;
  sort_order: number;
  variant_group_id: number;
}

async function fetchVariantGroupsForItems(itemIds: number[]): Promise<Record<number, VariantGroup[]>> {
  if (itemIds.length === 0) return {};

  const { data: groups, error: gErr } = await supabase
    .from("variant_groups")
    .select("*")
    .in("menu_item_id", itemIds)
    .order("sort_order");

  if (gErr) throw gErr;
  if (!groups || groups.length === 0) return {};

  const groupIds = (groups as DbVariantGroup[]).map((g) => g.id);
  const { data: options, error: oErr } = await supabase
    .from("variant_options")
    .select("*")
    .in("variant_group_id", groupIds)
    .order("sort_order");

  if (oErr) throw oErr;

  const optionsByGroup: Record<number, VariantGroup["options"]> = {};
  ((options as DbVariantOption[]) || []).forEach((o) => {
    if (!optionsByGroup[o.variant_group_id]) optionsByGroup[o.variant_group_id] = [];
    const rawPrice = o.price !== undefined && o.price !== null ? Number(o.price) : undefined;
    const rawAdj = o.price_adjustment !== undefined && o.price_adjustment !== null ? Number(o.price_adjustment) : 0;
    optionsByGroup[o.variant_group_id].push({
      id: String(o.id),
      name: o.name,
      price: rawPrice,
      priceAdjustment: rawAdj || (rawPrice ?? 0),
      sortOrder: o.sort_order,
    });
  });

  const result: Record<number, VariantGroup[]> = {};
  (groups as DbVariantGroup[]).forEach((g) => {
    if (!result[g.menu_item_id]) result[g.menu_item_id] = [];
    result[g.menu_item_id].push({
      id: String(g.id),
      name: g.name,
      isRequired: g.is_required,
      maxSelection: g.max_selection,
      options: optionsByGroup[g.id] || [],
    });
  });

  return result;
}

interface DbAddonGroup {
  id: number;
  name: string;
  is_required: boolean;
  max_selection: number;
  menu_item_id: number;
}

interface DbAddonOption {
  id: number;
  name: string;
  price: number;
  is_available: boolean;
  addon_group_id: number;
}

async function fetchAddonGroupsForItems(itemIds: number[]): Promise<Record<number, AddonGroup[]>> {
  if (itemIds.length === 0) return {};

  const { data: groups, error: gErr } = await supabase
    .from("addon_groups")
    .select("*")
    .in("menu_item_id", itemIds);

  if (gErr) throw gErr;
  if (!groups || groups.length === 0) return {};

  const groupIds = (groups as DbAddonGroup[]).map((g) => g.id);
  const { data: options, error: oErr } = await supabase
    .from("addon_options")
    .select("*")
    .in("addon_group_id", groupIds)
    .eq("is_available", true);

  if (oErr) throw oErr;

  const optionsByGroup: Record<number, AddonGroup["options"]> = {};
  ((options as DbAddonOption[]) || []).forEach((o) => {
    if (!optionsByGroup[o.addon_group_id]) optionsByGroup[o.addon_group_id] = [];
    optionsByGroup[o.addon_group_id].push({
      id: String(o.id),
      name: o.name,
      price: o.price,
      isAvailable: o.is_available,
    });
  });

  const result: Record<number, AddonGroup[]> = {};
  (groups as DbAddonGroup[]).forEach((g) => {
    if (!result[g.menu_item_id]) result[g.menu_item_id] = [];
    result[g.menu_item_id].push({
      id: String(g.id),
      name: g.name,
      isRequired: g.is_required || false,
      maxSelection: g.max_selection || 1,
      options: optionsByGroup[g.id] || [],
    });
  });

  return result;
}

export async function fetchMenuItem(id: string): Promise<MenuItem | undefined> {
  const items = await fetchMenuItems();
  return items.find((i) => i.id === id);
}

/* ── Auth ─────────────────────────────────────────── */

export interface SendOtpResponse {
  success: boolean;
  message: string;
}

export async function sendOtp(phone: string): Promise<SendOtpResponse> {
  await new Promise((r) => setTimeout(r, 800));
  return { success: true, message: `OTP sent to +91 ${phone}` };
}

export interface VerifyOtpResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    phone: string;
    email?: string;
    loyaltyTier: "bronze" | "silver" | "gold" | "platinum";
    loyaltyPoints: number;
    totalOrders: number;
  };
}

export async function verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse> {
  if (otp.length < 4) throw new Error("Invalid OTP");

  try {
    const res = await fetch("http://localhost:8000/api/v1/crm/customers/guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: "Guest",
        last_name: phone.slice(-4),
        email: `guest-${phone.slice(-4)}@baithak.com`,
        phone: phone
      })
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        token: `mock-jwt-${data.id}`,
        user: {
          id: String(data.id),
          name: `${data.first_name} ${data.last_name}`,
          phone: data.phone || phone,
          loyaltyTier: (data.loyalty_tier || "silver") as "bronze" | "silver" | "gold" | "platinum",
          loyaltyPoints: data.loyalty_points || 250,
          totalOrders: data.total_visits || 0
        }
      };
    }
  } catch (err) {
    console.warn("FastAPI verifyOtp customer guest save failed, using local fallback", err);
  }

  await new Promise((r) => setTimeout(r, 600));
  return {
    success: true,
    token: `mock-jwt-${Date.now()}`,
    user: {
      id: `user-${phone}`,
      name: `User ${phone.slice(-4)}`,
      phone,
      loyaltyTier: "silver",
      loyaltyPoints: 250,
      totalOrders: 8,
    },
  };
}

/* ── Orders ───────────────────────────────────────── */

export interface PlaceOrderPayload {
  customerId?: string;
  outletId?: number;
  tableId?: number;
  orderType: "dine-in" | "delivery" | "dine_in" | "takeaway";
  items: {
    menuItemId: string;
    variantId?: string;
    addonIds?: string[];
    quantity: number;
    unitPrice: number;
    notes?: string;
  }[];
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  discountAmount: number;
  total: number;
  deliveryAddress?: { fullAddress: string; lat?: number; lng?: number; label?: string };
  specialInstructions?: string;
  promoCode?: string;
  loyaltyPointsUsed?: number;
  paymentMethod: string;
}

export interface PlaceOrderResponse {
  success: boolean;
  orderId: string;
  estimatedTime: number;
  loyaltyPointsEarned: number;
}

export async function placeOrder(payload: PlaceOrderPayload): Promise<PlaceOrderResponse> {
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase().slice(-6)}`;

  try {
    const backendItems = payload.items.map((it) => {
      const pIdNumeric = Number(it.menuItemId.replace("prod-", "")) || 1;
      const matchedP = mockMenuItems.find((m) => m.id === it.menuItemId);
      return {
        product_id: pIdNumeric,
        product_name: matchedP?.name || "Web Order Dish",
        product_code: matchedP?.id || "",
        quantity: it.quantity,
        unit_price: it.unitPrice,
        discount_amount: 0,
        modifiers: [],
        preparation_notes: it.notes || null,
        course: null
      };
    });

    const res = await fetch("http://localhost:8000/api/v1/orders/guest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        branch_id: payload.outletId || 1,
        customer_id: payload.customerId && !payload.customerId.includes("user-") ? Number(payload.customerId) : null,
        table_id: payload.tableId || null,
        waiter_id: null,
        order_type: payload.orderType === "dine-in" ? "dine_in" : payload.orderType,
        items: backendItems,
        notes: payload.specialInstructions || null,
        special_instructions: payload.specialInstructions || null,
        source_channel: "web_order"
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        orderId: data.order_number || orderNumber,
        estimatedTime: payload.orderType === "delivery" ? 40 : 20,
        loyaltyPointsEarned: Math.floor(payload.total / 10),
      };
    }
  } catch (err) {
    console.warn("FastAPI guest placeOrder failed, falling back to Supabase", err);
  }

  try {
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        outlet_id: payload.outletId || 1,
        order_number: orderNumber,
        order_type: payload.orderType,
        customer_id: payload.customerId ? Number(payload.customerId) : null,
        table_id: payload.tableId || null,
        status: "Pending",
        payment_status: "unpaid",
        payment_method: payload.paymentMethod,
        subtotal: payload.subtotal,
        tax_amount: payload.taxAmount,
        discount_amount: payload.discountAmount,
        delivery_fee: payload.deliveryFee,
        total: payload.total,
        delivery_address: payload.deliveryAddress?.fullAddress || null,
        special_instructions: payload.specialInstructions || null,
        promo_code: payload.promoCode || null,
        loyalty_points_used: payload.loyaltyPointsUsed || 0,
        loyalty_points_earned: Math.floor(payload.total / 10),
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    // Insert order items
    const orderItems = payload.items.map((item) => ({
      order_id: order.id,
      menu_item_id: Number(item.menuItemId),
      menu_item_name: "",
      quantity: item.quantity,
      unit_price: item.unitPrice,
      notes: item.notes || null,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
    if (itemsErr) throw itemsErr;

    return {
      success: true,
      orderId: orderNumber,
      estimatedTime: payload.orderType === "delivery" ? 40 : 20,
      loyaltyPointsEarned: Math.floor(payload.total / 10),
    };
  } catch (err) {
    console.warn("Supabase placeOrder failed, using mock local storage fallback", err);

    // Resolve active unit and calculate count for SAP serialization format
    const unitCode = localStorage.getItem("baithak_active_unit") || "CUH02";
    const savedOrders = localStorage.getItem("baithak_orders");
    const currentOrders: { order_number?: string }[] = savedOrders ? JSON.parse(savedOrders) : [];

    const ordCount = currentOrders.filter((o) => o.order_number && o.order_number.includes(`-${unitCode}-`)).length + 1;
    const ordSeq = String(ordCount).padStart(4, "0");
    const resolvedOrderNumber = `2627-${unitCode}-ORD-${ordSeq}`;

    // Map items list names
    const mappedItems = payload.items.map((it) => {
      const pName = mockMenuItems.find((mi) => mi.id === it.menuItemId)?.name || "Food Item";
      return {
        product_name: pName,
        quantity: it.quantity,
        unit_price: it.unitPrice,
        line_total: it.unitPrice * it.quantity,
      };
    });

    const newOrder = {
      id: `ord-${Date.now()}`,
      order_number: resolvedOrderNumber,
      branch_id: unitCode,
      order_type: payload.orderType === "delivery" ? "delivery" : "dine_in",
      order_source: "customer_web",
      status: "confirmed",
      payment_status: "paid",
      subtotal: payload.subtotal,
      discount_amount: payload.discountAmount,
      total_tax: payload.taxAmount,
      grand_total: payload.total,
      amount_paid: payload.total,
      balance_due: 0,
      notes: payload.specialInstructions || "Customer Web Ordering",
      items: mappedItems,
      created_at: new Date().toISOString(),
    };
    currentOrders.push(newOrder);
    localStorage.setItem("baithak_orders", JSON.stringify(currentOrders));

    // Also write a mock invoice for admin billing sync using same SAP serial
    const savedInvs = localStorage.getItem("baithak_invoices");
    const currentInvs: { number?: string }[] = savedInvs ? JSON.parse(savedInvs) : [];
    const invCount = currentInvs.filter((i) => i.number && i.number.includes(`-${unitCode}-`)).length + 1;
    const invSeq = String(invCount).padStart(4, "0");
    const resolvedInvoiceNumber = `2627-${unitCode}-INV-${invSeq}`;

    currentInvs.push({
      id: `inv-${Date.now()}`,
      number: resolvedInvoiceNumber,
      customer: payload.customerId ? `Guest (${payload.customerId})` : "Customer Food App",
      date: new Date().toISOString().slice(0, 10),
      amount: payload.total,
      status: "paid",
    });
    localStorage.setItem("baithak_invoices", JSON.stringify(currentInvs));

    // Save this order state locally for status checking
    localStorage.setItem(`baithak_status_${orderNumber}`, JSON.stringify({
      orderId: orderNumber,
      status: "Preparing",
      createdAt: new Date().toISOString(),
      estimatedTime: payload.orderType === "delivery" ? 40 : 20,
    }));

    return {
      success: true,
      orderId: orderNumber,
      estimatedTime: payload.orderType === "delivery" ? 40 : 20,
      loyaltyPointsEarned: Math.floor(payload.total / 10),
    };
  }
}

export interface OrderStatusResponse {
  orderId: string;
  status: "Pending" | "Preparing" | "Ready" | "Out for Delivery" | "Delivered" | "Completed" | "Cancelled";
  estimatedTime: number;
  updatedAt: string;
}

export async function fetchOrderStatus(orderId: string): Promise<OrderStatusResponse> {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("order_number", orderId)
      .single();

    if (error) throw error;

    return {
      orderId: data.order_number,
      status: data.status,
      estimatedTime: data.estimated_time || 15,
      updatedAt: data.updated_at,
    };
  } catch (err) {
    console.warn("Supabase fetchOrderStatus failed, simulating progression locally", err);
    
    const localStatus = localStorage.getItem(`baithak_status_${orderId}`);
    if (localStatus) {
      const sObj = JSON.parse(localStatus);
      const diffMs = Date.now() - new Date(sObj.createdAt).getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      
      // Simulate status progression
      let currentStatus: OrderStatusResponse["status"] = "Preparing";
      if (diffSecs < 10) currentStatus = "Pending";
      else if (diffSecs < 30) currentStatus = "Preparing";
      else if (diffSecs < 60) currentStatus = "Ready";
      else currentStatus = "Delivered";

      return {
        orderId,
        status: currentStatus,
        estimatedTime: Math.max(0, sObj.estimatedTime - Math.floor(diffSecs / 60)),
        updatedAt: new Date().toISOString(),
      };
    }

    return {
      orderId,
      status: "Preparing",
      estimatedTime: 15,
      updatedAt: new Date().toISOString(),
    };
  }
}

export async function fetchMyOrders(userId: string): Promise<PastOrder[]> {
  return [];
}

/* ── Promo Codes ──────────────────────────────────── */

export interface PromoValidationResult {
  valid: boolean;
  discount: number;
  message: string;
  type: "percentage" | "flat";
  value: number;
}

const MOCK_PROMOS: Record<string, { type: "percentage" | "flat"; value: number; minOrder: number }> = {
  WELCOME50: { type: "flat", value: 50, minOrder: 200 },
  BAITHAK20: { type: "percentage", value: 20, minOrder: 300 },
  FIRST100: { type: "flat", value: 100, minOrder: 500 },
};

export async function validatePromoCode(code: string, orderTotal: number): Promise<PromoValidationResult> {
  const promo = MOCK_PROMOS[code.toUpperCase()];
  if (!promo) return { valid: false, discount: 0, message: "Invalid promo code", type: "flat", value: 0 };
  if (orderTotal < promo.minOrder) {
    return { valid: false, discount: 0, message: `Minimum order ₹${promo.minOrder} required`, type: promo.type, value: promo.value };
  }
  const discount = promo.type === "percentage" ? Math.round(orderTotal * (promo.value / 100)) : promo.value;
  return { valid: true, discount, message: `₹${discount} off applied!`, type: promo.type, value: promo.value };
}

/* ── Loyalty ──────────────────────────────────────── */

export function calculateLoyaltyDiscount(points: number): number {
  return points;
}

/* ── Payment ──────────────────────────────────────── */

export interface InitPaymentResponse {
  success: boolean;
  paymentId: string;
  gatewayOrderId: string;
}

export async function initiatePayment(orderId: string, amount: number, method: string): Promise<InitPaymentResponse> {
  await new Promise((r) => setTimeout(r, 800));
  return {
    success: true,
    paymentId: `PAY-${Date.now().toString(36).toUpperCase()}`,
    gatewayOrderId: `RZPAY-${Date.now()}`,
  };
}

/* ── Profile ──────────────────────────────────────── */

export interface SavedAddress {
  id: string;
  label: string;
  fullAddress: string;
  lat?: number;
  lng?: number;
}

export async function fetchSavedAddresses(userId: string): Promise<SavedAddress[]> {
  return [
    { id: "addr-1", label: "Home", fullAddress: "123 MG Road, Sector 14, Delhi - 110001" },
    { id: "addr-2", label: "Office", fullAddress: "456 Cyber Hub, Gurugram, Haryana - 122002" },
  ];
}

export async function saveAddress(userId: string, address: Omit<SavedAddress, "id">): Promise<SavedAddress> {
  return { ...address, id: `addr-${Date.now()}` };
}

export async function deleteAddress(userId: string, addressId: string): Promise<boolean> {
  return true;
}
