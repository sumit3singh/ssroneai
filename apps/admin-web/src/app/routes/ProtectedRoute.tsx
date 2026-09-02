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
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FAF9F5] text-slate-700">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Redirecting to Authentication...</p>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
