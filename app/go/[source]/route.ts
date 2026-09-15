import { NextResponse } from "next/server";
import { SOURCES } from "@/lib/sources";
import { OTA_URL } from "@/lib/external-link";
import type { SourceId } from "@/lib/types";

/**
 * Affiliate hand-off. This is the monetisation seam for the B2C surface: the click
 * is recorded here, then the user is redirected to the OTA carrying our tag.
 *
 * The app never takes payment and never books on the user's behalf — it refers.
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ source: string }> },
) {
  const { source } = await params;
  if (!(source in SOURCES)) {
    return NextResponse.json({ error: `Sumber '${source}' tidak dikenal.` }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const target = OTA_URL[source as SourceId]({
    hotel: searchParams.get("hotel") ?? "",
    checkIn: searchParams.get("checkIn") ?? "",
    checkOut: searchParams.get("checkOut") ?? "",
    aff: searchParams.get("aff") ?? "",
  });

  // Click attribution would be persisted here (source, hotel, timestamp, session).
  return NextResponse.redirect(target, { status: 302 });
}
