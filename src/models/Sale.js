import { ObjectId } from "mongodb";
import { getCollection } from "../lib/db";

// Sale Schema
export const SaleSchema = {
  productId: ObjectId,
  quantitySold: Number,
  sellingPrice: Number,
  totalAmount: Number,
  adminId: ObjectId,
  note: String,
  createdAt: Date,
};

// Sale Model Functions
export const Sale = {
  // Create sale
  async create(saleData) {
    const collection = await getCollection("sales");

    const sale = {
      ...saleData,
      productId: new ObjectId(saleData.productId),
      adminId: saleData.adminId ? new ObjectId(saleData.adminId) : null,
      totalAmount: saleData.quantitySold * saleData.sellingPrice,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(sale);
    return { ...sale, _id: result.insertedId };
  },

  // Find by product ID
  async findByProductId(productId, options = {}) {
    const collection = await getCollection("sales");

    let cursor = collection.find({
      productId: new ObjectId(productId),
    });

    cursor = cursor.sort({ createdAt: -1 });

    if (options.limit) {
      cursor = cursor.limit(options.limit);
    }

    return await cursor.toArray();
  },

  // Find all with filters
  async find(filters = {}, options = {}) {
    const collection = await getCollection("sales");

    let cursor = collection.find(filters);

    if (options.sort) {
      cursor = cursor.sort(options.sort);
    } else {
      cursor = cursor.sort({ createdAt: -1 });
    }

    if (options.limit) {
      cursor = cursor.limit(options.limit);
    }

    if (options.skip) {
      cursor = cursor.skip(options.skip);
    }

    return await cursor.toArray();
  },

  // Get sales by date range
  async findByDateRange(startDate, endDate) {
    const collection = await getCollection("sales");

    return await collection
      .find({
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      })
      .sort({ createdAt: -1 })
      .toArray();
  },

  // Get sales with product details
  async findWithProducts(filters = {}, options = {}) {
    const collection = await getCollection("sales");

    const pipeline = [
      { $match: filters },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      { $sort: options.sort || { createdAt: -1 } },
    ];

    if (options.limit) {
      pipeline.push({ $limit: options.limit });
    }

    return await collection.aggregate(pipeline).toArray();
  },

  // Get sales summary
  async getSummary(startDate, endDate) {
    const collection = await getCollection("sales");

    const pipeline = [
      {
        $match: {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
          },
        },
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: "$totalAmount" },
          totalQuantity: { $sum: "$quantitySold" },
          count: { $sum: 1 },
        },
      },
    ];

    const result = await collection.aggregate(pipeline).toArray();
    return result[0] || { totalSales: 0, totalQuantity: 0, count: 0 };
  },
};
