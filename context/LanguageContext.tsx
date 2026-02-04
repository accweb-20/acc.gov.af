// context/LanguageContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Lang = "en" | "ps" | "fa";

type LanguageContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
};

const LanguageContext = createContext<LanguageContextValue>({
  lang: "en",
  setLang: () => undefined,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const stored = typeof window !== "undefined" ? (localStorage.getItem("site_lang") as Lang | null) : null;
      if (stored === "en" || stored === "ps" || stored === "fa") {
        setLangState(stored);
      } else {
        setLangState("en");
      }
    } catch (e) {
      setLangState("en");
    }
  }, []);

  // Whenever lang changes: persist and update document attributes (lang + dir)
  useEffect(() => {
    try {
      if (typeof window !== "undefined") localStorage.setItem("site_lang", lang);
    } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang === "fa" ? "fa" : lang === "ps" ? "ps" : "en";
      document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
    }
  }, [lang]);

  const setLang = (l: Lang) => {
    if (l === "en" || l === "ps" || l === "fa") setLangState(l);
  };

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export const useLang = () => useContext(LanguageContext);
