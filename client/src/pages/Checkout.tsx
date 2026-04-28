import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCart } from "@/hooks/use-cart";
import { useCreateOrder } from "@/hooks/use-orders";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { convertGoogleDriveLink, validateEgyptianPhone } from "@/lib/utils";

export default function Checkout() {
  const { items, getCartTotal, getDiscountedTotal, clearCart, appliedDiscount } = useCart();
  const createOrder = useCreateOrder();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    paymentMethod: "cod"
  });

  if (items.length === 0 && !success) {
    setLocation("/cart");
    return null;
  }

  if (success) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center pt-20">
          <CheckCircle2 className="w-24 h-24 text-secondary mb-6" />
          <h1 className="text-4xl font-serif text-primary mb-4">{t("checkout.orderSuccess")}</h1>
          <p className="text-muted-foreground mb-8 max-w-md text-center">
            {t("checkout.orderSuccessMsg")}
          </p>
          <Button onClick={() => setLocation("/")} className="bg-primary">{t("checkout.returnHome")}</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEgyptianPhone(formData.phone)) {
      toast({
        title: t("admin.login.error"),
        description: "Please enter a valid Egyptian phone number (e.g., 01012345678)",
        variant: "destructive"
      });
      return;
    }
    
    createOrder.mutate({
      customerName: formData.name,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      paymentMethod: formData.paymentMethod,
      totalAmount: getDiscountedTotal(),
      items: items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        size: item.size || null
      }))
    }, {
      onSuccess: () => {
        clearCart();
        setSuccess(true);
      },
      onError: (err) => {
        toast({
          title: t("admin.login.error"),
          description: err.message,
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-serif text-primary mb-12">{t("checkout.title")}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            
            {/* Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-8">
                
                <div className="bg-white p-8 rounded-xl luxury-shadow space-y-6">
                  <h2 className="text-2xl font-serif text-primary mb-6">{t("checkout.shippingDetails")}</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("checkout.fullName")}</Label>
                    <Input 
                      id="name" 
                      required 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="bg-background focus-visible:ring-primary" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("checkout.phoneNumber")}</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-sm text-muted-foreground border-e pe-2">
                        <span className="text-base">🇪🇬</span> +20
                      </span>
                      <Input 
                        id="phone" 
                        required 
                        type="tel"
                        placeholder="01xxxxxxxxx"
                        maxLength={11}
                        value={formData.phone}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, "").slice(0, 11);
                          setFormData(prev => ({ ...prev, phone: val }));
                        }}
                        className="bg-background focus-visible:ring-primary ps-20" 
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground">Must be a valid Egyptian number (11 digits)</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">{t("checkout.deliveryAddress")}</Label>
                    <textarea 
                      id="address" 
                      required 
                      rows={3}
                      value={formData.address}
                      onChange={e => setFormData({...formData, address: e.target.value})}
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="bg-white p-8 rounded-xl luxury-shadow">
                  <h2 className="text-2xl font-serif text-primary mb-6">{t("checkout.paymentMethod")}</h2>
                  
                  <RadioGroup 
                    value={formData.paymentMethod} 
                    onValueChange={(val) => setFormData({...formData, paymentMethod: val})}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-3 border border-border p-4 rounded-md">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="font-medium cursor-pointer">{t("checkout.cod")}</Label>
                    </div>
                    <div className="flex items-center space-x-3 border border-border p-4 rounded-md">
                      <RadioGroupItem value="bank" id="bank" />
                      <Label htmlFor="bank" className="font-medium cursor-pointer">{t("checkout.bankTransfer")}</Label>
                    </div>
                    <div className="flex items-center space-x-3 border border-border p-4 rounded-md">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="font-medium cursor-pointer">{t("checkout.creditCard")}</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button 
                  type="submit" 
                  disabled={createOrder.isPending}
                  className="w-full bg-primary hover:bg-primary/90 text-white h-16 rounded-md text-lg tracking-wider shadow-lg shadow-primary/20"
                >
                  {createOrder.isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : t("checkout.placeOrder")}
                </Button>

              </form>
            </div>

            {/* Order Summary */}
            <div className="bg-muted/30 p-8 rounded-xl h-fit">
              <h2 className="text-2xl font-serif text-primary mb-6">{t("checkout.yourItems")}</h2>
              
              <div className="space-y-6 mb-8 max-h-[400px] overflow-auto pe-2">
                {items.map(item => (
                  <div key={item.product.id} className="flex gap-4 items-center">
                    <img src={convertGoogleDriveLink(item.product.imageUrl)} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                    <div className="flex-1">
                      <h4 className="font-medium">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground">{t("checkout.qty")}: {item.quantity}</p>
                    </div>
                    <p className="font-medium">{(Number(item.product.price) * item.quantity).toFixed(2)} {t("product.currency")}</p>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-border pt-6 space-y-3">
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("checkout.subtotal")}</span>
                  <span>{getCartTotal().toFixed(2)} {t("product.currency")}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>{t("checkout.shipping")}</span>
                  <span>{t("checkout.free")}</span>
                </div>
                {appliedDiscount && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({appliedDiscount}%)</span>
                    <span>-{(getCartTotal() * appliedDiscount / 100).toFixed(2)} {t("product.currency")}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-serif text-primary pt-4">
                  <span>{t("checkout.total")}</span>
                  <span>{getDiscountedTotal().toFixed(2)} {t("product.currency")}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
