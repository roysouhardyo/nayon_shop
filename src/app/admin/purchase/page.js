"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentLanguage, t } from "@/lib/i18n";
import { formatDateTime, debounce } from "@/lib/utils";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/Modal";
import { useNotification } from "@/components/NotificationProvider";

export default function PurchasePage() {
  const router = useRouter();
  const [lang, setLang] = useState("bn");
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [filterType, setFilterType] = useState("all"); // 'all', 'IN', 'OUT'

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }

    setLang(getCurrentLanguage());
    const handleLanguageChange = () => setLang(getCurrentLanguage());
    window.addEventListener("languageChanged", handleLanguageChange);

    fetchMovements();

    return () =>
      window.removeEventListener("languageChanged", handleLanguageChange);
  }, [router, filterType]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const params = new URLSearchParams();
      if (filterType !== "all") params.append("type", filterType);

      const response = await fetch(`/api/stock?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setMovements(data.movements);
      }
    } catch (error) {
      console.error("Error fetching movements:", error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "IN":
        return "bg-green-100 text-green-800";
      case "OUT":
        return "bg-red-100 text-red-800";
      case "EDIT":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case "IN":
        return lang === "bn" ? "স্টক ইন" : "Stock IN";
      case "OUT":
        return lang === "bn" ? "স্টক আউট" : "Stock OUT";
      case "EDIT":
        return lang === "bn" ? "সম্পাদনা" : "Edit";
      default:
        return type;
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
                  {t("purchase", lang)}
                </h1>
                <p className="text-xs text-gray-600">
                  {lang === "bn" ? "স্টক ম্যানেজমেন্ট" : "Stock Management"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              {/* Add Purchase button - hidden on mobile, shown on desktop */}
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="hidden lg:inline-flex btn btn-primary text-sm"
              >
                + {t("addPurchase", lang)}
              </button>
            </div>
          </div>

          {/* Mobile Add Purchase Button - Full width above filter tabs */}
          <button
            onClick={() => setShowPurchaseModal(true)}
            className="lg:hidden w-full btn btn-primary text-base mb-3 py-3"
          >
            + {t("addPurchase", lang)}
          </button>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                filterType === "all"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {lang === "bn" ? "সব" : "All"}
            </button>
            <button
              onClick={() => setFilterType("IN")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                lang === "bn" ? "bengali-text" : ""
              } ${
                filterType === "IN"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {t("stockIn", lang)}
            </button>
            <button
              onClick={() => setFilterType("OUT")}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                lang === "bn" ? "bengali-text" : ""
              } ${
                filterType === "OUT"
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {t("stockOut", lang)}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2
              className={`text-lg font-semibold text-gray-900 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {lang === "bn"
                ? "স্টক মুভমেন্ট হিস্ট্রি"
                : "Stock Movement History"}
            </h2>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : movements.length === 0 ? (
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <h3
                className={`mt-2 text-sm font-medium text-gray-900 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {lang === "bn" ? "কোন মুভমেন্ট নেই" : "No movements yet"}
              </h3>
              <button
                onClick={() => setShowPurchaseModal(true)}
                className="mt-4 btn btn-primary"
              >
                {lang === "bn" ? "প্রথম ক্রয় যোগ করুন" : "Add first purchase"}
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn" ? "তারিখ" : "Date"}
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn" ? "ধরন" : "Type"}
                    </th>
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
                      {t("quantity", lang)}
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn" ? "আগে" : "Before"}
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn" ? "পরে" : "After"}
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {t("note", lang)}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {movements.map((movement) => (
                    <tr key={movement._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(movement.createdAt, lang)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`badge ${getTypeColor(movement.type)} ${
                            lang === "bn" ? "bengali-text" : ""
                          }`}
                        >
                          {getTypeLabel(movement.type)}
                        </span>
                      </td>
                      <td
                        className={`px-6 py-4 ${
                          lang === "bn" ? "bengali-text" : ""
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {movement.product
                            ? lang === "bn"
                              ? movement.product.name_bn
                              : movement.product.name_en
                            : "-"}
                        </div>
                        {movement.product?.partCode && (
                          <div className="text-xs text-gray-500 font-mono">
                            {movement.product.partCode}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-semibold ${
                            movement.type === "IN"
                              ? "text-green-600"
                              : movement.type === "OUT"
                              ? "text-red-600"
                              : "text-blue-600"
                          }`}
                        >
                          {movement.type === "IN"
                            ? "+"
                            : movement.type === "OUT"
                            ? "-"
                            : ""}
                          {movement.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {movement.quantityBefore}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {movement.quantityAfter}
                      </td>
                      <td
                        className={`px-6 py-4 text-sm text-gray-500 ${
                          lang === "bn" ? "bengali-text" : ""
                        }`}
                      >
                        {movement.note || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <PurchaseFormModal
          lang={lang}
          onClose={() => setShowPurchaseModal(false)}
          onSuccess={() => {
            setShowPurchaseModal(false);
            fetchMovements();
          }}
        />
      )}
    </div>
  );
}

// Purchase Form Modal Component
function PurchaseFormModal({ lang, onClose, onSuccess }) {
  const notification = useNotification();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
    fetchAllProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setAllProducts(data.products);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  // Filter products based on category, sub-category, and search
  useEffect(() => {
    filterProducts();
  }, [selectedCategory, selectedSubCategory, searchTerm, allProducts]);

  const filterProducts = () => {
    let filtered = [...allProducts];

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        (p) =>
          p.category_bn === selectedCategory ||
          p.category_en === selectedCategory
      );
    }

    // Filter by sub-category
    if (selectedSubCategory) {
      filtered = filtered.filter(
        (p) =>
          p.subCategory_bn === selectedSubCategory ||
          p.subCategory_en === selectedSubCategory
      );
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name_bn?.toLowerCase().includes(term) ||
          p.name_en?.toLowerCase().includes(term) ||
          p.partCode?.toLowerCase().includes(term) ||
          p.brand?.toLowerCase().includes(term)
      );
    }

    setProducts(filtered);
  };

  const handleCategoryChange = (categoryName) => {
    setSelectedCategory(categoryName);
    setSelectedSubCategory(""); // Reset sub-category when category changes
  };

  const searchProducts = debounce(async (term) => {
    setSearchTerm(term);
  }, 300);

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setProducts([]);
    setSearchTerm("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      notification.warning(
        lang === "bn" ? "পণ্য নির্বাচন করুন" : "Please select a product"
      );
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: selectedProduct._id,
          quantity: parseInt(quantity),
          note: note || "Purchase",
        }),
      });

      const data = await response.json();

      if (data.success) {
        notification.success(
          lang === "bn" ? "স্টক সফলভাবে যোগ হয়েছে" : "Stock added successfully"
        );
        onSuccess();
      } else {
        notification.error(
          data.error || (lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred")
        );
      }
    } catch (error) {
      console.error("Error adding stock:", error);
      notification.error(lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={t("addPurchase", lang)}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Search */}
        <div>
          <label
            className={`block text-sm font-medium text-gray-700 mb-1 ${
              lang === "bn" ? "bengali-text" : ""
            }`}
          >
            {t("productName", lang)} *
          </label>

          {selectedProduct ? (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className={`font-semibold text-gray-900 ${
                      lang === "bn" ? "bengali-text" : ""
                    }`}
                  >
                    {lang === "bn"
                      ? selectedProduct.name_bn
                      : selectedProduct.name_en}
                  </p>
                  <p className="text-sm text-gray-600">
                    {lang === "bn" ? "বর্তমান স্টক" : "Current Stock"}:{" "}
                    {selectedProduct.stockQuantity}
                  </p>
                  <p className="text-xs text-gray-500 font-mono">
                    {selectedProduct.partCode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="text-red-600 hover:text-red-800"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Category and Sub-Category Filters */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <select
                    value={selectedCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className={`input text-sm ${
                      lang === "bn" ? "bengali-text" : ""
                    }`}
                  >
                    <option value="">
                      {lang === "bn" ? "সব ক্যাটাগরি" : "All Categories"}
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name_bn}>
                        {lang === "bn" ? cat.name_bn : cat.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => setSelectedSubCategory(e.target.value)}
                    className={`input text-sm ${
                      lang === "bn" ? "bengali-text" : ""
                    }`}
                    disabled={!selectedCategory}
                  >
                    <option value="">
                      {lang === "bn"
                        ? "সব সাব-ক্যাটাগরি"
                        : "All Sub-Categories"}
                    </option>
                    {selectedCategory &&
                      categories
                        .find((c) => c.name_bn === selectedCategory)
                        ?.subCategories?.map((sub, index) => (
                          <option key={index} value={sub.bn}>
                            {lang === "bn" ? sub.bn : sub.en}
                          </option>
                        ))}
                  </select>
                </div>
              </div>

              {/* Search Input */}
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    searchProducts(e.target.value);
                  }}
                  placeholder={
                    lang === "bn" ? "পণ্য খুঁজুন..." : "Search product..."
                  }
                  className={`input ${lang === "bn" ? "bengali-text" : ""}`}
                />

                {searching && (
                  <div className="absolute right-3 top-3">
                    <div className="spinner w-5 h-5 border-2"></div>
                  </div>
                )}

                {products.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {products.map((product) => (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => handleProductSelect(product)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <p
                          className={`font-medium text-gray-900 ${
                            lang === "bn" ? "bengali-text" : ""
                          }`}
                        >
                          {lang === "bn"
                            ? product.name_bn || product.name_en
                            : product.name_en || product.name_bn}
                        </p>
                        <p className="text-sm text-gray-600">
                          {lang === "bn" ? "স্টক" : "Stock"}:{" "}
                          {product.stockQuantity}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {product.partCode}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Category & Sub-Category (Auto-populated) */}
        {selectedProduct && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className={`block text-sm font-medium text-gray-700 mb-1 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {lang === "bn" ? "ক্যাটাগরি" : "Category"}
              </label>
              <input
                type="text"
                value={
                  lang === "bn"
                    ? selectedProduct.category_bn
                    : selectedProduct.category_en
                }
                readOnly
                className="input bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium text-gray-700 mb-1 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {lang === "bn" ? "সাব-ক্যাটাগরি" : "Sub-Category"}
              </label>
              <input
                type="text"
                value={
                  selectedProduct.subCategory_bn ||
                  selectedProduct.subCategory_en
                    ? lang === "bn"
                      ? selectedProduct.subCategory_bn
                      : selectedProduct.subCategory_en
                    : "-"
                }
                readOnly
                className="input bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>
        )}

        {/* Quantity */}
        <div>
          <label
            className={`block text-sm font-medium text-gray-700 mb-1 ${
              lang === "bn" ? "bengali-text" : ""
            }`}
          >
            {t("quantity", lang)} *
          </label>
          <input
            type="number"
            required
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="input"
          />
        </div>

        {/* New Stock Preview */}
        {selectedProduct && quantity && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p
              className={`text-sm text-gray-600 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {lang === "bn" ? "নতুন স্টক" : "New Stock"}
            </p>
            <p className="text-2xl font-bold text-green-600">
              {selectedProduct.stockQuantity} + {quantity} ={" "}
              {selectedProduct.stockQuantity + quantity}
            </p>
          </div>
        )}

        {/* Note */}
        <div>
          <label
            className={`block text-sm font-medium text-gray-700 mb-1 ${
              lang === "bn" ? "bengali-text" : ""
            }`}
          >
            {t("note", lang)}
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows="2"
            className={`input ${lang === "bn" ? "bengali-text" : ""}`}
            placeholder={
              lang === "bn"
                ? "সরবরাহকারী, চালান নম্বর ইত্যাদি..."
                : "Supplier, invoice number, etc..."
            }
          />
        </div>

        {/* Actions */}
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
            disabled={loading || !selectedProduct}
          >
            {loading
              ? lang === "bn"
                ? "যোগ হচ্ছে..."
                : "Adding..."
              : lang === "bn"
              ? "স্টক যোগ করুন"
              : "Add Stock"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
