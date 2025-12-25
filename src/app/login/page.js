"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentLanguage, t } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState("bn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLang(getCurrentLanguage());

    const handleLanguageChange = () => {
      setLang(getCurrentLanguage());
    };

    window.addEventListener("languageChanged", handleLanguageChange);
    return () =>
      window.removeEventListener("languageChanged", handleLanguageChange);

    // Check if already logged in
    const token = localStorage.getItem("authToken");
    if (token) {
      router.push("/admin");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Store token and admin info
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("adminInfo", JSON.stringify(data.admin));

        // Redirect to admin dashboard
        router.push("/admin");
      } else {
        setError(data.error || t("loginFailed", lang));
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(t("loginFailed", lang));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-green-100 to-emerald-100 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h1
            className={`text-3xl font-bold text-gray-900 mb-2 ${
              lang === "bn" ? "bengali-text" : ""
            }`}
          >
            {lang === "bn" ? "নায়ন শপ" : "Nayon Shop"}
          </h1>
          <p className={`text-gray-600 ${lang === "bn" ? "bengali-text" : ""}`}>
            {lang === "bn" ? "অ্যাডমিন লগইন" : "Admin Login"}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div
                className={`bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className={`block text-sm font-medium text-gray-700 mb-2 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {lang === "bn" ? "ইমেইল" : "Email"}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder={
                  lang === "bn" ? "আপনার ইমেইল লিখুন" : "Enter your email"
                }
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className={`block text-sm font-medium text-gray-700 mb-2 ${
                  lang === "bn" ? "bengali-text" : ""
                }`}
              >
                {lang === "bn" ? "পাসওয়ার্ড" : "Password"}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
                placeholder={
                  lang === "bn"
                    ? "আপনার পাসওয়ার্ড লিখুন"
                    : "Enter your password"
                }
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full btn btn-primary py-3 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {lang === "bn" ? "লগইন হচ্ছে..." : "Logging in..."}
                </span>
              ) : (
                t("login", lang)
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push("/public")}
              className={`text-sm text-primary-600 hover:text-primary-700 ${
                lang === "bn" ? "bengali-text" : ""
              }`}
            >
              {lang === "bn"
                ? "← পাবলিক ভিউতে ফিরে যান"
                : "← Back to Public View"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
