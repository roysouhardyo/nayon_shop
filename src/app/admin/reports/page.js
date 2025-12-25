"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentLanguage, t } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useNotification } from "@/components/NotificationProvider";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportsPage() {
  const router = useRouter();
  const notification = useNotification();
  const [lang, setLang] = useState("bn");
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("dashboard"); // 'dashboard' or 'pdf'
  const [selectedReport, setSelectedReport] = useState("currentStock");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/login");
      return;
    }

    setLang(getCurrentLanguage());
    const handleLanguageChange = () => setLang(getCurrentLanguage());
    window.addEventListener("languageChanged", handleLanguageChange);

    // Set default date range (last 30 days)
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);

    setEndDate(end.toISOString().split("T")[0]);
    setStartDate(start.toISOString().split("T")[0]);

    // Fetch dashboard data
    fetchDashboardData();

    return () =>
      window.removeEventListener("languageChanged", handleLanguageChange);
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      // Fetch products, sales, and stock movements
      const [productsRes, salesRes] = await Promise.all([
        fetch("/api/products", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/sales", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const productsData = await productsRes.json();
      const salesData = await salesRes.json();

      if (productsData.success && salesData.success) {
        setDashboardData({
          products: productsData.products,
          sales: salesData.sales,
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      notification.error(
        lang === "bn" ? "ডেটা লোড করতে ব্যর্থ" : "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePDF = async () => {
    const selectedReportType = reportTypes.find((r) => r.id === selectedReport);

    if (selectedReportType?.needsDateRange && (!startDate || !endDate)) {
      notification.warning(
        lang === "bn" ? "তারিখ নির্বাচন করুন" : "Please select date range"
      );
      return;
    }

    setPdfLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportType: selectedReport,
          startDate,
          endDate,
          lang,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Open HTML in new window for printing/PDF
        const printWindow = window.open("", "_blank");
        printWindow.document.write(data.html);
        printWindow.document.close();

        // Trigger print dialog
        setTimeout(() => {
          printWindow.print();
        }, 500);

        notification.success(
          lang === "bn"
            ? "রিপোর্ট তৈরি হয়েছে"
            : "Report generated successfully"
        );
      } else {
        notification.error(
          data.error || (lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred")
        );
      }
    } catch (error) {
      console.error("Error generating report:", error);
      notification.error(lang === "bn" ? "ত্রুটি হয়েছে" : "Error occurred");
    } finally {
      setPdfLoading(false);
    }
  };

  const reportTypes = [
    {
      id: "currentStock",
      name_bn: "বর্তমান স্টক রিপোর্ট",
      name_en: "Current Stock Report",
      description_bn: "সকল পণ্যের বর্তমান স্টক অবস্থা",
      description_en: "Current stock status of all products",
      icon: "📦",
      needsDateRange: false,
    },
    {
      id: "sales",
      name_bn: "বিক্রয় রিপোর্ট",
      name_en: "Sales Report",
      description_bn: "নির্দিষ্ট সময়ের বিক্রয় তথ্য",
      description_en: "Sales data for specific period",
      icon: "💰",
      needsDateRange: true,
    },
    {
      id: "stockMovement",
      name_bn: "স্টক মুভমেন্ট রিপোর্ট",
      name_en: "Stock Movement Report",
      description_bn: "স্টক ইন/আউট এর সম্পূর্ণ ইতিহাস",
      description_en: "Complete history of stock IN/OUT",
      icon: "📊",
      needsDateRange: true,
    },
    {
      id: "lowStock",
      name_bn: "কম স্টক রিপোর্ট",
      name_en: "Low Stock Report",
      description_bn: "কম স্টক এবং স্টক শেষ পণ্য",
      description_en: "Low stock and out of stock products",
      icon: "⚠️",
      needsDateRange: false,
    },
  ];

  // Prepare chart data
  const getStockByCategory = () => {
    if (!dashboardData?.products) return null;

    const categoryStock = {};
    dashboardData.products.forEach((product) => {
      const category = product.category_bn || product.category_en || "অন্যান্য";
      if (!categoryStock[category]) {
        categoryStock[category] = 0;
      }
      categoryStock[category] += product.stockQuantity;
    });

    return {
      labels: Object.keys(categoryStock),
      datasets: [
        {
          label: lang === "bn" ? "স্টক পরিমাণ" : "Stock Quantity",
          data: Object.values(categoryStock),
          backgroundColor: [
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 99, 132, 0.8)",
            "rgba(255, 206, 86, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(153, 102, 255, 0.8)",
            "rgba(255, 159, 64, 0.8)",
          ],
          borderColor: [
            "rgba(54, 162, 235, 1)",
            "rgba(255, 99, 132, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const getSalesOverTime = () => {
    if (!dashboardData?.sales) return null;

    // Group sales by date (last 7 days)
    const salesByDate = {};
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      last7Days.push(dateStr);
      salesByDate[dateStr] = 0;
    }

    dashboardData.sales.forEach((sale) => {
      const saleDate = new Date(sale.createdAt).toISOString().split("T")[0];
      if (salesByDate.hasOwnProperty(saleDate)) {
        salesByDate[saleDate] += sale.totalAmount;
      }
    });

    return {
      labels: last7Days.map((date) => {
        const d = new Date(date);
        return d.toLocaleDateString(lang === "bn" ? "bn-BD" : "en-US", {
          month: "short",
          day: "numeric",
        });
      }),
      datasets: [
        {
          label: lang === "bn" ? "বিক্রয় (৳)" : "Sales (৳)",
          data: last7Days.map((date) => salesByDate[date]),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const getStockStatus = () => {
    if (!dashboardData?.products) return null;

    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;

    dashboardData.products.forEach((product) => {
      if (product.stockQuantity === 0) {
        outOfStock++;
      } else if (product.stockQuantity <= product.minimumStockLevel) {
        lowStock++;
      } else {
        inStock++;
      }
    });

    return {
      labels: [
        lang === "bn" ? "স্টক আছে" : "In Stock",
        lang === "bn" ? "কম স্টক" : "Low Stock",
        lang === "bn" ? "স্টক শেষ" : "Out of Stock",
      ],
      datasets: [
        {
          data: [inStock, lowStock, outOfStock],
          backgroundColor: [
            "rgba(34, 197, 94, 0.8)",
            "rgba(251, 191, 36, 0.8)",
            "rgba(239, 68, 68, 0.8)",
          ],
          borderColor: [
            "rgba(34, 197, 94, 1)",
            "rgba(251, 191, 36, 1)",
            "rgba(239, 68, 68, 1)",
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            family: lang === "bn" ? "'Hind Siliguri', sans-serif" : "Arial",
            size: 12,
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: lang === "bn" ? "'Hind Siliguri', sans-serif" : "Arial",
          },
        },
      },
      x: {
        ticks: {
          font: {
            family: lang === "bn" ? "'Hind Siliguri', sans-serif" : "Arial",
          },
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            family: lang === "bn" ? "'Hind Siliguri', sans-serif" : "Arial",
            size: 12,
          },
        },
      },
    },
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
                  {t("reports", lang)}
                </h1>
                <p className="text-sm text-gray-600">
                  {lang === "bn"
                    ? "ড্যাশবোর্ড এবং পিডিএফ রিপোর্ট"
                    : "Dashboard & PDF Reports"}
                </p>
              </div>
            </div>
            <LanguageSwitcher />
          </div>

          {/* Tabs */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setSelectedTab("dashboard")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTab === "dashboard"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } ${lang === "bn" ? "bengali-text" : ""}`}
            >
              📊 {lang === "bn" ? "ড্যাশবোর্ড" : "Dashboard"}
            </button>
            <button
              onClick={() => setSelectedTab("pdf")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTab === "pdf"
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } ${lang === "bn" ? "bengali-text" : ""}`}
            >
              📄 {lang === "bn" ? "পিডিএফ রিপোর্ট" : "PDF Reports"}
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <LoadingSpinner
            text={lang === "bn" ? "লোড হচ্ছে..." : "Loading..."}
          />
        ) : selectedTab === "dashboard" ? (
          <DashboardView
            lang={lang}
            dashboardData={dashboardData}
            getStockByCategory={getStockByCategory}
            getSalesOverTime={getSalesOverTime}
            getStockStatus={getStockStatus}
            chartOptions={chartOptions}
            doughnutOptions={doughnutOptions}
          />
        ) : (
          <PDFReportView
            lang={lang}
            reportTypes={reportTypes}
            selectedReport={selectedReport}
            setSelectedReport={setSelectedReport}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            pdfLoading={pdfLoading}
            handleGeneratePDF={handleGeneratePDF}
          />
        )}
      </main>
    </div>
  );
}

// Dashboard View Component
function DashboardView({
  lang,
  dashboardData,
  getStockByCategory,
  getSalesOverTime,
  getStockStatus,
  chartOptions,
  doughnutOptions,
}) {
  const stockByCategoryData = getStockByCategory();
  const salesOverTimeData = getSalesOverTime();
  const stockStatusData = getStockStatus();

  // Calculate summary stats
  const totalProducts = dashboardData?.products?.length || 0;
  const totalStock =
    dashboardData?.products?.reduce((sum, p) => sum + p.stockQuantity, 0) || 0;
  const totalSales = dashboardData?.sales?.length || 0;
  const totalRevenue =
    dashboardData?.sales?.reduce((sum, s) => sum + s.totalAmount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">
                {lang === "bn" ? "মোট পণ্য" : "Total Products"}
              </p>
              <p className="text-3xl font-bold mt-1">{totalProducts}</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">
                {lang === "bn" ? "মোট স্টক" : "Total Stock"}
              </p>
              <p className="text-3xl font-bold mt-1">{totalStock}</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">
                {lang === "bn" ? "মোট বিক্রয়" : "Total Sales"}
              </p>
              <p className="text-3xl font-bold mt-1">{totalSales}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">
                {lang === "bn" ? "মোট আয়" : "Total Revenue"}
              </p>
              <p className="text-2xl font-bold mt-1">
                ৳ {totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="text-4xl">💵</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock by Category */}
        {stockByCategoryData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3
              className={`text-lg font-semibold text-gray-900 mb-4 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {lang === "bn" ? "ক্যাটাগরি অনুযায়ী স্টক" : "Stock by Category"}
            </h3>
            <div style={{ height: "300px" }}>
              <Bar data={stockByCategoryData} options={chartOptions} />
            </div>
          </div>
        )}

        {/* Stock Status */}
        {stockStatusData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3
              className={`text-lg font-semibold text-gray-900 mb-4 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {lang === "bn" ? "স্টক অবস্থা" : "Stock Status"}
            </h3>
            <div style={{ height: "300px" }}>
              <Doughnut data={stockStatusData} options={doughnutOptions} />
            </div>
          </div>
        )}

        {/* Sales Over Time */}
        {salesOverTimeData && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
            <h3
              className={`text-lg font-semibold text-gray-900 mb-4 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {lang === "bn" ? "গত ৭ দিনের বিক্রয়" : "Sales - Last 7 Days"}
            </h3>
            <div style={{ height: "300px" }}>
              <Line data={salesOverTimeData} options={chartOptions} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// PDF Report View Component (existing functionality)
function PDFReportView({
  lang,
  reportTypes,
  selectedReport,
  setSelectedReport,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  pdfLoading,
  handleGeneratePDF,
}) {
  const selectedReportType = reportTypes.find((r) => r.id === selectedReport);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Report Selection */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2
            className={`text-lg font-semibold text-gray-900 mb-4 ${
              lang === "bn" ? "bengali-text" : ""
            }`}
          >
            {lang === "bn" ? "রিপোর্ট নির্বাচন করুন" : "Select Report Type"}
          </h2>

          <div className="space-y-3">
            {reportTypes.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report.id)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  selectedReport === report.id
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{report.icon}</span>
                  <div className="flex-1">
                    <p
                      className={`font-semibold text-gray-900 ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn" ? report.name_bn : report.name_en}
                    </p>
                    <p
                      className={`text-sm text-gray-600 mt-1 ${
                        lang === "bn" ? "bengali-text" : ""
                      }`}
                    >
                      {lang === "bn"
                        ? report.description_bn
                        : report.description_en}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Configuration */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2
            className={`text-lg font-semibold text-gray-900 mb-4 ${
              lang === "bn" ? "bengali-text" : ""
            }`}
          >
            {lang === "bn" ? "রিপোর্ট কনফিগারেশন" : "Report Configuration"}
          </h2>

          {/* Selected Report Info */}
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{selectedReportType?.icon}</span>
              <div>
                <h3
                  className={`font-semibold text-gray-900 ${
                    lang === "bn" ? "bengali-text" : ""
                  }`}
                >
                  {lang === "bn"
                    ? selectedReportType?.name_bn
                    : selectedReportType?.name_en}
                </h3>
                <p
                  className={`text-sm text-gray-600 mt-1 ${
                    lang === "bn" ? "bengali-text" : ""
                  }`}
                >
                  {lang === "bn"
                    ? selectedReportType?.description_bn
                    : selectedReportType?.description_en}
                </p>
              </div>
            </div>
          </div>

          {/* Date Range (if needed) */}
          {selectedReportType?.needsDateRange && (
            <div className="mb-6">
              <h3
                className={`font-medium text-gray-900 mb-3 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {lang === "bn" ? "সময়কাল নির্বাচন করুন" : "Select Date Range"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    className={`block text-sm font-medium text-gray-700 mb-1 ${
                      lang === "bn" ? "bengali-text" : ""
                    }`}
                  >
                    {lang === "bn" ? "শুরুর তারিখ" : "Start Date"}
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input"
                  />
                </div>

                <div>
                  <label
                    className={`block text-sm font-medium text-gray-700 mb-1 ${
                      lang === "bn" ? "bengali-text" : ""
                    }`}
                  >
                    {lang === "bn" ? "শেষ তারিখ" : "End Date"}
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              {/* Quick Date Ranges */}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() - 7);
                    setStartDate(start.toISOString().split("T")[0]);
                    setEndDate(end.toISOString().split("T")[0]);
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  {lang === "bn" ? "গত ৭ দিন" : "Last 7 days"}
                </button>
                <button
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setDate(start.getDate() - 30);
                    setStartDate(start.toISOString().split("T")[0]);
                    setEndDate(end.toISOString().split("T")[0]);
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  {lang === "bn" ? "গত ৩০ দিন" : "Last 30 days"}
                </button>
                <button
                  onClick={() => {
                    const end = new Date();
                    const start = new Date();
                    start.setMonth(start.getMonth() - 1);
                    setStartDate(start.toISOString().split("T")[0]);
                    setEndDate(end.toISOString().split("T")[0]);
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  {lang === "bn" ? "গত ১ মাস" : "Last 1 month"}
                </button>
                <button
                  onClick={() => {
                    const end = new Date();
                    const start = new Date(
                      end.getFullYear(),
                      end.getMonth(),
                      1
                    );
                    setStartDate(start.toISOString().split("T")[0]);
                    setEndDate(end.toISOString().split("T")[0]);
                  }}
                  className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg"
                >
                  {lang === "bn" ? "এই মাস" : "This month"}
                </button>
              </div>
            </div>
          )}

          {/* Generate Button */}
          <div className="border-t border-gray-200 pt-6">
            <button
              onClick={handleGeneratePDF}
              disabled={pdfLoading}
              className="w-full btn btn-primary py-3 text-lg"
            >
              {pdfLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="spinner w-5 h-5 border-2"></div>
                  {lang === "bn" ? "তৈরি হচ্ছে..." : "Generating..."}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
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
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  {t("generatePDF", lang)}
                </span>
              )}
            </button>

            <p
              className={`text-sm text-gray-500 text-center mt-3 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {lang === "bn"
                ? "রিপোর্ট নতুন উইন্ডোতে খুলবে। প্রিন্ট বা পিডিএফ সেভ করতে পারবেন।"
                : "Report will open in new window. You can print or save as PDF."}
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3
            className={`font-semibold text-blue-900 mb-2 ${
              lang === "bn" ? "bengali-text" : ""
            }`}
          >
            {lang === "bn" ? "📝 নির্দেশনা" : "📝 Instructions"}
          </h3>
          <ul
            className={`text-sm text-blue-800 space-y-1 ${
              lang === "bn" ? "bengali-text" : ""
            }`}
          >
            <li>
              •{" "}
              {lang === "bn"
                ? "রিপোর্ট নতুন ট্যাবে খুলবে"
                : "Report will open in a new tab"}
            </li>
            <li>
              •{" "}
              {lang === "bn"
                ? "প্রিন্ট ডায়ালগ স্বয়ংক্রিয়ভাবে আসবে"
                : "Print dialog will appear automatically"}
            </li>
            <li>
              •{" "}
              {lang === "bn"
                ? 'পিডিএফ সেভ করতে "Save as PDF" নির্বাচন করুন'
                : 'Select "Save as PDF" to save the report'}
            </li>
            <li>
              •{" "}
              {lang === "bn"
                ? "সরাসরি প্রিন্ট করতে প্রিন্টার নির্বাচন করুন"
                : "Select printer to print directly"}
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
