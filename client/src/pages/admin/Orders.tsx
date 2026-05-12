import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useOrders, useUpdateOrderStatus, useDeleteOrder } from "@/hooks/use-orders";
import { Loader2, Eye, Trash2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { convertGoogleDriveLink } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function AdminOrders() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const { t } = useLanguage();
  const { toast } = useToast();

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate({ id, status });
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t("admin.dashboard.resetDataTitle"))) return;
    
    try {
      await deleteOrder.mutateAsync(id);
      toast({
        title: "Success",
        description: "Order deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-serif text-primary mb-8">{t("admin.orders.title")}</h1>

        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/30 uppercase">
                <tr>
                  <th className="px-6 py-4">{t("admin.orders.orderId")}</th>
                  <th className="px-6 py-4">{t("admin.orders.customer")}</th>
                  <th className="px-6 py-4">{t("admin.orders.items")}</th>
                  <th className="px-6 py-4">{t("admin.orders.amount")}</th>
                  <th className="px-6 py-4">{t("admin.orders.method")}</th>
                  <th className="px-6 py-4">{t("admin.orders.status")}</th>
                  <th className="px-6 py-4">{t("admin.orders.action")}</th>
                </tr>
              </thead>
              <tbody>
                {orders?.map((o: any) => (
                  <tr key={o.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium">#{o.id}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{o.customerName}</div>
                      <div className="text-xs text-muted-foreground">{o.customerPhone}</div>
                      <div className="text-xs text-muted-foreground italic">{o.customerAddress}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="gap-2 text-xs h-8">
                            <Eye className="w-3.5 h-3.5" />
                            {o.items?.length || 0} {t("admin.orders.items")}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="font-serif text-2xl flex items-center gap-2">
                              {t("admin.orders.orderDetails")} #{o.id}
                            </DialogTitle>
                          </DialogHeader>
                          
                          <div className="mt-4 space-y-6">
                            <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg text-sm">
                              <div>
                                <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider mb-1">{t("admin.orders.customer")}</p>
                                <p className="font-medium">{o.customerName}</p>
                                <p className="text-xs">{o.customerPhone}</p>
                                <p className="text-xs">{o.customerEmail}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-wider mb-1">{t("checkout.deliveryAddress")}</p>
                                <p className="text-xs leading-relaxed">{o.customerAddress}</p>
                              </div>
                            </div>

                            <div className="space-y-4">
                              <h3 className="font-serif text-lg border-b pb-2">{t("admin.orders.items")}</h3>
                              <div className="space-y-3">
                                {o.items?.map((item: any, idx: number) => (
                                  <div key={idx} className="flex gap-4 p-3 border rounded-lg hover:bg-muted/10 transition-colors">
                                    <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 border bg-white">
                                      <img 
                                        src={convertGoogleDriveLink(item.product?.imageUrl || "")} 
                                        alt={item.product?.name} 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-sm truncate">{item.product?.name}</p>
                                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                        <p className="text-xs text-muted-foreground">
                                          <span className="font-semibold">{t("admin.orders.quantity")}:</span> {item.quantity}
                                        </p>
                                        {item.size && (
                                          <p className="text-xs text-muted-foreground">
                                            <span className="font-semibold">{t("admin.orders.size")}:</span> {item.size}
                                          </p>
                                        )}
                                        {item.color && (
                                          <p className="text-xs text-muted-foreground">
                                            <span className="font-semibold">{t("admin.orders.color")}:</span> {item.color}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                      <p className="font-medium text-sm">{Number(item.price).toFixed(2)} {t("product.currency")}</p>
                                      <p className="text-[10px] text-muted-foreground mt-1">
                                        {t("admin.orders.total")}: {(Number(item.price) * item.quantity).toFixed(2)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t">
                              <div className="text-sm">
                                <span className="text-muted-foreground">{t("admin.orders.method")}:</span>
                                <span className="ml-2 font-medium uppercase">{o.paymentMethod}</span>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">{t("admin.orders.amount")}</p>
                                <p className="text-2xl font-serif text-primary">{Number(o.totalAmount).toFixed(2)} {t("product.currency")}</p>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </td>
                    <td className="px-6 py-4 font-medium text-primary">{Number(o.totalAmount).toFixed(2)} {t("product.currency")}</td>
                    <td className="px-6 py-4 uppercase text-xs font-semibold tracking-tight">{o.paymentMethod}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${
                        o.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        o.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        o.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-2">
                      <select 
                        className="text-xs border-border rounded p-1.5 bg-muted/20 focus:ring-1 focus:ring-primary outline-none transition-all"
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        disabled={updateStatus.isPending}
                      >
                        <option value="pending">{t("admin.orders.pending")}</option>
                        <option value="shipped">{t("admin.orders.shipped")}</option>
                        <option value="delivered">{t("admin.orders.delivered")}</option>
                        <option value="cancelled">{t("admin.orders.cancelled")}</option>
                      </select>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(o.id)}
                        disabled={deleteOrder.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {(!orders || orders.length === 0) && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground font-serif italic text-lg">
                      {t("admin.orders.noOrders")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
