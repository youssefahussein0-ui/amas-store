import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/shop/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { useSearch } from "wouter";
import { useState, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useCategories } from "@/hooks/use-categories";

export default function Shop() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const categoryQuery = searchParams.get("category");
  const { t, language } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<string>(categoryQuery || "All");

  const categoryMap = useMemo(() => {
    const base = [{ key: "All", label: t("categories.all") }];
    if (!categories) return base;
    return [
      ...base,
      ...categories.map(c => ({
        key: c.slug,
        label: language === "ar" ? c.nameAr : c.nameEn
      }))
    ];
  }, [categories, t, language]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (activeCategory === "All") return products;
    
    // Find the category name associated with the slug (activeCategory)
    const categoryObj = categories?.find(c => c.slug === activeCategory);
    const targetCategoryName = categoryObj ? categoryObj.nameEn : activeCategory;

    return products.filter(p => 
      p.category.toLowerCase() === targetCategoryName.toLowerCase() ||
      p.category.toLowerCase() === activeCategory.toLowerCase()
    );
  }, [products, activeCategory, categories]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 pt-32 pb-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif text-primary mb-4">{t("shop.title")}</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto font-light">
              {t("shop.subtitle")}
            </p>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {categoryMap.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                  activeCategory === cat.key 
                    ? "bg-primary text-white shadow-lg" 
                    : "bg-white text-foreground hover:bg-muted"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-serif text-primary mb-2">{t("shop.noProducts")}</h3>
              <p className="text-muted-foreground">{t("shop.noProductsHint")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-16">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
