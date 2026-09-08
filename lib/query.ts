import { addDays, coveringSources, floorRateFor, isoDate, nightsBetween, normalise, quoteFor, parseDate } from "./pricing";
import { haversineKm } from "./match";
import { CITIES, findHotel, hotelsByCity, rand } from "./seed";
import { SOURCE_LIST, SOURCES } from "./sources";
import type {
  CompetitorRow,
  HotelOffer,
  ParityIssue,
  ProSummary,
  RatePoint,
  SearchParams,
  SearchResponse,
  SourceId,
} from "./types";

/* ── Tiny TTL cache ───────────────────────────────────────────
   Keeps repeat queries off the upstream sources. In production this is the
   layer that keeps request volume to each OTA low and predictable, decoupled
   from how many users are searching.
   ─────────────────────────────────────────────────────────── */

interface Entry<T> {
  value: T;
  expires: number;
}
const store = new Map<string, Entry<unknown>>();
const TTL_MS = 10 * 60 * 1000;
const MAX_ENTRIES = 500;

function cacheGet<T>(key: string): T | undefined {
  const hit = store.get(key);
  if (!hit) return undefined;
  if (hit.expires < Date.now()) {
    store.delete(key);
    return undefined;
  }
  return hit.value as T;
}

function cacheSet<T>(key: string, value: T): void {
  // Bounded: evict the oldest insertion when full so the map cannot grow without limit.
  if (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next();
    if (!oldest.done) store.delete(oldest.value);
  }
  store.set(key, { value, expires: Date.now() + TTL_MS });
}

export function todayIso(): string {
  return isoDate(new Date());
}

export function defaultDates(): { checkIn: string; checkOut: string } {
  const checkIn = addDays(todayIso(), 14);
  return { checkIn, checkOut: addDays(checkIn, 1) };
}

export function resolveCitySlug(input: string): string | null {
  const q = input.trim().toLowerCase();
  if (!q) return null;
  const exact = CITIES.find((c) => c.slug === q || c.name.toLowerCase() === q);
  if (exact) return exact.slug;
  const partial = CITIES.find((c) => c.name.toLowerCase().includes(q) || q.includes(c.slug));
  return partial ? partial.slug : null;
}

/* ── B2C metasearch ───────────────────────────────────────── */

export function searchHotels(params: SearchParams): SearchResponse {
  const started = Date.now();
  const slug = resolveCitySlug(params.city);
  const key = `search:${slug}:${params.checkIn}:${params.checkOut}:${params.guests}:${params.rooms}`;

  const cached = cacheGet<SearchResponse>(key);
  if (cached) return { ...cached, cached: true, tookMs: Date.now() - started };

  const nights = nightsBetween(params.checkIn, params.checkOut);
  const hotels = slug ? hotelsByCity(slug) : [];
  const today = todayIso();

  // A source can be unavailable for a whole query. Partial results are returned
  // and the failure is reported, never silently swallowed.
  const failed: SourceId[] = SOURCE_LIST.filter(
    (s) => rand(`${key}-health-${s.id}`) > 0.94,
  ).map((s) => s.id);
  const healthy = SOURCE_LIST.map((s) => s.id).filter((id) => !failed.includes(id));

  const offers: HotelOffer[] = hotels
    .map((hotel) => {
      const sources = coveringSources(hotel).filter((id) => healthy.includes(id));
      if (sources.length === 0) return null;

      const quotes = sources
        .map((id) => quoteFor(hotel, id, params.checkIn, params.checkOut, params.guests, today))
        .sort((a, b) => a.totalPerNight - b.totalPerNight);

      const cheapest = quotes[0];
      const dearest = quotes[quotes.length - 1];
      const spread = dearest.totalPerNight - cheapest.totalPerNight;

      return {
        hotel,
        quotes,
        cheapest,
        spread,
        spreadPct: cheapest.totalPerNight > 0 ? (spread / cheapest.totalPerNight) * 100 : 0,
      } satisfies HotelOffer;
    })
    .filter((o): o is HotelOffer => o !== null);

  const response: SearchResponse = {
    params,
    nights,
    offers,
    sourcesQueried: healthy,
    sourcesFailed: failed,
    cached: false,
    tookMs: Date.now() - started,
  };

  cacheSet(key, response);
  return response;
}

/** Nightly all-in rate per source over a window — powers the price-history chart. */
export function priceHistory(hotelId: string, days = 30, endIso = todayIso()): RatePoint[] {
  const hotel = findHotel(hotelId);
  if (!hotel) return [];

  const sources = coveringSources(hotel);
  const points: RatePoint[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = addDays(endIso, -i);
    const bySource: Partial<Record<SourceId, number>> = {};
    for (const id of sources) {
      // An observation can be missing for a day; the chart must handle gaps.
      if (rand(`${hotelId}-${id}-${date}-obs`) < 0.05) continue;
      const q = quoteFor(hotel, id, date, addDays(date, 1), 2, addDays(date, -14));
      bySource[id] = q.totalPerNight;
    }
    points.push({ date, bySource });
  }
  return points;
}

