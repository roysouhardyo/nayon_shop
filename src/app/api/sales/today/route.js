import { NextResponse } from "next/server";
import { Sale } from "@/models/Sale";
import { getUserFromRequest } from "@/lib/auth";

// GET - Get today's sales summary
export async function GET(request) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get today's date range (start of day to end of day)
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    // Get today's sales summary
    const summary = await Sale.getSummary(startOfDay, endOfDay);

    return NextResponse.json({
      success: true,
      todaySales: {
        count: summary.count || 0,
        totalAmount: summary.totalSales || 0,
        totalQuantity: summary.totalQuantity || 0,
      },
    });
  } catch (error) {
    console.error("Get today's sales error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
