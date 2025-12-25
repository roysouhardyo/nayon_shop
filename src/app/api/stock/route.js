import { NextResponse } from "next/server";
import { Product } from "@/models/Product";
import { StockMovement } from "@/models/StockMovement";
import { getUserFromRequest } from "@/lib/auth";

// POST - Add stock (purchase)
export async function POST(request) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity, note } = await request.json();

    // Validate input
    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: "Invalid stock data" },
        { status: 400 }
      );
    }

    // Get product
    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const quantityBefore = product.stockQuantity;
    const quantityAfter = quantityBefore + quantity;

    // Update stock
    await Product.updateStock(productId, quantityAfter);

    // Record stock movement
    const movement = await StockMovement.create({
      productId,
      type: "IN",
      quantity,
      quantityBefore,
      quantityAfter,
      note: note || "Purchase",
      adminId: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        movement,
        newStockQuantity: quantityAfter,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Add stock error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Get stock movements
export async function GET(request) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type");
    const productId = searchParams.get("productId");

    let movements;

    if (productId) {
      movements = await StockMovement.findByProductId(productId);
    } else if (startDate && endDate) {
      movements = await StockMovement.findByDateRange(startDate, endDate, type);
    } else {
      movements = await StockMovement.findWithProducts({}, { limit: 50 });
    }

    return NextResponse.json({
      success: true,
      movements,
    });
  } catch (error) {
    console.error("Get stock movements error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
