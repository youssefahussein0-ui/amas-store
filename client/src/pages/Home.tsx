import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/shop/ProductCard";
import { SpinWheel } from "@/components/shop/SpinWheel";
import { useProducts } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useCategories } from "@/hooks/use-categories";
import { convertGoogleDriveLink } from "@/lib/utils";
import logoImg from "@assets/logo_gold.png";

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { t, language } = useLanguage();

  const newCollection = products?.filter(p => p.isNew).slice(0, 4) || [];
  const bestSellers = products?.filter(p => p.isBestSeller).slice(0, 4) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SpinWheel />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2000" 
            alt="Hero background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10 pt-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-7xl font-serif text-primary mb-6 leading-tight">
              {t("hero.title1")} <br />
              <span className="italic font-light">{t("hero.title2")}</span> <br />
              {t("hero.title3")}
            </h1>
            <p className="text-lg md:text-xl text-foreground/80 mb-10 max-w-lg font-light leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <Link href="/shop" className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 uppercase tracking-widest text-sm font-semibold transition-all hover:shadow-lg hover:shadow-primary/30">
              {t("hero.cta")}
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8">
            {isLoadingCategories ? (
              <div className="col-span-4 flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : categories?.map((cat) => (
              <Link key={cat.id} href={`/shop?category=${cat.slug}`} className="group relative h-[400px] overflow-hidden cursor-pointer">
                <img src={convertGoogleDriveLink(cat.imageUrl)} alt={language === 'ar' ? cat.nameAr : cat.nameEn} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-white text-3xl font-serif tracking-wider">{language === 'ar' ? cat.nameAr : cat.nameEn}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Collection */}
      <section className="py-24 bg-[#FAF9F6]">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif text-primary mb-4">{t("home.newCollection")}</h2>
            <div className="w-16 h-px bg-secondary mx-auto"></div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {newCollection.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-16">
            <Link href="/shop" className="inline-block border border-primary text-primary px-8 py-3 uppercase tracking-widest text-sm hover:bg-primary hover:text-white transition-colors">
              {t("home.viewAllProducts")}
            </Link>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 flex justify-center items-center bg-white/5 backdrop-blur-sm rounded-t-full p-12 border border-white/10 shadow-2xl">
              <img src={logoImg} alt="Amas Logo" className="w-full max-w-md animate-pulse-slow" />
            </div>
            <div className="order-1 lg:order-2 space-y-8">
              <h2 className="text-4xl md:text-5xl font-serif text-secondary">{t("home.theAmasStory")}</h2>
              <h3 className="text-2xl font-light italic opacity-90">{t("home.storySubtitle")}</h3>
              <p className="text-lg font-light leading-relaxed opacity-80">
                {t("home.storyP1")}
              </p>
              <p className="text-lg font-light leading-relaxed opacity-80">
                {t("home.storyP2")}
              </p>
              <Link href="/shop" className="inline-block border border-secondary text-secondary px-8 py-3 uppercase tracking-widest text-sm hover:bg-secondary hover:text-primary transition-colors mt-4">
                {t("home.discoverTheCraft")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      {bestSellers.length > 0 && (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif text-primary mb-4">{t("home.bestSellers")}</h2>
              <div className="w-16 h-px bg-secondary mx-auto"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
              {bestSellers.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
