import { lazy, Suspense } from "react";
import { Toaster, Sonner } from "@ssrone/ui/customer";
import { TooltipProvider } from "@ssrone/ui/customer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TopNavbar from "./components/TopNavbar";
import CustomerAuthGuard from "./components/CustomerAuthGuard";

// Eager-load critical routes
import Welcome from "./pages/Welcome";
import MenuPage from "./pages/Menu";

// Lazy-load non-critical routes
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderStatus = lazy(() => import("./pages/OrderStatus"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminQR = lazy(() => import("./pages/AdminQR"));
const NotFound = lazy(() => import("./pages/NotFound"));

import React from "react";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("React ErrorBoundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-2xl mx-auto my-12 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-3xl text-red-900 dark:text-red-200 shadow-xl">
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">⚠️ Application Render Error</h2>
          <p className="text-base font-bold text-red-600 dark:text-red-400 mb-2">
            {this.state.error?.message || String(this.state.error)}
          </p>
          <p className="text-xs font-mono bg-red-100 dark:bg-red-900/60 p-4 rounded-xl border border-red-300 dark:border-red-700 whitespace-pre-wrap break-all mb-4 max-h-60 overflow-y-auto">
            {String(this.state.error?.stack || this.state.error)}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient();

const LazyFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CustomerAuthGuard>
            <div>
              <TopNavbar />
              <Suspense fallback={<LazyFallback />}>
              <Routes>
                {/* General access (home) */}
                <Route path="/" element={<Welcome />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-status" element={<OrderStatus />} />

                {/* Tenant & Branch scoped routes */}
                <Route path="/t/:tenantSlug" element={<Welcome />} />
                <Route path="/t/:tenantSlug/menu" element={<MenuPage />} />
                <Route path="/t/:tenantSlug/b/:branchCode" element={<Welcome />} />
                <Route path="/t/:tenantSlug/b/:branchCode/menu" element={<MenuPage />} />
                <Route path="/t/:tenantSlug/b/:branchCode/checkout" element={<Checkout />} />
                <Route path="/t/:tenantSlug/b/:branchCode/status" element={<OrderStatus />} />

                {/* QR table ordering with Tenant & Branch */}
                <Route path="/t/:tenantSlug/b/:branchCode/table/:tableNumber" element={<Welcome />} />
                <Route path="/t/:tenantSlug/b/:branchCode/table/:tableNumber/menu" element={<MenuPage />} />
                <Route path="/t/:tenantSlug/b/:branchCode/table/:tableNumber/checkout" element={<Checkout />} />
                <Route path="/t/:tenantSlug/b/:branchCode/table/:tableNumber/status" element={<OrderStatus />} />

                {/* QR table ordering legacy fallback */}
                <Route path="/order/table/:tableNumber" element={<Welcome />} />
                <Route path="/order/table/:tableNumber/menu" element={<MenuPage />} />
                <Route path="/order/table/:tableNumber/checkout" element={<Checkout />} />
                <Route path="/order/table/:tableNumber/status" element={<OrderStatus />} />

                {/* Account scoped */}
                <Route path="/t/:tenantSlug/b/:branchCode/my-orders" element={<MyOrders />} />
                <Route path="/t/:tenantSlug/b/:branchCode/profile" element={<Profile />} />

                {/* Account */}
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/profile" element={<Profile />} />

                {/* Redirect old login paths to root CustomerAuthGuard */}
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/t/:tenantSlug/b/:branchCode/login" element={<Navigate to="/" replace />} />

                {/* Admin */}
                <Route path="/admin/qr" element={<AdminQR />} />

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </div>
        </CustomerAuthGuard>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
</ErrorBoundary>
);

export default App;
