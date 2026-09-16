import { type ReactNode, useEffect, Suspense } from "react";
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

  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="flex-1 w-full h-full min-h-[350px] flex flex-col items-center justify-center p-8 text-muted-foreground animate-in fade-in duration-150 select-none">
            <div className="w-7 h-7 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs font-mono font-semibold tracking-wider uppercase opacity-70">
              Loading Module Workspace...
            </span>
          </div>
        }
      >
        {children}
      </Suspense>
    </AppShell>
  );
}
