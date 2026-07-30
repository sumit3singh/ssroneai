/**
 * Compatibility shim for the admin web app.
 * This file re-exports the shared monorepo API client so existing imports continue to work.
 */
export {
  api,
  apiClient,
  clearAuthData,
  createApiClient,
  getAccessToken,
  getTenantSlug,
  setAccessToken,
  setTenantSlug,
} from "@ssr-one-ai/api-client";

export { default } from "@ssr-one-ai/api-client";
