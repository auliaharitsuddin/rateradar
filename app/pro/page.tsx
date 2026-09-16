import { proSummary } from "@/lib/query";
import { HOTELS } from "@/lib/seed";
import { ProView } from "@/components/pro-view";
import { ProNotFound } from "@/components/pro-not-found";

export const dynamic = "force-dynamic";

const DEFAULT_ID = "bali-1";

export default async function ProPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.id) ? sp.id[0] : sp.id;
  const id = raw && HOTELS.some((h) => h.id === raw) ? raw : DEFAULT_ID;

  const data = proSummary(id, 30);
  if (!data) {
    return <ProNotFound />;
  }

  return <ProView id={id} data={data} />;
}
