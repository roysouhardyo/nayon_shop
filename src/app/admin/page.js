"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentLanguage, t } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminDashboard() {
  const router = useRouter();
  const [lang, setLang] = useState("bn");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    outOfStock: 0,
    todaySales: 0,
  });
  const [adminInfo, setAdminInfo] = useState(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem("authToken");
    const admin = localStorage.getItem("adminInfo");

    if (!token) {
      router.push("/login");
      return;
    }

    if (admin) {
      setAdminInfo(JSON.parse(admin));
    }

    setLang(getCurrentLanguage());

    const handleLanguageChange = () => {
      setLang(getCurrentLanguage());
    };

    window.addEventListener("languageChanged", handleLanguageChange);

    fetchStats();

    return () =>
      window.removeEventListener("languageChanged", handleLanguageChange);
  }, [router]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("authToken");

      // Fetch total products
      const productsRes = await fetch("/api/products", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const productsData = await productsRes.json();

      // Fetch low stock
      const lowStockRes = await fetch("/api/products?status=lowStock", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const lowStockData = await lowStockRes.json();

      // Fetch out of stock
      const outOfStockRes = await fetch("/api/products?status=outOfStock", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const outOfStockData = await outOfStockRes.json();

      // Fetch today's sales
      const todaySalesRes = await fetch("/api/sales/today", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const todaySalesData = await todaySalesRes.json();

      setStats({
        totalProducts: productsData.pagination?.total || 0,
        lowStock: lowStockData.products?.length || 0,
        outOfStock: outOfStockData.products?.length || 0,
        todaySales: todaySalesData.todaySales?.count || 0,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("adminInfo");
    router.push("/login");
  };

  const quickActions = [
    {
      title_bn: "বিক্রয় রেকর্ড",
      title_en: "Record Sale",
      icon: "💰",
      href: "/admin/sales",
      color: "bg-green-500",
    },
    {
      title_bn: "স্টক যোগ করুন",
      title_en: "Add Stock",
      icon: "📥",
      href: "/admin/purchase",
      color: "bg-purple-500",
    },
    {
      title_bn: "রিপোর্ট তৈরি",
      title_en: "Generate Report",
      icon: "📊",
      href: "/admin/reports",
      color: "bg-orange-500",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1
                className={`text-2xl font-bold text-primary-600 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {lang === "bn" ? "নায়ন শপ" : "Nayon Shop"}
              </h1>
              <p
                className={`text-sm text-gray-600 mt-1 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {lang === "bn" ? "অ্যাডমিন ড্যাশবোর্ড" : "Admin Dashboard"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <button
                onClick={handleLogout}
                className="btn btn-secondary text-sm"
              >
                {t("logout", lang)}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Welcome */}
        <div className={`mb-6 ${lang === "bn" ? "bengali-text" : ""}`}>
          <h2 className="text-xl font-semibold text-gray-800">
            {lang === "bn" ? "স্বাগতম" : "Welcome"}, {adminInfo?.name}!
          </h2>
          <p className="text-gray-600 mt-1">
            {lang === "bn"
              ? "আপনার ব্যবসা পরিচালনা করুন এবং ইনভেন্টরি ট্র্যাক করুন"
              : "Manage your business and track inventory"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`text-sm text-gray-600 ${
                    lang === "bn" ? "bengali-text" : ""
                  }`}
                >
                  {lang === "bn" ? "মোট পণ্য" : "Total Products"}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats.totalProducts}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                📦
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
                  {lang === "bn" ? "কম স্টক" : "Low Stock"}
                </p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">
                  {stats.lowStock}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">
                ⚠️
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
                  {lang === "bn" ? "স্টক শেষ" : "Out of Stock"}
                </p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {stats.outOfStock}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                ❌
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
                  {lang === "bn" ? "আজকের বিক্রয়" : "Today's Sales"}
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.todaySales}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                💰
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3
            className={`text-lg font-semibold text-gray-800 mb-4 ${
              lang === "bn" ? "bengali-text" : ""
            }`}
          >
            {lang === "bn" ? "দ্রুত অ্যাকশন" : "Quick Actions"}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => router.push(action.href)}
                className={`${action.color} text-white rounded-lg p-6 hover:opacity-90 transition-opacity card-hover`}
              >
                <div className="text-4xl mb-3">{action.icon}</div>
                <p
                  className={`font-semibold ${
                    lang === "bn" ? "bengali-text" : ""
                  }`}
                >
                  {lang === "bn" ? action.title_bn : action.title_en}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3
            className={`text-lg font-semibold text-gray-800 mb-4 ${
              lang === "bn" ? "bengali-text" : ""
            }`}
          >
            {lang === "bn" ? "মেনু" : "Menu"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <button
              onClick={() => router.push("/admin/inventory")}
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-2xl">📋</span>
              <span
                className={`font-medium text-gray-700 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {t("inventory", lang)}
              </span>
            </button>

            <button
              onClick={() => router.push("/admin/sales")}
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-2xl">💵</span>
              <span
                className={`font-medium text-gray-700 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {t("sales", lang)}
              </span>
            </button>

            <button
              onClick={() => router.push("/admin/purchase")}
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-2xl">🛒</span>
              <span
                className={`font-medium text-gray-700 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {t("purchase", lang)}
              </span>
            </button>

            <button
              onClick={() => router.push("/admin/reports")}
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-2xl">📈</span>
              <span
                className={`font-medium text-gray-700 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {t("reports", lang)}
              </span>
            </button>

            <button
              onClick={() => window.open("/public", "_blank")}
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-2xl">👁️</span>
              <span
                className={`font-medium text-gray-700 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {t("publicView", lang)}
              </span>
            </button>

            <button
              onClick={() => router.push("/admin/settings")}
              className="flex items-center gap-3 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <span className="text-2xl">⚙️</span>
              <span
                className={`font-medium text-gray-700 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {t("settings", lang)}
              </span>
            </button>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav lg:hidden">
        <div className="flex justify-around items-center py-2">
          <button
            onClick={() => router.push("/admin")}
            className="flex flex-col items-center gap-1 p-2 text-primary-600"
          >
            <span className="text-xl">🏠</span>
            <span className={`text-xs ${lang === "bn" ? "bengali-text" : ""}`}>
              {t("home", lang)}
            </span>
          </button>

          <button
            onClick={() => router.push("/admin/inventory")}
            className="flex flex-col items-center gap-1 p-2 text-gray-600"
          >
            <span className="text-xl">📦</span>
            <span className={`text-xs ${lang === "bn" ? "bengali-text" : ""}`}>
              {t("inventory", lang)}
            </span>
          </button>

          <button
            onClick={() => router.push("/admin/sales")}
            className="flex flex-col items-center gap-1 p-2 text-gray-600"
          >
            <span className="text-xl">💰</span>
            <span className={`text-xs ${lang === "bn" ? "bengali-text" : ""}`}>
              {t("sales", lang)}
            </span>
          </button>

          <button
            onClick={() => router.push("/admin/reports")}
            className="flex flex-col items-center gap-1 p-2 text-gray-600"
          >
            <span className="text-xl">📊</span>
            <span className={`text-xs ${lang === "bn" ? "bengali-text" : ""}`}>
              {t("reports", lang)}
            </span>
          </button>
          <button
            onClick={() => window.open("/public", "_blank")}
            className="flex flex-col items-center gap-1 p-2 text-gray-600"
          >
            <span className="text-xl">👁️</span>
            <span className={`text-xs ${lang === "bn" ? "bengali-text" : ""}`}>
              {lang === "bn" ? "পাবলিক" : "Public"}
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
