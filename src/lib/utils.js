// Generate unique part code
export function generatePartCode(category, brand) {
  const timestamp = Date.now().toString(36).toUpperCase();
  const categoryPrefix = category?.substring(0, 3).toUpperCase() || "GEN";
  const brandPrefix = brand?.substring(0, 2).toUpperCase() || "XX";
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();

  return `${categoryPrefix}-${brandPrefix}-${timestamp}-${random}`;
}

// Format currency in BDT
export function formatCurrency(amount, lang = "bn") {
  if (!amount && amount !== 0) return "-";

  const formatted = new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return lang === "bn" ? formatted.replace("BDT", "৳") : formatted;
}

// Format date
export function formatDate(date, lang = "bn") {
  if (!date) return "-";

  const d = new Date(date);

  if (lang === "bn") {
    return d.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Format date and time
export function formatDateTime(date, lang = "bn") {
  if (!date) return "-";

  const d = new Date(date);

  if (lang === "bn") {
    return d.toLocaleString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Convert English numbers to Bangla
export function toBengaliNumber(num) {
  if (num === null || num === undefined) return "";

  const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(num).replace(/\d/g, (digit) => bengaliDigits[digit]);
}

// Get stock status
export function getStockStatus(quantity, minimumStock = 0) {
  if (quantity <= 0) return "outOfStock";
  if (quantity <= minimumStock) return "lowStock";
  return "available";
}

// Get stock status color
export function getStockStatusColor(status) {
  const colors = {
    available: "bg-green-100 text-green-800",
    lowStock: "bg-yellow-100 text-yellow-800",
    outOfStock: "bg-red-100 text-red-800",
  };
  return colors[status] || colors.available;
}

// Validate email
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
