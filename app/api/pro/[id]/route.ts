import { NextResponse } from "next/server";
import { proSummary } from "@/lib/query";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { searchParams } = new URL(request.url);
  const daysRaw = Number(searchParams.get("days") ?? 30);
  const days = Number.isFinite(daysRaw) ? Math.min(Math.max(Math.trunc(daysRaw), 7), 90) : 30;

  const summary = proSummary(id, days);
  if (!summary) {
    return NextResponse.json({ error: `Properti '${id}' tidak ditemukan.` }, { status: 404 });
  }

  return NextResponse.json(summary, {
    headers: { "Cache-Control": "private, max-age=300" },
  });
}
