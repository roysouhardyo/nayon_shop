import { getDatabase } from "@/lib/db";

export const Category = {
  // Get all categories
  async getAll() {
    const db = await getDatabase();
    const collection = db.collection("categories");
    return await collection.find({}).sort({ order: 1 }).toArray();
  },

  // Get category by ID
  async getById(id) {
    const db = await getDatabase();
    const collection = db.collection("categories");
    const { ObjectId } = require("mongodb");
    return await collection.findOne({ _id: new ObjectId(id) });
  },

  // Create new category
  async create(categoryData) {
    const db = await getDatabase();
    const collection = db.collection("categories");
    const now = new Date();

    const category = {
      ...categoryData,
      subCategories: categoryData.subCategories || [],
      order: categoryData.order || 999,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(category);
    return { ...category, _id: result.insertedId };
  },

  // Update category
  async update(id, updateData) {
    const db = await getDatabase();
    const collection = db.collection("categories");
    const { ObjectId } = require("mongodb");

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

  // Delete category
  async delete(id) {
    const db = await getDatabase();
    const collection = db.collection("categories");
    const { ObjectId } = require("mongodb");

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  },

  // Add sub-category to a category
  async addSubCategory(categoryId, subCategory) {
    const db = await getDatabase();
    const collection = db.collection("categories");
    const { ObjectId } = require("mongodb");

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(categoryId) },
      {
        $push: { subCategories: subCategory },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    return result;
  },

  // Remove sub-category from a category
  async removeSubCategory(categoryId, subCategoryIndex) {
    const db = await getDatabase();
    const collection = db.collection("categories");
    const { ObjectId } = require("mongodb");

    const category = await collection.findOne({
      _id: new ObjectId(categoryId),
    });
    if (!category) return null;

    category.subCategories.splice(subCategoryIndex, 1);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(categoryId) },
      {
        $set: {
          subCategories: category.subCategories,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result;
  },
};

/**
 * Category Schema:
 * {
 *   _id: ObjectId,
 *   name_bn: String,
 *   name_en: String,
 *   id: String, // Unique identifier (e.g., "water-pump")
 *   subCategories: [
 *     {
 *       bn: String,
 *       en: String
 *     }
 *   ],
 *   order: Number, // For sorting
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 */
