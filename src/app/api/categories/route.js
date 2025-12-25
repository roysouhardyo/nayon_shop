import { NextResponse } from "next/server";
import { Category } from "@/models/Category";
import { getUserFromRequest } from "@/lib/auth";

// GET - Get all categories
export async function GET(request) {
  try {
    const categories = await Category.getAll();

    // Sort categories: 'others' always at the end, rest by order
    const sortedCategories = categories.sort((a, b) => {
      // If 'a' is 'others', it should come after 'b'
      if (a.id === "others") return 1;
      // If 'b' is 'others', it should come after 'a'
      if (b.id === "others") return -1;
      // Otherwise sort by order
      return (a.order || 999) - (b.order || 999);
    });

    return NextResponse.json({ success: true, categories: sortedCategories });
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new category
export async function POST(request) {
  try {
    console.log("=== Category POST Request Started ===");

    // Check authentication
    const user = getUserFromRequest(request);
    console.log("User:", user);

    if (!user) {
      console.log("Authentication failed - no user");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categoryData = await request.json();
    console.log("Category Data received:", categoryData);

    // Validate required fields (only Bangla name and ID are required)
    if (!categoryData.name_bn || !categoryData.id) {
      console.log("Validation failed - missing required fields");
      return NextResponse.json(
        { error: "Category Bangla name and ID are required" },
        { status: 400 }
      );
    }

    // Set English name to Bangla name if not provided
    if (!categoryData.name_en) {
      console.log("English name not provided, using Bangla name");
      categoryData.name_en = categoryData.name_bn;
    }

    console.log("Creating category with data:", categoryData);

    // Create category
    const category = await Category.create(categoryData);
    console.log("Category created successfully:", category);

    return NextResponse.json(
      {
        success: true,
        category,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("=== Create category error ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    console.error("Full error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + error.message },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(request) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, ...updateData } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const category = await Category.update(id, updateData);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(request) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

    const deleted = await Category.delete(id);

    if (!deleted) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
