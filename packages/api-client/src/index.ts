/**
 * SSR One AI – Monorepo Shared API Client
 * Axios client setup with multi-tenant headers, JWT refresh interceptor, and branch isolation.
 */
import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";

const normalizeApiBaseUrl = (url: string | undefined): string | undefined => {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  const normalized = trimmed.replace(/\/+$/, "");
  return normalized.endsWith("/api/v1") ? normalized : `${normalized}/api/v1`;
};

const resolveDynamicBaseUrl = (): string => {
  if (typeof globalThis !== "undefined" && (globalThis as { __SSR_ONE_AI_API_BASE__?: string }).__SSR_ONE_AI_API_BASE__) {
    const custom = normalizeApiBaseUrl((globalThis as { __SSR_ONE_AI_API_BASE__?: string }).__SSR_ONE_AI_API_BASE__);
    if (custom) return custom;
  }

  const envUrl = typeof import.meta !== "undefined" && (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_API_URL
    ? (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_API_URL
    : undefined;
  const normalizedEnv = normalizeApiBaseUrl(envUrl);

  // Auto-detect Railway cloud environment when running in browser
  if (typeof window !== "undefined" && window.location.hostname.endsWith(".railway.app")) {
    if (!normalizedEnv || normalizedEnv.includes("localhost") || normalizedEnv.includes("127.0.0.1")) {
      return "https://backend-production-43941.up.railway.app/api/v1";
    }
  }

  return normalizedEnv ?? "http://localhost:8000/api/v1";
};

const BASE_URL = resolveDynamicBaseUrl();

const ACCESS_TOKEN_KEY = "ssrone_access_token";
const REFRESH_TOKEN_KEY = "ssrone_refresh_token";
const TENANT_SLUG_KEY = "ssrone_tenant_slug";
const BRANCH_CODE_KEY = "ssrone_branch_code";
const BRANCH_ID_KEY = "ssrone_branch_id";

export const getAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const setAccessToken = (token: string): void =>
  localStorage.setItem(ACCESS_TOKEN_KEY, token);

export const getRefreshToken = (): string | null =>
  localStorage.getItem(REFRESH_TOKEN_KEY);

export const setRefreshToken = (token: string): void =>
  localStorage.setItem(REFRESH_TOKEN_KEY, token);

export const clearAuthData = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TENANT_SLUG_KEY);
  localStorage.removeItem(BRANCH_CODE_KEY);
  localStorage.removeItem(BRANCH_ID_KEY);
};

export const triggerSessionExpired = (): void => {
  clearAuthData();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("ssrone:auth-expired"));
  }
};

export const getTenantSlug = (): string | null =>
  localStorage.getItem(TENANT_SLUG_KEY);

export const setTenantSlug = (slug: string): void =>
  localStorage.setItem(TENANT_SLUG_KEY, slug);

export const getBranchCode = (): string | null =>
  localStorage.getItem(BRANCH_CODE_KEY);

export const setBranchCode = (code: string): void =>
  localStorage.setItem(BRANCH_CODE_KEY, code);

export const getBranchId = (): string | null =>
  localStorage.getItem(BRANCH_ID_KEY);

