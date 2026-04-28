import logoImg from "@assets/image_1772919891991.png";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useCategories } from "@/hooks/use-categories";
import { Link } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Phone, Facebook, Instagram } from "lucide-react";

export function Footer() {
  const { t, language } = useLanguage();
  const { data: categories } = useCategories();
  
  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8 border-t border-primary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-start">
          
          <div className="flex flex-col items-center md:items-start">
            <img src={logoImg} alt="Amas" className="h-16 mb-4 filter brightness-0 invert" />
            <p className="text-primary-foreground/80 font-serif italic text-lg max-w-xs">
              {t("footer.tagline")}
            </p>
          </div>

          <div>
            <h4 className="font-serif text-xl mb-6 text-secondary">{t("footer.discover")}</h4>
            <ul className="space-y-3 font-light">
              <li><Link href="/shop" className="hover:text-secondary transition-colors">{t("footer.newCollection")}</Link></li>
              {categories?.slice(0, 4).map(cat => (
                <li key={cat.id}>
                  <Link href={`/shop?category=${cat.slug}`} className="hover:text-secondary transition-colors">
                    {language === "ar" ? cat.nameAr : cat.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-xl mb-6 text-secondary">{t("footer.amas")}</h4>
            <ul className="space-y-3 font-light">
              <li><a href="#" className="hover:text-secondary transition-colors">{t("footer.ourStory")}</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">{t("footer.materialsCare")}</a></li>
              <li>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="hover:text-secondary transition-colors text-start">{t("footer.contactUs")}</button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md bg-white">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-serif text-primary border-b pb-2">{t("footer.contactUs")}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                      <div className="space-y-3">
                        <h5 className="font-medium flex items-center gap-2 text-primary">
                          <Phone className="w-4 h-4" /> {language === 'ar' ? 'أرقام الهاتف' : 'Phone Numbers'}
                        </h5>
                        <div className="grid grid-cols-1 gap-2 pl-6">
                          <a href="tel:01002349187" className="hover:text-secondary transition-colors">01002349187</a>
                          <a href="tel:01003374884" className="hover:text-secondary transition-colors">01003374884</a>
                          <a href="tel:01150388851" className="hover:text-secondary transition-colors">01150388851</a>
                          <a href="tel:01001653773" className="hover:text-secondary transition-colors">01001653773</a>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <h5 className="font-medium flex items-center gap-2 text-primary">
                          {language === 'ar' ? 'تابعنا على' : 'Follow Us'}
                        </h5>
                        <div className="flex gap-4 pl-6">
                          <a href="https://www.facebook.com/share/1LatwaqTkz/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="p-3 bg-muted rounded-full hover:bg-primary hover:text-white transition-all">
                            <Facebook className="w-5 h-5" />
                          </a>
                          <a href="https://www.instagram.com/amasgallery2?igsh=MTk0eXFkNDh1c3hkNg==" target="_blank" rel="noopener noreferrer" className="p-3 bg-muted rounded-full hover:bg-primary hover:text-white transition-all">
                            <Instagram className="w-5 h-5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </li>
              <li><Link href="/admin/login" className="hover:text-secondary transition-colors">{t("footer.adminPortal")}</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/60 font-light">
          <p>{t("footer.copyright", { year: new Date().getFullYear().toString() })}</p>
        </div>
      </div>
    </footer>
  );
}
