/** Core domain types shared by the B2C metasearch and the B2B rate-intelligence surfaces. */

export type SourceId = "booking" | "agoda" | "traveloka" | "tiket";

export interface SourceMeta {
  id: SourceId;
  name: string;
  /** Which categorical slot this source owns. Colour follows the entity, never its rank. */
  seriesSlot: 1 | 2 | 3 | 4;
  /** Affiliate programmes differ: some expose a price API, some are deep-link only. */
  hasPriceApi: boolean;
  /** How the source quotes a room rate before we normalise it. */
  taxTreatment: "inclusive" | "exclusive";
  /** Indonesian hotel tax + service charge applied when taxTreatment === "exclusive". */
  affiliate: "api" | "deeplink";
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  area: string;
  stars: number;
  rating: number;
  reviews: number;
  lat: number;
  lng: number;
  image: string;
  amenities: string[];
}

/** A single price quote from one source, already normalised to all-in IDR per room per night. */
export interface Quote {
  sourceId: SourceId;
  /** All-in price per room per night, IDR. Comparable across sources. */
  totalPerNight: number;
  /** What the source itself displays before normalisation — kept for transparency. */
  displayedPrice: number;
  taxAndFees: number;
  /** Strike-through price when the source is running a promo. */
  wasPrice: number | null;
  promoLabel: string | null;
  refundable: boolean;
  roomsLeft: number | null;
  deepLink: string;
}

export interface HotelOffer {
  hotel: Hotel;
  quotes: Quote[];
  cheapest: Quote;
  /** Rupiah saved versus the most expensive source carrying this hotel. */
  spread: number;
  spreadPct: number;
}

export interface SearchParams {
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

export interface SearchResponse {
  params: SearchParams;
  nights: number;
  offers: HotelOffer[];
  /** Sources that answered vs. timed out — partial results are shown, never silently dropped. */
  sourcesQueried: SourceId[];
  sourcesFailed: SourceId[];
  cached: boolean;
  tookMs: number;
}

/* ── B2B rate intelligence ────────────────────────────────── */

export interface RatePoint {
  date: string;
  /** Keyed by source; a missing source means no rate was observed that day. */
  bySource: Partial<Record<SourceId, number>>;
}

export interface CompetitorRow {
  hotelId: string;
  name: string;
  stars: number;
  distanceKm: number;
  /** Per-source ADR over the same window as the property's own ADR. */
  rates: Partial<Record<SourceId, number>>;
  median: number;
  /** Positive = this competitor is priced above you. */
  vsYou: number;
}

/** A parity breach: one source selling the same room below the property's own floor rate. */
export interface ParityIssue {
  id: string;
  sourceId: SourceId;
  date: string;
  floorRate: number;
  observedRate: number;
  gap: number;
  gapPct: number;
  severity: "critical" | "warning";
}

export interface ProSummary {
  propertyName: string;
  city: string;
  stars: number;
  /** Window both the property ADR and the market ADR are measured over. */
  windowDays: number;
  /** Average daily rate for the property over the window. */
  adr: number;
  /** Change in the property's own ADR, first half of the window vs second half. */
  adrDelta: number;
  /** Market ADR over the SAME window — comparable to `adr` by construction. */
  marketAdr: number;
  /** How far the property sits above/below market, in percent. */
  vsMarketPct: number;
  /** 1-based rank by price among the tracked competitive set. */
  rank: number;
  rankTotal: number;
  parityIssues: number;
  /** Change in the NUMBER of breaches versus the preceding window (a count, not a percentage). */
  parityIssuesDelta: number;
  /** Property's own floor rate — always present, even when no breach was found. */
  floorRate: number;
  series: RatePoint[];
  competitors: CompetitorRow[];
  issues: ParityIssue[];
}
