import logoImg from "@assets/logo_gold.png";
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
            <img src={logoImg} alt="Amas" className="h-20 mb-4 object-contain" />
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
                          <a href="https://www.tiktok.com/@amasgallery2?_r=1&_t=ZS-95vPZaF2Ow9" target="_blank" rel="noopener noreferrer" className="p-3 bg-muted rounded-full hover:bg-primary hover:text-white transition-all">
                            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                              <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.81-.6-4.03-1.37-.01 3.9-.01 7.79-.02 11.69-.02 1.14-.14 2.34-.64 3.38-.5 1.04-1.33 1.93-2.4 2.41-1.07.49-2.3.63-3.46.61-1.14-.02-2.29-.21-3.32-.73-1.03-.52-1.91-1.37-2.44-2.4-1.11-2.12-1.03-4.9.45-6.85.55-.74 1.28-1.33 2.13-1.69.85-.36 1.79-.47 2.7-.42v4.04c-.67-.06-1.37.04-1.95.4-.58.36-1.01.97-1.14 1.65-.13.68-.01 1.41.34 2.01.35.6.94 1.05 1.61 1.24.67.19 1.4.12 2.01-.19.61-.31 1.08-.87 1.27-1.53.19-.66.19-1.38.19-2.07 0-4.32.01-8.64.01-12.96-.01-1.12.03-2.26-.01-3.39z"/>
                            </svg>
                          </a>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </li>
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
