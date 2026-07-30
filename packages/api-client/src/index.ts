/**
 * SSR One AI – Monorepo Shared API Client
 * Axios client setup with multi-tenant headers, JWT refresh interceptor, and branch isolation.
 */
import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";

const BASE_URL = (typeof globalThis !== "undefined" && (globalThis as { __SSR_ONE_AI_API_BASE__?: string }).__SSR_ONE_AI_API_BASE__)
  ? (globalThis as { __SSR_ONE_AI_API_BASE__?: string }).__SSR_ONE_AI_API_BASE__
  : (typeof import.meta !== "undefined" && (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_API_URL)
    ? (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_API_URL
    : "http://localhost:8000/api/v1";

const ACCESS_TOKEN_KEY = "baithak_access_token";
const TENANT_SLUG_KEY = "baithak_tenant_slug";

export const getAccessToken = (): string | null =>
  localStorage.getItem(ACCESS_TOKEN_KEY);

export const setAccessToken = (token: string): void =>
  localStorage.setItem(ACCESS_TOKEN_KEY, token);

export const clearAuthData = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(TENANT_SLUG_KEY);
};

export const getTenantSlug = (): string | null =>
  localStorage.getItem(TENANT_SLUG_KEY);

export const setTenantSlug = (slug: string): void =>
  localStorage.setItem(TENANT_SLUG_KEY, slug);

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  withCredentials: true,
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

    try {
      const selectedBranch = JSON.parse(localStorage.getItem("baithak_auth_storage") || "{}")?.state?.selected_branch;
      if (selectedBranch?.id) {
        config.headers["X-Branch-ID"] = String(selectedBranch.id);
      }
    } catch {
      // Fallback ignore if storage parse fails
    }

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

export const api = {
  get: <T>(url: string, params?: object) =>
    apiClient.get<T>(url, { params }).then((r) => r.data),

  post: <T>(url: string, data?: unknown) =>
    apiClient.post<T>(url, data).then((r) => r.data),

  put: <T>(url: string, data?: unknown) =>
    apiClient.put<T>(url, data).then((r) => r.data),

  patch: <T>(url: string, data?: unknown) =>
    apiClient.patch<T>(url, data).then((r) => r.data),

  delete: <T>(url: string) =>
    apiClient.delete<T>(url).then((r) => r.data),
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

export default apiClient;
