"use client";

import { useRouter } from "next/navigation";
import type { Hotel } from "@/lib/types";
import { useLanguage } from "@/lib/language";

export function PropertyPicker({ hotels, current }: { hotels: Hotel[]; current: string }) {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="property" className="whitespace-nowrap text-xs font-medium text-muted-fg">
        {t.propertyPicker.label}
      </label>
      <select
        id="property"
        value={current}
        onChange={(e) => router.push(`/pro?id=${e.target.value}`)}
        className="h-11 w-full max-w-xs cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm text-foreground hover:border-border-strong"
      >
        {hotels.map((h) => (
          <option key={h.id} value={h.id}>
            {h.name} — {h.city}
          </option>
        ))}
      </select>
    </div>
  );
}
