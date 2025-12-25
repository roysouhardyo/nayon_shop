import { ObjectId } from "mongodb";
import { getCollection } from "../lib/db";

// Product Schema
export const ProductSchema = {
  name_bn: String,
  name_en: String,
  category_bn: String,
  category_en: String,
  subCategory_bn: String,
  subCategory_en: String,
  brand: String,
  compatibleModel: String,
  partCode: String, // Auto-generated unique code
  purchasePrice: Number,
  sellingPrice: Number,
  stockQuantity: Number,
  minimumStockLevel: Number,
  supplierName: String,
  shelfLocation: String,
  images: [String], // Array of Cloudinary URLs
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
};

// Product Model Functions
export const Product = {
  // Create product
  async create(productData) {
    const collection = await getCollection("products");
    const now = new Date();

    const product = {
      ...productData,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(product);
    return { ...product, _id: result.insertedId };
  },

  // Find by ID
  async findById(id) {
    const collection = await getCollection("products");
    return await collection.findOne({ _id: new ObjectId(id) });
  },

  // Find all with filters
  async find(filters = {}, options = {}) {
    const collection = await getCollection("products");
    const query = { isActive: true, ...filters };

    let cursor = collection.find(query);

    if (options.sort) {
      cursor = cursor.sort(options.sort);
    }

    if (options.limit) {
      cursor = cursor.limit(options.limit);
    }

    if (options.skip) {
      cursor = cursor.skip(options.skip);
    }

    return await cursor.toArray();
  },

  // Search products (Bangla + English)
  async search(searchTerm, filters = {}) {
    const collection = await getCollection("products");

    const searchQuery = {
      isActive: true,
      $or: [
        { name_bn: { $regex: searchTerm, $options: "i" } },
        { name_en: { $regex: searchTerm, $options: "i" } },
        { brand: { $regex: searchTerm, $options: "i" } },
        { partCode: { $regex: searchTerm, $options: "i" } },
        { compatibleModel: { $regex: searchTerm, $options: "i" } },
      ],
      ...filters,
    };

    return await collection.find(searchQuery).toArray();
  },

  // Update product
  async update(id, updateData) {
    const collection = await getCollection("products");

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result;
  },

  // Update stock quantity
  async updateStock(id, quantity) {
    const collection = await getCollection("products");

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          stockQuantity: quantity,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result;
  },

  // Soft delete
  async delete(id) {
    const collection = await getCollection("products");

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result;
  },

  // Get low stock products
  async getLowStock() {
    const collection = await getCollection("products");

    return await collection
      .find({
        isActive: true,
        $expr: { $lte: ["$stockQuantity", "$minimumStockLevel"] },
      })
      .toArray();
  },

  // Get out of stock products
  async getOutOfStock() {
    const collection = await getCollection("products");

    return await collection
      .find({
        isActive: true,
        stockQuantity: { $lte: 0 },
      })
      .toArray();
  },

  // Count products
  async count(filters = {}) {
    const collection = await getCollection("products");
    return await collection.countDocuments({ isActive: true, ...filters });
  },
};
