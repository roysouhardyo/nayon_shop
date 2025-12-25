#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const envContent = `# MongoDB Atlas
MONGODB_URI=mongodb+srv://nayon:Roy06539@teamdivider.7dbezvd.mongodb.net/nayon_shop?appName=TeamDivider

# JWT Secret
JWT_SECRET=375346d4f4c9a95f202420c481d50abf20f745113736187c7bb40f6bcdc5768e1a66907b5609ee4af59a05c69b816a00defe6f04a05de64ca1691b47d6e8e0d8

# Cloudinary (optional - add when you need image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# App Configuration
NEXT_PUBLIC_APP_NAME=নায়ন শপ
NEXT_PUBLIC_SHOP_NAME_BN=নায়ন মেশিনারি এন্ড হার্ডওয়্যার
NEXT_PUBLIC_SHOP_NAME_EN=Nayon Machinery & Hardware
`;

const envPath = path.join(__dirname, ".env.local");

fs.writeFileSync(envPath, envContent, "utf8");

console.log("✅ .env.local file created successfully!");
console.log("\nYour configuration:");
console.log("- MongoDB: MongoDB Atlas (cloud)");
console.log("- JWT Secret: Set ✓");
console.log("- Shop Name: নায়ন শপ");
console.log(
  "\n⚠️  Note: Cloudinary credentials are placeholders. Add them when you need image uploads.\n"
);
