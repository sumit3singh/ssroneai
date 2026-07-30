import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import TopNavbar from "./components/TopNavbar";

// Eager-load critical routes
import Welcome from "./pages/Welcome";
import MenuPage from "./pages/Menu";

// Lazy-load non-critical routes
const Checkout = lazy(() => import("./pages/Checkout"));
const OrderStatus = lazy(() => import("./pages/OrderStatus"));
const Login = lazy(() => import("./pages/Login"));
const MyOrders = lazy(() => import("./pages/MyOrders"));
const Profile = lazy(() => import("./pages/Profile"));
const AdminQR = lazy(() => import("./pages/AdminQR"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const LazyFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div>
          <TopNavbar />
          <Suspense fallback={<LazyFallback />}>
            <Routes>
              {/* General access (home) */}
              <Route path="/" element={<Welcome />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-status" element={<OrderStatus />} />

              {/* QR table ordering */}
              <Route path="/order/table/:tableNumber" element={<Welcome />} />
              <Route path="/order/table/:tableNumber/menu" element={<MenuPage />} />
              <Route path="/order/table/:tableNumber/checkout" element={<Checkout />} />
              <Route path="/order/table/:tableNumber/status" element={<OrderStatus />} />

              {/* Auth & account */}
              <Route path="/login" element={<Login />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/profile" element={<Profile />} />

              {/* Admin */}
              <Route path="/admin/qr" element={<AdminQR />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
