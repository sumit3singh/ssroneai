export interface AppConfig {
    apiBaseUrl: string;
    appName: string;
    environment: string;
}

export function getAppConfig(env: Record<string, string | undefined> = {}): AppConfig {
    return {
        apiBaseUrl: env.VITE_API_URL ?? env.API_BASE_URL ?? "http://localhost:8000/api/v1",
        appName: "SSR One AI",
        environment: env.NODE_ENV ?? "development",
    };
}
