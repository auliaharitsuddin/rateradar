// GitHub Pages export build only. scripts/export-pages.mjs swaps this in as
// page.tsx for the duration of `next build --output export`, then restores the
// real page.tsx (which force-dynamic renders per request instead) afterwards.
import { HOTELS } from "@/lib/seed";
import { HotelView } from "@/components/hotel-view";

export function generateStaticParams() {
  return HOTELS.map((h) => ({ id: h.id }));
}

export default async function HotelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <HotelView id={id} />;
}
