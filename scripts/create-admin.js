#!/usr/bin/env node

/**
 * Script to create the first admin account
 * Run: node scripts/create-admin.js
 */

const readline = require("readline");
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function createAdmin() {
  console.log("\n🔧 নায়ন শপ - Create First Admin Account\n");

  try {
    // Get MongoDB URI
    const mongoUri = await question(
      "MongoDB URI (press Enter for default: mongodb://localhost:27017/nayon_shop): "
    );
    const uri = mongoUri.trim() || "mongodb://localhost:27017/nayon_shop";

    // Get admin details
    const name = await question("Admin Name: ");
    const email = await question("Admin Email: ");
    const password = await question("Admin Password: ");

    if (!name || !email || !password) {
      console.error("❌ All fields are required!");
      process.exit(1);
    }

    console.log("\n⏳ Connecting to MongoDB...");

    // Connect to MongoDB
    const client = new MongoClient(uri);
    await client.connect();

    const db = client.db("nayon_shop");
    const adminsCollection = db.collection("admins");

    // Check if admin already exists
    const existingAdmin = await adminsCollection.findOne({
      email: email.toLowerCase(),
    });

    if (existingAdmin) {
      console.error(`❌ Admin with email ${email} already exists!`);
      await client.close();
      process.exit(1);
    }

    // Hash password
    console.log("🔒 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    console.log("👤 Creating admin account...");
    const result = await adminsCollection.insertOne({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log("\n✅ Admin account created successfully!");
    console.log("\n📧 Email:", email);
    console.log("🔑 Password:", password);
    console.log(
      "\n⚠️  Please save these credentials and change the password after first login.\n"
    );

    await client.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

createAdmin();
