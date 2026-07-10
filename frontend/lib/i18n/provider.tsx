"use client";

import * as React from "react";
import { dict, type Lang } from "./translations";
import { localizedCrop } from "./crops";

type Ctx = {
  lang: Lang;
  dir: "ltr" | "rtl";
  setLang: (l: Lang) => void;
  t: typeof dict.en;
  tCrop: (slug: string, fallback: string) => string;
};

const LanguageContext = React.createContext<Ctx | null>(null);
const STORAGE_KEY = "cropai-lang";
const VALID: Lang[] = ["en", "ur", "hi"];

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("en");

  // Restore saved language on mount. localStorage is unavailable during SSR, so this
  // one-time read has to happen in an effect rather than in the initial state.
  React.useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Lang | null;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved && VALID.includes(saved)) setLangState(saved);
  }, []);

  // Keep <html lang/dir> in sync (Urdu is right-to-left).
  React.useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const value = React.useMemo<Ctx>(
    () => ({
      lang,
      dir: lang === "ur" ? "rtl" : "ltr",
      setLang,
      t: dict[lang] as typeof dict.en,
      tCrop: (slug, fallback) => localizedCrop(slug, lang, fallback),
    }),
    [lang, setLang],
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useI18n(): Ctx {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) throw new Error("useI18n must be used within LanguageProvider");
  return ctx;
}

export function useT() {
  return useI18n().t;
}
