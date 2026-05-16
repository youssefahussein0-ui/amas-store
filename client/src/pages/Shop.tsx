import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductCard } from "@/components/shop/ProductCard";
import { useProducts } from "@/hooks/use-products";
import { useSearch, useLocation } from "wouter";
import { useState, useMemo, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useCategories } from "@/hooks/use-categories";

export default function Shop() {
  const { data: products, isLoading } = useProducts();
  const { data: categories } = useCategories();
  const searchString = useSearch();
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(searchString);
  const categoryQuery = searchParams.get("category");
  const { t, language } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<string>(categoryQuery || "All");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  useEffect(() => {
    setActiveCategory(categoryQuery || "All");
  }, [categoryQuery]);

  const handleCategoryClick = (key: string) => {
    setActiveCategory(key);
    if (key === "All") {
      setLocation("/shop");
    } else {
      setLocation(`/shop?category=${key}`);
    }
  };

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
    const categoryObj = categories?.find(c => c.slug.trim().toLowerCase() === activeCategory.trim().toLowerCase());
    const targetCategoryName = categoryObj ? categoryObj.nameEn : activeCategory;

    return products.filter(p => 
      (p.category.trim().toLowerCase() === targetCategoryName.trim().toLowerCase() ||
      p.category.trim().toLowerCase() === activeCategory.trim().toLowerCase()) &&
      (Number(p.discountPrice || p.price) >= priceRange[0] && Number(p.discountPrice || p.price) <= priceRange[1])
    );
  }, [products, activeCategory, categories, priceRange]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const priceA = Number(a.discountPrice || a.price);
      const priceB = Number(b.discountPrice || b.price);
      
      if (sortBy === "price-low") return priceA - priceB;
      if (sortBy === "price-high") return priceB - priceA;
      if (sortBy === "newest") return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      return 0;
    });
  }, [filteredProducts, sortBy]);

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
          <div className="flex flex-col md:flex-row gap-8 mb-16">
            <div className="flex-1">
              <div className="flex flex-wrap gap-4">
                {categoryMap.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => handleCategoryClick(cat.key)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      activeCategory.trim().toLowerCase() === cat.key.trim().toLowerCase() 
                        ? "bg-primary text-white shadow-lg" 
                        : "bg-white text-foreground hover:bg-muted"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-background border border-input rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="newest">{t("shop.sort.newest") || "Newest"}</option>
                <option value="price-low">{t("shop.sort.priceLow") || "Price: Low to High"}</option>
                <option value="price-high">{t("shop.sort.priceHigh") || "Price: High to Low"}</option>
              </select>
            </div>
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
              {sortedProducts.map(product => (
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
