import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import en from "./translations/en.json";
import ar from "./translations/ar.json";

export type Language = "en" | "ar";

const translations: Record<Language, Record<string, any>> = { en, ar };

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
  dir: "ltr" | "rtl";
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

function getNestedValue(obj: any, path: string): string {
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current === undefined || current === null) return path;
    current = current[key];
  }
  return typeof current === "string" ? current : path;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem("amas-language");
    return (saved === "ar" || saved === "en") ? saved : "en";
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("amas-language", lang);
  }, []);

  const t = useCallback(
    (key: string, replacements?: Record<string, string>) => {
      let value = getNestedValue(translations[language], key);
      if (replacements) {
        Object.entries(replacements).forEach(([k, v]) => {
          value = value.replace(`{${k}}`, v);
        });
      }
      return value;
    },
    [language]
  );

  const dir = language === "ar" ? "rtl" : "ltr";
  const isRTL = language === "ar";

  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", language);
    if (language === "ar") {
      document.body.style.fontFamily = "'Amiri', 'Playfair Display', serif";
    } else {
      document.body.style.fontFamily = "'Montserrat', sans-serif";
    }
  }, [language, dir]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir, isRTL }}>
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