export const setBranchId = (id: string): void =>
  localStorage.setItem(BRANCH_ID_KEY, id);

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const tenantSlug = getTenantSlug();
    if (tenantSlug) {
      config.headers["X-Tenant-Slug"] = tenantSlug;
    }

    const branchCode = getBranchCode();
    if (branchCode) {
      config.headers["X-Branch-Code"] = branchCode;
    }

    const branchId = getBranchId() || localStorage.getItem("active_branch_id");
    if (branchId) {
      config.headers["X-Branch-ID"] = String(branchId);
    }

    try {
      const authState = JSON.parse(localStorage.getItem("ssrone-auth-storage") || "{}")?.state;
      if (authState?.selected_company?.id) {
        config.headers["X-Company-ID"] = String(authState.selected_company.id);
      }
      if (authState?.selected_branch?.id) {
        config.headers["X-Branch-ID"] = String(authState.selected_branch.id);
      }
      if (authState?.selected_fin_year?.code) {
        config.headers["X-Fin-Year"] = String(authState.selected_fin_year.code);
      }
    } catch {
      // Fallback ignore if storage parse fails
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Concurrency lock and queue for transparent 401 token refresh & retry
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Check if error is 401 Unauthorized and not already retried
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const url = originalRequest.url || "";
      // Avoid looping on auth endpoints
      if (url.includes("/auth/login") || url.includes("/auth/refresh") || url.includes("/auth/logout")) {
        return Promise.reject(error);
      }

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        triggerSessionExpired();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post<{
          access_token: string;
          refresh_token?: string;
        }>(
          `${BASE_URL}/auth/refresh`,
          { refresh_token: refreshToken },
          {
            headers: {
              "Content-Type": "application/json",
              ...(getTenantSlug() ? { "X-Tenant-Slug": getTenantSlug()! } : {}),
            },
            withCredentials: true,
          }
        );

        const newAccessToken = refreshResponse.data.access_token;
        setAccessToken(newAccessToken);
        if (refreshResponse.data.refresh_token) {
          setRefreshToken(refreshResponse.data.refresh_token);
        }

        // Sync zustand persistent storage if present
        try {
          const rawStorage = localStorage.getItem("ssrone-auth-storage");
          if (rawStorage) {
            const parsed = JSON.parse(rawStorage);
            if (parsed.state) {
              parsed.state.access_token = newAccessToken;
              if (refreshResponse.data.refresh_token) {
                parsed.state.refresh_token = refreshResponse.data.refresh_token;
              }
              localStorage.setItem("ssrone-auth-storage", JSON.stringify(parsed));
            }
          }
        } catch {
          // ignore parsing error
        }

        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        triggerSessionExpired();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const api = {
  get: <T>(url: string, params?: object, options?: object) =>
    apiClient.get<T>(url, { params, ...options }).then((r) => r.data),

  post: <T>(url: string, data?: unknown, options?: object) =>
    apiClient.post<T>(url, data, options).then((r) => r.data),

  put: <T>(url: string, data?: unknown, options?: object) =>
    apiClient.put<T>(url, data, options).then((r) => r.data),

  patch: <T>(url: string, data?: unknown, options?: object) =>
    apiClient.patch<T>(url, data, options).then((r) => r.data),

  delete: <T>(url: string, options?: object) =>
    apiClient.delete<T>(url, options).then((r) => r.data),
};

export const createApiClient = (baseUrl?: string) => {
  const client = axios.create({
    baseURL: baseUrl ?? BASE_URL,
    timeout: 30_000,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const tenantSlug = getTenantSlug();
    if (tenantSlug) {
      config.headers["X-Tenant-Slug"] = tenantSlug;
    }

    return config;
  });

  return client;
};

export interface BranchInfo {
  id: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  is_active?: boolean;
}

export const fetchPublicBranches = async (tenantSlug?: string): Promise<BranchInfo[]> => {
  const slug = tenantSlug || getTenantSlug() || "baithak-cafe";
  try {
    const param = slug ? `?tenant_slug=${slug}` : "";
    const res = await api.get<any>(`/auth/public/branches${param}`).catch(() => api.get<any>(`/restaurant/public/branches${param}`));
    const list = Array.isArray(res) ? res : res?.branches || res?.data || [];
    if (list && list.length > 0) {
      return list.map((b: any) => ({
        id: String(b.id),
        code: b.code || `BR-00${b.id}`,
        name: b.name,
        address: typeof b.address === "string" ? b.address : (b.address?.city || b.name),
        phone: b.phone
      }));
    }
  } catch {
    // API error
  }

  if (slug === "baithak-cafe") {
    return [
      { id: "1", code: "BAITHAK-CUH", name: "Baithak Cafe - CUH Mahendragarh", address: "Mahendragarh" },
      { id: "2", code: "GGN01", name: "Baithak Cafe - Gurugram", address: "Gurugram" },
    ];
  }

  return [
    { id: "1", code: "BR01", name: "Main Outlet", address: "Main Street" },
    { id: "2", code: "BR02", name: "Express Outlet", address: "Express Highway" },
  ];
};

// In-memory instant cache for 0ms menu rendering
let cachedMenuItems: { key: string; data: any[]; timestamp: number } | null = null;
let cachedCategories: { key: string; data: any[]; timestamp: number } | null = null;

export const getCachedMenuItems = (branchId?: number | string): any[] | null => {
  const key = String(branchId || "default");
  if (cachedMenuItems && cachedMenuItems.key === key && cachedMenuItems.data.length > 0) {
    return cachedMenuItems.data;
  }
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem(`ssrone_menu_items_${key}`) || localStorage.getItem(`ssrone_menu_items_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedMenuItems = { key, data: parsed, timestamp: Date.now() };
          return parsed;
        }
      }
    } catch {}
  }
  return null;
};

export const getCachedCategories = (branchId?: number | string): any[] | null => {
  const key = String(branchId || "default");
  if (cachedCategories && cachedCategories.key === key && cachedCategories.data.length > 0) {
    return cachedCategories.data;
  }
  if (typeof window !== "undefined") {
    try {
      const stored = sessionStorage.getItem(`ssrone_categories_${key}`) || localStorage.getItem(`ssrone_categories_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedCategories = { key, data: parsed, timestamp: Date.now() };
          return parsed;
        }
      }
    } catch {}
  }
  return null;
};