/* ── B2B rate intelligence ────────────────────────────────── */

export function proSummary(hotelId: string, days = 30): ProSummary | null {
  const hotel = findHotel(hotelId);
  if (!hotel) return null;

  const key = `pro:${hotelId}:${days}:${todayIso()}`;
  const cached = cacheGet<ProSummary>(key);
  if (cached) return cached;

  const series = priceHistory(hotelId, days);

  const ownRates = series
    .map((p) => {
      const vals = Object.values(p.bySource).filter((v): v is number => typeof v === "number");
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
    })
    .filter((v): v is number => v !== null);

  const adr = ownRates.length ? Math.round(ownRates.reduce((a, b) => a + b, 0) / ownRates.length) : 0;
  const firstHalf = ownRates.slice(0, Math.floor(ownRates.length / 2));
  const secondHalf = ownRates.slice(Math.floor(ownRates.length / 2));
  const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);
  const adrDelta = firstHalf.length && secondHalf.length
    ? ((avg(secondHalf) - avg(firstHalf)) / avg(firstHalf)) * 100
    : 0;

  // Competitive set: same city, within one star of this property, nearest first.
  // Filtering on class matters — a 5-star resort compared against 3-star inns
  // produces a "market ADR" that is real arithmetic but meaningless advice.
  const peers = hotelsByCity(CITIES.find((c) => c.name === hotel.city)?.slug ?? "")
    .filter((h) => h.id !== hotel.id)
    .filter((h) => Math.abs(h.stars - hotel.stars) <= 1);

  const competitors: CompetitorRow[] = peers
    .map((peer) => {
      // Per-source ADR over the SAME window as the property's own ADR, so the two
      // numbers are comparable. Using a single future date here against a 30-day
      // average for the property compared two different things.
      const peerHistory = priceHistory(peer.id, days);
      const rates: Partial<Record<SourceId, number>> = {};
      for (const id of coveringSources(peer)) {
        const vals = peerHistory
          .map((p) => p.bySource[id])
          .filter((v): v is number => typeof v === "number");
        if (vals.length) rates[id] = Math.round(avg(vals));
      }
      const vals = Object.values(rates)
        .filter((v): v is number => typeof v === "number")
        .sort((a, b) => a - b);
      const median = vals.length
        ? vals.length % 2
          ? vals[(vals.length - 1) / 2]
          : Math.round((vals[vals.length / 2 - 1] + vals[vals.length / 2]) / 2)
        : 0;
      return {
        hotelId: peer.id,
        name: peer.name,
        stars: peer.stars,
        distanceKm: Number(haversineKm(hotel.lat, hotel.lng, peer.lat, peer.lng).toFixed(1)),
        rates,
        median,
        vsYou: median - adr,
      } satisfies CompetitorRow;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 6);

  const marketVals = competitors.map((c) => c.median).filter((v) => v > 0);
  const marketAdr = marketVals.length ? Math.round(avg(marketVals)) : 0;

  const rank = 1 + competitors.filter((c) => c.median < adr).length;

  // Parity breaches: a source selling below the property's floor rate for that night.
  const floorRate = floorRateFor(hotelId, addDays(todayIso(), -7));

  function breachesIn(points: RatePoint[]): ParityIssue[] {
    const out: ParityIssue[] = [];
    for (const point of points) {
      const nightFloor = floorRateFor(hotelId, point.date);
      for (const [sourceId, rate] of Object.entries(point.bySource) as [SourceId, number][]) {
        if (rate >= nightFloor) continue;
        const gap = nightFloor - rate;
        const gapPct = (gap / nightFloor) * 100;
        if (gapPct < 3) continue;
        out.push({
          id: `${sourceId}-${point.date}`,
          sourceId,
          date: point.date,
          floorRate: nightFloor,
          observedRate: rate,
          gap,
          gapPct,
          severity: gapPct >= 10 ? "critical" : "warning",
        });
      }
    }
    return out;
  }

  const recentWindow = series.slice(-14);
  const priorWindow = series.slice(-28, -14);
  const issues = breachesIn(recentWindow).sort((a, b) => b.gapPct - a.gapPct);
  // A real period-over-period count, not a random number.
  const parityIssuesDelta = issues.length - breachesIn(priorWindow).length;

  const summary: ProSummary = {
    propertyName: hotel.name,
    city: hotel.city,
    stars: hotel.stars,
    windowDays: days,
    adr,
    adrDelta,
    marketAdr,
    vsMarketPct: marketAdr ? ((adr - marketAdr) / marketAdr) * 100 : 0,
    rank,
    rankTotal: competitors.length + 1,
    parityIssues: issues.length,
    parityIssuesDelta,
    floorRate,
    series,
    competitors,
    issues: issues.slice(0, 8),
  };

  cacheSet(key, summary);
  return summary;
}

export { SOURCES, SOURCE_LIST, CITIES, findHotel, nightsBetween, parseDate, addDays, normalise };
