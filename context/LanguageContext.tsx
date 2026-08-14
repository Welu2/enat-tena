"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Language, translations } from "@/lib/i18n";

type TranslationsType = typeof translations.am;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationsType;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const LANG_STORAGE_KEY = "enat-tena-lang";

function getInitialLang(): Language {
  if (typeof window === "undefined") return "am";
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  if (stored === "en" || stored === "am") return stored;
  return "am";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>("am");
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setLangState(getInitialLang());
    setHydrated(true);
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem(LANG_STORAGE_KEY, newLang);
    }
  };

  // During SSR / pre-hydration, use default lang ("am")
  const activeLang = hydrated ? lang : "am";

  return (
    <LanguageContext.Provider
      value={{ lang: activeLang, setLang, t: translations[activeLang] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}