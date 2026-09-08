import { NextResponse } from "next/server";
import { defaultDates, resolveCitySlug, searchHotels } from "@/lib/query";
import { nightsBetween } from "@/lib/pricing";

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const city = (searchParams.get("city") ?? "").trim();
  if (!city) {
    return NextResponse.json({ error: "Parameter 'city' wajib diisi." }, { status: 400 });
  }
  if (!resolveCitySlug(city)) {
    return NextResponse.json(
      { error: `Kota '${city}' belum didukung.`, supported: ["Bali", "Jakarta", "Bandung", "Yogyakarta"] },
      { status: 404 },
    );
  }

  const fallback = defaultDates();
  const checkIn = searchParams.get("checkIn") ?? fallback.checkIn;
  const checkOut = searchParams.get("checkOut") ?? fallback.checkOut;

  if (!ISO.test(checkIn) || !ISO.test(checkOut)) {
    return NextResponse.json({ error: "Tanggal harus berformat YYYY-MM-DD." }, { status: 400 });
  }
  if (nightsBetween(checkIn, checkOut) < 1 || checkOut <= checkIn) {
    return NextResponse.json({ error: "checkOut harus setelah checkIn." }, { status: 400 });
  }

  const guests = Number(searchParams.get("guests") ?? 2);
  const rooms = Number(searchParams.get("rooms") ?? 1);
  if (!Number.isInteger(guests) || guests < 1 || guests > 20) {
    return NextResponse.json({ error: "guests harus bilangan bulat 1–20." }, { status: 400 });
  }
  if (!Number.isInteger(rooms) || rooms < 1 || rooms > 10) {
    return NextResponse.json({ error: "rooms harus bilangan bulat 1–10." }, { status: 400 });
  }

  const result = searchHotels({ city, checkIn, checkOut, guests, rooms });

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, max-age=300, stale-while-revalidate=600" },
  });
}
