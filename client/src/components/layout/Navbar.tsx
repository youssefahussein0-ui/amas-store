import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, Globe } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useCart } from "@/hooks/use-cart";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useCategories } from "@/hooks/use-categories";
import logoImg from "@assets/logo_gold.png";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const cartCount = useCart((state) => state.getCartCount());
  const { t, language, setLanguage, isRTL } = useLanguage();
  const { data: categories } = useCategories();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = useMemo(() => {
    const base = [
      { name: t("nav.home"), path: "/" },
      { name: t("nav.shopCollection"), path: "/shop" },
    ];
    if (!categories) return base;
    return [
      ...base,
      ...categories.map(c => ({
        name: language === "ar" ? c.nameAr : c.nameEn,
        path: `/shop?category=${c.slug}`
      }))
    ];
  }, [categories, t, language]);

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ar" : "en");
  };

  return (
    <>
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled || location !== "/" ? "glass-nav py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Mobile: Left side - menu trigger */}
          <div className="flex items-center gap-2 md:hidden min-w-[48px]">
            <button
              className="text-foreground p-2"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Desktop Nav - Left */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium tracking-wide uppercase hover:text-secondary transition-colors duration-300"
            >
              {t("nav.home")}
            </Link>
            <Link
              href="/shop"
              className="text-sm font-medium tracking-wide uppercase hover:text-secondary transition-colors duration-300"
            >
              {t("nav.shopCollection")}
            </Link>
            
            {/* Categories Dropdown */}
            <div className="relative group">
              <button className="text-sm font-medium tracking-wide uppercase hover:text-secondary transition-colors duration-300 flex items-center gap-1">
                {t("admin.sidebar.categories") || "Categories"}
                <svg className="w-4 h-4 transition-transform group-hover:rotate-180" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              <div className="absolute top-full left-0 mt-2 w-52 bg-white/95 backdrop-blur-md rounded-xl shadow-2xl border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top scale-95 group-hover:scale-100 py-2">
                {categories?.map((c) => (
                  <Link
                    key={c.id}
                    href={`/shop?category=${c.slug}`}
                    className="block px-6 py-3 text-sm hover:bg-muted/50 hover:text-secondary transition-colors"
                  >
                    {language === "ar" ? c.nameAr : c.nameEn}
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Logo - Centered */}
          <Link href="/" className="flex-shrink-0 flex items-center cursor-pointer md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
            <img src={logoImg} alt="أماس Amas" className="h-16 md:h-20 w-auto object-contain transition-transform hover:scale-110 duration-500" />
          </Link>

          {/* Right Nav */}
          <div className="flex items-center gap-2 md:gap-6">
            <div className="hidden md:flex items-center gap-8">
              {/* Language Toggle - Desktop only */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase hover:text-secondary transition-colors duration-300 py-1.5 px-3 border border-border rounded-full hover-elevate"
                title={language === "en" ? "العربية" : "English"}
              >
                <Globe className="w-4 h-4" />
                <span>{language === "en" ? "AR" : "EN"}</span>
              </button>
              
              <Link href="/admin/login" className="text-xs font-medium tracking-wide uppercase hover:text-secondary transition-colors duration-300 py-1 px-3 border border-border rounded hover-elevate">
                {t("nav.admin")}
              </Link>
            </div>
            
            <Link href="/cart" className="relative group p-2 cursor-pointer">
              <ShoppingBag className="w-5 h-5 group-hover:text-secondary transition-colors" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: isRTL ? "100%" : "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? "100%" : "-100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-background md:hidden"
          >
            <div className="p-5 flex justify-between items-center border-b border-border">
              <img src={logoImg} alt="أماس" className="h-14" />
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="w-8 h-8 text-primary" />
              </button>
            </div>
            <div className="flex flex-col p-8 gap-6 text-center">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className="text-2xl font-serif text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              {/* Mobile Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="text-lg font-serif text-secondary flex items-center justify-center gap-2 border-t border-border pt-6 mt-2"
              >
                <Globe className="w-5 h-5" />
                {language === "en" ? "العربية" : "English"}
              </button>

              <Link
                href="/admin/login"
                className="text-lg font-serif text-secondary border-t border-border pt-6 mt-2"
                onClick={() => setMobileMenuOpen(false)}
                data-testid="link-admin-mobile"
              >
                {t("nav.admin")}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
