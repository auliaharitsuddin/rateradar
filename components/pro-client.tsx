"use client";

import { useSearchParams } from "next/navigation";
import { proSummary } from "@/lib/query";
import { HOTELS } from "@/lib/seed";
import { ProView } from "@/components/pro-view";
import { ProNotFound } from "@/components/pro-not-found";

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
    return <ProNotFound />;
  }

  return <ProView id={id} data={data} />;
}
