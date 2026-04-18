import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import logoImg from "@assets/image_1772919891991.png";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const cartCount = useCart((state) => state.getCartCount());
  const { t, language, setLanguage, isRTL } = useLanguage();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t("nav.home"), path: "/" },
    { name: t("nav.shopCollection"), path: "/shop" },
    { name: t("nav.rings"), path: "/shop?category=Rings" },
    { name: t("nav.necklaces"), path: "/shop?category=Necklaces" },
  ];

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
            {navLinks.slice(0, 2).map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className="text-sm font-medium tracking-wide uppercase hover:text-secondary transition-colors duration-300"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Logo - Centered */}
          <Link href="/" className="flex-shrink-0 flex items-center cursor-pointer md:absolute md:left-1/2 md:transform md:-translate-x-1/2">
            <img src={logoImg} alt="أماس Amas" className="h-10 md:h-12 w-auto object-contain" />
          </Link>

          {/* Right Nav */}
          <div className="flex items-center gap-2 md:gap-6">
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.slice(2).map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className="text-sm font-medium tracking-wide uppercase hover:text-secondary transition-colors duration-300"
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* Language Toggle - Desktop only (mobile version is in hamburger menu) */}
            <button
              onClick={toggleLanguage}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase hover:text-secondary transition-colors duration-300 py-1.5 px-3 border border-border rounded-full hover-elevate"
              data-testid="lang-toggle"
              title={language === "en" ? "العربية" : "English"}
            >
              <Globe className="w-4 h-4" />
              <span>{language === "en" ? "AR" : "EN"}</span>
            </button>
            
            <Link href="/cart" className="relative group p-2 cursor-pointer">
              <ShoppingBag className="w-5 h-5 group-hover:text-secondary transition-colors" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link 
              href="/admin/login" 
              className="hidden md:block text-xs font-medium tracking-wide uppercase hover:text-secondary transition-colors duration-300 py-1 px-3 border border-border rounded hover-elevate"
              data-testid="link-admin"
            >
              {t("nav.admin")}
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
              <img src={logoImg} alt="أماس" className="h-10" />
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
