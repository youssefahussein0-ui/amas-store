import { useState } from "react";
import { Link } from "wouter";
import { type Product } from "@shared/schema";
import { Eye, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { convertGoogleDriveLink } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const addItem = useCart((state) => state.addItem);
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleAddToCart = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    addItem(product, 1);
    toast({
      title: t("product.addedToCart"),
      description: `${product.name} ${t("product.addedToCartDesc")}`,
      className: "bg-primary text-primary-foreground border-none",
    });
    setQuickViewOpen(false);
  };

  return (
    <>
      <div className="group relative flex flex-col gap-4">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden bg-white/50 rounded-lg cursor-pointer">
          {product.isNew && (
            <span className="absolute top-3 left-3 z-10 bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-sm">
              {t("product.new")}
            </span>
          )}
          {product.isBestSeller && !product.isNew && !product.discountPrice && (
            <span className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-sm">
              {t("product.bestSeller")}
            </span>
          )}
          {product.discountPrice && (
            <span className="absolute top-3 left-3 z-10 bg-red-600 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-sm">
              {t("product.sale")}
            </span>
          )}
          
          <Link href={`/product/${product.id}`} className="block w-full h-full">
            <img
              src={convertGoogleDriveLink(product.imageUrl)}
              alt={product.name}
              className="object-cover w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </Link>

          {/* Quick Actions Hover */}
          <div className="absolute bottom-0 left-0 w-full p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex gap-2">
            <button
              onClick={(e) => { e.preventDefault(); setQuickViewOpen(true); }}
              className="flex-1 bg-background/90 backdrop-blur text-foreground hover:bg-primary hover:text-primary-foreground py-3 flex items-center justify-center gap-2 rounded transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="text-xs uppercase font-semibold">{t("product.quickView")}</span>
            </button>
          </div>
        </div>

        {/* Product Info */}
        <div className="text-center">
          <Link href={`/product/${product.id}`} className="hover:text-secondary transition-colors">
            <h3 className="font-serif text-lg">{product.name}</h3>
          </Link>
          <p className="text-muted-foreground text-sm mt-1 mb-3">{product.category}</p>
          {product.discountPrice ? (
            <div className="flex items-center justify-center gap-2">
              <span className="font-medium text-primary">{Number(product.discountPrice).toFixed(2)} {t("product.currency")}</span>
              <span className="text-sm text-muted-foreground line-through">{Number(product.price).toFixed(2)} {t("product.currency")}</span>
            </div>
          ) : (
            <p className="font-medium text-primary">{Number(product.price).toFixed(2)} {t("product.currency")}</p>
          )}
        </div>
      </div>

      {/* Quick View Dialog */}
      <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-background border-none rounded-xl luxury-shadow">
          <DialogTitle className="sr-only">{product.name} Quick View</DialogTitle>
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="aspect-square md:aspect-auto h-full bg-muted/20">
              <img src={convertGoogleDriveLink(product.imageUrl)} alt={product.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h2 className="text-3xl font-serif text-primary mb-2">{product.name}</h2>
              {product.discountPrice ? (
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-2xl font-serif text-primary">{Number(product.discountPrice).toFixed(2)} {t("product.currency")}</span>
                  <span className="text-lg text-muted-foreground line-through">{Number(product.price).toFixed(2)} {t("product.currency")}</span>
                </div>
              ) : (
                <p className="text-xl font-light mb-6">{Number(product.price).toFixed(2)} {t("product.currency")}</p>
              )}
              
              <div className="w-12 h-px bg-secondary mb-6"></div>
              
              <p className="text-muted-foreground text-sm leading-relaxed mb-8">
                {product.description}
              </p>

              <div className="space-y-4">
                <Button 
                  onClick={handleAddToCart}
                  className="w-full bg-primary hover:bg-primary/90 text-white rounded-none h-14 font-medium tracking-wide uppercase"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {t("product.addToCart")}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = `/product/${product.id}`}
                  className="w-full rounded-none h-14 border-primary text-primary hover:bg-primary/5 tracking-wide uppercase"
                >
                  {t("product.viewFullDetails")}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
