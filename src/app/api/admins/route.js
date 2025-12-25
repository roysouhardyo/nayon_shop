import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { getDatabase } from "@/lib/db";

// GET - Fetch all admins (only accessible by authenticated admins)
export async function GET(request) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDatabase();
    const adminsCollection = db.collection("admins");

    // Fetch all admins (excluding passwords)
    const admins = await adminsCollection
      .find({}, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      admins,
    });
  } catch (error) {
    console.error("Fetch admins error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create new admin (only accessible by existing admins)
export async function POST(request) {
  try {
    // Check authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const adminsCollection = db.collection("admins");

    // Check if admin already exists
    const existingAdmin = await adminsCollection.findOne({
      email: email.toLowerCase(),
    });

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new admin
    const newAdmin = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "admin",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: user.id,
    };

    const result = await adminsCollection.insertOne(newAdmin);

    // Return admin without password
    const { password: _, ...adminWithoutPassword } = newAdmin;

    return NextResponse.json(
      {
        success: true,
        admin: {
          ...adminWithoutPassword,
          id: result.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
