/**
 * Dev Environment Utilities
 */
export const isDevEnvironment = (import.meta as any).env?.DEV ?? false;

export function isMockSession(): boolean {
  return false;
}

export function assertDevOnlyFeature(featureName: string): void {
  if (!isDevEnvironment) {
    throw new Error(`Dev-only feature '${featureName}' cannot run in production.`);
  }
}

export function assertDevOrMockFeature(featureName: string): void {
  if (!isDevEnvironment) {
    throw new Error(`Dev-only feature '${featureName}' cannot run in production.`);
  }
}

