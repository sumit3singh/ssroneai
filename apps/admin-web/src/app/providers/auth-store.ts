/**
 * The Baithak – Auth Store (Zustand)
 * Global authentication state management.
 */
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { api, clearAuthData, setAccessToken, setTenantSlug } from "@/shared/utils/api-client";
import { isDevEnvironment } from "@/shared/utils/dev-mode";
import type {
  AuthState,
  Company,
  Branch,
  FinancialYear,
  LoginRequest,
  LoginResponse,
  Role,
  UserProfile,
} from "@/shared/types";

interface AuthStore extends AuthState {
  selected_company: Company | null;
  selected_branch: Branch | null;
  selected_role: Role | null;
  selected_fin_year: FinancialYear | null;
  companies: Company[];
  branches: Branch[];
  roles: Role[];
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: UserProfile) => void;
  refreshUser: () => Promise<void>;
  setSelectedCompany: (company: Company | null) => void;
  setSelectedBranch: (branch: Branch | null) => void;
  setSelectedRole: (role: Role | null) => void;
  setSelectedFinYear: (year: FinancialYear | null) => void;
  setCompanies: (companies: Company[]) => void;
  setBranches: (branches: Branch[]) => void;
  setRoles: (roles: Role[]) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    immer((set, get) => ({
      // State
      user: null,
      access_token: null,
      tenant_slug: null,
      is_authenticated: false,
      selected_company: null,
      selected_branch: null,
      selected_role: null,
      selected_fin_year: null,
      companies: [],
      branches: [],
      roles: [],

      // Actions
      setSelectedCompany: (company: Company | null) => {
        set((state) => {
          state.selected_company = company;
        });
      },
      setSelectedBranch: (branch: Branch | null) => {
        set((state) => {
          state.selected_branch = branch;
        });
      },
      setSelectedRole: (role: Role | null) => {
        set((state) => {
          state.selected_role = role;
        });
      },
      setSelectedFinYear: (year: FinancialYear | null) => {
        set((state) => {
          state.selected_fin_year = year;
        });
      },
      setCompanies: (companies: Company[]) => {
        set((state) => {
          state.companies = companies;
        });
      },
      setBranches: (branches: Branch[]) => {
        set((state) => {
          state.branches = branches;
        });
      },
      setRoles: (roles: Role[]) => {
        set((state) => {
          state.roles = roles;
        });
      },

      // Actions
      login: async (credentials: LoginRequest) => {
        try {
          const response = await api.post<LoginResponse>("/auth/login", credentials);
          setAccessToken(response.access_token);
          setTenantSlug(credentials.tenant_slug);

          set((state) => {
            state.user = response.user;
            state.access_token = response.access_token;
            state.tenant_slug = credentials.tenant_slug;
            state.is_authenticated = true;
          });
        } catch (err) {
          if (isDevEnvironment) {
            console.warn("Backend login API unavailable, initializing dev mock session with mock-token-12345");
            const mockToken = "mock-token-12345";
            const mockUser: UserProfile = {
              id: "00000000-0000-0000-0000-000000000001",
              email: credentials.email || "admin@baithak.com",
              first_name: "Sumit",
              last_name: "Singh",
              display_name: "Sumit Singh",
              avatar_url: null,
              is_active: true,
              is_verified: true,
              is_superadmin: true,
              tenant_id: "baithak-demo",
              language: "en",
              timezone: "UTC",
              created_at: new Date().toISOString(),
            };
            setAccessToken(mockToken);
            setTenantSlug(credentials.tenant_slug || "baithak-demo");
            set((state) => {
              state.user = mockUser;
              state.access_token = mockToken;
              state.tenant_slug = credentials.tenant_slug || "baithak-demo";
              state.is_authenticated = true;
            });
            return;
          }
          throw err;
        }
      },

      logout: async () => {
        try {
          await api.post("/auth/logout");
        } catch {
          // Ignore errors on logout
        } finally {
          clearAuthData();
          set((state) => {
            state.user = null;
            state.access_token = null;
            state.tenant_slug = null;
            state.is_authenticated = false;
            state.selected_company = null;
            state.selected_branch = null;
            state.selected_role = null;
            state.selected_fin_year = null;
            state.companies = [];
            state.branches = [];
            state.roles = [];
          });
          window.location.href = "/login";
        }
      },

      setUser: (user: UserProfile) => {
        set((state) => {
          state.user = user;
        });
      },

      refreshUser: async () => {
        if (!get().is_authenticated) return;
        if (isMockSession()) {
          console.log("Mock session active, skipping refresh API call.");
          return;
        }
        try {
          const user = await api.get<UserProfile>("/auth/me");
          set((state) => {
            state.user = user;
          });
        } catch {
          await get().logout();
        }
      },
    })),
    {
      name: "baithak-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        access_token: state.access_token,
        tenant_slug: state.tenant_slug,
        is_authenticated: state.is_authenticated,
        selected_company: state.selected_company,
        selected_branch: state.selected_branch,
        selected_role: state.selected_role,
        selected_fin_year: state.selected_fin_year,
        companies: state.companies,
        branches: state.branches,
        roles: state.roles,
      }),
    },
  ),
);
