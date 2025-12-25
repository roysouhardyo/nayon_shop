// Bilingual dictionary - Bangla is default
export const translations = {
  bn: {
    // Navigation
    home: "হোম",
    inventory: "ইনভেন্টরি",
    sales: "বিক্রয়",
    purchase: "ক্রয়",
    reports: "রিপোর্ট",
    settings: "সেটিংস",
    logout: "লগআউট",
    login: "লগইন",

    // Common
    search: "অনুসন্ধান করুন",
    filter: "ফিল্টার",
    add: "যোগ করুন",
    edit: "সম্পাদনা",
    delete: "মুছুন",
    save: "সংরক্ষণ",
    cancel: "বাতিল",
    confirm: "নিশ্চিত করুন",
    close: "বন্ধ করুন",
    submit: "জমা দিন",
    reset: "রিসেট",

    // Product Fields
    productName: "পণ্যের নাম",
    category: "ক্যাটাগরি",
    subCategory: "সাব-ক্যাটাগরি",
    brand: "ব্র্যান্ড",
    compatibleModel: "উপযুক্ত মডেল",
    partCode: "পার্ট কোড",
    purchasePrice: "ক্রয় মূল্য",
    sellingPrice: "বিক্রয় মূল্য",
    stockQuantity: "স্টক পরিমাণ",
    minimumStock: "ন্যূনতম স্টক",
    supplier: "সরবরাহকারী",
    shelfLocation: "শেল্ফ অবস্থান",
    image: "ছবি",

    // Categories
    waterPumpParts: "ওয়াটার পাম্প পার্টস",
    motorcycleParts: "মোটরসাইকেল পার্টস",
    cycleParts: "সাইকেল পার্টস",
    engineParts: "ইঞ্জিন পার্টস",
    engineVanParts: "ইঞ্জিন ভ্যান পার্টস",

    // Stock Status
    available: "স্টকে আছে",
    lowStock: "কম স্টক",
    outOfStock: "স্টক শেষ",

    // Actions
    stockIn: "স্টক ইন",
    stockOut: "স্টক আউট",
    recordSale: "বিক্রয় রেকর্ড",
    addPurchase: "ক্রয় যোগ করুন",
    generatePDF: "পিডিএফ তৈরি করুন",

    // Reports
    currentStockReport: "বর্তমান স্টক রিপোর্ট",
    salesReport: "বিক্রয় রিপোর্ট",
    purchaseReport: "ক্রয় রিপোর্ট",
    stockMovementReport: "স্টক মুভমেন্ট রিপোর্ট",
    lowStockReport: "কম স্টক রিপোর্ট",

    // Messages
    loginSuccess: "সফলভাবে লগইন হয়েছে",
    loginFailed: "লগইন ব্যর্থ হয়েছে",
    saleRecorded: "বিক্রয় সফলভাবে রেকর্ড হয়েছে",
    stockUpdated: "স্টক আপডেট হয়েছে",
    productAdded: "পণ্য যোগ হয়েছে",
    productUpdated: "পণ্য আপডেট হয়েছে",
    insufficientStock: "পর্যাপ্ত স্টক নেই",

    // Validation
    required: "এই ফিল্ডটি আবশ্যক",
    invalidEmail: "ইমেইল সঠিক নয়",
    invalidPrice: "মূল্য সঠিক নয়",
    invalidQuantity: "পরিমাণ সঠিক নয়",

    // Misc
    total: "মোট",
    quantity: "পরিমাণ",
    price: "মূল্য",
    date: "তারিখ",
    time: "সময়",
    note: "নোট",
    admin: "অ্যাডমিন",
    publicView: "পাবলিক ভিউ",
  },

  en: {
    // Navigation
    home: "Home",
    inventory: "Inventory",
    sales: "Sales",
    purchase: "Purchase",
    reports: "Reports",
    settings: "Settings",
    logout: "Logout",
    login: "Login",

    // Common
    search: "Search",
    filter: "Filter",
    add: "Add",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    close: "Close",
    submit: "Submit",
    reset: "Reset",

    // Product Fields
    productName: "Product Name",
    category: "Category",
    subCategory: "Sub-Category",
    brand: "Brand",
    compatibleModel: "Compatible Model",
    partCode: "Part Code",
    purchasePrice: "Purchase Price",
    sellingPrice: "Selling Price",
    stockQuantity: "Stock Quantity",
    minimumStock: "Minimum Stock",
    supplier: "Supplier",
    shelfLocation: "Shelf Location",
    image: "Image",

    // Categories
    waterPumpParts: "Water Pump Parts",
    motorcycleParts: "Motorcycle Parts",
    cycleParts: "Cycle Parts",
    engineParts: "Engine Parts",
    engineVanParts: "Engine Van Parts",

    // Stock Status
    available: "Available",
    lowStock: "Low Stock",
    outOfStock: "Out of Stock",

    // Actions
    stockIn: "Stock IN",
    stockOut: "Stock OUT",
    recordSale: "Record Sale",
    addPurchase: "Add Purchase",
    generatePDF: "Generate PDF",

    // Reports
    currentStockReport: "Current Stock Report",
    salesReport: "Sales Report",
    purchaseReport: "Purchase Report",
    stockMovementReport: "Stock Movement Report",
    lowStockReport: "Low Stock Report",

    // Messages
    loginSuccess: "Login successful",
    loginFailed: "Login failed",
    saleRecorded: "Sale recorded successfully",
    stockUpdated: "Stock updated",
    productAdded: "Product added",
    productUpdated: "Product updated",
    insufficientStock: "Insufficient stock",

    // Validation
    required: "This field is required",
    invalidEmail: "Invalid email",
    invalidPrice: "Invalid price",
    invalidQuantity: "Invalid quantity",

    // Misc
    total: "Total",
    quantity: "Quantity",
    price: "Price",
    date: "Date",
    time: "Time",
    note: "Note",
    admin: "Admin",
    publicView: "Public View",
  },
};

// Get translation
export function t(key, lang = "bn") {
  return translations[lang]?.[key] || key;
}

// Get current language from localStorage (client-side only)
export function getCurrentLanguage() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("language") || "bn";
  }
  return "bn";
}

// Set language
export function setLanguage(lang) {
  if (typeof window !== "undefined") {
    localStorage.setItem("language", lang);
  }
}
