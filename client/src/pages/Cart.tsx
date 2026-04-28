import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";
import { Trash2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { convertGoogleDriveLink } from "@/lib/utils";

export default function Cart() {
  const { items, removeItem, updateQuantity, getCartTotal } = useCart();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 container mx-auto px-4 sm:px-6">
        <h1 className="text-4xl font-serif text-primary mb-12">{t("cart.title")}</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-16 h-16 mx-auto text-muted-foreground/30 mb-6" />
            <h2 className="text-2xl font-serif text-primary mb-3">{t("cart.empty")}</h2>
            <p className="text-muted-foreground mb-8">{t("cart.emptyHint")}</p>
            <Link href="/shop">
              <Button className="bg-primary hover:bg-primary/90">{t("cart.startShopping")}</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {items.map(item => (
                <div key={item.product.id + (item.size || '')} className="flex gap-6 bg-white p-6 rounded-xl luxury-shadow">
                  <img 
                    src={convertGoogleDriveLink(item.product.imageUrl)} 
                    alt={item.product.name} 
                    className="w-24 h-24 object-cover rounded-lg" 
                  />
                  <div className="flex-1">
                    <h3 className="font-serif text-lg text-primary">{item.product.name}</h3>
                    <div className="flex gap-4 text-muted-foreground text-sm">
                      <p>{item.product.category}</p>
                      {item.size && <p className="border-s ps-4 font-medium text-secondary">Size: {item.size}</p>}
                    </div>
                    <p className="font-medium mt-2">{Number(item.product.price).toFixed(2)} {t("product.currency")}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button 
                      onClick={() => removeItem(item.product.id, item.size)}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex items-center border border-input rounded-md">
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.size)}
                        className="px-3 py-1 hover:text-primary transition-colors"
                      >-</button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.size)}
                        className="px-3 py-1 hover:text-primary transition-colors"
                      >+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-muted/30 p-8 rounded-xl h-fit">
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("cart.subtotal")}</span>
                  <span>{getCartTotal().toFixed(2)} {t("product.currency")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("cart.shipping")}</span>
                  <span>{t("cart.free")}</span>
                </div>
                {useCart.getState().appliedDiscount && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({useCart.getState().appliedDiscount}%)</span>
                    <span>-{(getCartTotal() * (useCart.getState().appliedDiscount || 0) / 100).toFixed(2)} {t("product.currency")}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-serif text-primary pt-4 border-t border-border">
                  <span>{t("cart.total")}</span>
                  <span>{useCart.getState().getDiscountedTotal().toFixed(2)} {t("product.currency")}</span>
                </div>
              </div>
              <Link href="/checkout">
                <Button className="w-full bg-primary hover:bg-primary/90 text-white h-14 rounded-md text-lg tracking-wider shadow-lg shadow-primary/20">
                  {t("cart.proceedToCheckout")}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
