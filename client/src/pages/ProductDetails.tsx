import { useParams, useLocation } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useProduct, useProducts } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShoppingCart, ShieldCheck, Truck, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/ProductCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useCategories } from "@/hooks/use-categories";
import { convertGoogleDriveLink, cn, trackEvent } from "@/lib/utils";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=1000&auto=format&fit=crop";

export default function ProductDetails() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const productId = parseInt(params.id || "0");
  const { data: product, isLoading } = useProduct(productId);
  const { data: allProducts } = useProducts();
  const { data: categories } = useCategories();
  const addItem = useCart(state => state.addItem);
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [activeImage, setActiveImage] = useState<string>("");
  const { t } = useLanguage();

  useEffect(() => {
    if (product) {
      setActiveImage(product.imageUrl);
      // Set first size as default if available
      if (product.sizes) {
        const sizes = product.sizes.split(",").map(s => s.trim());
        if (sizes.length > 0) setSelectedSize(sizes[0]);
      }
      if (product.colors) {
        const colors = product.colors.split(",").map(s => s.trim());
        if (colors.length > 0) setSelectedColor(colors[0]);
      }
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    
    const startTime = Date.now();
    
    return () => {
      const timeSpentSeconds = Math.floor((Date.now() - startTime) / 1000);
      if (timeSpentSeconds > 2) { // only log if they stayed for more than 2 seconds
        import("@shared/routes").then(({ api }) => {
          fetch(api.analytics.productView.path, {
            method: api.analytics.productView.method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product.id, timeSpentSeconds })
          }).catch(e => console.error("Failed to log product view", e));
        });
      }
    };
  }, [product?.id]);

  const handleAddToCart = (): boolean => {
    if (product) {
      if (product.sizes && !selectedSize) {
        toast({
          title: t("admin.login.error"),
          description: "Please select a size",
          variant: "destructive"
        });
        return false;
      }
      if (categories?.find(c => c.slug === product.category)?.hasColors && product.colors && !selectedColor) {
        toast({
          title: t("admin.login.error"),
          description: "Please select a color",
          variant: "destructive"
        });
        return false;
      }
      addItem(product, quantity, selectedSize, selectedColor);
      
      trackEvent("AddToCart", {
        content_name: product.name,
        content_category: product.category,
        content_ids: [product.id],
        content_type: 'product',
        value: Number(product.discountPrice || product.price) * quantity,
        currency: 'EGP'
      });

      const optionsStr = [selectedSize, selectedColor].filter(Boolean).join(", ");
      toast({
        title: t("product.addedToCart"),
        description: `${quantity}x ${product.name} ${optionsStr ? `(${optionsStr})` : ""} ${t("product.addedToCartDesc")}`,
        className: "bg-primary text-primary-foreground border-none",
      });
      return true;
    }
    return false;
  };

  const handleBuyNow = () => {
    if (handleAddToCart()) {
      setLocation("/checkout");
    }
  };

  const isSoldOut = product ? product.stock <= 0 : false;

  const relatedProducts = allProducts
    ?.filter(p => p.category === product?.category && p.id !== product?.id)
    .slice(0, 4);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <h1 className="text-3xl font-serif text-primary">{t("product.notFound")}</h1>
        </div>
        <Footer />
      </div>
    );
  }

  const allImages = [product.imageUrl, ...(product.additionalImages ? product.additionalImages.split(",") : [])].filter(Boolean);
  const sizes = product.sizes ? product.sizes.split(",").map(s => s.trim()) : [];
  const colors = product.colors ? product.colors.split(",").map(s => s.trim()) : [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 mb-24">
            
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-[4/5] bg-muted/20 rounded-xl overflow-hidden shadow-xl relative group">
                <img 
                  src={convertGoogleDriveLink(activeImage)} 
                  alt={product.name} 
                  onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; e.currentTarget.onerror = null; }}
                  className={cn("w-full h-full object-cover transition-transform duration-500 hover:scale-105", isSoldOut && "grayscale opacity-70")} 
                />
                {allImages.length > 1 && (
                  <>
                    <button 
                      onClick={() => {
                        const idx = allImages.indexOf(activeImage);
                        setActiveImage(allImages[(idx - 1 + allImages.length) % allImages.length]);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => {
                        const idx = allImages.indexOf(activeImage);
                        setActiveImage(allImages[(idx + 1) % allImages.length]);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {allImages.map((img, i) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveImage(img)}
                      className={cn(
                        "w-20 h-24 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0",
                        activeImage === img ? "border-primary shadow-md" : "border-transparent opacity-60 hover:opacity-100"
                      )}
                    >
                      <img src={convertGoogleDriveLink(img)} onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; e.currentTarget.onerror = null; }} className={cn("w-full h-full object-cover", isSoldOut && "grayscale opacity-70")} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col pt-8">
              <div className="mb-2">
                <span className="text-sm uppercase tracking-widest text-secondary font-medium">{product.category}</span>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-4xl md:text-5xl font-serif text-primary leading-tight">{product.name}</h1>
                {isSoldOut && (
                  <span className="bg-muted text-muted-foreground text-xs font-bold px-3 py-1.5 rounded uppercase">{t("product.soldOut")}</span>
                )}
              </div>
              {product.discountPrice ? (
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-3xl font-serif text-primary">{Number(product.discountPrice).toFixed(2)} {t("product.currency")}</span>
                  <span className="text-xl text-muted-foreground line-through">{Number(product.price).toFixed(2)} {t("product.currency")}</span>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded uppercase">{t("product.sale")}</span>
                </div>
              ) : (
                <p className="text-2xl font-light text-foreground mb-8">{Number(product.price).toFixed(2)} {t("product.currency")}</p>
              )}

              <div className="prose prose-sm text-muted-foreground font-light mb-8">
                <p>{product.description}</p>
                {product.materials && (
                  <p><strong>{t("product.materials")}:</strong> {product.materials}</p>
                )}
              </div>

              {/* Size Selection */}
              {categories?.find(c => c.slug === product.category)?.hasSizes && sizes.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm uppercase tracking-wider font-semibold mb-3">Select Size</h3>
                  <div className="flex flex-wrap gap-3">
                    {sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={cn(
                          "min-w-[3rem] h-12 flex items-center justify-center border transition-all",
                          selectedSize === size 
                            ? "border-primary bg-primary text-white shadow-lg" 
                            : "border-border hover:border-primary"
                        )}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {categories?.find(c => c.slug === product.category)?.hasColors && colors.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm uppercase tracking-wider font-semibold mb-3">Select Color</h3>
                  <div className="flex flex-wrap gap-3">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={cn(
                          "min-w-[4rem] h-12 flex items-center justify-center border transition-all px-4",
                          selectedColor === color 
                            ? "border-primary bg-primary text-white shadow-lg" 
                            : "border-border hover:border-primary"
                        )}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-8 border-y border-border py-6">
                <div className="flex items-center justify-between sm:justify-start border border-input rounded-md flex-shrink-0">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isSoldOut}
                    className="px-4 py-3 text-xl hover:text-primary transition-colors disabled:opacity-50"
                  >-</button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={isSoldOut}
                    className="px-4 py-3 text-xl hover:text-primary transition-colors disabled:opacity-50"
                  >+</button>
                </div>
                
                <div className="flex flex-1 gap-3">
                  <Button 
                    onClick={handleAddToCart}
                    disabled={isSoldOut}
                    className={cn("flex-1 h-14 rounded-md font-medium tracking-wide uppercase shadow-lg", isSoldOut ? "bg-muted text-muted-foreground" : "bg-secondary hover:bg-secondary/90 text-secondary-foreground")}
                  >
                    <ShoppingCart className="w-4 h-4 me-2" />
                    {isSoldOut ? t("product.soldOut") : t("product.addToCart")}
                  </Button>
                  
                  {!isSoldOut && (
                    <Button 
                      onClick={handleBuyNow}
                      className="flex-1 bg-primary hover:bg-primary/90 text-white h-14 rounded-md font-medium tracking-wide uppercase shadow-lg shadow-primary/20"
                    >
                      {t("product.buyNow")}
                    </Button>
                  )}
                </div>
              </div>

              {/* Value Props */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="w-6 h-6 text-secondary" />
                  <span>{t("product.lifetimeWarranty")}</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <RefreshCw className="w-6 h-6 text-secondary" />
                  <span>{t("product.returns")}</span>
                </div>
              </div>

            </div>
          </div>

          {/* Related Products */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="border-t border-border pt-20">
              <h2 className="text-3xl font-serif text-center text-primary mb-12">{t("product.youMayAlsoLike")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {relatedProducts.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
