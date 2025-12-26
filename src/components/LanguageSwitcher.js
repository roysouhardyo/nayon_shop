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
      className="btn btn-secondary text-sm whitespace-nowrap flex items-center gap-1.5"
      aria-label="Switch Language"
    >
      <span className="text-sm font-medium">
        {lang === "bn" ? (
          <>
            <span className="mr-1">🇬🇧</span>
            English
          </>
        ) : (
          <>
            <span className="mr-1">🇧🇩</span>
            বাংলা
          </>
        )}
      </span>
    </button>
  );
}
