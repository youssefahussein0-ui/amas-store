import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useOrders, useUpdateOrderStatus } from "@/hooks/use-orders";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AdminOrders() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();
  const { t } = useLanguage();

  const handleStatusChange = (id: number, status: string) => {
    updateStatus.mutate({ id, status });
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
                      <div>{o.customerName}</div>
                      <div className="text-xs text-muted-foreground">{o.customerPhone}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-primary">${Number(o.totalAmount).toFixed(2)}</td>
                    <td className="px-6 py-4 uppercase text-xs">{o.paymentMethod}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        o.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        o.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                        o.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        className="text-xs border-border rounded p-1"
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value)}
                        disabled={updateStatus.isPending}
                      >
                        <option value="pending">{t("admin.orders.pending")}</option>
                        <option value="shipped">{t("admin.orders.shipped")}</option>
                        <option value="delivered">{t("admin.orders.delivered")}</option>
                        <option value="cancelled">{t("admin.orders.cancelled")}</option>
                      </select>
                    </td>
                  </tr>
                ))}
                {(!orders || orders.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
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
