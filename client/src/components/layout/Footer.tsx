import logoImg from "@assets/image_1772919891991.png";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  
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
              <li><a href="/shop" className="hover:text-secondary transition-colors">{t("footer.newCollection")}</a></li>
              <li><a href="/shop?category=Rings" className="hover:text-secondary transition-colors">{t("categories.rings")}</a></li>
              <li><a href="/shop?category=Necklaces" className="hover:text-secondary transition-colors">{t("categories.necklaces")}</a></li>
              <li><a href="/shop?category=Bracelets" className="hover:text-secondary transition-colors">{t("categories.bracelets")}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-serif text-xl mb-6 text-secondary">{t("footer.amas")}</h4>
            <ul className="space-y-3 font-light">
              <li><a href="#" className="hover:text-secondary transition-colors">{t("footer.ourStory")}</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">{t("footer.materialsCare")}</a></li>
              <li><a href="#" className="hover:text-secondary transition-colors">{t("footer.contactUs")}</a></li>
              <li><a href="/admin" className="hover:text-secondary transition-colors">{t("footer.adminPortal")}</a></li>
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
