// Product categories with sub-categories for Nayon Shop
// Bilingual support: Bangla (bn) and English (en)

// Default categories (fallback if database is empty)
const DEFAULT_CATEGORIES = [
  {
    id: "water-pump",
    bn: "ওয়াটার পাম্প পার্টস",
    en: "Water Pump Parts",
    subCategories: [
      { bn: "মোটর", en: "Motor" },
      { bn: "ইম্পেলার", en: "Impeller" },
      { bn: "সিল", en: "Seal" },
      { bn: "বিয়ারিং", en: "Bearing" },
      { bn: "পাইপ ও ফিটিংস", en: "Pipe & Fittings" },
      { bn: "ভালভ", en: "Valve" },
      { bn: "কন্ট্রোল প্যানেল", en: "Control Panel" },
    ],
  },
  {
    id: "motorcycle",
    bn: "মোটরসাইকেল পার্টস",
    en: "Motorcycle Parts",
    subCategories: [
      { bn: "ইঞ্জিন পার্টস", en: "Engine Parts" },
      { bn: "বডি পার্টস", en: "Body Parts" },
      { bn: "ইলেকট্রিক্যাল", en: "Electrical" },
      { bn: "ব্রেক সিস্টেম", en: "Brake System" },
      { bn: "টায়ার ও টিউব", en: "Tires & Tubes" },
      { bn: "চেইন ও স্প্রোকেট", en: "Chain & Sprocket" },
      { bn: "সাসপেনশন", en: "Suspension" },
      { bn: "লাইট ও মিরর", en: "Lights & Mirrors" },
    ],
  },
  {
    id: "cycle",
    bn: "সাইকেল পার্টস",
    en: "Cycle Parts",
    subCategories: [
      { bn: "ফ্রেম ও ফর্ক", en: "Frame & Fork" },
      { bn: "চাকা ও টায়ার", en: "Wheels & Tires" },
      { bn: "ব্রেক সিস্টেম", en: "Brake System" },
      { bn: "প্যাডেল ও ক্র্যাঙ্ক", en: "Pedals & Crank" },
      { bn: "সিট ও হ্যান্ডেল", en: "Seat & Handle" },
      { bn: "গিয়ার সিস্টেম", en: "Gear System" },
      { bn: "বেল ও লাইট", en: "Bell & Light" },
    ],
  },
  {
    id: "engine",
    bn: "ইঞ্জিন পার্টস",
    en: "Engine Parts",
    subCategories: [
      { bn: "পিস্টন ও রিং", en: "Piston & Rings" },
      { bn: "সিলিন্ডার", en: "Cylinder" },
      { bn: "কার্বুরেটর", en: "Carburetor" },
      { bn: "স্পার্ক প্লাগ", en: "Spark Plug" },
      { bn: "অয়েল ফিল্টার", en: "Oil Filter" },
      { bn: "এয়ার ফিল্টার", en: "Air Filter" },
      { bn: "গ্যাসকেট", en: "Gasket" },
      { bn: "ভালভ", en: "Valve" },
    ],
  },
  {
    id: "engine-van",
    bn: "ইঞ্জিন ভ্যান পার্টস",
    en: "Engine Van Parts",
    subCategories: [
      { bn: "ইঞ্জিন এসেম্বলি", en: "Engine Assembly" },
      { bn: "ট্রান্সমিশন", en: "Transmission" },
      { bn: "সাসপেনশন", en: "Suspension" },
      { bn: "ইলেকট্রিক্যাল", en: "Electrical" },
      { bn: "বডি পার্টস", en: "Body Parts" },
      { bn: "ব্রেক সিস্টেম", en: "Brake System" },
      { bn: "স্টিয়ারিং", en: "Steering" },
    ],
  },
  {
    id: "others",
    bn: "অন্যান্য",
    en: "Others",
    subCategories: [
      { bn: "টুলস", en: "Tools" },
      { bn: "লুব্রিকেন্ট", en: "Lubricants" },
      { bn: "এক্সেসরিজ", en: "Accessories" },
      { bn: "পরিষ্কারক", en: "Cleaners" },
      { bn: "বিবিধ", en: "Miscellaneous" },
    ],
  },
];

// Export default categories
export const CATEGORIES = DEFAULT_CATEGORIES;

// Helper functions
export function getCategoryById(id) {
  return CATEGORIES.find((cat) => cat.id === id);
}

export function getCategoryByName(name, lang = "bn") {
  return CATEGORIES.find((cat) =>
    lang === "bn" ? cat.bn === name : cat.en === name
  );
}

export function getSubCategories(categoryId) {
  const category = getCategoryById(categoryId);
  return category ? category.subCategories : [];
}

export function getAllCategoryNames(lang = "bn") {
  return CATEGORIES.map((cat) => (lang === "bn" ? cat.bn : cat.en));
}

// Fetch categories from database (for client-side use)
export async function fetchCategoriesFromDB() {
  try {
    const response = await fetch("/api/categories");
    const data = await response.json();
    if (data.success && data.categories.length > 0) {
      return data.categories;
    }
    return DEFAULT_CATEGORIES;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return DEFAULT_CATEGORIES;
  }
}
