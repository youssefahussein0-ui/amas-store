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

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

import { useEffect } from "react";
import { api } from "@shared/routes";

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

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <ErrorBoundary>
            <Router />
          </ErrorBoundary>
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
