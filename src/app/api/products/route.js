import { NextResponse } from "next/server";
import { Product } from "@/models/Product";
import { getUserFromRequest } from "@/lib/auth";

// GET - Public endpoint to fetch all products
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const subCategory = searchParams.get("subCategory");
    const brand = searchParams.get("brand");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    let products;
    const filters = {};

    // Add filters
    if (category) {
      filters.$or = [{ category_bn: category }, { category_en: category }];
    }

    if (subCategory) {
      // Add subcategory filter
      if (!filters.$and) filters.$and = [];
      filters.$and.push({
        $or: [{ subCategory_bn: subCategory }, { subCategory_en: subCategory }],
      });
    }

    if (brand) {
      filters.brand = brand;
    }

    if (status === "lowStock") {
      products = await Product.getLowStock();
    } else if (status === "outOfStock") {
      products = await Product.getOutOfStock();
    } else if (search) {
      products = await Product.search(search, filters);
    } else {
      const skip = (page - 1) * limit;
      products = await Product.find(filters, {
        limit,
        skip,
        sort: { createdAt: -1 },
      });
    }

    // Get total count
    const total = await Product.count(filters);

    return NextResponse.json({
      success: true,
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Protected endpoint to create product
export async function POST(request) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const productData = await request.json();

    // Validate required fields - at least one name is required
    if (!productData.name_bn && !productData.name_en) {
      return NextResponse.json(
        { error: "Product name (Bangla or English) is required" },
        { status: 400 }
      );
    }

    // Create product
    const product = await Product.create(productData);

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
