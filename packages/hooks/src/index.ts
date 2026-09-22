export * from "./useMemoryCleanup";
import { useState, useEffect, useCallback, useRef } from "react";

/** Detect mobile viewport (< 768px) */
export function useMobile(): boolean {
    const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    return isMobile;
}

/** Debounce a value (useful for search inputs) */
export function useDebounce<T>(value: T, delay = 300): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(value), delay);
        return () => window.clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}

/** Persist state to localStorage */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? (JSON.parse(item) as T) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const setValue = useCallback(
        (value: T | ((prev: T) => T)) => {
            setStoredValue((previousValue) => {
                const nextValue = typeof value === "function" ? (value as (prev: T) => T)(previousValue) : value;
                window.localStorage.setItem(key, JSON.stringify(nextValue));
                return nextValue;
            });
        },
        [key],
    );

    return [storedValue, setValue];
}

/** Online/offline detection */
export function useOnline(): boolean {
    const [online, setOnline] = useState(navigator.onLine);

    useEffect(() => {
        const goOnline = () => setOnline(true);
        const goOffline = () => setOnline(false);
        window.addEventListener("online", goOnline);
        window.addEventListener("offline", goOffline);
        return () => {
            window.removeEventListener("online", goOnline);
            window.removeEventListener("offline", goOffline);
        };
    }, []);

    return online;
}

/** Previous value tracker */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

/** Clipboard copy */
export function useCopyToClipboard(): [boolean, (text: string) => void] {
    const [copied, setCopied] = useState(false);

    const copy = useCallback((text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        });
    }, []);

    return [copied, copy];
}

/** KDS WebSocket hook for real-time kitchen display */
export function useKDSSocket(branchId: string | null): {
    connected: boolean;
    lastMessage: unknown;
} {
    const [connected, setConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<unknown>(null);
    const wsRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!branchId) return;

        const wsUrl = `ws://localhost:8000/api/v1/restaurant/kds/${branchId}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => setConnected(true);
        ws.onclose = () => setConnected(false);
        ws.onerror = () => setConnected(false);
        ws.onmessage = (event) => {
            try {
                setLastMessage(JSON.parse(event.data));
            } catch {
                // ignore non-JSON payloads
            }
        };

        const ping = window.setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.send("ping");
            }
        }, 30000);

        return () => {
            window.clearInterval(ping);
            ws.close();
        };
    }, [branchId]);

    return { connected, lastMessage };
}

/** Click outside detector */
export function useClickOutside(handler: () => void) {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const listener = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                handler();
            }
        };

        document.addEventListener("mousedown", listener);
        return () => {
            document.removeEventListener("mousedown", listener);
        };
    }, [handler]);

    return ref;
}

/** Intersection observer helper */
export function useIntersection(callback: () => void): React.RefObject<HTMLDivElement | null> {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    callback();
                }
            },
            { threshold: 0.1 },
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [callback]);

    return ref;
}