export const fetchCategories = async (branchId?: number | string): Promise<any[]> => {
  const key = String(branchId || "default");
  try {
    const param = branchId ? `?branch_id=${branchId}` : "";
    const res = await api.get<any>(`/restaurant/categories${param}`);
    const list = Array.isArray(res) ? res : res?.categories || res?.data || [];
    if (list.length > 0) {
      cachedCategories = { key, data: list, timestamp: Date.now() };
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`ssrone_categories_${key}`, JSON.stringify(list));
        } catch {}
      }
    }
    return list;
  } catch {
    return getCachedCategories(branchId) || [];
  }
};

const resolveDishImage = (name: string, catId: string | number, existingUrl?: string): string => {
  if (existingUrl && !existingUrl.includes("1546069901-ba9599a7e63c")) {
    return existingUrl;
  }
  const n = (name || "").toLowerCase();
  const c = String(catId);
  if (n.includes("pizza") || c === "7") return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=200&q=75";
  if (n.includes("momo") || c === "1") return "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=200&q=75";
  if (n.includes("roll") || c === "2") return "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=200&q=75";
  if (n.includes("noodle") || n.includes("rice") || c === "3") return "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=200&q=75";
  if (n.includes("fry") || n.includes("fries") || n.includes("pasta") || c === "5" || c === "6") return "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=200&q=75";
  if (n.includes("drink") || n.includes("chai") || n.includes("coffee") || c === "8") return "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=200&q=75";
  if (n.includes("tandoor") || c === "9") return "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=200&q=75";
  if (n.includes("paneer") || n.includes("sabji") || c === "10" || c === "11") return "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=200&q=75";
  if (n.includes("naan") || n.includes("roti") || n.includes("bread") || c === "12" || c === "13") return "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=200&q=75";
  if (n.includes("thali") || n.includes("combo") || c === "14" || c === "15") return "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=200&q=75";
  return "https://images.unsplash.com/photo-1546069901-d8a436573c7f?auto=format&fit=crop&w=200&q=75";
};

