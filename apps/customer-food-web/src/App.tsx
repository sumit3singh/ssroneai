import { lazy, Suspense } from "react";
import { Toaster, Sonner } from "@ssrone/ui/customer";
import { TooltipProvider } from "@ssrone/ui/customer";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TopNavbar from "./components/TopNavbar";
import CustomerAuthGuard from "./components/CustomerAuthGuard";
import PWAInstallBanner from "./components/PWAInstallBanner";

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
import { AlertTriangle, RefreshCw } from "lucide-react";

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
        <div className="p-6 sm:p-8 max-w-xl mx-auto my-12 bg-card border border-destructive/30 rounded-3xl text-card-foreground shadow-2xl font-sans">
          <div className="w-12 h-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-3 border border-destructive/20 shadow-sm">
            <AlertTriangle className="w-6 h-6 stroke-[2]" />
          </div>
          <h2 className="text-lg font-black mb-1 text-foreground">Application Render Error</h2>
          <p className="text-xs font-semibold text-destructive mb-3">
            {this.state.error?.message || String(this.state.error)}
          </p>
          <pre className="text-[11px] font-mono bg-muted/60 text-muted-foreground p-3.5 rounded-2xl border border-border whitespace-pre-wrap break-all mb-4 max-h-48 overflow-y-auto">
            {String(this.state.error?.stack || this.state.error)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            className="min-h-[44px] px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-full shadow-md flex items-center gap-2 cursor-pointer transition active:scale-95"
          >
            <RefreshCw className="w-4 h-4" /> Reload Page
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
        <Sonner position="top-center" richColors closeButton />
        <BrowserRouter>
          <CustomerAuthGuard requireAuth={true}>
            <div>
              <TopNavbar />
              <PWAInstallBanner />
              <Suspense fallback={<LazyFallback />}>
              <Routes>
                {/* General access (home) */}
                <Route path="/" element={<Welcome />} />
                <Route path="/menu" element={<MenuPage />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-status" element={<OrderStatus />} />
                <Route path="/order-status/:orderId" element={<OrderStatus />} />

                {/* Tenant & Branch scoped routes */}
                <Route path="/t/:tenantSlug" element={<Welcome />} />
                <Route path="/t/:tenantSlug/menu" element={<MenuPage />} />
                <Route path="/t/:tenantSlug/b/:branchCode" element={<Welcome />} />
                <Route path="/t/:tenantSlug/b/:branchCode/menu" element={<MenuPage />} />
                <Route path="/t/:tenantSlug/b/:branchCode/checkout" element={<Checkout />} />
                <Route path="/t/:tenantSlug/b/:branchCode/status" element={<OrderStatus />} />
                <Route path="/t/:tenantSlug/b/:branchCode/status/:orderId" element={<OrderStatus />} />
                <Route path="/t/:tenantSlug/b/:branchCode/order-status/:orderId" element={<OrderStatus />} />

                {/* QR table ordering with Tenant & Branch */}
                <Route path="/t/:tenantSlug/b/:branchCode/table/:tableNumber" element={<Welcome />} />
                <Route path="/t/:tenantSlug/b/:branchCode/table/:tableNumber/menu" element={<MenuPage />} />
                <Route path="/t/:tenantSlug/b/:branchCode/table/:tableNumber/checkout" element={<Checkout />} />
                <Route path="/t/:tenantSlug/b/:branchCode/table/:tableNumber/status" element={<OrderStatus />} />
                <Route path="/t/:tenantSlug/b/:branchCode/table/:tableNumber/status/:orderId" element={<OrderStatus />} />

                {/* QR table ordering legacy fallback */}
                <Route path="/order/table/:tableNumber" element={<Welcome />} />
                <Route path="/order/table/:tableNumber/menu" element={<MenuPage />} />
                <Route path="/order/table/:tableNumber/checkout" element={<Checkout />} />
                <Route path="/order/table/:tableNumber/status" element={<OrderStatus />} />
                <Route path="/order/table/:tableNumber/status/:orderId" element={<OrderStatus />} />

                {/* Account scoped (Authentication strictly required) */}
                <Route path="/t/:tenantSlug/b/:branchCode/my-orders" element={<CustomerAuthGuard requireAuth><MyOrders /></CustomerAuthGuard>} />
                <Route path="/t/:tenantSlug/b/:branchCode/profile" element={<CustomerAuthGuard requireAuth><Profile /></CustomerAuthGuard>} />

                {/* Account (Authentication strictly required) */}
                <Route path="/my-orders" element={<CustomerAuthGuard requireAuth><MyOrders /></CustomerAuthGuard>} />
                <Route path="/profile" element={<CustomerAuthGuard requireAuth><Profile /></CustomerAuthGuard>} />

                {/* Redirect old login paths to root */}
                <Route path="/login" element={<Navigate to="/" replace />} />
                <Route path="/t/:tenantSlug/b/:branchCode/login" element={<Navigate to="/" replace />} />

                {/* Staff / Admin QR */}
                <Route path="/staff/admin-qr" element={<AdminQR />} />
                <Route path="/admin/qr" element={<Navigate to="/staff/admin-qr" replace />} />

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
