import { type ReactNode, useEffect, Suspense } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore, initInactivityTracker } from "@ssrone/auth";
import { toast } from "sonner";
import { AppShell } from "@/shared/layout/AppShell";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { is_authenticated, isLoggedIn, user, logout } = useAuthStore();
  const tokenInStorage = typeof window !== "undefined" 
    ? (localStorage.getItem("ssrone_access_token") || localStorage.getItem("access_token")) 
    : null;

  const isAuthenticated = Boolean((is_authenticated || isLoggedIn || !!tokenInStorage) && user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      void navigate({ to: "/login" });
      return;
    }

    // 1-Hour Inactivity Auto-Logout Protocol
    const cleanupTracker = initInactivityTracker({
      timeoutMs: 60 * 60 * 1000, // Exactly 1 hour of inactivity
      onTimeout: () => {
        toast.warning("You have been logged out due to 1 hour of inactivity.", {
          duration: 8000,
        });
        void logout();
      },
    });

    // Handle token expiration/revocation event from API client
    const handleAuthExpired = () => {
      toast.error("Your session has expired. Please log in again.", {
        duration: 6000,
      });
      void logout();
    };

    window.addEventListener("ssrone:auth-expired", handleAuthExpired);

    return () => {
      cleanupTracker();
      window.removeEventListener("ssrone:auth-expired", handleAuthExpired);
    };
  }, [isAuthenticated, navigate, logout]);

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
