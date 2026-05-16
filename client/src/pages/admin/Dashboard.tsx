import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useAdminStats, useClearAllData } from "@/hooks/use-admin";
import { DollarSign, Package, ShoppingCart, Loader2, TrendingUp, Trash2, Users, Eye, Clock } from "lucide-react";
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
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip } from "recharts";

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
      value: stats?.totalRevenue ? `${Number(stats.totalRevenue).toFixed(2)} ${t("product.currency")}` : `0.00 ${t("product.currency")}`,
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
    },
    {
      title: t("admin.dashboard.totalVisits") || "Total Visits",
      icon: Users,
      value: stats?.totalVisits || 0,
      color: "text-primary"
    }
  ];

  const bestSellers = stats?.bestSellingProducts || [];
  const mostViewed = stats?.mostViewedProducts || [];
  const dailyData = stats?.dailyStats || [];

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
          <>
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
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <Card className="border-secondary/20 shadow-xl bg-gradient-to-br from-card to-card/80 p-6">
                  <CardTitle className="text-lg font-serif text-primary mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-secondary" />
                    {t("admin.dashboard.revenueTrend") || "Revenue Trend (Last 7 Days)"}
                  </CardTitle>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyData}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
                          <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}}
                            tickFormatter={(str) => {
                              try {
                                return new Date(str).toLocaleDateString(undefined, {weekday: 'short'});
                              } catch(e) {
                                return str;
                              }
                            }}
                          />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}} />
                          <ChartTooltip 
                            contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px'}}
                            itemStyle={{color: 'hsl(var(--primary))'}}
                          />
                          <Area type="monotone" dataKey="revenue" stroke="hsl(var(--secondary))" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                  <Card className="border-secondary/20 shadow-xl bg-gradient-to-br from-card to-card/80 p-6">
                    <CardTitle className="text-lg font-serif text-primary mb-6 flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-primary" />
                      {t("admin.dashboard.ordersTrend") || "Orders Trend (Last 7 Days)"}
                    </CardTitle>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyData}>
                          <defs>
                            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted-foreground)/0.1)" />
                          <XAxis 
                            dataKey="date" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}}
                            tickFormatter={(str) => {
                              try {
                                return new Date(str).toLocaleDateString(undefined, {weekday: 'short'});
                              } catch(e) {
                                return str;
                              }
                            }}
                          />
                          <YAxis axisLine={false} tickLine={false} tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}} />
                          <ChartTooltip 
                            contentStyle={{backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px'}}
                            itemStyle={{color: 'hsl(var(--primary))'}}
                          />
                          <Area type="monotone" dataKey="orders" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorOrders)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </motion.div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                  <Card className="border-secondary/20 shadow-xl bg-gradient-to-br from-card to-card/80">
                    <CardHeader>
                      <CardTitle className="text-lg font-serif text-primary flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-secondary" />
                        {t("admin.dashboard.bestSellers") || "Best Selling Products"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {bestSellers.length > 0 ? bestSellers.map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                            <div className="flex items-center gap-3">
                              <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded object-cover" />
                              <div>
                                <p className="font-medium text-sm">{p.name}</p>
                                <p className="text-xs text-muted-foreground">{p.totalSold} sold</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-primary">{Number(p.totalRevenue).toFixed(2)} {t("product.currency")}</p>
                            </div>
                          </div>
                        )) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No sales data yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
    
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
                  <Card className="border-secondary/20 shadow-xl bg-gradient-to-br from-card to-card/80">
                    <CardHeader>
                      <CardTitle className="text-lg font-serif text-primary flex items-center gap-2">
                        <Eye className="w-5 h-5 text-secondary" />
                        {t("admin.dashboard.mostViewed") || "Most Viewed Products"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {mostViewed.length > 0 ? mostViewed.map((p: any) => (
                          <div key={p.id} className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border/50">
                            <div className="flex items-center gap-3">
                              <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded object-cover" />
                              <div>
                                <p className="font-medium text-sm">{p.name}</p>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {p.views || 0}</span>
                                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {Math.round((p.timeSpent || 0) / 60)} min</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <p className="text-sm text-muted-foreground text-center py-4">No view data yet</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
          </>
        ) : (
          <div className="text-center text-muted-foreground py-10">{t("admin.dashboard.failedStats")}</div>
        )}
      </main>
    </div>
  );
}
