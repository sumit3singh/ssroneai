/**
 * The Baithak – Protected Route Wrapper
 * Redirects unauthenticated users to login.
 */
import { type ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/app/providers/auth-store";
import { AppShell } from "@/shared/layout/AppShell";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.is_authenticated);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate({ to: "/login" });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return <AppShell>{children}</AppShell>;
}
