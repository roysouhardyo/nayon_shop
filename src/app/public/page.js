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
            <div
              className="cursor-pointer"
              onClick={() => router.push("/public")}
            >
              <h1
                className={`text-lg font-bold text-primary-600 hover:text-primary-700 transition-colors ${
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
            {products.map((product, index) => (
              <div key={product._id} className="stagger-item">
                <ProductCardWithCarousel product={product} lang={lang} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-8 animate-fade-in border-t-4 border-primary-500">
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          {/* Contact Information */}
          <div className="text-center mb-4 md:mb-6">
            <h3
              className={`text-lg md:text-xl font-bold mb-3 md:mb-4 text-primary-400 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {lang === "bn" ? "যোগাযোগ করুন" : "Contact Us"}
            </h3>
            <div className="flex items-center justify-center gap-2 md:gap-3 bg-gray-800 rounded-lg py-3 px-4 md:py-4 md:px-6 max-w-sm md:max-w-md mx-auto border-2 border-primary-500/30 hover:border-primary-500 transition-all">
              <svg
                className="w-5 h-5 md:w-6 md:h-6 text-primary-400 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <a
                href="tel:+8801931798504"
                className="text-lg md:text-xl font-bold text-white hover:text-primary-300 transition-colors"
              >
                +880 1931-798504
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700 mb-4 md:mb-6"></div>

          {/* Built with love */}
          <div className="text-center space-y-2">
            <p className="flex items-center justify-center gap-2 text-sm md:text-base">
              <span
                className={`font-medium ${lang === "bn" ? "bengali-text" : ""}`}
              >
                {lang === "bn" ? "ভালোবাসা দিয়ে তৈরি" : "Built with love"}
              </span>
              <span className="text-red-400 animate-pulse text-base md:text-lg">
                ❤️
              </span>
            </p>
            <p className="text-xs md:text-sm text-gray-400 italic">
              {lang === "bn" ? "কারণ: অজানা" : "Reason: unknown"}
            </p>
            <p className="text-xs md:text-sm text-gray-500">
              © {new Date().getFullYear()}{" "}
              <span
                className={`font-medium text-gray-300 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {lang === "bn" ? "নয়ন হার্ডওয়্যার" : "Nayon Hardware"}
              </span>
              {lang === "bn"
                ? " । সর্বস্বত্ব সংরক্ষিত"
                : " • All rights reserved"}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
