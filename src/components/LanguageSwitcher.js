"use client";

import { useState, useEffect } from "react";
import { getCurrentLanguage, setLanguage } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const [lang, setLang] = useState("bn");

  useEffect(() => {
    setLang(getCurrentLanguage());
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === "bn" ? "en" : "bn";
    setLanguage(newLang);
    setLang(newLang);

    // Trigger a custom event to notify other components
    window.dispatchEvent(new Event("languageChanged"));
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors touch-target"
      aria-label="Switch Language"
    >
      <span className="text-sm font-medium">
        {lang === "bn" ? (
          <>
            <span className="mr-1">🇧🇩</span>
            বাংলা
          </>
        ) : (
          <>
            <span className="mr-1">🇬🇧</span>
            English
          </>
        )}
      </span>
      <svg
        className="w-4 h-4 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    </button>
  );
}
