#!/usr/bin/env node

/**
 * Script to seed sample products for testing
 * Run: node scripts/seed-products.js
 */

const { MongoClient } = require("mongodb");

const sampleProducts = [
  {
    name_bn: "ওয়াটার পাম্প মোটর",
    name_en: "Water Pump Motor",
    category_bn: "ওয়াটার পাম্প পার্টস",
    category_en: "Water Pump Parts",
    subCategory_bn: "মোটর",
    subCategory_en: "Motor",
    brand: "Pedrollo",
    compatibleModel: "PKm 60",
    partCode: "WAT-PE-" + Date.now(),
    purchasePrice: 3500,
    sellingPrice: 4200,
    stockQuantity: 15,
    minimumStockLevel: 5,
    supplierName: "ঢাকা ট্রেডার্স",
    shelfLocation: "A-12",
    images: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name_bn: "মোটরসাইকেল চেইন",
    name_en: "Motorcycle Chain",
    category_bn: "মোটরসাইকেল পার্টস",
    category_en: "Motorcycle Parts",
    subCategory_bn: "চেইন",
    subCategory_en: "Chain",
    brand: "RK",
    compatibleModel: "Hero Splendor",
    partCode: "MOT-RK-" + Date.now(),
    purchasePrice: 850,
    sellingPrice: 1100,
    stockQuantity: 25,
    minimumStockLevel: 10,
    supplierName: "বাইক পার্টস সেন্টার",
    shelfLocation: "B-05",
    images: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name_bn: "সাইকেল টায়ার",
    name_en: "Bicycle Tire",
    category_bn: "সাইকেল পার্টস",
    category_en: "Cycle Parts",
    subCategory_bn: "টায়ার",
    subCategory_en: "Tire",
    brand: "MRF",
    compatibleModel: "26 inch",
    partCode: "CYC-MR-" + Date.now(),
    purchasePrice: 320,
    sellingPrice: 450,
    stockQuantity: 40,
    minimumStockLevel: 15,
    supplierName: "সাইকেল ডিপো",
    shelfLocation: "C-08",
    images: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name_bn: "ইঞ্জিন পিস্টন",
    name_en: "Engine Piston",
    category_bn: "ইঞ্জিন পার্টস",
    category_en: "Engine Parts",
    subCategory_bn: "পিস্টন",
    subCategory_en: "Piston",
    brand: "Bajaj",
    compatibleModel: "RE 4S",
    partCode: "ENG-BA-" + Date.now(),
    purchasePrice: 1200,
    sellingPrice: 1600,
    stockQuantity: 8,
    minimumStockLevel: 5,
    supplierName: "ইঞ্জিন হাউস",
    shelfLocation: "D-03",
    images: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    name_bn: "ভ্যান ব্রেক শু",
    name_en: "Van Brake Shoe",
    category_bn: "ইঞ্জিন ভ্যান পার্টস",
    category_en: "Engine Van Parts",
    subCategory_bn: "ব্রেক পার্টস",
    subCategory_en: "Brake Parts",
    brand: "TVS",
    compatibleModel: "King",
    partCode: "VAN-TV-" + Date.now(),
    purchasePrice: 450,
    sellingPrice: 650,
    stockQuantity: 20,
    minimumStockLevel: 8,
    supplierName: "ভ্যান পার্টস মার্ট",
    shelfLocation: "E-15",
    images: [],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function seedProducts() {
  console.log("\n🌱 Seeding sample products...\n");

  try {
    const uri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/nayon_shop";

    console.log("⏳ Connecting to MongoDB...");
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db("nayon_shop");
    const productsCollection = db.collection("products");

    console.log("📦 Inserting products...");
    const result = await productsCollection.insertMany(sampleProducts);

    console.log(
      `\n✅ Successfully inserted ${result.insertedCount} products!\n`
    );

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

seedProducts();
