import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

// DELETE - Delete an admin (only accessible by authenticated admins)
export async function DELETE(request, { params }) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    // Prevent self-deletion
    if (id === user.id) {
      return NextResponse.json(
        { error: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const adminsCollection = db.collection("admins");

    // Delete the admin
    const result = await adminsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Delete admin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
