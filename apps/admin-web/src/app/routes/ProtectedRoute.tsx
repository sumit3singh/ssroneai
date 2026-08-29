/**
 * The ssrone – Protected Route Wrapper
 * Redirects unauthenticated users to login.
 */
import { type ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@ssrone/auth";
import { AppShell } from "@/shared/layout/AppShell";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { is_authenticated, isLoggedIn, user } = useAuthStore();
  const tokenInStorage = typeof window !== "undefined" 
    ? (localStorage.getItem("ssrone_access_token") || localStorage.getItem("access_token")) 
    : null;

  const isAuthenticated = Boolean((is_authenticated || isLoggedIn || !!tokenInStorage) && user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return <AppShell>{children}</AppShell>;
}
