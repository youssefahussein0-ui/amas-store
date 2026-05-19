import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { useProducts, useCreateProduct, useDeleteProduct, useUpdateProduct } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useState, useRef } from "react";
import { Plus, Edit, Trash2, Loader2, Upload, Download, FileSpreadsheet, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { convertGoogleDriveLink, cn } from "@/lib/utils";
import { ExportButtons } from "@/components/admin/ExportButtons";

export default function AdminProducts() {
  const { data: products, isLoading } = useProducts();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const createProduct = useCreateProduct();
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ inserted: number; errors: string[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const exportData = products?.map(p => ({
    ID: p.id,
    Name: p.name,
    Price: p.price,
    Discount: p.discountPrice || "-",
    Category: p.category,
    Stock: p.stock,
    New: p.isNew ? "Yes" : "No",
    BestSeller: p.isBestSeller ? "Yes" : "No",
    Views: p.views || 0,
    Created: new Date(p.createdAt).toLocaleDateString()
  })) || [];

  const [formData, setFormData] = useState({
    name: "", description: "", price: "", imageUrl: "", category: "Rings", stock: 10, isNew: true, isBestSeller: false, materials: "", discountPrice: "",
    additionalImages: "", sizes: "", colors: ""
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  const resetForm = () => {
    setFormData({ name: "", description: "", price: "", imageUrl: "", category: "Rings", stock: 10, isNew: true, isBestSeller: false, materials: "", discountPrice: "", additionalImages: "", sizes: "", colors: "" });
    setEditingProduct(null);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: String(product.price),
      imageUrl: product.imageUrl,
      category: product.category,
      stock: product.stock,
      isNew: !!product.isNew,
      isBestSeller: !!product.isBestSeller,
      materials: product.materials || "",
      discountPrice: product.discountPrice ? String(product.discountPrice) : "",
      additionalImages: product.additionalImages || "",
      sizes: product.sizes || "",
      colors: product.colors || ""
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: formData.price,
      discountPrice: formData.discountPrice || null,
      imageUrl: convertGoogleDriveLink(formData.imageUrl),
      additionalImages: formData.additionalImages.split(/[\n,]/).map(s => convertGoogleDriveLink(s.trim())).filter(Boolean).join(","),
      sizes: formData.sizes,
      colors: formData.colors,
    };

    if (editingProduct) {
      updateProduct.mutate({ id: editingProduct.id, ...data }, {
        onSuccess: () => {
          setIsFormOpen(false);
          resetForm();
          toast({ title: t("admin.products.success"), description: t("admin.products.productUpdated") });
        },
        onError: (e) => toast({ title: t("admin.login.error"), description: e.message, variant: "destructive" })
      });
    } else {
      createProduct.mutate(data, {
        onSuccess: () => {
          setIsFormOpen(false);
          resetForm();
          toast({ title: t("admin.products.success"), description: t("admin.products.productCreated") });
        },
        onError: (e) => toast({ title: t("admin.login.error"), description: e.message, variant: "destructive" })
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'imageUrl' | 'additionalImages') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("image", file);

    try {
      toast({ title: "Uploading image...", description: "Please wait." });
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      
      if (field === 'imageUrl') {
        setFormData(prev => ({ ...prev, imageUrl: data.url }));
      } else {
        setFormData(prev => ({ 
          ...prev, 
          additionalImages: prev.additionalImages ? `${prev.additionalImages}\n${data.url}` : data.url 
        }));
      }
      toast({ title: "Success", description: "Image uploaded successfully." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleDelete = (id: number) => {
    if(confirm(t("admin.products.confirmDelete"))) {
      deleteProduct.mutate(id, {
        onSuccess: () => toast({ title: t("admin.products.deleted") })
      });
    }
  };

  const downloadTemplate = () => {
    const headers = "name,description,price,imageUrl,category,stock,isNew,isBestSeller,materials,discountPrice";
    const sample = '"Sample Ring","A beautiful gold ring",1200,"https://example.com/image.jpg","Rings",10,true,false,"18K Gold",1000';
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

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts?.map(p => p.id) || []);
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} products?`)) return;
    
    setIsBulkDeleting(true);
    try {
      await Promise.all(selectedIds.map(id => deleteProduct.mutateAsync(id)));
      toast({ title: t("admin.products.deleted"), description: `${selectedIds.length} products removed` });
      setSelectedIds([]);
    } catch (err: any) {
      toast({ title: t("admin.login.error"), description: err.message, variant: "destructive" });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil((filteredProducts?.length || 0) / itemsPerPage);
  const paginatedProducts = filteredProducts?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to first page when search changes
  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-6">
            <h1 className="text-3xl font-serif text-primary">{t("admin.products.title")}</h1>
            {!isLoading && products && <ExportButtons data={exportData} filename="Amas-Products" sheetName="Products" />}
          </div>
          
          <div className="flex gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search products..." 
                className="pl-10 w-64 bg-white"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
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
            <Dialog open={isFormOpen} onOpenChange={(open) => { setIsFormOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="bg-primary gap-2" onClick={() => { resetForm(); setIsFormOpen(true); }}><Plus className="w-4 h-4"/> {t("admin.products.addProduct")}</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingProduct ? t("admin.products.editProduct") : t("admin.products.addNewProduct")}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
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
                      <Label>{t("admin.products.discountPrice")}</Label>
                      <Input type="number" step="0.01" placeholder="Optional" value={formData.discountPrice} onChange={e=>setFormData({...formData, discountPrice: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.products.category")}</Label>
                      <select className="w-full border-border rounded-md p-2" value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})}>
                        {categories?.map(cat => (
                          <option key={cat.id} value={cat.slug}>{cat.nameEn}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("admin.products.stock")}</Label>
                      <Input required type="number" value={formData.stock} onChange={e=>setFormData({...formData, stock: parseInt(e.target.value)})} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>{t("admin.products.imageUrl")}</Label>
                      <div className="flex gap-2">
                        <Input required value={formData.imageUrl} onChange={e=>setFormData({...formData, imageUrl: e.target.value})} placeholder="URL or upload..." />
                        <div className="relative overflow-hidden shrink-0">
                          <Button type="button" variant="outline" size="icon">
                            <Upload className="w-4 h-4" />
                          </Button>
                          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'imageUrl')} />
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>{t("admin.products.description")}</Label>
                      <textarea className="w-full border-border rounded-md p-2" required value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>{t("admin.products.materials")}</Label>
                      <Input value={formData.materials} onChange={e=>setFormData({...formData, materials: e.target.value})} />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label>Additional Images (URLs, one per line or comma separated)</Label>
                      <div className="flex gap-2">
                        <textarea className="w-full border-border rounded-md p-2 h-24" value={formData.additionalImages} onChange={e=>setFormData({...formData, additionalImages: e.target.value})} placeholder="URLs or upload multiple..." />
                        <div className="relative overflow-hidden shrink-0">
                          <Button type="button" variant="outline" size="icon">
                            <Upload className="w-4 h-4" />
                          </Button>
                          <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, 'additionalImages')} />
                        </div>
                      </div>
                    </div>
                    {categories?.find(c => c.slug === formData.category)?.hasSizes && (
                      <div className="col-span-2 space-y-2">
                        <Label>Sizes (Comma separated, e.g. S, M, L or 38, 39, 40)</Label>
                        <Input placeholder="S, M, L, XL" value={formData.sizes} onChange={e=>setFormData({...formData, sizes: e.target.value})} />
                      </div>
                    )}
                    {categories?.find(c => c.slug === formData.category)?.hasColors && (
                      <div className="col-span-2 space-y-2">
                        <Label>Colors (Comma separated, e.g. Red, Blue, Gold)</Label>
                        <Input placeholder="Red, Blue, Green" value={formData.colors} onChange={e=>setFormData({...formData, colors: e.target.value})} />
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Checkbox id="isNew" checked={formData.isNew} onCheckedChange={(c)=>setFormData({...formData, isNew: !!c})} />
                      <Label htmlFor="isNew">{t("admin.products.isNew")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="isBestSeller" checked={formData.isBestSeller} onCheckedChange={(c)=>setFormData({...formData, isBestSeller: !!c})} />
                      <Label htmlFor="isBestSeller">{t("admin.products.isBestSeller")}</Label>
                    </div>
                  </div>
                  <Button type="submit" disabled={createProduct.isPending || updateProduct.isPending} className="w-full mt-4">
                    {(createProduct.isPending || updateProduct.isPending) ? <Loader2 className="w-4 h-4 animate-spin"/> : (editingProduct ? t("admin.products.update") : t("admin.products.create"))}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="mb-4 p-4 bg-primary/5 border border-primary/20 rounded-xl flex justify-between items-center animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-primary">
                {selectedIds.length} {t("admin.products.selected")}
              </span>
              <Button 
                variant="destructive" 
                size="sm" 
                className="gap-2"
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
              >
                {isBulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {t("admin.products.deleteSelected")}
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
              {t("admin.products.clearSelection")}
            </Button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <>
              <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/30 uppercase">
                <tr>
                  <th className="px-6 py-4 w-10">
                    <Checkbox 
                      checked={selectedIds.length > 0 && selectedIds.length === paginatedProducts?.length}
                      onCheckedChange={() => {
                        if (selectedIds.length === paginatedProducts?.length) {
                          setSelectedIds([]);
                        } else {
                          setSelectedIds(paginatedProducts?.map(p => p.id) || []);
                        }
                      }}
                    />
                  </th>
                  <th className="px-6 py-4">{t("admin.products.productCol")}</th>
                  <th className="px-6 py-4">{t("admin.products.category")}</th>
                  <th className="px-6 py-4">{t("admin.products.price")}</th>
                  <th className="px-6 py-4">{t("admin.products.stock")}</th>
                  <th className="px-6 py-4">{t("admin.products.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts?.map(p => (
                  <tr key={p.id} className={cn(
                    "border-b border-border/50 hover:bg-muted/10 transition-colors",
                    selectedIds.includes(p.id) && "bg-primary/5"
                  )}>
                    <td className="px-6 py-4">
                      <Checkbox 
                        checked={selectedIds.includes(p.id)}
                        onCheckedChange={() => toggleSelect(p.id)}
                      />
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <img src={convertGoogleDriveLink(p.imageUrl)} alt={p.name} className="w-10 h-10 rounded object-cover" />
                      <span className="font-medium text-primary">{p.name}</span>
                    </td>
                    <td className="px-6 py-4">{p.category}</td>
                    <td className="px-6 py-4">{Number(p.price).toFixed(2)} {t("product.currency")}</td>
                    <td className="px-6 py-4">{p.stock}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(p)}>
                          <Edit className="w-4 h-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} disabled={deleteProduct.isPending}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/10">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts?.length || 0)} of {filteredProducts?.length} products
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Logic to show a window of pages around current page
                      let pageNum;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                      
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          className="w-8 h-8 p-0"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
