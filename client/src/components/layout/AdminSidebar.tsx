import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, ShoppingCart, LogOut, Layers, Gift, Tag, ShoppingBag } from "lucide-react";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import logoImg from "@assets/image_1772919891991.png";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function AdminSidebar() {
  const [location] = useLocation();
  const { logout } = useAdminAuth();
  const { t } = useLanguage();

  const links = [
    { name: t("admin.sidebar.dashboard"), path: "/admin", icon: LayoutDashboard },
    { name: t("admin.sidebar.categories") || "Categories", path: "/admin/categories", icon: Layers },
    { name: t("admin.sidebar.products"), path: "/admin/products", icon: Package },
    { name: t("admin.sidebar.orders"), path: "/admin/orders", icon: ShoppingCart },
    { name: t("admin.sidebar.promo") || "Promo Codes", path: "/admin/promo-codes", icon: Tag },
    { name: t("admin.sidebar.abandoned") || "Abandoned Carts", path: "/admin/abandoned-carts", icon: ShoppingBag },
    { name: "Spin Leads", path: "/admin/leads", icon: Gift },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="w-64 bg-gradient-to-b from-card to-card/80 border-e border-secondary/20 h-screen flex flex-col sticky top-0 shadow-xl">
      <div className="p-6 border-b border-secondary/20 flex justify-center bg-gradient-to-r from-primary/10 to-secondary/10">
        <Link href="/">
          <img src={logoImg} alt="Amas Admin" className="h-12 cursor-pointer hover-elevate" />
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {links.map((link) => {
          const isActive = location === link.path;
          const Icon = link.icon;
          return (
            <Link key={link.path} href={link.path}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                  : "text-foreground hover:bg-secondary/10 hover-elevate"
              }`} data-testid={`sidebar-link-${link.path.split('/').pop()}`}>
                <Icon className="w-5 h-5" />
                <span className="font-medium">{link.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-secondary/20">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 cursor-pointer hover-elevate"
          data-testid="button-logout"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t("admin.sidebar.logout")}</span>
        </button>
      </div>
    </div>
  );
}
