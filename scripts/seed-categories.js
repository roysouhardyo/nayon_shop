// Seed script to populate categories in the database
// Run with: node scripts/seed-categories.js

const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Read .env.local file
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf8");
const envLines = envContent.split("\n");
const env = {};
envLines.forEach((line) => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const categories = [
  {
    id: "water-pump",
    name_bn: "ওয়াটার পাম্প পার্টস",
    name_en: "Water Pump Parts",
    order: 1,
    subCategories: [
      { bn: "মোটর", en: "Motor" },
      { bn: "ইম্পেলার", en: "Impeller" },
      { bn: "সিল ও গ্যাসকেট", en: "Seal & Gasket" },
      { bn: "বিয়ারিং", en: "Bearing" },
      { bn: "পাইপ ও ফিটিংস", en: "Pipe & Fittings" },
      { bn: "ভালভ", en: "Valve" },
      { bn: "কন্ট্রোল প্যানেল", en: "Control Panel" },
      { bn: "প্রেশার সুইচ", en: "Pressure Switch" },
      { bn: "ক্যাপাসিটর", en: "Capacitor" },
    ],
  },
  {
    id: "motorcycle",
    name_bn: "মোটরসাইকেল পার্টস",
    name_en: "Motorcycle Parts",
    order: 2,
    subCategories: [
      { bn: "ইঞ্জিন পার্টস", en: "Engine Parts" },
      { bn: "বডি পার্টস", en: "Body Parts" },
      { bn: "ইলেকট্রিক্যাল পার্টস", en: "Electrical Parts" },
      { bn: "ব্রেক সিস্টেম", en: "Brake System" },
      { bn: "টায়ার ও টিউব", en: "Tires & Tubes" },
      { bn: "চেইন ও স্প্রোকেট", en: "Chain & Sprocket" },
      { bn: "সাসপেনশন", en: "Suspension" },
      { bn: "লাইট ও মিরর", en: "Lights & Mirrors" },
      { bn: "হর্ন ও ইন্ডিকেটর", en: "Horn & Indicator" },
      { bn: "ব্যাটারি", en: "Battery" },
      { bn: "ক্লাচ পার্টস", en: "Clutch Parts" },
      { bn: "ফুয়েল সিস্টেম", en: "Fuel System" },
    ],
  },
  {
    id: "cycle",
    name_bn: "সাইকেল পার্টস",
    name_en: "Cycle Parts",
    order: 3,
    subCategories: [
      { bn: "ফ্রেম ও ফর্ক", en: "Frame & Fork" },
      { bn: "চাকা ও টায়ার", en: "Wheels & Tires" },
      { bn: "ব্রেক সিস্টেম", en: "Brake System" },
      { bn: "প্যাডেল ও ক্র্যাঙ্ক", en: "Pedals & Crank" },
      { bn: "সিট ও হ্যান্ডেল", en: "Seat & Handle" },
      { bn: "গিয়ার সিস্টেম", en: "Gear System" },
      { bn: "বেল ও লাইট", en: "Bell & Light" },
      { bn: "চেইন ও স্প্রোকেট", en: "Chain & Sprocket" },
      { bn: "স্ট্যান্ড", en: "Stand" },
      { bn: "মাডগার্ড", en: "Mudguard" },
    ],
  },
  {
    id: "engine",
    name_bn: "ইঞ্জিন পার্টস",
    name_en: "Engine Parts",
    order: 4,
    subCategories: [
      { bn: "পিস্টন ও রিং", en: "Piston & Rings" },
      { bn: "সিলিন্ডার", en: "Cylinder" },
      { bn: "কার্বুরেটর", en: "Carburetor" },
      { bn: "স্পার্ক প্লাগ", en: "Spark Plug" },
      { bn: "অয়েল ফিল্টার", en: "Oil Filter" },
      { bn: "এয়ার ফিল্টার", en: "Air Filter" },
      { bn: "গ্যাসকেট সেট", en: "Gasket Set" },
      { bn: "ভালভ", en: "Valve" },
      { bn: "কানেক্টিং রড", en: "Connecting Rod" },
      { bn: "ক্র্যাঙ্কশ্যাফট", en: "Crankshaft" },
      { bn: "ক্যামশ্যাফট", en: "Camshaft" },
    ],
  },
  {
    id: "engine-van",
    name_bn: "ইঞ্জিন ভ্যান পার্টস",
    name_en: "Engine Van Parts",
    order: 5,
    subCategories: [
      { bn: "ইঞ্জিন এসেম্বলি", en: "Engine Assembly" },
      { bn: "ট্রান্সমিশন", en: "Transmission" },
      { bn: "সাসপেনশন", en: "Suspension" },
      { bn: "ইলেকট্রিক্যাল সিস্টেম", en: "Electrical System" },
      { bn: "বডি পার্টস", en: "Body Parts" },
      { bn: "ব্রেক সিস্টেম", en: "Brake System" },
      { bn: "স্টিয়ারিং সিস্টেম", en: "Steering System" },
      { bn: "চাকা ও টায়ার", en: "Wheels & Tires" },
      { bn: "ফুয়েল সিস্টেম", en: "Fuel System" },
      { bn: "কুলিং সিস্টেম", en: "Cooling System" },
    ],
  },
  {
    id: "tools-accessories",
    name_bn: "টুলস ও এক্সেসরিজ",
    name_en: "Tools & Accessories",
    order: 6,
    subCategories: [
      { bn: "হ্যান্ড টুলস", en: "Hand Tools" },
      { bn: "পাওয়ার টুলস", en: "Power Tools" },
      { bn: "মেজারিং টুলস", en: "Measuring Tools" },
      { bn: "লুব্রিকেন্ট ও অয়েল", en: "Lubricants & Oil" },
      { bn: "ক্লিনিং সাপ্লাইজ", en: "Cleaning Supplies" },
      { bn: "সেফটি ইকুইপমেন্ট", en: "Safety Equipment" },
      { bn: "ফাস্টেনার", en: "Fasteners" },
      { bn: "এডহেসিভ ও সিলেন্ট", en: "Adhesives & Sealants" },
    ],
  },
  {
    id: "electrical",
    name_bn: "ইলেকট্রিক্যাল পার্টস",
    name_en: "Electrical Parts",
    order: 7,
    subCategories: [
      { bn: "ব্যাটারি", en: "Battery" },
      { bn: "ওয়্যার ও কেবল", en: "Wires & Cables" },
      { bn: "সুইচ", en: "Switches" },
      { bn: "রিলে", en: "Relays" },
      { bn: "ফিউজ", en: "Fuses" },
      { bn: "কানেক্টর", en: "Connectors" },
      { bn: "বাল্ব ও LED", en: "Bulbs & LED" },
      { bn: "হর্ন", en: "Horn" },
      { bn: "ইগনিশন কয়েল", en: "Ignition Coil" },
    ],
  },
  {
    id: "others",
    name_bn: "অন্যান্য",
    name_en: "Others",
    order: 8,
    subCategories: [
      { bn: "রাবার পার্টস", en: "Rubber Parts" },
      { bn: "প্লাস্টিক পার্টস", en: "Plastic Parts" },
      { bn: "বিয়ারিং", en: "Bearings" },
      { bn: "বুশিং", en: "Bushings" },
      { bn: "স্প্রিং", en: "Springs" },
      { bn: "বিবিধ", en: "Miscellaneous" },
    ],
  },
];

async function seedCategories() {
  const uri = env.MONGODB_URI;

  if (!uri) {
    console.error("❌ MONGODB_URI not found in .env.local");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    console.log("🔄 Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db("nayon_shop");
    const collection = db.collection("categories");

    // Clear existing categories
    console.log("🔄 Clearing existing categories...");
    await collection.deleteMany({});
    console.log("✅ Existing categories cleared");

    // Insert new categories
    console.log("🔄 Inserting new categories...");
    const now = new Date();
    const categoriesToInsert = categories.map((cat) => ({
      ...cat,
      createdAt: now,
      updatedAt: now,
    }));

    const result = await collection.insertMany(categoriesToInsert);
    console.log(`✅ Inserted ${result.insertedCount} categories`);

    // Display summary
    console.log("\n📊 Categories Summary:");
    console.log("━".repeat(60));
    for (const cat of categories) {
      console.log(`\n${cat.name_bn} (${cat.name_en})`);
      console.log(`  ID: ${cat.id}`);
      console.log(`  Sub-categories: ${cat.subCategories.length}`);
      cat.subCategories.forEach((sub, index) => {
        console.log(`    ${index + 1}. ${sub.bn} (${sub.en})`);
      });
    }
    console.log("\n" + "━".repeat(60));
    console.log(`\n✅ Total: ${categories.length} categories`);
    console.log(
      `✅ Total sub-categories: ${categories.reduce(
        (sum, cat) => sum + cat.subCategories.length,
        0
      )}`
    );
    console.log("\n🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\n👋 Database connection closed");
  }
}

// Run the seed function
seedCategories();
