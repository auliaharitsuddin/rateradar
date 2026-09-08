import { NextResponse } from "next/server";
import { findHotel, priceHistory } from "@/lib/query";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const hotel = findHotel(id);
  if (!hotel) {
    return NextResponse.json({ error: `Hotel '${id}' tidak ditemukan.` }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const daysRaw = Number(searchParams.get("days") ?? 30);
  const days = Number.isFinite(daysRaw) ? Math.min(Math.max(Math.trunc(daysRaw), 7), 90) : 30;

  return NextResponse.json(
    { hotel, days, history: priceHistory(id, days) },
    { headers: { "Cache-Control": "public, max-age=600, stale-while-revalidate=1800" } },
  );
}
