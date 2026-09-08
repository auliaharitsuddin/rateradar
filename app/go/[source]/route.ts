import { NextResponse } from "next/server";
import { SOURCES } from "@/lib/sources";
import type { SourceId } from "@/lib/types";

/**
 * Affiliate hand-off. This is the monetisation seam for the B2C surface: the click
 * is recorded here, then the user is redirected to the OTA carrying our tag.
 *
 * The app never takes payment and never books on the user's behalf — it refers.
 */
const TARGETS: Record<SourceId, (q: URLSearchParams) => string> = {
  booking: (q) =>
    `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(q.get("hotel") ?? "")}&checkin=${q.get("checkIn") ?? ""}&checkout=${q.get("checkOut") ?? ""}&aid=${q.get("aff") ?? ""}`,
  agoda: (q) =>
    `https://www.agoda.com/search?q=${encodeURIComponent(q.get("hotel") ?? "")}&checkIn=${q.get("checkIn") ?? ""}&checkOut=${q.get("checkOut") ?? ""}&cid=${q.get("aff") ?? ""}`,
  traveloka: (q) =>
    `https://www.traveloka.com/en-id/hotel/search?q=${encodeURIComponent(q.get("hotel") ?? "")}&aff=${q.get("aff") ?? ""}`,
  tiket: (q) =>
    `https://www.tiket.com/hotel/search?q=${encodeURIComponent(q.get("hotel") ?? "")}&aff=${q.get("aff") ?? ""}`,
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ source: string }> },
) {
  const { source } = await params;
  if (!(source in SOURCES)) {
    return NextResponse.json({ error: `Sumber '${source}' tidak dikenal.` }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const target = TARGETS[source as SourceId](searchParams);

  // Click attribution would be persisted here (source, hotel, timestamp, session).
  return NextResponse.redirect(target, { status: 302 });
}
