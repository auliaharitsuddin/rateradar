/**
 * Cross-OTA hotel identity resolution.
 *
 * The same property is listed under different strings on every OTA
 * ("Stark Boutique Hotel and Spa Bali" / "Stark Boutique Hotel & Spa" /
 * "Stark Boutique Kuta"), so comparing by name alone silently compares two
 * different hotels. Matching is gated on geography first, then name similarity;
 * anything in between is returned as "review" rather than guessed, because a
 * wrong match is worse than a missing one.
 */

const NOISE = new Set([
  "hotel", "hotels", "resort", "resorts", "spa", "the", "and", "by",
  "inn", "suites", "suite", "residence", "villas", "villa", "lodge",
  "bali", "jakarta", "bandung", "yogyakarta", "indonesia",
]);

export function normaliseName(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokens(raw: string): string[] {
  return normaliseName(raw)
    .split(" ")
    .filter((t) => t.length > 1 && !NOISE.has(t));
}

/** Dice coefficient over significant tokens — 1 is identical, 0 is disjoint. */
export function nameSimilarity(a: string, b: string): number {
  const ta = new Set(tokens(a));
  const tb = new Set(tokens(b));
  if (ta.size === 0 || tb.size === 0) return 0;
  let shared = 0;
  for (const t of ta) if (tb.has(t)) shared++;
  return (2 * shared) / (ta.size + tb.size);
}

/** Great-circle distance in kilometres. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(a)));
}

export type MatchVerdict = "match" | "review" | "no-match";

export interface MatchResult {
  verdict: MatchVerdict;
  score: number;
  distanceKm: number;
}

/**
 * Two listings are the same property when they are physically close AND the
 * names agree. The 0.15 km gate is deliberately tight: neighbouring hotels in
 * Kuta or Malioboro sit within a few hundred metres of each other.
 */
export function matchListing(
  a: { name: string; lat: number; lng: number },
  b: { name: string; lat: number; lng: number },
): MatchResult {
  const distanceKm = haversineKm(a.lat, a.lng, b.lat, b.lng);
  const score = nameSimilarity(a.name, b.name);

  if (distanceKm > 0.5) return { verdict: "no-match", score, distanceKm };
  if (distanceKm <= 0.15 && score >= 0.6) return { verdict: "match", score, distanceKm };
  if (score >= 0.34) return { verdict: "review", score, distanceKm };
  return { verdict: "no-match", score, distanceKm };
}
