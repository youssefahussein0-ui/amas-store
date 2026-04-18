import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Loader2 } from "lucide-react";

export function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, checkAuth } = useAdminAuth();
  const [, setLocation] = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    checkAuth().then(() => setChecked(true));
  }, [checkAuth]);

  useEffect(() => {
    if (checked && !isAuthenticated) {
      setLocation("/admin/login");
    }
  }, [checked, isAuthenticated, setLocation]);

  if (isLoading || !checked) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
