/**
 * Dev Environment & Mock Session Utilities
 */
export const isDevEnvironment = (import.meta as any).env?.DEV ?? false;

export function isMockSession(): boolean {
  try {
    const raw = localStorage.getItem("baithak_auth_storage");
    if (!raw) return false;
    const data = JSON.parse(raw);
    return data?.state?.access_token === "mock-token-12345";
  } catch {
    return false;
  }
}

export function assertDevOnlyFeature(featureName: string): void {
  if (!isDevEnvironment) {
    throw new Error(`Dev-only feature '${featureName}' cannot run in production.`);
  }
}

export function assertDevOrMockFeature(featureName: string): void {
  if (!isDevEnvironment && !isMockSession()) {
    throw new Error(`Dev-only feature '${featureName}' cannot run in production.`);
  }
}
