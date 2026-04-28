import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/use-categories";
import { useState } from "react";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { convertGoogleDriveLink } from "@/lib/utils";

export default function AdminCategories() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { toast } = useToast();
  const { t, language } = useLanguage();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  const [formData, setFormData] = useState({
    slug: "", nameEn: "", nameAr: "", imageUrl: ""
  });

  const resetForm = () => {
    setFormData({ slug: "", nameEn: "", nameAr: "", imageUrl: "" });
    setEditingCategory(null);
  };

  const handleEdit = (category: any) => {
    setEditingCategory(category);
    setFormData({
      slug: category.slug,
      nameEn: category.nameEn,
      nameAr: category.nameAr,
      imageUrl: category.imageUrl,
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      updateCategory.mutate({ id: editingCategory.id, ...formData }, {
        onSuccess: () => {
          setIsFormOpen(false);
          resetForm();
          toast({ title: t("admin.products.success"), description: t("admin.products.productUpdated") }); // Reusing generic success
        },
        onError: (e) => toast({ title: t("admin.login.error"), description: e.message, variant: "destructive" })
      });
    } else {
      createCategory.mutate(formData, {
        onSuccess: () => {
          setIsFormOpen(false);
          resetForm();
          toast({ title: t("admin.products.success"), description: t("admin.products.productCreated") }); // Reusing generic success
        },
        onError: (e) => toast({ title: t("admin.login.error"), description: e.message, variant: "destructive" })
      });
    }
  };

  const handleDelete = (id: number) => {
    if(confirm(t("admin.products.confirmDelete"))) {
      deleteCategory.mutate(id, {
        onSuccess: () => toast({ title: t("admin.products.deleted") })
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif text-primary">{t("admin.categories.title") || "Manage Categories"}</h1>
          
          <div className="flex gap-3">
            <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="bg-primary gap-2" onClick={() => { resetForm(); setIsFormOpen(true); }}><Plus className="w-4 h-4"/> {t("admin.categories.addCategory") || "Add Category"}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingCategory ? (t("admin.categories.editCategory") || "Edit Category") : (t("admin.categories.addNewCategory") || "Add New Category")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Slug (English Key, e.g. Rings)</Label>
                      <Input required value={formData.slug} onChange={e=>setFormData({...formData, slug: e.target.value})} disabled={!!editingCategory} />
                    </div>
                    <div className="space-y-2">
                      <Label>English Name</Label>
                      <Input required value={formData.nameEn} onChange={e=>setFormData({...formData, nameEn: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Arabic Name (الاسم بالعربية)</Label>
                      <Input required value={formData.nameAr} onChange={e=>setFormData({...formData, nameAr: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Image URL (Use GD Link)</Label>
                      <Input required value={formData.imageUrl} onChange={e=>setFormData({...formData, imageUrl: e.target.value})} />
                    </div>
                  </div>
                  <Button type="submit" disabled={createCategory.isPending || updateCategory.isPending} className="w-full mt-4">
                    {(createCategory.isPending || updateCategory.isPending) ? <Loader2 className="w-4 h-4 animate-spin"/> : (editingCategory ? (t("admin.products.update") || "Update") : (t("admin.products.create") || "Create"))}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/30 uppercase">
                <tr>
                  <th className="px-6 py-4">Image</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">English Name</th>
                  <th className="px-6 py-4">Arabic Name</th>
                  <th className="px-6 py-4">{t("admin.products.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {categories?.map(cat => (
                  <tr key={cat.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <img src={convertGoogleDriveLink(cat.imageUrl)} alt={cat.nameEn} className="w-16 h-16 rounded object-cover" />
                    </td>
                    <td className="px-6 py-4">{cat.slug}</td>
                    <td className="px-6 py-4 font-medium">{cat.nameEn}</td>
                    <td className="px-6 py-4 font-medium">{cat.nameAr}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                          <Edit className="w-4 h-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)} disabled={deleteCategory.isPending}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