export const fetchMenuItems = async (branchId?: number | string): Promise<any[]> => {
  const key = String(branchId || "default");
  try {
    const param = branchId ? `?branch_id=${branchId}` : "";
    const res = await api.get<any>(`/restaurant/menu-items${param}`);
    const list = Array.isArray(res) ? res : res?.items || res?.data || [];
    const formatted = list.map((item: any) => {
      const priceVal = typeof item.price === "number" ? item.price : parseFloat(String(item.price || item.base_price || 0)) || 100;
      const catId = item.categoryId ?? item.category_id ?? "all";
      const imgUrl = resolveDishImage(item.name, catId, item.imageUrl || item.image_url || item.image);
      return {
        id: String(item.id || `item_${Math.random()}`),
        name: item.name || "Delicious Item",
        description: item.description || "Freshly prepared dining item",
        price: priceVal,
        basePrice: priceVal,
        base_price: priceVal,
        categoryId: String(catId),
        category_id: String(catId),
        isVeg: item.isVeg !== undefined ? item.isVeg : (item.is_veg !== false),
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : (item.is_available !== false),
        isPopular: item.isPopular || item.is_popular || false,
        imageUrl: imgUrl,
        image: imgUrl,
        tags: item.tags || [],
        variantGroups: (item.variant_groups || item.variantGroups || []).map((vg: any) => ({
          id: String(vg.id || `vg_${Math.random()}`),
          name: vg.name || "Size / Portion",
          isRequired: vg.is_required !== undefined ? vg.is_required : (vg.isRequired !== false),
          minSelection: vg.min_selection ?? vg.minSelection ?? 1,
          maxSelection: vg.max_selection ?? vg.maxSelection ?? 1,
          sortOrder: vg.sort_order ?? vg.sortOrder ?? 1,
          options: (vg.options || []).map((opt: any) => ({
            id: String(opt.id || `vopt_${Math.random()}`),
            name: opt.name || "",
            price: typeof opt.selling_price === "number" ? opt.selling_price : (typeof opt.price === "number" ? opt.price : 0),
            sellingPrice: typeof opt.selling_price === "number" ? opt.selling_price : (typeof opt.price === "number" ? opt.price : 0),
            isDefault: opt.is_default !== undefined ? opt.is_default : (opt.isDefault || false),
            isAvailable: opt.is_available !== undefined ? opt.is_available : (opt.isAvailable !== false),
            sortOrder: opt.sort_order ?? opt.sortOrder ?? 1
          }))
        })),
        addonGroups: (item.addon_groups || item.addonGroups || []).map((ag: any) => ({
          id: String(ag.id || `ag_${Math.random()}`),
          name: ag.name || "Extra Addons",
          isRequired: ag.is_required !== undefined ? ag.is_required : (ag.isRequired || false),
          minSelection: ag.min_selection ?? ag.minSelection ?? 0,
          maxSelection: ag.max_selection ?? ag.maxSelection ?? 5,
          sortOrder: ag.sort_order ?? ag.sortOrder ?? 1,
          options: (ag.options || []).map((opt: any) => ({
            id: String(opt.id || `aopt_${Math.random()}`),
            name: opt.name || "",
            price: typeof opt.price === "number" ? opt.price : (parseFloat(String(opt.price || 0)) || 0),
            variant_prices: opt.variant_prices || opt.variantPrices || {},
            variantPrices: opt.variant_prices || opt.variantPrices || {},
            isAvailable: opt.is_available !== undefined ? opt.is_available : (opt.isAvailable !== false),
            sortOrder: opt.sort_order ?? opt.sortOrder ?? 1
          }))
        }))
      };
    });

    if (formatted.length > 0) {
      cachedMenuItems = { key, data: formatted, timestamp: Date.now() };
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(`ssrone_menu_items_${key}`, JSON.stringify(formatted));
        } catch {}
      }
    }
    return formatted;
  } catch {
    return getCachedMenuItems(branchId) || [];
  }
};

export const validatePromoCode = async (code: string, total: number): Promise<{ valid: boolean; discountAmount: number; message?: string }> => {
  try {
    return await api.post("/pos/validate-promo", { code, total });
  } catch {
    return { valid: false, discountAmount: 0, message: "Invalid promo code" };
  }
};

