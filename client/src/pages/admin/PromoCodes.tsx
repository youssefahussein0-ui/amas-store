import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminPromoCodes() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPromo, setNewPromo] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    maxUses: "",
    expiresAt: ""
  });

  const fetchPromoCodes = async () => {
    try {
      const res = await fetch(api.promoCodes.list.path);
      const data = await res.json();
      setPromoCodes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(api.promoCodes.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newPromo,
          discountValue: String(newPromo.discountValue),
          maxUses: newPromo.maxUses ? parseInt(newPromo.maxUses) : null,
          expiresAt: newPromo.expiresAt ? new Date(newPromo.expiresAt).toISOString() : null
        })
      });
      if (!res.ok) throw new Error("Failed to create promo code");
      toast({ title: "Success", description: "Promo code created!" });
      setIsDialogOpen(false);
      setNewPromo({ code: "", discountType: "percentage", discountValue: "", maxUses: "", expiresAt: "" });
      fetchPromoCodes();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch(api.promoCodes.delete.path.replace(":id", String(id)), { method: "DELETE" });
      setPromoCodes(promoCodes.filter(p => p.id !== id));
      toast({ title: "Deleted", description: "Promo code removed" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif text-primary">{t("admin.promo.title") || "Promo Codes"}</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                {t("admin.promo.add") || "Add Promo Code"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("admin.promo.new") || "New Promo Code"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>{t("admin.promo.code") || "Code"}</Label>
                  <Input 
                    required 
                    value={newPromo.code} 
                    onChange={e => setNewPromo({...newPromo, code: e.target.value.toUpperCase()})} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("admin.promo.type") || "Type"}</Label>
                    <Select value={newPromo.discountType} onValueChange={v => setNewPromo({...newPromo, discountType: v})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("admin.promo.value") || "Value"}</Label>
                    <Input 
                      required 
                      type="number" 
                      value={newPromo.discountValue} 
                      onChange={e => setNewPromo({...newPromo, discountValue: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.promo.maxUses") || "Max Uses (Optional)"}</Label>
                  <Input 
                    type="number" 
                    value={newPromo.maxUses} 
                    onChange={e => setNewPromo({...newPromo, maxUses: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("admin.promo.expiry") || "Expiry Date (Optional)"}</Label>
                  <Input 
                    type="date" 
                    value={newPromo.expiresAt} 
                    onChange={e => setNewPromo({...newPromo, expiresAt: e.target.value})} 
                  />
                </div>
                <Button type="submit" className="w-full mt-4">{t("common.save") || "Save"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promoCodes.map(promo => (
              <Card key={promo.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                    <Tag className="w-4 h-4" />
                    {promo.code}
                  </CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(promo.id)} className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Discount:</span> {promo.discountValue}{promo.discountType === "percentage" ? "%" : " EGP"}</p>
                    <p><span className="text-muted-foreground">Uses:</span> {promo.currentUses} / {promo.maxUses || "∞"}</p>
                    {promo.expiresAt && <p><span className="text-muted-foreground">Expires:</span> {new Date(promo.expiresAt).toLocaleDateString()}</p>}
                    <div className={`mt-2 inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {promo.isActive ? "Active" : "Inactive"}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {promoCodes.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground italic">
                No promo codes created yet.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
