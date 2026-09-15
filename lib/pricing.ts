import { SOURCE_LIST, SOURCES, TAX_RATE } from "./sources";
import { BASE_RATE, rand, randInt } from "./seed";
import { OTA_URL } from "./external-link";
import type { Hotel, Quote, SourceId } from "./types";

const STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

/** Per-source pricing bias — mirrors how OTAs genuinely differ on the same room. */
const SOURCE_BIAS: Record<SourceId, number> = {
  booking: 1.06,
  agoda: 0.97,
  traveloka: 1.0,
  tiket: 1.03,
};

/** Rounds to the nearest 1.000 IDR the way OTAs display rates. */
function roundIdr(v: number): number {
  return Math.round(v / 1000) * 1000;
}

export function parseDate(iso: string): Date {
  // Force UTC so the same ISO date yields identical output on server and client.
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, (m ?? 1) - 1, d ?? 1));
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  const a = parseDate(checkIn).getTime();
  const b = parseDate(checkOut).getTime();
  const n = Math.round((b - a) / 86400000);
  return n > 0 ? n : 1;
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const d = parseDate(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}

/** Weekend nights carry a premium; peak months (Jun–Aug, Dec) lift the whole market. */
function seasonalFactor(dateIso: string): number {
  const d = parseDate(dateIso);
  const dow = d.getUTCDay(); // 0 Sun .. 6 Sat
  const weekend = dow === 5 || dow === 6 ? 1.18 : 1.0;
  const month = d.getUTCMonth();
  const peak = month === 5 || month === 6 || month === 7 || month === 11 ? 1.12 : 1.0;
  return weekend * peak;
}

/** Booking further ahead is cheaper, flattening out past ~45 days. */
function leadTimeFactor(checkIn: string, today: string): number {
  const lead = Math.max(0, Math.round((parseDate(checkIn).getTime() - parseDate(today).getTime()) / 86400000));
  const capped = Math.min(lead, 45);
  return 1.14 - (capped / 45) * 0.14;
}

/**
 * The nightly rate a source *displays*, in that source's own tax convention.
 *
 * BASE_RATE is the all-in reference rate for the room. A tax-inclusive source
 * shows that figure directly; a tax-exclusive source shows the pre-tax figure,
 * which is why it looks cheaper on its own site. Deriving both from one
 * underlying rate is what makes the normalised totals comparable — an earlier
 * version treated BASE_RATE as pre-tax for every source, which silently made
 * tax-inclusive sources ~21% cheaper in real terms and skewed every comparison.
 */
function rawRate(hotel: Hotel, sourceId: SourceId, dateIso: string, today: string): number {
  const allInReference = BASE_RATE[hotel.id] ?? 500000;
  const jitter = 0.94 + rand(`${hotel.id}-${sourceId}-${dateIso}`) * 0.14;
  const allIn =
    allInReference *
    SOURCE_BIAS[sourceId] *
    seasonalFactor(dateIso) *
    leadTimeFactor(dateIso, today) *
    jitter;

  return SOURCES[sourceId].taxTreatment === "inclusive"
    ? roundIdr(allIn)
    : roundIdr(allIn / (1 + TAX_RATE));
}

/**
 * The property's own floor rate (BAR) for a given night — seasonally adjusted,
 * because hotels raise their floor in peak periods. A flat annual floor produced
 * zero breaches during peak months and made the parity monitor look broken.
 */
export function floorRateFor(hotelId: string, dateIso: string): number {
  const allInReference = BASE_RATE[hotelId] ?? 500000;
  return roundIdr(allInReference * seasonalFactor(dateIso) * 1.05);
}

/**
 * Normalise a source's displayed rate to an all-in, comparable figure.
 *
 * This is the single most important correctness rule in the app: Indonesian OTAs
 * disagree on whether the headline price includes tax and service. Comparing the
 * displayed numbers directly would rank a tax-exclusive source cheapest purely
 * because 21% is hidden, which is exactly the trap a price comparison must avoid.
 */
export function normalise(displayed: number, sourceId: SourceId): { total: number; tax: number } {
  const meta = SOURCES[sourceId];
  if (meta.taxTreatment === "inclusive") {
    return { total: displayed, tax: Math.round((displayed * TAX_RATE) / (1 + TAX_RATE)) };
  }
  const tax = Math.round(displayed * TAX_RATE);
  return { total: displayed + tax, tax };
}

function buildDeepLink(sourceId: SourceId, hotel: Hotel, checkIn: string, checkOut: string, guests: number): string {
  const aff = `rateradar-${sourceId}`;
  // Static export (GitHub Pages) has no server to run the /go redirect, so the
  // demo build links straight to the OTA instead of through our click-tracking hop.
  if (STATIC_EXPORT) {
    return OTA_URL[sourceId]({ hotel: hotel.name, checkIn, checkOut, aff });
  }
  const q = new URLSearchParams({
    hotel: hotel.name,
    city: hotel.city,
    checkIn,
    checkOut,
    guests: String(guests),
    // In production this carries the real affiliate tag for the source.
    aff,
  });
  return `/go/${sourceId}?${q.toString()}`;
}

/** Sources that actually carry this hotel. Coverage is never 100% in reality. */
export function coveringSources(hotel: Hotel): SourceId[] {
  const covering = SOURCE_LIST.filter((s) => rand(`${hotel.id}-cover-${s.id}`) > 0.12).map((s) => s.id);
  // Guarantee at least two sources so a comparison always has something to compare.
  if (covering.length < 2) return ["booking", "traveloka"];
  return covering;
}

export function quoteFor(
  hotel: Hotel,
  sourceId: SourceId,
  checkIn: string,
  checkOut: string,
  guests: number,
  today: string,
): Quote {
  const displayed = rawRate(hotel, sourceId, checkIn, today);
  const { total, tax } = normalise(displayed, sourceId);

  const promoRoll = rand(`${hotel.id}-${sourceId}-${checkIn}-promo`);
  const hasPromo = promoRoll > 0.62;
  const promoLabels = ["MERDEKA SALE", "Flash Deal", "Member Price", "Early Bird"];
  const wasPrice = hasPromo ? roundIdr(total * (1.1 + promoRoll * 0.25)) : null;

  return {
    sourceId,
    totalPerNight: total,
    displayedPrice: displayed,
    taxAndFees: tax,
    wasPrice,
    promoLabel: hasPromo ? promoLabels[randInt(`${hotel.id}-${sourceId}-label`, 0, 3)] : null,
    refundable: rand(`${hotel.id}-${sourceId}-refund`) > 0.45,
    roomsLeft: rand(`${hotel.id}-${sourceId}-rooms`) > 0.72 ? randInt(`${hotel.id}-${sourceId}-n`, 1, 4) : null,
    deepLink: buildDeepLink(sourceId, hotel, checkIn, checkOut, guests),
  };
}
