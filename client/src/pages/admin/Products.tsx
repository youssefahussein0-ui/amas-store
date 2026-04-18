import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useProducts, useCreateProduct, useDeleteProduct, useUpdateProduct } from "@/hooks/use-products";
import { useState, useRef } from "react";
import { Plus, Edit, Trash2, Loader2, Upload, Download, FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

export default function AdminProducts() {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ inserted: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    name: "", description: "", price: "", imageUrl: "", category: "Rings", stock: 10, isNew: true, isBestSeller: false, materials: ""
  });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate({
      ...formData,
      price: formData.price,
    }, {
      onSuccess: () => {
        setIsAddOpen(false);
        setFormData({ name: "", description: "", price: "", imageUrl: "", category: "Rings", stock: 10, isNew: true, isBestSeller: false, materials: "" });
        toast({ title: t("admin.products.success"), description: t("admin.products.productCreated") });
      },
      onError: (e) => toast({ title: t("admin.login.error"), description: e.message, variant: "destructive" })
    });
  };

  const handleDelete = (id: number) => {
    if(confirm(t("admin.products.confirmDelete"))) {
      deleteProduct.mutate(id, {
        onSuccess: () => toast({ title: t("admin.products.deleted") })
      });
    }
  };

  const downloadTemplate = () => {
    const headers = "name,description,price,imageUrl,category,stock,isNew,isBestSeller,materials";
    const sample = '"Sample Ring","A beautiful gold ring",1200,"https://example.com/image.jpg","Rings",10,true,false,"18K Gold"';
    const csv = `${headers}\n${sample}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "products_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith(".csv")) {
      setSelectedFile(file);
      setUploadResult(null);
    } else {
      toast({ title: t("admin.login.error"), description: "Please select a CSV file", variant: "destructive" });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploadLoading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await fetch("/api/products/bulk", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const result = await res.json();

      if (res.ok) {
        setUploadResult(result);
        toast({
          title: t("admin.products.uploadSuccess"),
          description: `${result.inserted} ${t("admin.products.productsInserted")}`,
        });
        queryClient.invalidateQueries({ queryKey: [api.products.list.path] });
      } else {
        toast({
          title: t("admin.products.uploadError"),
          description: result.message || "Upload failed",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: t("admin.products.uploadError"),
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith(".csv")) {
      setSelectedFile(file);
      setUploadResult(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif text-primary">{t("admin.products.title")}</h1>
          
          <div className="flex gap-3">
            {/* Upload File Button */}
            <Dialog open={isUploadOpen} onOpenChange={(open) => { setIsUploadOpen(open); if (!open) { setSelectedFile(null); setUploadResult(null); } }}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-secondary text-secondary hover:bg-secondary/10">
                  <Upload className="w-4 h-4"/> {t("admin.products.uploadFile")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{t("admin.products.bulkUpload")}</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-6 py-4">
                  {/* Download Template */}
                  <Button variant="outline" onClick={downloadTemplate} className="w-full gap-2">
                    <Download className="w-4 h-4" /> {t("admin.products.downloadTemplate")}
                  </Button>

                  {/* Drop Zone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-secondary transition-colors"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <FileSpreadsheet className="w-8 h-8 text-secondary" />
                        <div className="text-start">
                          <p className="font-medium text-primary">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}>
                          <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">{t("admin.products.dragDrop")}</p>
                        <p className="text-xs text-muted-foreground/60 mt-2">{t("admin.products.csvFormat")}</p>
                      </>
                    )}
                  </div>

                  {/* Upload Button */}
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || uploadLoading}
                    className="w-full bg-primary gap-2"
                  >
                    {uploadLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> {t("admin.products.uploading")}</>
                    ) : (
                      <><Upload className="w-4 h-4" /> {t("admin.products.uploadCsv")}</>
                    )}
                  </Button>

                  {/* Results */}
                  {uploadResult && (
                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                      <p className="text-sm font-medium text-primary">
                        ✅ {uploadResult.inserted} {t("admin.products.productsInserted")}
                      </p>
                      {uploadResult.errors.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-destructive">
                            ⚠️ {uploadResult.errors.length} {t("admin.products.rowErrors")}:
                          </p>
                          <div className="max-h-32 overflow-auto text-xs text-muted-foreground">
                            {uploadResult.errors.map((err, i) => (
                              <p key={i}>{err}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Product Button */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary gap-2"><Plus className="w-4 h-4"/> {t("admin.products.addProduct")}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t("admin.products.addNewProduct")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAdd} className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("admin.products.name")}</Label>
                      <Input required value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.products.price")}</Label>
                      <Input required type="number" step="0.01" value={formData.price} onChange={e=>setFormData({...formData, price: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.products.category")}</Label>
                      <select className="w-full border-border rounded-md p-2" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})}>
                        <option>Rings</option>
                        <option>Necklaces</option>
                        <option>Bracelets</option>
                        <option>Earrings</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.products.stock")}</Label>
                      <Input required type="number" value={formData.stock} onChange={e=>setFormData({...formData, stock: parseInt(e.target.value)})} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>{t("admin.products.imageUrl")}</Label>
                      <Input required value={formData.imageUrl} onChange={e=>setFormData({...formData, imageUrl: e.target.value})} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>{t("admin.products.description")}</Label>
                      <textarea className="w-full border-border rounded-md p-2" required value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>{t("admin.products.materials")}</Label>
                      <Input value={formData.materials} onChange={e=>setFormData({...formData, materials: e.target.value})} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="isNew" checked={formData.isNew} onCheckedChange={(c)=>setFormData({...formData, isNew: !!c})} />
                      <Label htmlFor="isNew">{t("admin.products.isNew")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="isBestSeller" checked={formData.isBestSeller} onCheckedChange={(c)=>setFormData({...formData, isBestSeller: !!c})} />
                      <Label htmlFor="isBestSeller">{t("admin.products.isBestSeller")}</Label>
                    </div>
                  </div>
                  <Button type="submit" disabled={createProduct.isPending} className="w-full mt-4">
                    {createProduct.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : t("admin.products.create")}
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
                  <th className="px-6 py-4">{t("admin.products.productCol")}</th>
                  <th className="px-6 py-4">{t("admin.products.category")}</th>
                  <th className="px-6 py-4">{t("admin.products.price")}</th>
                  <th className="px-6 py-4">{t("admin.products.stock")}</th>
                  <th className="px-6 py-4">{t("admin.products.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {products?.map(p => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded object-cover" />
                      <span className="font-medium text-primary">{p.name}</span>
                    </td>
                    <td className="px-6 py-4">{p.category}</td>
                    <td className="px-6 py-4">${Number(p.price).toFixed(2)}</td>
                    <td className="px-6 py-4">{p.stock}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} disabled={deleteProduct.isPending}>
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
