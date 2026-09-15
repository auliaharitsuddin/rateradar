"use client";

import { useSearchParams } from "next/navigation";
import { proSummary } from "@/lib/query";
import { HOTELS } from "@/lib/seed";
import { ProView } from "@/components/pro-view";

const DEFAULT_ID = "bali-1";

/**
 * Client-side twin of the Pro page's server logic, used only in the static
 * export build: `output: "export"` has no server to read `?id=` at request
 * time, so this reads it from the browser URL and re-runs proSummary(), the
 * same deterministic function the real deployment calls server-side.
 */
export function ProClient() {
  const sp = useSearchParams();
  const raw = sp.get("id");
  const id = raw && HOTELS.some((h) => h.id === raw) ? raw : DEFAULT_ID;

  const data = proSummary(id, 30);
  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-lg font-semibold text-foreground">Properti tidak ditemukan</h1>
      </div>
    );
  }

  return <ProView id={id} data={data} />;
}
