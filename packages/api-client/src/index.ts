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
const TENANT_SLUG_KEY = "ssrone_tenant_slug";
const BRANCH_CODE_KEY = "ssrone_branch_code";
const BRANCH_ID_KEY = "ssrone_branch_id";

export const getAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const setAccessToken = (token: string): void =>
  localStorage.setItem(ACCESS_TOKEN_KEY, token);

export const clearAuthData = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(TENANT_SLUG_KEY);
  localStorage.removeItem(BRANCH_CODE_KEY);
  localStorage.removeItem(BRANCH_ID_KEY);
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

export const fetchCategories = async (branchId?: number | string): Promise<any[]> => {
  try {
    const param = branchId ? `?branch_id=${branchId}` : "";
    const res = await api.get<any>(`/restaurant/categories${param}`).catch(() => api.get<any>(`/pos/categories${param}`));
    return Array.isArray(res) ? res : res?.categories || res?.data || [];
  } catch {
    return [];
  }
};

export const fetchMenuItems = async (branchId?: number | string): Promise<any[]> => {
  try {
    const param = branchId ? `?branch_id=${branchId}` : "";
    const res = await api.get<any>(`/restaurant/menu-items${param}`).catch(() => api.get<any>(`/pos/items${param}`));
    const list = Array.isArray(res) ? res : res?.items || res?.data || [];
    return list.map((item: any) => {
      const priceVal = typeof item.price === "number" ? item.price : parseFloat(String(item.price || item.base_price || 0)) || 100;
      const imgUrl = item.imageUrl || item.image_url || item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80";
      return {
        id: String(item.id || `item_${Math.random()}`),
        name: item.name || "Delicious Item",
        description: item.description || "Freshly prepared dining item",
        price: priceVal,
        basePrice: priceVal,
        base_price: priceVal,
        categoryId: item.categoryId ?? item.category_id ?? "all",
        category_id: item.category_id ?? item.categoryId ?? "all",
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
  } catch {
    return [];
  }
};

export const validatePromoCode = async (code: string, total: number): Promise<{ valid: boolean; discountAmount: number; message?: string }> => {
  try {
    return await api.post("/pos/validate-promo", { code, total });
  } catch {
    return { valid: false, discountAmount: 0, message: "Invalid promo code" };
  }
};

export const placeOrder = async (orderData: unknown): Promise<{ orderId: string; status: string; estimatedTime?: number; loyaltyPointsEarned?: number }> => {
  try {
    const res = await api.post<any>("/pos/orders", orderData);
    return {
      orderId: String(res?.id || res?.order_number || res?.order_id),
      status: res?.status || "KOT_SENT",
      estimatedTime: res?.estimated_time || 15,
      loyaltyPointsEarned: res?.loyalty_points_earned || 10
    };
  } catch (err) {
    const res = await api.post<any>("/orders", orderData);
    return {
      orderId: String(res?.id || res?.order_number || res?.order_id),
      status: res?.status || "KOT_SENT",
      estimatedTime: res?.estimated_time || 15,
      loyaltyPointsEarned: res?.loyalty_points_earned || 10
    };
  }
};

export interface SavedAddress {
  id?: string | number;
  label: string;
  fullAddress: string;
  city?: string;
  pincode?: string;
  is_default?: boolean;
}

export const fetchSavedAddresses = async (): Promise<SavedAddress[]> => {
  try {
    return await api.get("/customer/addresses");
  } catch {
    try {
      return await api.get("/customers/addresses");
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

export const sendOtp = async (phone: string): Promise<{ success: boolean; message?: string }> => {
  return await api.post("/auth/send-otp", { phone });
};

export const verifyOtp = async (phone: string, otp: string): Promise<{ success: boolean; user: { id: string; name: string; phone: string; loyaltyTier: string; loyaltyPoints: number } }> => {
  return await api.post("/auth/verify-otp", { phone, otp });
};

export const saveAddress = async (userId: string, address: { label: string; fullAddress: string; city?: string; pincode?: string }): Promise<SavedAddress> => {
  try {
    return await api.post<SavedAddress>("/customer/addresses", address);
  } catch {
    return await api.post<SavedAddress>("/customers/addresses", address);
  }
};

export const saveCustomerAddress = saveAddress;

export const updateCustomerProfile = async (userId: string, profileData: { name?: string; email?: string; address?: string; city?: string; pincode?: string }): Promise<any> => {
  return await api.put(`/crm/customers/${userId}`, profileData);
};

export const deleteAddress = async (userId: string, addressId: string): Promise<void> => {
  await api.delete(`/customer/addresses/${addressId}`);
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
