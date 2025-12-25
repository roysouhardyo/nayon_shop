"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentLanguage, t } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SearchBar from "@/components/SearchBar";
import LoadingSpinner from "@/components/LoadingSpinner";
import ProductCardWithCarousel from "@/components/ProductCardWithCarousel";
import { debounce } from "@/lib/utils";

export default function PublicInventoryPage() {
  const router = useRouter();
  const [lang, setLang] = useState("bn");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");

  useEffect(() => {
    setLang(getCurrentLanguage());

    const handleLanguageChange = () => {
      setLang(getCurrentLanguage());
    };

    window.addEventListener("languageChanged", handleLanguageChange);

    // Fetch categories
    fetchCategories();

    return () =>
      window.removeEventListener("languageChanged", handleLanguageChange);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, selectedSubCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedSubCategory)
        params.append("subCategory", selectedSubCategory);

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = debounce((value) => {
    setSearchTerm(value);
  }, 300);

  const handleCategorySelect = (categoryName) => {
    setSelectedCategory(categoryName);
    setSelectedSubCategory(""); // Reset subcategory when category changes
  };

  // Get subcategories for selected category
  const getSubCategories = () => {
    if (!selectedCategory) return [];
    const category = categories.find(
      (cat) =>
        cat.name_bn === selectedCategory || cat.name_en === selectedCategory
    );
    return category?.subCategories || [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1
                className={`text-2xl font-bold text-primary-600 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {lang === "bn" ? "নয়ন হার্ডওয়্যার" : "Nayon Hardware"}
              </h1>
              <p
                className={`text-sm text-gray-600 mt-1 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {t("publicView", lang)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <button
                onClick={() => router.push("/login")}
                className="btn btn-primary text-sm"
              >
                {t("login", lang)}
              </button>
            </div>
          </div>

          {/* Search */}
          <SearchBar onSearch={handleSearch} />
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Categories */}
          <div className="mb-2">
            <p
              className={`text-xs font-medium text-gray-600 mb-2 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {lang === "bn" ? "ক্যাটাগরি" : "Category"}
            </p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => handleCategorySelect("")}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  !selectedCategory
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {t("all", lang) || (lang === "bn" ? "সব" : "All")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() =>
                    handleCategorySelect(
                      lang === "bn" ? cat.name_bn : cat.name_en
                    )
                  }
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    lang === "bn" ? "bengali-text" : ""
                  } ${
                    selectedCategory ===
                    (lang === "bn" ? cat.name_bn : cat.name_en)
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {lang === "bn" ? cat.name_bn : cat.name_en}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategories - Only show if category is selected */}
          {selectedCategory && getSubCategories().length > 0 && (
            <div>
              <p
                className={`text-xs font-medium text-gray-600 mb-2 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {lang === "bn" ? "সাব-ক্যাটাগরি" : "Sub-Category"}
              </p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedSubCategory("")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                    !selectedSubCategory
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {lang === "bn" ? "সব" : "All"}
                </button>
                {getSubCategories().map((subCat, index) => {
                  // Show name with fallback - subcategories use 'bn' and 'en' properties
                  const displayName =
                    lang === "bn"
                      ? subCat.bn || subCat.en || "Unnamed"
                      : subCat.en || subCat.bn || "Unnamed";

                  const compareValue = lang === "bn" ? subCat.bn : subCat.en;

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedSubCategory(compareValue)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                        lang === "bn" ? "bengali-text" : ""
                      } ${
                        selectedSubCategory === compareValue
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {displayName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <LoadingSpinner
            text={lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}
          />
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3
              className={`mt-2 text-sm font-medium text-gray-900 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {lang === "bn" ? "কোন পণ্য পাওয়া যায়নি" : "No products found"}
            </h3>
          </div>
        ) : (
          <div className="responsive-grid">
            {products.map((product) => (
              <ProductCardWithCarousel
                key={product._id}
                product={product}
                lang={lang}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
