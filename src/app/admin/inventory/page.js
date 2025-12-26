"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentLanguage, t } from "@/lib/i18n";
import { generatePartCode, formatCurrency, formatDate } from "@/lib/utils";
import { CATEGORIES } from "@/lib/categories";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SearchBar from "@/components/SearchBar";
import StockBadge from "@/components/StockBadge";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/Modal";
import ImageUpload from "@/components/ImageUpload";
import CategoryManagementModal from "@/components/CategoryManagementModal";
import { useNotification } from "@/components/NotificationProvider";

export default function InventoryPage() {
  const router = useRouter();
  const notification = useNotification();
  const [lang, setLang] = useState("bn");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState("cards"); // 'cards' or 'table'
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categories, setCategories] = useState(CATEGORIES); // Initialize with default
  const [productToDelete, setProductToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }

    setLang(getCurrentLanguage());
    const handleLanguageChange = () => setLang(getCurrentLanguage());
    window.addEventListener("languageChanged", handleLanguageChange);

    fetchProducts();
    fetchCategories(); // Fetch categories from database

    return () =>
      window.removeEventListener("languageChanged", handleLanguageChange);
  }, [router, searchTerm, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success && data.categories && data.categories.length > 0) {
        // Transform database categories to match expected format
        const normalizedCategories = data.categories.map((cat) => ({
          id: cat.id,
          bn: cat.name_bn,
          en: cat.name_en || cat.name_bn, // Fallback to Bangla if English is empty
          subCategories: cat.subCategories || [],
          order: cat.order || 999,
        }));

        // Sort categories: 'others' always at the end, rest by order
        const sortedCategories = normalizedCategories.sort((a, b) => {
          // If 'a' is 'others', it should come after 'b'
          if (a.id === "others") return 1;
          // If 'b' is 'others', it should come after 'a'
          if (b.id === "others") return -1;
          // Otherwise sort by order
          return (a.order || 999) - (b.order || 999);
        });

        setCategories(sortedCategories);
      } else {
        // If database is empty, use default categories
        console.log("No categories in database, using defaults");
        setCategories(CATEGORIES);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Keep using default CATEGORIES if fetch fails
      setCategories(CATEGORIES);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (selectedCategory) params.append("category", selectedCategory);

      const response = await fetch(`/api/products?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteConfirm(true);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/products/${productToDelete._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        notification.success(
          lang === "bn"
            ? "পণ্য মুছে ফেলা হয়েছে"
            : "Product deleted successfully"
        );
        setShowDeleteConfirm(false);
        setProductToDelete(null);
        fetchProducts(); // Refresh the product list
      } else {
        notification.error(
          data.error ||
            (lang === "bn" ? "ত্রুটি হয়েছে" : "Error deleting product")
        );
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      notification.error(
        lang === "bn" ? "ত্রুটি হয়েছে" : "Error deleting product"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 mr-2">
              <button
                onClick={() => router.push("/admin")}
                className="lg:hidden text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1
                  className={`text-base font-bold text-gray-900 ${
                    lang === "bn" ? "bengali-text" : ""
                  }`}
                >
                  {t("inventory", lang)}
                </h1>
                <p className="text-xs text-gray-600">
                  {products.length} {lang === "bn" ? "পণ্য" : "products"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <button
                onClick={() => setShowCategoryModal(true)}
                className="btn btn-secondary text-sm whitespace-nowrap"
              >
                {lang === "bn" ? "ক্যাটাগরি" : "Categories"}
              </button>
              {/* Add button - hidden on mobile, shown on desktop */}
              <button
                onClick={() => setShowAddModal(true)}
                className="hidden lg:inline-flex btn btn-primary text-sm whitespace-nowrap"
              >
                + {t("add", lang)}
              </button>
            </div>
          </div>

          {/* Mobile Add Button - Full width above search bar */}
          <button
            onClick={() => setShowAddModal(true)}
            className="lg:hidden w-full btn btn-primary text-base mb-3 py-3"
          >
            + {t("add", lang)}
          </button>

          <SearchBar onSearch={setSearchTerm} />

          {/* View Toggle */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedCategory("")}
                className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                  !selectedCategory
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {lang === "bn" ? "সব" : "All"}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.en}
                  onClick={() =>
                    setSelectedCategory(lang === "bn" ? cat.bn : cat.en)
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                    lang === "bn" ? "bengali-text" : ""
                  } ${
                    selectedCategory === (lang === "bn" ? cat.bn : cat.en)
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {lang === "bn" ? cat.bn : cat.en}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex gap-2 ml-4">
              <button
                onClick={() => setViewMode("cards")}
                className={`p-2 rounded ${
                  viewMode === "cards"
                    ? "bg-primary-100 text-primary-600"
                    : "bg-gray-100"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded ${
                  viewMode === "table"
                    ? "bg-primary-100 text-primary-600"
                    : "bg-gray-100"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <LoadingSpinner />
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
              {lang === "bn" ? "কোন পণ্য নেই" : "No products"}
            </h3>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 btn btn-primary"
            >
              {lang === "bn" ? "প্রথম পণ্য যোগ করুন" : "Add first product"}
            </button>
          </div>
        ) : viewMode === "cards" ? (
          <div className="responsive-grid">
            {products.map((product, index) => (
              <div key={product._id} className="stagger-item">
                <ProductCard
                  product={product}
                  lang={lang}
                  onEdit={() => {
                    setSelectedProduct(product);
                    setShowEditModal(true);
                  }}
                  onDelete={() => handleDeleteClick(product)}
                />
              </div>
            ))}
          </div>
        ) : (
          <ProductTable
            products={products}
            lang={lang}
            onEdit={(product) => {
              setSelectedProduct(product);
              setShowEditModal(true);
            }}
            onDelete={(product) => handleDeleteClick(product)}
          />
        )}
      </main>

      {/* Add Product Modal */}
      {showAddModal && (
        <ProductFormModal
          lang={lang}
          categories={categories}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchProducts();
          }}
        />
      )}

      {/* Edit Product Modal */}
      {showEditModal && selectedProduct && (
        <ProductFormModal
          lang={lang}
          categories={categories}
          product={selectedProduct}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          onSuccess={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
            fetchProducts();
          }}
        />
      )}

      {/* Category Management Modal */}
      {showCategoryModal && (
        <CategoryManagementModal
          lang={lang}
          onClose={() => setShowCategoryModal(false)}
          onSuccess={() => {
            fetchCategories(); // Refresh categories list
            fetchProducts(); // Refresh products to get updated categories
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && productToDelete && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowDeleteConfirm(false);
            setProductToDelete(null);
          }}
          title={lang === "bn" ? "নিশ্চিত করুন" : "Confirm Delete"}
          size="sm"
        >
          <div className="space-y-4">
            <p
              className={`text-gray-700 ${lang === "bn" ? "bengali-text" : ""}`}
            >
              {lang === "bn"
                ? "আপনি কি নিশ্চিত যে এই পণ্যটি মুছে ফেলতে চান?"
                : "Are you sure you want to delete this product?"}
            </p>
            <div className="bg-gray-50 rounded-lg p-3">
              <p
                className={`font-semibold text-gray-900 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {lang === "bn"
                  ? productToDelete.name_bn
                  : productToDelete.name_en}
              </p>
              <p className="text-sm text-gray-500 font-mono">
                {productToDelete.partCode}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setProductToDelete(null);
                }}
                className="flex-1 btn btn-secondary"
              >
                {t("cancel", lang)}
              </button>
              <button onClick={handleDelete} className="flex-1 btn btn-danger">
                {t("delete", lang)}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Product Card Component
function ProductCard({ product, lang, onEdit, onDelete }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = product.images || [];
  const hasMultipleImages = images.length > 1;

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index, e) => {
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border-[3px] border-primary-300 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:border-primary-500">
      {/* Product Image Carousel */}
      <div className="relative w-full h-48 bg-gray-100 group">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentImageIndex]}
              alt={lang === "bn" ? product.name_bn : product.name_en}
              className="w-full h-full object-cover"
            />

            {/* Navigation Arrows - Only show if multiple images */}
            {hasMultipleImages && (
              <>
                {/* Previous Button */}
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Previous image"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Next Button */}
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Next image"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                {/* Dots Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => goToImage(index, e)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "bg-white w-4"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Image Counter */}
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="h-16 w-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Product Name */}
        <div className="mb-2">
          {product.name_bn && (
            <h3 className="font-bold text-lg text-gray-900 bengali-text line-clamp-1">
              {product.name_bn}
            </h3>
          )}
          {product.name_en && (
            <h3
              className={`font-bold text-gray-900 line-clamp-1 ${
                product.name_bn ? "text-base" : "text-lg"
              }`}
            >
              {product.name_en}
            </h3>
          )}
        </div>

        {/* Category */}
        <p className="text-xs text-gray-500 mb-3">
          {product.category_bn && (
            <span className="bengali-text">{product.category_bn}</span>
          )}
          {product.category_bn && product.category_en && (
            <span className="mx-1">•</span>
          )}
          {product.category_en && <span>{product.category_en}</span>}
          {(product.subCategory_bn || product.subCategory_en) && (
            <span>
              {" "}
              ›{" "}
              {product.subCategory_bn && (
                <span className="bengali-text">{product.subCategory_bn}</span>
              )}
              {product.subCategory_bn && product.subCategory_en && (
                <span className="mx-1">•</span>
              )}
              {product.subCategory_en && <span>{product.subCategory_en}</span>}
            </span>
          )}
        </p>

        {/* Brand & Model */}
        <div className="space-y-1 mb-3 pb-3 border-b border-gray-200">
          {product.brand && (
            <div className="flex items-center text-sm">
              <span className="text-gray-500 w-16">
                {lang === "bn" ? "ব্র্যান্ড" : "Brand"}:
              </span>
              <span className="font-medium text-gray-900">{product.brand}</span>
            </div>
          )}
          {product.compatibleModel && (
            <div className="flex items-center text-sm">
              <span className="text-gray-500 w-16">
                {lang === "bn" ? "মডেল" : "Model"}:
              </span>
              <span className="font-medium text-gray-900">
                {product.compatibleModel}
              </span>
            </div>
          )}
        </div>

        {/* Part Code */}
        <p className="text-xs text-gray-400 mb-3 font-mono bg-gray-50 px-3 py-2 rounded border border-gray-300 inline-block">
          {product.partCode}
        </p>

        {/* Price */}
        <div className="bg-gradient-to-r from-primary-50 to-green-50 rounded-lg p-3 mb-3 border-2 border-primary-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">
                {lang === "bn" ? "বিক্রয় মূল্য" : "Selling Price"}
              </p>
              <p className="text-xl font-bold text-primary-600">
                {formatCurrency(product.sellingPrice, lang)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">
                {lang === "bn" ? "ক্রয় মূল্য" : "Purchase"}
              </p>
              <p className="text-sm font-semibold text-gray-700">
                {formatCurrency(product.purchasePrice, lang)}
              </p>
            </div>
          </div>
        </div>

        {/* Current Stock */}
        <div className="flex items-center justify-between mb-4 bg-gray-50 rounded-lg p-3 border-2 border-gray-300">
          <div className="flex items-center gap-2">
            <StockBadge
              quantity={product.stockQuantity}
              minimumStock={product.minimumStockLevel}
            />
            <span className="text-xs text-gray-600">
              {lang === "bn" ? "স্টক স্ট্যাটাস" : "Stock Status"}
            </span>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">
              {lang === "bn" ? "বর্তমান স্টক" : "Current Stock"}
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {product.stockQuantity}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 btn btn-secondary text-sm py-2"
          >
            {t("edit", lang)}
          </button>
          <button
            onClick={onDelete}
            className="flex-1 btn btn-danger text-sm py-2"
          >
            {t("delete", lang)}
          </button>
        </div>
      </div>
    </div>
  );
}

// Product Table Component
function ProductTable({ products, lang, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {t("productName", lang)}
            </th>
            <th
              className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {t("category", lang)}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {t("brand", lang)}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {lang === "bn" ? "স্টক" : "Stock"}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {lang === "bn" ? "মূল্য" : "Price"}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              {lang === "bn" ? "অ্যাকশন" : "Actions"}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div
                  className={`text-sm font-medium text-gray-900 ${
                    lang === "bn" ? "bengali-text" : ""
                  }`}
                >
                  {lang === "bn"
                    ? product.name_bn || product.name_en
                    : product.name_en || product.name_bn}
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {product.partCode}
                </div>
              </td>
              <td
                className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {lang === "bn"
                  ? product.category_bn || product.category_en
                  : product.category_en || product.category_bn}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {product.brand || "-"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StockBadge
                  quantity={product.stockQuantity}
                  minimumStock={product.minimumStockLevel}
                />
                <div className="text-xs text-gray-500 mt-1">
                  {product.stockQuantity} {lang === "bn" ? "পিস" : "pcs"}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {formatCurrency(product.sellingPrice, lang)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(product)}
                  className="text-primary-600 hover:text-primary-900 mr-3"
                >
                  {t("edit", lang)}
                </button>
                <button
                  onClick={() => onDelete(product)}
                  className="text-red-600 hover:text-red-900"
                >
                  {t("delete", lang)}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Product Form Modal Component
function ProductFormModal({ lang, categories, product, onClose, onSuccess }) {
  const notification = useNotification();
  const [formData, setFormData] = useState({
    name_bn: product?.name_bn || "",
    name_en: product?.name_en || "",
    category_bn: product?.category_bn || categories[0].bn,
    category_en: product?.category_en || categories[0].en,
    subCategory_bn: product?.subCategory_bn || "",
    subCategory_en: product?.subCategory_en || "",
    brand: product?.brand || "",
    compatibleModel: product?.compatibleModel || "",
    partCode: product?.partCode || `PART-${Date.now()}`,
    purchasePrice: product?.purchasePrice || "",
    sellingPrice: product?.sellingPrice || "",
    stockQuantity: product?.stockQuantity || 0,
    minimumStockLevel: product?.minimumStockLevel || 5,
    supplierName: product?.supplierName || "",
    shelfLocation: product?.shelfLocation || "",
    images: product?.images || [],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const url = product ? `/api/products/${product._id}` : "/api/products";
      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        notification.success(
          lang === "bn" ? "সফলভাবে সংরক্ষিত হয়েছে" : "Saved successfully"
        );
        onSuccess();
      } else {
        notification.error(lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      notification.error(lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={
        product
          ? t("edit", lang) + " " + t("productName", lang)
          : t("add", lang) + " " + t("productName", lang)
      }
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              className={`block text-sm font-medium text-gray-700 mb-1 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {t("productName", lang)} (বাংলা) *
            </label>
            <input
              type="text"
              required
              value={formData.name_bn}
              onChange={(e) =>
                setFormData({ ...formData, name_bn: e.target.value })
              }
              className="input bengali-text"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("productName", lang)} (English) -{" "}
              {lang === "bn" ? "ঐচ্ছিক" : "Optional"}
            </label>
            <input
              type="text"
              value={formData.name_en}
              onChange={(e) =>
                setFormData({ ...formData, name_en: e.target.value })
              }
              className="input"
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium text-gray-700 mb-1 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {t("category", lang)} *
            </label>
            <select
              required
              value={formData.category_bn}
              onChange={(e) => {
                const cat = categories.find((c) => c.bn === e.target.value);
                setFormData({
                  ...formData,
                  category_bn: cat.bn,
                  category_en: cat.en,
                  subCategory_bn: "",
                  subCategory_en: "",
                });
              }}
              className={`input ${lang === "bn" ? "bengali-text" : ""}`}
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.bn}>
                  {lang === "bn" ? cat.bn : cat.en}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className={`block text-sm font-medium text-gray-700 mb-1 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {lang === "bn" ? "সাব-ক্যাটাগরি" : "Sub-Category"}
            </label>
            <select
              value={formData.subCategory_bn}
              onChange={(e) => {
                const selectedCat = categories.find(
                  (c) => c.bn === formData.category_bn
                );
                const subCat = selectedCat?.subCategories?.find(
                  (s) => s.bn === e.target.value
                );
                setFormData({
                  ...formData,
                  subCategory_bn: subCat?.bn || "",
                  subCategory_en: subCat?.en || "",
                });
              }}
              className={`input bg-white text-gray-900 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              <option value="" className="text-gray-900">
                {lang === "bn" ? "-- নির্বাচন করুন --" : "-- Select --"}
              </option>
              {categories
                .find((c) => c.bn === formData.category_bn)
                ?.subCategories?.map((sub) => (
                  <option key={sub.en} value={sub.bn} className="text-gray-900">
                    {lang === "bn" ? sub.bn : sub.en || sub.bn}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label
              className={`block text-sm font-medium text-gray-700 mb-1 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {t("brand", lang)}
            </label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
              className="input"
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium text-gray-700 mb-1 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {t("compatibleModel", lang)}
            </label>
            <input
              type="text"
              value={formData.compatibleModel}
              onChange={(e) =>
                setFormData({ ...formData, compatibleModel: e.target.value })
              }
              className="input"
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium text-gray-700 mb-1 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {t("purchasePrice", lang)} *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.purchasePrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  purchasePrice: parseFloat(e.target.value),
                })
              }
              className="input"
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium text-gray-700 mb-1 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {t("sellingPrice", lang)} *
            </label>
            <input
              type="number"
              required
              min="0"
              step="0.01"
              value={formData.sellingPrice}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sellingPrice: parseFloat(e.target.value),
                })
              }
              className="input"
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium text-gray-700 mb-1 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {t("stockQuantity", lang)} *
            </label>
            <input
              type="number"
              required
              min="0"
              value={formData.stockQuantity}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  stockQuantity: parseInt(e.target.value),
                })
              }
              className="input"
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium text-gray-700 mb-1 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {t("minimumStock", lang)}
            </label>
            <input
              type="number"
              min="0"
              value={formData.minimumStockLevel}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minimumStockLevel: parseInt(e.target.value),
                })
              }
              className="input"
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium text-gray-700 mb-1 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {t("supplier", lang)}
            </label>
            <input
              type="text"
              value={formData.supplierName}
              onChange={(e) =>
                setFormData({ ...formData, supplierName: e.target.value })
              }
              className="input"
            />
          </div>

          <div>
            <label
              className={`block text-sm font-medium text-gray-700 mb-1 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {t("shelfLocation", lang)}
            </label>
            <input
              type="text"
              value={formData.shelfLocation}
              onChange={(e) =>
                setFormData({ ...formData, shelfLocation: e.target.value })
              }
              className="input"
            />
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="mt-6">
          <ImageUpload
            images={formData.images}
            onChange={(images) => setFormData({ ...formData, images })}
            lang={lang}
            maxImages={5}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn btn-secondary"
            disabled={loading}
          >
            {t("cancel", lang)}
          </button>
          <button
            type="submit"
            className="flex-1 btn btn-primary"
            disabled={loading}
          >
            {loading
              ? lang === "bn"
                ? "সংরক্ষণ হচ্ছে..."
                : "Saving..."
              : t("save", lang)}
          </button>
        </div>
      </form>
    </Modal>
  );
}
