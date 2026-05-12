import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useAdminStats, useClearAllData } from "@/hooks/use-admin";
import { DollarSign, Package, ShoppingCart, Loader2, TrendingUp, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();
  const clearData = useClearAllData();
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleResetData = async () => {
    try {
      await clearData.mutateAsync();
      toast({
        title: "Success",
        description: "All test data has been cleared.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear data.",
        variant: "destructive"
      });
    }
  };

  const stats_items = [
    {
      title: t("admin.dashboard.totalRevenue"),
      icon: DollarSign,
      value: stats?.totalRevenue ? `${stats.totalRevenue.toFixed(2)} ${t("product.currency")}` : `0.00 ${t("product.currency")}`,
      color: "text-secondary"
    },
    {
      title: t("admin.dashboard.totalOrders"),
      icon: ShoppingCart,
      value: stats?.totalOrders || 0,
      color: "text-primary"
    },
    {
      title: t("admin.dashboard.totalProducts"),
      icon: Package,
      value: stats?.totalProducts || 0,
      color: "text-secondary"
    }
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <AdminSidebar />
      
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-2 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              <span className="text-sm text-muted-foreground uppercase tracking-wide font-medium">{t("admin.dashboard.analytics")}</span>
            </div>
            <h1 className="text-4xl font-serif text-primary">{t("admin.dashboard.title")}</h1>
          </motion.div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-destructive hover:bg-destructive hover:text-white border-destructive/50 gap-2">
                <Trash2 className="w-4 h-4" />
                {t("admin.orders.resetData")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("admin.orders.resetDataTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("admin.orders.resetDataDescription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("admin.orders.resetDataCancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={handleResetData} className="bg-destructive text-white hover:bg-destructive/90">
                  {t("admin.orders.resetDataConfirm")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats_items.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="border-secondary/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover-elevate bg-gradient-to-br from-card to-card/80">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">{item.title}</CardTitle>
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <Icon className={`h-5 w-5 ${item.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-serif text-primary font-bold">{item.value}</div>
                      <p className="text-xs text-muted-foreground mt-2">{t("admin.dashboard.realtime")}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-10">{t("admin.dashboard.failedStats")}</div>
        )}
      </main>
    </div>
  );
}
