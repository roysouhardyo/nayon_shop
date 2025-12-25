import { NextResponse } from "next/server";
import { Admin } from "@/models/Admin";

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findByEmail(email);

    if (existingAdmin) {
      return NextResponse.json(
        { error: "Admin with this email already exists" },
        { status: 409 }
      );
    }

    // Create new admin
    const admin = await Admin.create({
      name,
      email,
      password,
      role: "admin",
    });

    return NextResponse.json(
      {
        success: true,
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
