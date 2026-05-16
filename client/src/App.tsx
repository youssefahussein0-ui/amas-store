import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import NotFound from "@/pages/not-found";

// Pages
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import Products from "./pages/admin/Products";
import Categories from "./pages/admin/Categories";
import Orders from "./pages/admin/Orders";
import Leads from "./pages/admin/Leads";
import PromoCodes from "./pages/admin/PromoCodes";
import AbandonedCarts from "./pages/admin/AbandonedCarts";
import { ProtectedAdminRoute } from "@/components/layout/ProtectedAdminRoute";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";

function Router() {
  return (
    <Switch>
      {/* Customer Routes */}
      <Route path="/" component={Home} />
      <Route path="/shop" component={Shop} />
      <Route path="/product/:id" component={ProductDetails} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />

      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin">
        {() => <ProtectedAdminRoute><Dashboard /></ProtectedAdminRoute>}
      </Route>
      <Route path="/admin/products">
        {() => <ProtectedAdminRoute><Products /></ProtectedAdminRoute>}
      </Route>
      <Route path="/admin/categories">
        {() => <ProtectedAdminRoute><Categories /></ProtectedAdminRoute>}
      </Route>
      <Route path="/admin/orders">
        {() => <ProtectedAdminRoute><Orders /></ProtectedAdminRoute>}
      </Route>
      <Route path="/admin/leads">
        {() => <ProtectedAdminRoute><Leads /></ProtectedAdminRoute>}
      </Route>
      <Route path="/admin/promo-codes">
        {() => <ProtectedAdminRoute><PromoCodes /></ProtectedAdminRoute>}
      </Route>
      <Route path="/admin/abandoned-carts">
        {() => <ProtectedAdminRoute><AbandonedCarts /></ProtectedAdminRoute>}
      </Route>

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

import { useEffect } from "react";
import { api } from "@shared/routes";
import { useCart } from "@/hooks/use-cart";
import { MessageCircle } from "lucide-react";

function App() {
  useEffect(() => {
    const trackVisit = async () => {
      const sessionId = sessionStorage.getItem("site_session_id");
      if (!sessionId) {
        const newSessionId = Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem("site_session_id", newSessionId);
        try {
          await fetch(api.analytics.visit.path, {
            method: api.analytics.visit.method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId: newSessionId })
          });
        } catch (e) {
          console.error("Failed to log visit", e);
        }
      }
    };
    trackVisit();
  }, []);

  const { items } = useCart();
  useEffect(() => {
    if (items.length === 0) return;

    const syncCart = async () => {
      const sessionId = sessionStorage.getItem("site_session_id");
      if (!sessionId) return;

      try {
        await fetch(api.abandonedCarts.sync.path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            cartData: JSON.stringify(items)
          })
        });
      } catch (e) {
        console.error("Failed to sync cart", e);
      }
    };

    const timer = setTimeout(syncCart, 2000); // Sync after 2s of inactivity
    return () => clearTimeout(timer);
  }, [items]);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <ErrorBoundary>
            <Router />
            {/* WhatsApp Floating Button */}
            <a 
              href="https://wa.me/201234567890" 
              target="_blank" 
              rel="noopener noreferrer"
              className="fixed bottom-6 left-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform duration-300 flex items-center justify-center group"
              aria-label="Contact us on WhatsApp"
            >
              <MessageCircle className="w-6 h-6 fill-white" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ms-2 transition-all duration-500 whitespace-nowrap font-medium">
                WhatsApp Help
              </span>
            </a>
          </ErrorBoundary>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
