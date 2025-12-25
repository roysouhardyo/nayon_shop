import { ObjectId } from "mongodb";
import { getCollection } from "../lib/db";
import { hashPassword, verifyPassword } from "../lib/auth";

// Admin Schema
export const AdminSchema = {
  name: String,
  email: String,
  password: String, // Hashed
  role: String, // 'admin' | 'super_admin'
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
};

// Admin Model Functions
export const Admin = {
  // Create admin
  async create(adminData) {
    const collection = await getCollection("admins");
    const now = new Date();

    // Hash password
    const hashedPassword = await hashPassword(adminData.password);

    const admin = {
      name: adminData.name,
      email: adminData.email.toLowerCase(),
      password: hashedPassword,
      role: adminData.role || "admin",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(admin);

    // Remove password from returned object
    const { password, ...adminWithoutPassword } = admin;
    return { ...adminWithoutPassword, _id: result.insertedId };
  },

  // Find by email
  async findByEmail(email) {
    const collection = await getCollection("admins");
    return await collection.findOne({
      email: email.toLowerCase(),
      isActive: true,
    });
  },

  // Find by ID
  async findById(id) {
    const collection = await getCollection("admins");
    const admin = await collection.findOne({
      _id: new ObjectId(id),
      isActive: true,
    });

    if (admin) {
      const { password, ...adminWithoutPassword } = admin;
      return adminWithoutPassword;
    }

    return null;
  },

  // Verify login credentials
  async verifyCredentials(email, password) {
    const admin = await this.findByEmail(email);

    if (!admin) {
      return null;
    }

    const isValid = await verifyPassword(password, admin.password);

    if (!isValid) {
      return null;
    }

    // Remove password from returned object
    const { password: _, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  },

  // Update admin
  async update(id, updateData) {
    const collection = await getCollection("admins");

    const dataToUpdate = { ...updateData, updatedAt: new Date() };

    // Hash password if it's being updated
    if (updateData.password) {
      dataToUpdate.password = await hashPassword(updateData.password);
    }

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: dataToUpdate },
      { returnDocument: "after" }
    );

    if (result.value) {
      const { password, ...adminWithoutPassword } = result.value;
      return adminWithoutPassword;
    }

    return null;
  },

  // Soft delete
  async delete(id) {
    const collection = await getCollection("admins");

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          isActive: false,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    return result.value;
  },

  // Find all admins
  async findAll() {
    const collection = await getCollection("admins");
    const admins = await collection.find({ isActive: true }).toArray();

    // Remove passwords
    return admins.map(({ password, ...admin }) => admin);
  },
};
