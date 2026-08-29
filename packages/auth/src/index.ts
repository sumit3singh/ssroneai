/**
 * SSR One AI – Monorepo Shared Auth & Session Store
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { api, clearAuthData, setAccessToken, setTenantSlug, getAccessToken, getTenantSlug } from "@ssrone/api-client";

export { apiClient, api, getAccessToken, setAccessToken, clearAuthData, getTenantSlug, setTenantSlug } from "@ssrone/api-client";
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
        if (credentials && credentials.tenant_slug) {
          try {
            const response = await api.post<{ access_token: string; user: UserProfile }>("/auth/login", credentials);
            setAccessToken(response.access_token);
            setTenantSlug(credentials.tenant_slug);

            set({
              user: response.user,
              access_token: response.access_token,
              tenant_slug: credentials.tenant_slug,
              is_authenticated: true,
              isLoggedIn: true,
            });
            return;
          } catch (e) {
            console.error("API login error", e);
          }
        }
        set({
          user: credentials,
          is_authenticated: true,
          isLoggedIn: true,
        });
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          // Ignore network errors on logout
        } finally {
          clearAuthData();
          set({
            user: null,
            access_token: null,
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
    return {
      isLoggedIn: Boolean(state?.is_authenticated || state?.isLoggedIn || user),
      user: state?.user || null,
      role: user?.role || (user ? "employee" : null),
      name: user?.name || user?.first_name || (user ? "Staff Member" : null),
      access_token: state?.access_token || null,
      tenant_slug: state?.tenant_slug || null,
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

export default useAuthStore;
