/**
 * SSR One AI – Monorepo Shared Auth & Session Store
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  api,
  clearAuthData,
  setAccessToken,
  getAccessToken,
  setRefreshToken,
  getRefreshToken,
  setTenantSlug,
  getTenantSlug,
} from "@ssrone/api-client";

export {
  apiClient,
  api,
  getAccessToken,
  setAccessToken,
  getRefreshToken,
  setRefreshToken,
  clearAuthData,
  getTenantSlug,
  setTenantSlug,
} from "@ssrone/api-client";
export { PermissionGuard, type PermissionGuardProps } from "./PermissionGuard";
export { FeatureGate, type FeatureGateProps, type LicenseTier } from "./FeatureGate";

export interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  tenant_id?: string;
}

export interface Company {
  id: string;
  name: string;
  code?: string;
}

export interface Branch {
  id: string;
  name: string;
  code?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions?: string[];
}

export interface FinancialYear {
  id: string;
  name: string;
  start_date?: string;
  end_date?: string;
}

export interface AuthState {
  user: UserProfile | any;
  access_token: string | null;
  refresh_token: string | null;
  tenant_slug: string | null;
  is_authenticated: boolean;
  isLoggedIn?: boolean;
  deliveryAddress?: string | null;
  orderMode?: string;
  loyaltyTier?: string;
  loyaltyPoints?: number;
  otpSent?: boolean;
  pastOrders?: any[];
  totalOrders?: number;
  selected_company: Company | null;
  selected_branch: Branch | null;
  selected_role: Role | null;
  selected_fin_year: FinancialYear | null;
  companies: Company[];
  branches: Branch[];
  roles: Role[];
}

export interface AuthStore extends AuthState {
  setSelectedCompany: (company: Company | null) => void;
  setSelectedBranch: (branch: Branch | null) => void;
  setSelectedRole: (role: Role | null) => void;
  setSelectedFinYear: (year: FinancialYear | null) => void;
  setCompanies: (companies: Company[]) => void;
  setBranches: (branches: Branch[]) => void;
  setRoles: (roles: Role[]) => void;
  setOrderMode?: (mode: string) => void;
  setDeliveryAddress?: (address: string) => void;
  setOtpSent?: (sent: boolean) => void;
  setLoyalty?: (tier: string, points: number) => void;
  rateOrder?: (orderId: string, rating: number) => void;
  updateName?: (name: string) => void;
  login: (credentials: any) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile) => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      access_token: null,
      refresh_token: null,
      tenant_slug: null,
      is_authenticated: false,
      isLoggedIn: false,
      deliveryAddress: null,
      orderMode: "dine-in",
      loyaltyTier: "BRONZE",
      loyaltyPoints: 100,
      otpSent: false,
      pastOrders: [],
      totalOrders: 0,
      selected_company: null,
      selected_branch: null,
      selected_role: null,
      selected_fin_year: null,
      companies: [],
      branches: [],
      roles: [],

      setSelectedCompany: (company) => set({ selected_company: company }),
      setSelectedBranch: (branch) => set({ selected_branch: branch }),
      setSelectedRole: (role) => set({ selected_role: role }),
      setSelectedFinYear: (year) => set({ selected_fin_year: year }),
      setCompanies: (companies) => set({ companies }),
      setBranches: (branches) => set({ branches }),
      setRoles: (roles) => set({ roles }),
      setOrderMode: (mode) => set({ orderMode: mode }),
      setDeliveryAddress: (address) => set({ deliveryAddress: address }),
      setOtpSent: (sent) => set({ otpSent: sent }),
      setLoyalty: (tier, points) => set({ loyaltyTier: tier, loyaltyPoints: points }),
      rateOrder: (orderId, rating) => {
        const current = get().pastOrders || [];
        set({ pastOrders: current.map((o) => (o.id === orderId ? { ...o, rating } : o)) });
      },
      updateName: (name) => {
        const currentUser = get().user || {};
        set({ user: { ...currentUser, name, first_name: name } });
      },

      login: async (credentials: any) => {
        if (!credentials || !credentials.tenant_slug || !credentials.email || !credentials.password) {
          throw new Error("Tenant slug, email, and password are required.");
        }
        try {
          const response = await api.post<{ access_token: string; refresh_token?: string; user: UserProfile }>("/auth/login", credentials);
          setAccessToken(response.access_token);
          if (response.refresh_token) {
            setRefreshToken(response.refresh_token);
          }
          setTenantSlug(credentials.tenant_slug);

          // Initialize activity timestamp upon successful login
          if (typeof window !== "undefined") {
            localStorage.setItem("ssrone_last_activity", String(Date.now()));
          }

          set({
            user: response.user,
            access_token: response.access_token,
            refresh_token: response.refresh_token || null,
            tenant_slug: credentials.tenant_slug,
            is_authenticated: true,
            isLoggedIn: true,
          });
          return;
        } catch (e) {
          console.error("Authentication rejected by database:", e);
          throw e;
        }
      },

      logout: async () => {
        try {
          const rt = getRefreshToken();
          await api.post("/auth/logout", { refresh_token: rt }).catch(() => {});
        } catch {
          // Ignore network errors on logout
        } finally {
          clearAuthData();
          try {
            sessionStorage.removeItem("pos_cache_categories");
            sessionStorage.removeItem("pos_cache_menu_items");
            sessionStorage.removeItem("pos_cache_tables");
            sessionStorage.removeItem("pos_cache_waiters");
            sessionStorage.removeItem("pos_cache_orders");
            localStorage.removeItem("ssrone_last_activity");
          } catch {}

          set({
            user: null,
            access_token: null,
            refresh_token: null,
            tenant_slug: null,
            is_authenticated: false,
            isLoggedIn: false,
            selected_company: null,
            selected_branch: null,
            selected_role: null,
            selected_fin_year: null,
            companies: [],
            branches: [],
            roles: [],
          });
          if (typeof window !== "undefined") {
            window.location.href = "/";
          }
        }
      },

      setUser: (user) => set({ user }),

      refreshUser: async () => {
        if (!get().is_authenticated) return;
        try {
          const user = await api.get<UserProfile>("/auth/me");
          set({ user });
        } catch {
          // Keep current stored state if request fails
        }
      },
    }),
    {
      name: "ssrone-auth-storage",
      storage: createJSONStorage(() => (typeof window !== "undefined" ? localStorage : ({} as Storage))),
    }
  )
);

export const getAuth = () => {
  if (typeof window === "undefined") return { isLoggedIn: false, user: null, role: null, name: null };
  try {
    const state = useAuthStore.getState();
    const user = state?.user;
    const isAuth = Boolean(state?.is_authenticated && state?.access_token && user);
    return {
      isLoggedIn: isAuth,
      user: isAuth ? user : null,
      role: isAuth ? (user?.role || "employee") : null,
      name: isAuth ? (user?.name || user?.first_name || "Staff Member") : null,
      access_token: isAuth ? state?.access_token : null,
      tenant_slug: isAuth ? state?.tenant_slug : null,
    };
  } catch {
    return { isLoggedIn: false, user: null, role: null, name: null, access_token: null, tenant_slug: null };
  }
};

export const setAuth = (authData: any) => {
  if (typeof window === "undefined") return;
  const user = authData?.user || authData;
  useAuthStore.setState({
    user: user,
    is_authenticated: !!user,
    isLoggedIn: !!user,
    access_token: authData?.token || authData?.access_token || null,
  });
};

export const loginEmployee = (empId: string) => {
  const emp = { id: empId, name: `Employee ${empId}`, role: "staff" };
  setAuth({ user: emp });
};

export const loginUser = (user: any) => {
  setAuth({ user });
};

export const logout = async () => {
  return useAuthStore.getState().logout();
};

// ═════════════════════════════════════════════════════════════
// 1-HOUR INACTIVITY AUTO-LOGOUT PROTOCOL (ENTERPRISE GRADE)
// ═════════════════════════════════════════════════════════════
export const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // Exactly 1 hour (3,600,000 ms)
export const LAST_ACTIVITY_KEY = "ssrone_last_activity";

export interface InactivityTrackerOptions {
  timeoutMs?: number;
  onTimeout?: () => void;
}

/**
 * Initializes cross-tab synchronized user activity monitoring.
 * If user does zero work in the software for 1 hour (or timeoutMs), executes auto-logout.
 */
