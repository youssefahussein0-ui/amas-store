import { useParams } from "wouter";
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
import { convertGoogleDriveLink, cn } from "@/lib/utils";

export default function ProductDetails() {
  const params = useParams();
  const productId = parseInt(params.id || "0");
  const { data: product, isLoading } = useProduct(productId);
  const { data: allProducts } = useProducts();
  const addItem = useCart(state => state.addItem);
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>("");
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
    }
  }, [product]);

  const handleAddToCart = () => {
    if (product) {
      if (product.sizes && !selectedSize) {
        toast({
          title: t("admin.login.error"),
          description: "Please select a size",
          variant: "destructive"
        });
        return;
      }
      addItem(product, quantity, selectedSize);
      toast({
        title: t("product.addedToCart"),
        description: `${quantity}x ${product.name} ${selectedSize ? `(${selectedSize})` : ""} ${t("product.addedToCartDesc")}`,
        className: "bg-primary text-primary-foreground border-none",
      });
    }
  };

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
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
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
                      <img src={convertGoogleDriveLink(img)} className="w-full h-full object-cover" />
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
              <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4 leading-tight">{product.name}</h1>
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
              {(product.category.toLowerCase() === "clothing" || product.category.toLowerCase() === "shoes" || product.category.toLowerCase() === "jacket") && sizes.length > 0 && (
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

              <div className="flex items-center gap-6 mb-8 border-y border-border py-6">
                <div className="flex items-center border border-input rounded-md">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-2 text-xl hover:text-primary transition-colors"
                  >-</button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-2 text-xl hover:text-primary transition-colors"
                  >+</button>
                </div>
                
                <Button 
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white h-14 rounded-md font-medium tracking-wide uppercase shadow-lg shadow-primary/20"
                >
                  <ShoppingCart className="w-4 h-4 me-2" />
                  {t("product.addToCart")}
                </Button>
              </div>

              {/* Value Props */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-center">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="w-6 h-6 text-secondary" />
                  <span>{t("product.lifetimeWarranty")}</span>
                </div>
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Truck className="w-6 h-6 text-secondary" />
                  <span>{t("product.freeShipping")}</span>
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
