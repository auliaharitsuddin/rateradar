"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import id from "@/messages/id";
import en from "@/messages/en";
import type { Messages } from "@/messages/id";

export type Lang = "id" | "en";

const DICTS: Record<Lang, Messages> = { id, en };
const STORAGE_KEY = "rr-lang";
// The app's UI copy is written in Indonesian, so that's the default when no
// preference has been stored yet.
const DEFAULT_LANG: Lang = "id";

interface Ctx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Messages;
}

const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT_LANG);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "id" || stored === "en") setLangState(stored);
    } catch {
      /* storage blocked — default language stands */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* storage blocked — the choice still applies for this session */
    }
  }, []);

  const value = useMemo(() => ({ lang, setLang, t: DICTS[lang] }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): Ctx {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
