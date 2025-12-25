"use client";

import { useState, useEffect } from "react";
import { getCurrentLanguage, t } from "@/lib/i18n";

export default function SearchBar({ onSearch, placeholder }) {
  const [lang, setLang] = useState("bn");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setLang(getCurrentLanguage());

    const handleLanguageChange = () => {
      setLang(getCurrentLanguage());
    };

    window.addEventListener("languageChanged", handleLanguageChange);
    return () =>
      window.removeEventListener("languageChanged", handleLanguageChange);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={handleSearch}
        placeholder={placeholder || t("search", lang)}
        className={`w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
          lang === "bn" ? "bengali-text" : ""
        }`}
      />

      {searchTerm && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <svg
            className="h-5 w-5 text-gray-400 hover:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
