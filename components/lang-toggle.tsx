"use client";

import { useLanguage, type Lang } from "@/lib/language";

const OPTIONS: { code: Lang; label: string }[] = [
  { code: "id", label: "ID" },
  { code: "en", label: "EN" },
];

export function LangToggle() {
  const { lang, setLang, t } = useLanguage();

  return (
    <div
      role="group"
      aria-label={t.nav.langSwitch}
      className="flex h-11 items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.code}
          type="button"
          data-lang={o.code}
          aria-pressed={lang === o.code}
          onClick={() => setLang(o.code)}
          className={`h-9 min-w-9 cursor-pointer rounded-md px-2 text-xs font-semibold transition-colors duration-200 ${
            lang === o.code
              ? "bg-primary text-on-primary"
              : "text-muted-fg hover:bg-surface-2 hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