export const placeOrder = async (orderData: any): Promise<{ orderId: string; orderNumber?: string; status: string; estimatedTime?: number; loyaltyPointsEarned?: number; raw?: any }> => {
  // Normalize items for backend schema
  const rawItems = Array.isArray(orderData?.items) ? orderData.items : [];
  const normalizedItems = rawItems.map((it: any) => ({
    product_id: it.product_id || it.productId || it.menuItemId || it.id || 1,
    item_id: it.product_id || it.productId || it.menuItemId || it.id || 1,
    product_name: it.product_name || it.productName || it.name || "Dish Item",
    name: it.product_name || it.productName || it.name || "Dish Item",
    quantity: it.quantity || 1,
    unit_price: it.unit_price ?? it.unitPrice ?? it.price ?? 0,
    variant_name: it.variant_name || it.variantName || (Array.isArray(it.selectedVariants) ? it.selectedVariants.map((v: any) => v.option?.name).join(", ") : undefined),
    addons: it.addons || it.selectedAddons || [],
    preparation_notes: it.preparation_notes || it.notes,
    notes: it.notes || it.preparation_notes,
    discount_amount: it.discount_amount || 0,
  }));

  const rawMode = String(orderData?.order_mode || orderData?.orderType || orderData?.order_type || "dine_in").toLowerCase();
  const effMode = rawMode.includes("deliv") ? "delivery" : (rawMode.includes("take") || rawMode.includes("pickup")) ? "takeaway" : "dine_in";

  const payload = {
    ...orderData,
    customer_id: orderData?.customer_id || orderData?.customerId,
    customerId: orderData?.customer_id || orderData?.customerId,
    customer_name: orderData?.customer_name || orderData?.customerName || orderData?.name,
    customer_phone: orderData?.customer_phone || orderData?.customerPhone || orderData?.phone,
    tenant_slug: orderData?.tenant_slug || orderData?.tenantSlug,
    branch_id: orderData?.branch_id || orderData?.branchId || 1,
    source_channel: orderData?.source_channel || "customer_web",
    order_source: orderData?.order_source || "customer_web",
    order_type: effMode,
    order_mode: effMode,
    table_name: orderData?.table_name || orderData?.tableNumber || orderData?.table_number,
    subtotal: orderData?.subtotal || orderData?.total || 0,
    net_amount: orderData?.net_amount || orderData?.total || orderData?.grandTotal || 0,
    tax_amount: orderData?.tax_amount || orderData?.taxAmount || 0,
    discount_amount: orderData?.discount_amount || orderData?.discountAmount || 0,
    payment_method: String(orderData?.payment_method || orderData?.paymentMethod || "CASH").toUpperCase(),
    status: orderData?.payment_status === "paid" ? "COMPLETED" : "PENDING",
    payment_status: orderData?.payment_status || orderData?.paymentStatus || "unpaid",
    special_instructions: orderData?.special_instructions || orderData?.specialInstructions,
    items: normalizedItems,
  };

  try {
    const res = await api.post<any>("/orders", payload);
    return {
      orderId: String(res?.id || res?.order_number || res?.order_id),
      orderNumber: String(res?.order_number || res?.id || ""),
      status: res?.status || "KOT_SENT",
      estimatedTime: res?.estimated_time || 15,
      loyaltyPointsEarned: res?.loyalty_points_earned || 10,
      raw: res,
    };
  } catch (err) {
    const res = await api.post<any>("/pos/orders", payload);
    return {
      orderId: String(res?.id || res?.order_number || res?.order_id),
      orderNumber: String(res?.order_number || res?.id || ""),
      status: res?.status || "KOT_SENT",
      estimatedTime: res?.estimated_time || 15,
      loyaltyPointsEarned: res?.loyalty_points_earned || 10,
      raw: res,
    };
  }
};

export const createRazorpayOrder = async (data: {
  amount: number;
  currency?: string;
  tenant_slug?: string;
  branch_code?: string;
  receipt?: string;
}): Promise<{ success: boolean; order_id: string; amount: number; currency: string; key_id: string }> => {
  return await api.post("/orders/razorpay/create-order", data);
};

