"use client";

import { useLanguage } from "@/lib/language";

export function DemoBanner() {
  const { t } = useLanguage();
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT !== "true") return null;
  return (
    <p className="bg-primary px-4 py-1.5 text-center text-xs font-medium text-on-primary">
      {t.demoBanner}
    </p>
  );
}
