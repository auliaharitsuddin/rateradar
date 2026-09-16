"use client";

import { useLanguage } from "@/lib/language";

/** Shared "property not found" message for both the server pro page and its static-export client twin. */
export function ProNotFound() {
  const { t } = useLanguage();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-lg font-semibold text-foreground">{t.proView.notFound}</h1>
    </div>
  );
}
