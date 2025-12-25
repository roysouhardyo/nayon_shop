"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { t, getCurrentLanguage } from "@/lib/i18n";
import { CATEGORIES } from "@/lib/categories";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ImageUpload from "@/components/ImageUpload";
import { useNotification } from "@/components/NotificationProvider";

export default function AddProductPage() {
  const router = useRouter();
  const notification = useNotification();
  const [language, setLanguage] = useState("bn");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState(CATEGORIES); // Initialize with default

  // Form state
  const [formData, setFormData] = useState({
    name_bn: "",
    name_en: "",
    category_bn: "",
    category_en: "",
    subCategory_bn: "",
    subCategory_en: "",
    brand: "",
    compatibleModel: "",
    partCode: "",
    purchasePrice: "",
    sellingPrice: "",
    stockQuantity: "",
    minimumStockLevel: "",
    supplierName: "",
    shelfLocation: "",
    images: [],
  });

  useEffect(() => {
    const lang = getCurrentLanguage();
    setLanguage(lang);

    // Listen for language changes
    const handleLanguageChange = () => {
      setLanguage(getCurrentLanguage());
    };

    window.addEventListener("languageChanged", handleLanguageChange);

    // Fetch categories from database
    fetchCategories();

    return () => {
      window.removeEventListener("languageChanged", handleLanguageChange);
    };
  }, []);

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

  const handleCategoryChange = (e) => {
    const selectedIndex = e.target.selectedIndex - 1; // -1 for the placeholder option
    if (selectedIndex >= 0) {
      const selectedCategory = categories[selectedIndex];
      setFormData({
        ...formData,
        category_bn: selectedCategory.bn,
        category_en: selectedCategory.en,
        subCategory_bn: "",
        subCategory_en: "",
      });
    } else {
      setFormData({
        ...formData,
        category_bn: "",
        category_en: "",
        subCategory_bn: "",
        subCategory_en: "",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields - at least one name is required
      if (!formData.name_bn && !formData.name_en) {
        notification.warning(
          language === "bn"
            ? "পণ্যের নাম (বাংলা অথবা ইংরেজি) আবশ্যক"
            : "Product name (Bangla or English) is required"
        );
        setLoading(false);
        return;
      }

      if (!formData.category_bn || !formData.category_en) {
        notification.warning(
          language === "bn"
            ? "ক্যাটাগরি নির্বাচন করুন"
            : "Please select a category"
        );
        setLoading(false);
        return;
      }

      // Prepare data - use provided name for both if only one is given
      const productData = {
        name_bn: formData.name_bn || formData.name_en,
        name_en: formData.name_en || formData.name_bn,
        category_bn: formData.category_bn,
        category_en: formData.category_en,
        subCategory_bn: formData.subCategory_bn || "",
        subCategory_en: formData.subCategory_en || "",
        brand: formData.brand || "",
        compatibleModel: formData.compatibleModel || "",
        partCode: `PART-${Date.now()}`, // Auto-generate always
        purchasePrice: parseFloat(formData.purchasePrice) || 0,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        minimumStockLevel: parseInt(formData.minimumStockLevel) || 5,
        supplierName: formData.supplierName || "",
        shelfLocation: formData.shelfLocation || "",
        images: [],
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(productData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add product");
      }

      notification.success(
        language === "bn"
          ? "পণ্য সফলভাবে যোগ হয়েছে"
          : "Product added successfully"
      );

      // Reset form
      setFormData({
        name_bn: "",
        name_en: "",
        category_bn: "",
        category_en: "",
        subCategory_bn: "",
        subCategory_en: "",
        brand: "",
        compatibleModel: "",
        partCode: "",
        purchasePrice: "",
        sellingPrice: "",
        stockQuantity: "",
        minimumStockLevel: "",
        supplierName: "",
        shelfLocation: "",
      });

      // Redirect after 1 second
      setTimeout(() => {
        router.push("/admin");
      }, 1000);
    } catch (err) {
      notification.error(
        err.message || (language === "bn" ? "ত্রুটি হয়েছে" : "Error occurred")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {language === "bn" ? "নতুন পণ্য যোগ করুন" : "Add New Product"}
              </h1>
              <p className="text-gray-600">
                {language === "bn"
                  ? "পণ্যের সম্পূর্ণ তথ্য দিয়ে ফর্মটি পূরণ করুন"
                  : "Fill in the complete product information"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {language === "bn" ? "← ফিরে যান" : "← Back"}
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-6 md:p-8"
        >
          {/* Product Names */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">📦</span>
              {language === "bn" ? "পণ্যের নাম" : "Product Name"}
              <span className="text-red-500 ml-1">*</span>
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              {language === "bn"
                ? "বাংলা নাম দিন। ইংরেজি নাম ঐচ্ছিক।"
                : "Enter Bangla name. English name is optional."}
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "bn" ? "বাংলায় নাম" : "Name in Bangla"}
                </label>
                <input
                  type="text"
                  name="name_bn"
                  value={formData.name_bn}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="যেমন: ওয়াটার পাম্প মোটর"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "bn"
                    ? "ইংরেজিতে নাম (ঐচ্ছিক)"
                    : "Name in English (Optional)"}
                </label>
                <input
                  type="text"
                  name="name_en"
                  value={formData.name_en}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="e.g: Water Pump Motor"
                />
              </div>
            </div>
          </div>

          {/* Category */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🏷️</span>
              {language === "bn" ? "ক্যাটাগরি" : "Category"}
              <span className="text-red-500 ml-1">*</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "bn"
                    ? "ক্যাটাগরি নির্বাচন করুন"
                    : "Select Category"}
                  <span className="text-red-500">*</span>
                </label>
                <select
                  onChange={handleCategoryChange}
                  value={formData.category_bn}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">
                    {language === "bn" ? "-- নির্বাচন করুন --" : "-- Select --"}
                  </option>
                  {categories.map((cat, index) => (
                    <option key={index} value={cat.bn}>
                      {language === "bn" ? cat.bn : cat.en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "bn"
                    ? "সাব-ক্যাটাগরি (ঐচ্ছিক)"
                    : "Sub-Category (Optional)"}
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">
                    {language === "bn" ? "-- নির্বাচন করুন --" : "-- Select --"}
                  </option>
                  {categories
                    .find((c) => c.bn === formData.category_bn)
                    ?.subCategories?.map((sub) => (
                      <option key={sub.en} value={sub.bn}>
                        {language === "bn" ? sub.bn : sub.en}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">📋</span>
              {language === "bn" ? "পণ্যের বিবরণ" : "Product Details"}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "bn" ? "ব্র্যান্ড" : "Brand"}
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={language === "bn" ? "যেমন: Honda" : "e.g: Honda"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "bn" ? "উপযুক্ত মডেল" : "Compatible Model"}
                </label>
                <input
                  type="text"
                  name="compatibleModel"
                  value={formData.compatibleModel}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={language === "bn" ? "যেমন: CD 70" : "e.g: CD 70"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "bn" ? "শেল্ফ অবস্থান" : "Shelf Location"}
                </label>
                <input
                  type="text"
                  name="shelfLocation"
                  value={formData.shelfLocation}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={language === "bn" ? "যেমন: A-12" : "e.g: A-12"}
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">💰</span>
              {language === "bn" ? "মূল্য নির্ধারণ" : "Pricing"}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "bn"
                    ? "ক্রয় মূল্য (টাকা)"
                    : "Purchase Price (৳)"}
                </label>
                <input
                  type="number"
                  name="purchasePrice"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "bn"
                    ? "বিক্রয় মূল্য (টাকা)"
                    : "Selling Price (৳)"}
                </label>
                <input
                  type="number"
                  name="sellingPrice"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>
            {formData.purchasePrice && formData.sellingPrice && (
              <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-semibold">
                    {language === "bn" ? "লাভ:" : "Profit:"}
                  </span>{" "}
                  ৳
                  {(
                    parseFloat(formData.sellingPrice) -
                    parseFloat(formData.purchasePrice)
                  ).toFixed(2)}{" "}
                  (
                  {formData.purchasePrice > 0
                    ? (
                        ((parseFloat(formData.sellingPrice) -
                          parseFloat(formData.purchasePrice)) /
                          parseFloat(formData.purchasePrice)) *
                        100
                      ).toFixed(1)
                    : 0}
                  %)
                </p>
              </div>
            )}
          </div>

          {/* Stock */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">📊</span>
              {language === "bn" ? "স্টক তথ্য" : "Stock Information"}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "bn" ? "স্টক পরিমাণ" : "Stock Quantity"}
                </label>
                <input
                  type="number"
                  name="stockQuantity"
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === "bn"
                    ? "ন্যূনতম স্টক লেভেল"
                    : "Minimum Stock Level"}
                </label>
                <input
                  type="number"
                  name="minimumStockLevel"
                  value={formData.minimumStockLevel}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {language === "bn"
                    ? "এই পরিমাণের নিচে গেলে সতর্কতা দেখাবে"
                    : "Alert will show when stock goes below this level"}
                </p>
              </div>
            </div>
          </div>

          {/* Supplier */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🏢</span>
              {language === "bn" ? "সরবরাহকারী তথ্য" : "Supplier Information"}
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "bn" ? "সরবরাহকারীর নাম" : "Supplier Name"}
              </label>
              <input
                type="text"
                name="supplierName"
                value={formData.supplierName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder={
                  language === "bn" ? "যেমন: ABC ট্রেডার্স" : "e.g: ABC Traders"
                }
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">📸</span>
              {language === "bn" ? "পণ্যের ছবি" : "Product Images"}
            </h2>
            <ImageUpload
              images={formData.images}
              onChange={(images) => setFormData({ ...formData, images })}
              lang={language}
              maxImages={5}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {language === "bn" ? "যোগ করা হচ্ছে..." : "Adding..."}
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <span className="text-xl mr-2">✓</span>
                  {language === "bn" ? "পণ্য যোগ করুন" : "Add Product"}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all disabled:opacity-50"
            >
              {language === "bn" ? "বাতিল" : "Cancel"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
