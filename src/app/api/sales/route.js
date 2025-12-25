import { NextResponse } from "next/server";
import { Product } from "@/models/Product";
import { Sale } from "@/models/Sale";
import { StockMovement } from "@/models/StockMovement";
import { getUserFromRequest } from "@/lib/auth";

// POST - Record a sale (protected)
export async function POST(request) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantitySold, sellingPrice, note } =
      await request.json();

    // Validate input
    if (!productId || !quantitySold || quantitySold <= 0) {
      return NextResponse.json({ error: "Invalid sale data" }, { status: 400 });
    }

    // Get product
    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check stock availability
    if (product.stockQuantity < quantitySold) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      );
    }

    const quantityBefore = product.stockQuantity;
    const quantityAfter = quantityBefore - quantitySold;

    // Update stock
    await Product.updateStock(productId, quantityAfter);

    // Record sale
    const sale = await Sale.create({
      productId,
      quantitySold,
      sellingPrice: sellingPrice || product.sellingPrice,
      adminId: user.id,
      note,
    });

    // Record stock movement
    await StockMovement.create({
      productId,
      type: "OUT",
      quantity: quantitySold,
      quantityBefore,
      quantityAfter,
      note: note || "Sale",
      adminId: user.id,
    });

    return NextResponse.json(
      {
        success: true,
        sale,
        newStockQuantity: quantityAfter,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Record sale error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET - Get sales with filters
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
    const productId = searchParams.get("productId");

    let sales;

    if (productId) {
      sales = await Sale.findByProductId(productId);
    } else if (startDate && endDate) {
      sales = await Sale.findByDateRange(startDate, endDate);
    } else {
      sales = await Sale.findWithProducts({}, { limit: 50 });
    }

    return NextResponse.json({
      success: true,
      sales,
    });
  } catch (error) {
    console.error("Get sales error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
