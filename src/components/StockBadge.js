"use client";

import { useState, useEffect } from "react";
import { getCurrentLanguage, t } from "@/lib/i18n";
import { getStockStatus, getStockStatusColor } from "@/lib/utils";

export default function StockBadge({ quantity, minimumStock = 0 }) {
  const [lang, setLang] = useState("bn");

  useEffect(() => {
    setLang(getCurrentLanguage());

    const handleLanguageChange = () => {
      setLang(getCurrentLanguage());
    };

    window.addEventListener("languageChanged", handleLanguageChange);
    return () =>
      window.removeEventListener("languageChanged", handleLanguageChange);
  }, []);

  const status = getStockStatus(quantity, minimumStock);
  const colorClass = getStockStatusColor(status);

  return (
    <span
      className={`badge ${colorClass} ${lang === "bn" ? "bengali-text" : ""}`}
    >
      {t(status, lang)}
    </span>
  );
}
