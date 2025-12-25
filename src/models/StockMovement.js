import { ObjectId } from "mongodb";
import { getCollection } from "../lib/db";

// StockMovement Schema
export const StockMovementSchema = {
  productId: ObjectId,
  type: String, // 'IN' | 'OUT' | 'EDIT'
  quantity: Number,
  quantityBefore: Number,
  quantityAfter: Number,
  note: String,
  adminId: ObjectId,
  createdAt: Date,
};

// StockMovement Model Functions
export const StockMovement = {
  // Create stock movement
  async create(movementData) {
    const collection = await getCollection("stock_movements");

    const movement = {
      ...movementData,
      productId: new ObjectId(movementData.productId),
      adminId: movementData.adminId ? new ObjectId(movementData.adminId) : null,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(movement);
    return { ...movement, _id: result.insertedId };
  },

  // Find by product ID
  async findByProductId(productId, options = {}) {
    const collection = await getCollection("stock_movements");

    let cursor = collection.find({
      productId: new ObjectId(productId),
    });

    if (options.sort) {
      cursor = cursor.sort(options.sort);
    } else {
      cursor = cursor.sort({ createdAt: -1 });
    }

    if (options.limit) {
      cursor = cursor.limit(options.limit);
    }

    return await cursor.toArray();
  },

  // Find all with filters
  async find(filters = {}, options = {}) {
    const collection = await getCollection("stock_movements");

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

  // Get movements by date range
  async findByDateRange(startDate, endDate, type = null) {
    const collection = await getCollection("stock_movements");

    const query = {
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    if (type) {
      query.type = type;
    }

    return await collection.find(query).sort({ createdAt: -1 }).toArray();
  },

  // Get movements with product details
  async findWithProducts(filters = {}, options = {}) {
    const collection = await getCollection("stock_movements");

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
};
