import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

// PUT - Change admin password (only accessible by authenticated admins)
export async function PUT(request, { params }) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const { currentPassword, newPassword } = await request.json();

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current password and new password are required" },
        { status: 400 }
      );
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Only allow admins to change their own password
    if (id !== user.id) {
      return NextResponse.json(
        { error: "You can only change your own password" },
        { status: 403 }
      );
    }

    const db = await getDatabase();
    const adminsCollection = db.collection("admins");

    // Get the admin with password
    const admin = await adminsCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      admin.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await adminsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