export const verifyRazorpayPayment = async (data: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<{ success: boolean; verified: boolean; message: string }> => {
  return await api.post("/orders/razorpay/verify-payment", data);
};

export interface SavedAddress {
  id?: string | number;
  customer_id?: number;
  label: string;
  flat_no?: string;
  area_street?: string;
  landmark?: string;
  fullAddress: string;
  city?: string;
  state?: string;
  pincode?: string;
  is_default?: boolean;
  alternate_phone?: string;
}

export interface TableInfo {
  id: number;
  table_number: string;
  name?: string;
  capacity?: number;
  section?: string;
  floor?: string;
  status?: string;
  is_active?: boolean;
  qr_code_url?: string;
}

export const fetchTables = async (branchId?: number | string): Promise<TableInfo[]> => {
  try {
    const param = branchId ? `?branch_id=${branchId}` : "";
    const res = await api.get<any>(`/restaurant/tables${param}`).catch(() => api.get<any>(`/pos/tables${param}`));
    return Array.isArray(res) ? res : res?.tables || res?.data || [];
  } catch {
    return [];
  }
};

export const fetchSavedAddresses = async (userId?: string, phone?: string): Promise<SavedAddress[]> => {
  try {
    const params = new URLSearchParams();
    if (userId && !isNaN(Number(userId))) params.append("customer_id", String(userId));
    if (phone) params.append("phone", phone);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return await api.get(`/customer/addresses${qs}`);
  } catch {
    try {
      const params = new URLSearchParams();
      if (userId && !isNaN(Number(userId))) params.append("customer_id", String(userId));
      if (phone) params.append("phone", phone);
      const qs = params.toString() ? `?${params.toString()}` : "";
      return await api.get(`/customers/addresses${qs}`);
    } catch {
      return [];
    }
  }
};

export const checkCustomerPhone = async (phone: string, tenantSlug?: string): Promise<{ exists: boolean; name?: string; hasPassword?: boolean }> => {
  const res = await api.get<any>(`/crm/customers/check-phone?phone=${encodeURIComponent(phone)}&tenant=${encodeURIComponent(tenantSlug || "")}`);
  return { exists: !!res?.exists, name: res?.name, hasPassword: !!res?.hasPassword };
};

export const registerCustomerAccount = async (data: { name: string; phone: string; password?: string; tenantSlug?: string }): Promise<{ success: boolean; user: any; message?: string }> => {
  const res = await api.post<any>("/crm/customers/register", data);
  return { success: true, user: res.user || res };
};

export const resetCustomerPassword = async (data: { phone: string; otp: string; newPassword: string }): Promise<{ success: boolean; message?: string }> => {
  return await api.post("/auth/reset-password", data);
};

export interface SendOtpResponse {
  success: boolean;
  message?: string;
  channel?: "whatsapp" | "sms" | string;
  otp?: string;
  whatsapp_url?: string;
  customer_exists?: boolean;
  customer_name?: string;
}

export const sendOtp = async (
  phone: string,
  channel: "whatsapp" | "sms" = "whatsapp",
  tenantSlug?: string
): Promise<SendOtpResponse> => {
  const slug = tenantSlug || getTenantSlug() || "baithak-cafe";
  return await api.post<SendOtpResponse>("/auth/send-otp", { phone, channel, tenant_slug: slug });
};

export const verifyOtp = async (
  phone: string,
  otp: string,
  tenantSlug?: string,
  name?: string
): Promise<{ success: boolean; token?: string; access_token?: string; user: { id: string; name: string; phone: string; loyaltyTier: string; loyaltyPoints: number } }> => {
  const slug = tenantSlug || getTenantSlug() || "baithak-cafe";
  return await api.post("/auth/verify-otp", { phone, otp, tenant_slug: slug, name });
};

export const saveAddress = async (
  userId: string,
  address: {
    label: string;
    fullAddress?: string;
    flat_no?: string;
    area_street?: string;
    landmark?: string;
    city?: string;
    state?: string;
    pincode?: string;
    is_default?: boolean;
    alternate_phone?: string;
    phone?: string;
  }
): Promise<SavedAddress> => {
  const custId = userId && !isNaN(Number(userId)) ? Number(userId) : undefined;
  const params = new URLSearchParams();
  if (custId) params.append("customer_id", String(custId));
  if (address.phone) params.append("phone", address.phone);
  const paramStr = params.toString() ? `?${params.toString()}` : "";
  try {
    return await api.post<SavedAddress>(`/customer/addresses${paramStr}`, address);
  } catch {
    return await api.post<SavedAddress>(`/customers/addresses${paramStr}`, address);
  }
};

export const saveCustomerAddress = saveAddress;

export const updateCustomerProfile = async (
  userIdOrPhone: string,
  profileData: { name?: string; email?: string; address?: string; city?: string; pincode?: string; phone?: string }
): Promise<any> => {
  try {
    return await api.put(`/crm/customers/${encodeURIComponent(userIdOrPhone)}`, profileData);
  } catch {
    return await api.put(`/customers/${encodeURIComponent(userIdOrPhone)}`, profileData);
  }
};

export const deleteAddress = async (userId: string, addressId: string): Promise<void> => {
  try {
    await api.delete(`/customer/addresses/${addressId}`);
  } catch {
    await api.delete(`/customers/addresses/${addressId}`);
  }
};

export const fetchCustomerOrders = async (customerIdOrPhone: string | number): Promise<any[]> => {
  try {
    const res = await api.get<any[]>(`/orders/by-customer/${encodeURIComponent(String(customerIdOrPhone))}`);
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
};


// ═══════════════════════════════════════════
// TENANT APP CONFIG & CUSTOMIZATION STUDIO
// ═══════════════════════════════════════════

export interface GlobalBrandingConfig {
  businessName: string;
  tagline: string;
  logoUrl?: string;
  primaryColor: string;
  accentColor: string;
  phone?: string;
  address?: string;
  businessHours?: string;
  socialLinks?: {
    instagram?: string;
    whatsapp?: string;
    googleMaps?: string;
  };
}

export interface FoodWebConfig {
  banner?: {
    imageUrl?: string;
    headline?: string;
    subtext?: string;
  };
  features?: {
    tableQrOrdering?: boolean;
    takeaway?: boolean;
    delivery?: boolean;
    onlinePayment?: boolean;
  };
  taxSettings?: {
    applyGst?: boolean;
    gstRate?: number;
    pricesIncludeTax?: boolean;
  };
  charges?: {
    enablePackingCharge?: boolean;
    packingChargeAmount?: number;
    enableDeliveryCharge?: boolean;
    deliveryChargeAmount?: number;
  };
  kitchenPrinting?: {
    autoPrintKotOnOrder?: boolean;
  };
  orderConfirmationMessage?: string;
  hiddenCategories?: string[];
  hiddenItems?: string[];
  featuredItems?: string[];
}

export interface TenantAppConfigPayload {
  branding?: GlobalBrandingConfig;
  banner?: {
    imageUrl?: string;
    headline?: string;
    subtext?: string;
  };
  features?: Record<string, boolean>;
  orderConfirmationMessage?: string;
  hiddenCategories?: string[];
  hiddenItems?: string[];
  featuredItems?: string[];
  [key: string]: any;
}

export interface AppConfigAdminResponse {
  id: string;
  tenant_id: string;
  branch_id?: string | null;
  app_name: string;
  draft_config: TenantAppConfigPayload;
  published_config: TenantAppConfigPayload;
  config_version: number;
  published_at?: string | null;
  is_draft_modified: boolean;
}

export interface PublicAppConfigResponse {
  tenant_id: string;
  branch_id?: string | null;
  app_name: string;
  config: TenantAppConfigPayload;
  config_version: number;
  is_draft: boolean;
}

export interface DNSInstruction {
  record_type: string;
  host: string;
  target: string;
  ttl: string;
  notes: string;
}

export interface CustomDomainRecord {
  id: string;
  tenant_id: string;
  branch_id?: string | null;
  app_name: string;
  domain: string;
  status: "pending_dns" | "verified" | "failed";
  record_type: "CNAME" | "A";
  target_value: string;
  verified_at?: string | null;
  last_checked_at?: string | null;
  error_message?: string | null;
  dns_instruction: DNSInstruction;
}

export const fetchPublicTenantConfig = async (
  tenantSlug: string,
  branchCode: string,
  appName: string,
  isDraft: boolean = false
): Promise<PublicAppConfigResponse | null> => {
  try {
    const draftParam = isDraft ? "?draft=true" : "";
    return await api.get<PublicAppConfigResponse>(
      `/tenant-config/by-slug/${tenantSlug}/${branchCode}/${appName}${draftParam}`
    );
  } catch {
    return null;
  }
};

export const fetchTenantAppConfig = fetchPublicTenantConfig;

export const fetchAdminAppConfig = async (
  appName: string,
  branchId?: string | number
): Promise<AppConfigAdminResponse> => {
  const param = branchId ? `?branch_id=${branchId}` : "";
  return await api.get<AppConfigAdminResponse>(`/tenant-config/admin/${appName}${param}`);
};

export const saveDraftAppConfig = async (
  appName: string,
  draftConfig: Record<string, any>,
  branchId?: string | number
): Promise<AppConfigAdminResponse> => {
  return await api.put<AppConfigAdminResponse>(`/tenant-config/admin/${appName}/draft`, {
    draft_config: draftConfig,
    branch_id: branchId ? Number(branchId) : null,
  });
};

export const publishAppConfig = async (
  appName: string,
  branchId?: string | number
): Promise<AppConfigAdminResponse> => {
  return await api.post<AppConfigAdminResponse>(`/tenant-config/admin/${appName}/publish`, {
    branch_id: branchId ? Number(branchId) : null,
  });
};

export const resetDraftAppConfig = async (
  appName: string,
  branchId?: string | number
): Promise<AppConfigAdminResponse> => {
  return await api.post<AppConfigAdminResponse>(`/tenant-config/admin/${appName}/reset-draft`, {
    branch_id: branchId ? Number(branchId) : null,
  });
};

export const fetchCustomDomains = async (): Promise<CustomDomainRecord[]> => {
  try {
    return await api.get<CustomDomainRecord[]>("/custom-domains");
  } catch {
    return [];
  }
};

export const registerCustomDomain = async (data: {
  domain: string;
  app_name?: string;
  branch_id?: number | null;
}): Promise<CustomDomainRecord> => {
  return await api.post<CustomDomainRecord>("/custom-domains", data);
};

export const verifyCustomDomain = async (domainId: string | number): Promise<CustomDomainRecord> => {
  return await api.post<CustomDomainRecord>(`/custom-domains/${domainId}/verify`);
};

export const deleteCustomDomain = async (domainId: string | number): Promise<void> => {
  await api.delete(`/custom-domains/${domainId}`);
};

export default apiClient;
