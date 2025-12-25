"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentLanguage, t } from "@/lib/i18n";
import { formatCurrency, formatDateTime, debounce } from "@/lib/utils";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LoadingSpinner from "@/components/LoadingSpinner";
import Modal from "@/components/Modal";
import { useNotification } from "@/components/NotificationProvider";

export default function SalesPage() {
  const router = useRouter();
  const [lang, setLang] = useState("bn");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [todaySummary, setTodaySummary] = useState({ count: 0, total: 0 });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }

    setLang(getCurrentLanguage());
    const handleLanguageChange = () => setLang(getCurrentLanguage());
    window.addEventListener("languageChanged", handleLanguageChange);

    fetchSales();

    return () =>
      window.removeEventListener("languageChanged", handleLanguageChange);
  }, [router]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const response = await fetch("/api/sales", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (data.success) {
        setSales(data.sales);

        // Calculate today's summary
        const today = new Date().toDateString();
        const todaySales = data.sales.filter(
          (sale) => new Date(sale.createdAt).toDateString() === today
        );

        setTodaySummary({
          count: todaySales.length,
          total: todaySales.reduce((sum, sale) => sum + sale.totalAmount, 0),
        });
      }
    } catch (error) {
      console.error("Error fetching sales:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
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
                  className={`text-2xl font-bold text-gray-900 ${
                    lang === "bn" ? "bengali-text" : ""
                  }`}
                >
                  {t("sales", lang)}
                </h1>
                <p className="text-sm text-gray-600">
                  {lang === "bn" ? "বিক্রয় রেকর্ড করুন" : "Record sales"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <button
                onClick={() => setShowSaleModal(true)}
                className="btn btn-primary text-sm"
              >
                + {t("recordSale", lang)}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm text-gray-600 ${
                    lang === "bn" ? "bengali-text" : ""
                  }`}
                >
                  {lang === "bn" ? "আজকের বিক্রয়" : "Today's Sales"}
                </p>
                <p className="text-3xl font-bold text-primary-600 mt-2">
                  {todaySummary.count}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-2xl">
                💰
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm text-gray-600 ${
                    lang === "bn" ? "bengali-text" : ""
                  }`}
                >
                  {lang === "bn" ? "আজকের আয়" : "Today's Revenue"}
                </p>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  {formatCurrency(todaySummary.total, lang)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                💵
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm text-gray-600 ${
                    lang === "bn" ? "bengali-text" : ""
                  }`}
                >
                  {lang === "bn" ? "মোট বিক্রয়" : "Total Sales"}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {sales.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                📊
              </div>
            </div>
          </div>
        </div>

        {/* Sales History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2
              className={`text-lg font-semibold text-gray-900 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {lang === "bn" ? "সাম্প্রতিক বিক্রয়" : "Recent Sales"}
            </h2>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : sales.length === 0 ? (
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
                {lang === "bn" ? "কোন বিক্রয় নেই" : "No sales yet"}
              </h3>
              <button
                onClick={() => setShowSaleModal(true)}
                className="mt-4 btn btn-primary"
              >
                {lang === "bn"
                  ? "প্রথম বিক্রয় রেকর্ড করুন"
                  : "Record first sale"}
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
                      {t("price", lang)}
                    </th>
                    <th
                      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {t("total", lang)}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sales.map((sale) => (
                    <tr key={sale._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateTime(sale.createdAt, lang)}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap ${
                          lang === "bn" ? "bengali-text" : ""
                        }`}
                      >
                        <div className="text-sm font-medium text-gray-900">
                          {sale.product
                            ? lang === "bn"
                              ? sale.product.name_bn
                              : sale.product.name_en
                            : "-"}
                        </div>
                        {sale.note && (
                          <div className="text-xs text-gray-500">
                            {sale.note}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {sale.quantitySold}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(sale.sellingPrice, lang)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-primary-600">
                        {formatCurrency(sale.totalAmount, lang)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Sale Modal */}
      {showSaleModal && (
        <SaleFormModal
          lang={lang}
          onClose={() => setShowSaleModal(false)}
          onSuccess={() => {
            setShowSaleModal(false);
            fetchSales();
          }}
        />
      )}
    </div>
  );
}

// Sale Form Modal Component
function SaleFormModal({ lang, onClose, onSuccess }) {
  const notification = useNotification();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sellingPrice, setSellingPrice] = useState("");
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
        setAllProducts(data.products.filter((p) => p.stockQuantity > 0));
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
    setSellingPrice(product.sellingPrice);
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

    if (quantity > selectedProduct.stockQuantity) {
      notification.error(
        lang === "bn" ? "পর্যাপ্ত স্টক নেই" : "Insufficient stock"
      );
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: selectedProduct._id,
          quantitySold: quantity,
          sellingPrice: parseFloat(sellingPrice),
          note,
        }),
      });

      const data = await response.json();

      if (data.success) {
        notification.success(
          lang === "bn"
            ? "বিক্রয় সফলভাবে রেকর্ড হয়েছে"
            : "Sale recorded successfully"
        );
        onSuccess();
      } else {
        notification.error(
          data.error || (lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred")
        );
      }
    } catch (error) {
      console.error("Error recording sale:", error);
      notification.error(lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={t("recordSale", lang)}
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
                    {lang === "bn" ? "স্টক" : "Stock"}:{" "}
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
                          {product.stockQuantity} |{" "}
                          {formatCurrency(product.sellingPrice, lang)}
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
            max={selectedProduct?.stockQuantity || 999999}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value))}
            className="input"
          />
          {selectedProduct && (
            <p className="text-xs text-gray-500 mt-1">
              {lang === "bn" ? "সর্বোচ্চ" : "Max"}:{" "}
              {selectedProduct.stockQuantity}
            </p>
          )}
        </div>

        {/* Selling Price */}
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
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            className="input"
          />
        </div>

        {/* Total Amount */}
        {sellingPrice && quantity && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p
              className={`text-sm text-gray-600 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {t("total", lang)}
            </p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(parseFloat(sellingPrice) * quantity, lang)}
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
              lang === "bn" ? "অতিরিক্ত তথ্য..." : "Additional info..."
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
                ? "রেকর্ড হচ্ছে..."
                : "Recording..."
              : t("recordSale", lang)}
          </button>
        </div>
      </form>
    </Modal>
  );
}
