import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET =
  process.env.JWT_SECRET || "fallback-secret-change-in-production";

// Hash password
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

// Generate JWT token
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Get user from request (for API routes)
export function getUserFromRequest(request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.substring(7);
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

// Middleware to protect routes
export function requireAuth(handler) {
  return async (request, context) => {
    const user = getUserFromRequest(request);

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Add user to context
    context.user = user;
    return handler(request, context);
  };
}
