"use client";

import { useSearchParams } from "next/navigation";
import { defaultDates, resolveCitySlug, searchHotels } from "@/lib/query";
import { SearchView } from "@/components/search-view";

const ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Client-side twin of the search page's server logic, used only in the static
 * export build: `output: "export"` has no server to read the `?city=` query
 * string at request time, so this reads it from the browser URL instead and
 * re-runs the exact same deterministic pricing functions from lib/query.
 */
export function SearchClient() {
  const sp = useSearchParams();
  const fallback = defaultDates();

  const city = sp.get("city") ?? "Bali";
  const rawIn = sp.get("checkIn");
  const rawOut = sp.get("checkOut");
  const checkIn = rawIn && ISO.test(rawIn) ? rawIn : fallback.checkIn;
  const checkOutCandidate = rawOut && ISO.test(rawOut) ? rawOut : fallback.checkOut;
  const checkOut =
    checkOutCandidate > checkIn ? checkOutCandidate : fallback.checkOut > checkIn ? fallback.checkOut : checkIn;

  const guestsRaw = Number(sp.get("guests") ?? 2);
  const guests = Number.isInteger(guestsRaw) && guestsRaw >= 1 && guestsRaw <= 6 ? guestsRaw : 2;

  const known = resolveCitySlug(city);
  const result = known ? searchHotels({ city, checkIn, checkOut, guests, rooms: 1 }) : null;

  return (
    <SearchView
      known={!!known}
      city={known ? city : "Bali"}
      checkIn={checkIn}
      checkOut={checkOut}
      guests={guests}
      result={result}
    />
  );
}
