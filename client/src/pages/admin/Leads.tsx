import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Loader2, Mail, Phone, Gift, Calendar } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AdminLeads() {
  const { data: leads, isLoading } = useQuery({
    queryKey: [api.admin.leads.path],
    queryFn: async () => {
      const res = await fetch(api.admin.leads.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch leads");
      return res.json();
    },
  });
  const { t } = useLanguage();

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-serif text-primary mb-8">Spin Wheel Leads</h1>

        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/30 uppercase">
                <tr>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Prize</th>
                  <th className="px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads?.map((lead: any) => (
                  <tr key={lead.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-secondary" />
                          <span className="font-medium">{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{lead.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Gift className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-primary">{lead.prize}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(lead.createdAt).toLocaleString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {(!leads || leads.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                      No leads found yet.
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
