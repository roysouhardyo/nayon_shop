#!/usr/bin/env node

/**
 * Create admin account using MongoDB Atlas
 */

const fs = require("fs");
const path = require("path");
const readline = require("readline");
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

// Simple .env parser
function loadEnv() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) {
    return {};
  }
  const envFile = fs.readFileSync(envPath, "utf8");
  const env = {};
  envFile.split("\n").forEach((line) => {
    line = line.trim();
    if (line && !line.startsWith("#")) {
      const [key, ...valueParts] = line.split("=");
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join("=").trim();
      }
    }
  });
  return env;
}

const env = loadEnv();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function createAdmin() {
  console.log("\n🔧 নায়ন শপ - Create Admin Account\n");

  try {
    const uri = env.MONGODB_URI;

    if (!uri) {
      console.error("❌ MONGODB_URI not found in .env.local file!");
      process.exit(1);
    }

    console.log("✅ Found MongoDB URI from .env.local");

    // Get admin details with defaults
    const name = await question("Admin Name (press Enter for 'Admin'): ");
    const email = await question(
      "Admin Email (press Enter for 'admin@nayonshop.com'): "
    );
    const password = await question(
      "Admin Password (press Enter for 'admin123'): "
    );

    const adminName = name.trim() || "Admin";
    const adminEmail = email.trim() || "admin@nayonshop.com";
    const adminPassword = password.trim() || "admin123";

    console.log("\n⏳ Connecting to MongoDB Atlas...");

    const client = new MongoClient(uri);
    await client.connect();

    console.log("✅ Connected to MongoDB!");

    const db = client.db("nayon_shop");
    const adminsCollection = db.collection("admins");

    // Check if admin already exists
    const existingAdmin = await adminsCollection.findOne({
      email: adminEmail.toLowerCase(),
    });

    if (existingAdmin) {
      console.log(`\n⚠️  Admin with email ${adminEmail} already exists!`);
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("You can login with this email at:");
      console.log("🔗 http://localhost:3000/login");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
      await client.close();
      process.exit(0);
    }

    // Hash password
    console.log("🔒 Hashing password...");
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin
    console.log("👤 Creating admin account...");
    await adminsCollection.insertOne({
      name: adminName,
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("\n✅ Admin account created successfully!");
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📧 Email:    ", adminEmail);
    console.log("🔑 Password: ", adminPassword);
    console.log("🔗 Login URL: http://localhost:3000/login");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("⚠️  Please save these credentials!\n");

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (
      error.message.includes("ENOTFOUND") ||
      error.message.includes("authentication")
    ) {
      console.log("\n💡 Tips:");
      console.log("1. Check your internet connection");
      console.log("2. Verify MongoDB Atlas credentials in .env.local");
      console.log("3. Make sure your IP is whitelisted in MongoDB Atlas\n");
    }
    process.exit(1);
  } finally {
    rl.close();
  }
}

createAdmin();
