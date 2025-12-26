import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";

// PUT - Update admin profile (only accessible by authenticated admins)
export async function PUT(request, { params }) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { name, email } = await request.json();

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Only allow admins to update their own profile
    if (id !== user.id) {
      return NextResponse.json(
        { error: "You can only update your own profile" },
        { status: 403 }
      );
    }

    const db = await getDatabase();
    const adminsCollection = db.collection("admins");

    // Check if email is already taken by another admin
    const existingAdmin = await adminsCollection.findOne({
      email: email.toLowerCase(),
      _id: { $ne: new ObjectId(id) },
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Email is already taken" },
        { status: 400 }
      );
    }

    // Update the admin
    const result = await adminsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          email: email.toLowerCase(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Return updated admin without password
    const { password, _id, ...adminData } = result;

    return NextResponse.json({
      success: true,
      admin: {
        ...adminData,
        id: _id.toString(),
      },
    });
  } catch (error) {
    console.error("Update admin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