export const initInactivityTracker = (options: InactivityTrackerOptions = {}): (() => void) => {
  if (typeof window === "undefined") return () => {};

  const timeoutMs = options.timeoutMs ?? INACTIVITY_TIMEOUT_MS;

  const recordActivity = () => {
    try {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    } catch {
      // Ignore storage errors
    }
  };

  // If no timestamp exists, initialize it
  if (!localStorage.getItem(LAST_ACTIVITY_KEY)) {
    recordActivity();
  }

  // Throttled activity handler (records at most once every 5 seconds)
  let lastRecorded = 0;
  const handleUserActivity = () => {
    const now = Date.now();
    if (now - lastRecorded >= 5000) {
      lastRecorded = now;
      recordActivity();
    }
  };

  const activityEvents: Array<keyof WindowEventMap> = [
    "mousemove",
    "mousedown",
    "keydown",
    "touchstart",
    "scroll",
    "click",
    "wheel",
  ];

  activityEvents.forEach((event) => {
    window.addEventListener(event, handleUserActivity, { passive: true });
  });

  // Cross-tab synchronization via storage event
  const handleStorage = (e: StorageEvent) => {
    if (e.key === LAST_ACTIVITY_KEY && e.newValue) {
      lastRecorded = Number(e.newValue);
    }
  };
  window.addEventListener("storage", handleStorage);

  // Periodic inactivity check (every 15 seconds)
  const intervalId = window.setInterval(() => {
    const authState = useAuthStore.getState();
    const hasToken = getAccessToken() || authState.access_token;
    if (!hasToken && !authState.is_authenticated && !authState.isLoggedIn) {
      return; // Idle checks only apply to logged-in sessions
    }

    const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || Date.now());
    const elapsed = Date.now() - lastActivity;

    if (elapsed >= timeoutMs) {
      console.warn(`[SSR One AI] User inactive for ${Math.round(elapsed / 60000)} minutes. Executing automatic logout.`);
      if (options.onTimeout) {
        options.onTimeout();
      } else {
        void useAuthStore.getState().logout();
      }
    }
  }, 15000);

  // Return cleanup teardown function
  return () => {
    activityEvents.forEach((event) => {
      window.removeEventListener(event, handleUserActivity);
    });
    window.removeEventListener("storage", handleStorage);
    window.clearInterval(intervalId);
  };
};

export default useAuthStore;

