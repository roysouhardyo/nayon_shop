"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("authToken");

    if (token) {
      // Redirect to admin dashboard
      router.push("/admin");
    } else {
      // Redirect to public inventory view
      router.push("/public");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
      <div className="text-center">
        <div className="spinner mx-auto mb-4"></div>
        <h1 className="text-2xl font-bold text-gray-800 bengali-text">
          নায়ন শপ
        </h1>
        <p className="text-gray-600 mt-2">Loading...</p>
      </div>
    </div>
  );
}
