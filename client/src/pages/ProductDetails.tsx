import { useParams } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useProduct, useProducts } from "@/hooks/use-products";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShoppingCart, ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/shop/ProductCard";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { convertGoogleDriveLink } from "@/lib/utils";

export default function ProductDetails() {
  const params = useParams();
  const productId = parseInt(params.id || "0");
  const { data: product, isLoading } = useProduct(productId);
  const { data: allProducts } = useProducts();
  const addItem = useCart(state => state.addItem);
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const { t } = useLanguage();

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast({
        title: t("product.addedToCart"),
        description: `${quantity}x ${product.name} ${t("product.addedToCartDesc")}`,
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 mb-24">
            
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-[4/5] bg-muted/20 rounded-xl overflow-hidden shadow-xl">
                <img src={convertGoogleDriveLink(product.imageUrl)} alt={product.name} className="w-full h-full object-cover" />
              </div>
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
