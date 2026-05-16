import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trash2, CheckCircle, Star, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from "@shared/routes";
import { useProducts } from "@/hooks/use-products";

export default function AdminReviews() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: products } = useProducts();

  const fetchReviews = async () => {
    try {
      const res = await fetch(api.reviews.list.path);
      const data = await res.json();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await fetch(api.reviews.delete.path.replace(":id", String(id)), { method: "DELETE" });
      setReviews(reviews.filter(r => r.id !== id));
      toast({ title: "Deleted", description: "Review removed" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await fetch(api.reviews.approve.path.replace(":id", String(id)), { method: "PATCH" });
      setReviews(reviews.map(r => r.id === id ? { ...r, isApproved: true } : r));
      toast({ title: "Approved", description: "Review is now visible" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to approve", variant: "destructive" });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-serif text-primary mb-8">{t("admin.reviews.title") || "Product Reviews"}</h1>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {reviews.map(review => {
              const product = products?.find(p => p.id === review.productId);
              return (
                <Card key={review.id} className={!review.isApproved ? "border-amber-200 bg-amber-50/30" : ""}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <MessageSquare className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{review.customerName}</CardTitle>
                        <p className="text-xs text-muted-foreground">On: {product?.name || "Deleted Product"}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!review.isApproved && (
                        <Button variant="outline" size="sm" onClick={() => handleApprove(review.id)} className="gap-2 text-green-600 border-green-200 hover:bg-green-50">
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(review.id)} className="text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className={`w-4 h-4 ${idx < review.rating ? "fill-secondary text-secondary" : "text-muted"}`} />
                      ))}
                    </div>
                    <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
                    <p className="text-[10px] text-muted-foreground mt-4 italic">{new Date(review.createdAt).toLocaleString()}</p>
                  </CardContent>
                </Card>
              );
            })}
            {reviews.length === 0 && (
              <div className="text-center py-12 text-muted-foreground italic bg-muted/20 rounded-xl">
                No reviews yet.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
