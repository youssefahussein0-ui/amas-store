import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShoppingCart, Clock, User, Phone, Mail } from "lucide-react";
import { api } from "@shared/routes";

export default function AdminAbandonedCarts() {
  const { t } = useLanguage();
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCarts = async () => {
    try {
      const res = await fetch(api.abandonedCarts.list.path);
      const data = await res.json();
      setCarts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, []);

  const parseCart = (data: string) => {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-serif text-primary mb-8">{t("admin.abandoned.title") || "Abandoned Carts"}</h1>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {carts.map(cart => {
              const items = parseCart(cart.cartData);
              const total = items.reduce((sum: number, item: any) => sum + (Number(item.product.price) * item.quantity), 0);
              
              return (
                <Card key={cart.id} className={cart.recovered ? "opacity-60 border-green-200" : ""}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 bg-muted/20">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <ShoppingCart className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Session: {cart.sessionId.slice(0, 8)}...</CardTitle>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          Last active: {new Date(cart.lastActive).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    {cart.recovered && (
                      <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">
                        Recovered
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Customer Info */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Customer Info</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>Guest</span>
                          </div>
                          {cart.customerPhone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-muted-foreground" />
                              <span>{cart.customerPhone}</span>
                            </div>
                          )}
                          {cart.customerEmail && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span>{cart.customerEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Items in Cart</h4>
                        <div className="space-y-2">
                          {items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm border-b pb-1 last:border-0">
                              <span>{item.quantity}x {item.product.name}</span>
                              <span className="font-medium">{(Number(item.product.price) * item.quantity).toFixed(2)} EGP</span>
                            </div>
                          ))}
                          <div className="flex justify-between font-bold text-primary pt-2">
                            <span>Potential Revenue</span>
                            <span>{total.toFixed(2)} EGP</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {carts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground italic bg-muted/20 rounded-xl">
                No abandoned carts recorded yet.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
