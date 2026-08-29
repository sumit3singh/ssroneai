/**
 * The ssrone – Auth Hooks
 * TanStack Query hooks for authentication operations.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@ssrone/api-client";
import { useAuthStore } from "@ssrone/auth";
import type { LoginRequest, UserProfile } from "@/shared/types";

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onSuccess: () => {
      toast.success("Welcome back!");
      void queryClient.invalidateQueries();
    },
    onError: (error: unknown) => {
      console.error("Login error:", error);
      const message =
        (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        "Login failed. Please check your credentials.";
      toast.error(message);
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);
  return useMutation({ mutationFn: () => logout() });
}

export function useCurrentUser() {
  const isAuthenticated = useAuthStore((s) => s.is_authenticated);
  const user = useAuthStore((s) => s.user);
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => {
      if (user) return Promise.resolve(user as UserProfile);
      return api.get<UserProfile>("/auth/me");
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 10,
  });
}
