import type { SourceId, SourceMeta } from "./types";

/**
 * Source registry. Each OTA is an adapter behind one interface, so swapping a mock
 * for a real affiliate API is a one-file change and never touches the UI.
 *
 * hasPriceApi mirrors reality: the global players expose a partner price API,
 * the Indonesian OTAs are affiliate deep-link only, so they contribute a
 * referral button rather than a comparable quote once real data is wired in.
 */
export const SOURCES: Record<SourceId, SourceMeta> = {
  booking: {
    id: "booking",
    name: "Booking.com",
    seriesSlot: 1,
    hasPriceApi: true,
    taxTreatment: "inclusive",
    affiliate: "api",
  },
  agoda: {
    id: "agoda",
    name: "Agoda",
    seriesSlot: 2,
    hasPriceApi: true,
    taxTreatment: "exclusive",
    affiliate: "api",
  },
  traveloka: {
    id: "traveloka",
    name: "Traveloka",
    seriesSlot: 3,
    hasPriceApi: false,
    taxTreatment: "exclusive",
    affiliate: "deeplink",
  },
  tiket: {
    id: "tiket",
    name: "tiket.com",
    seriesSlot: 4,
    hasPriceApi: false,
    taxTreatment: "inclusive",
    affiliate: "deeplink",
  },
};

export const SOURCE_LIST: SourceMeta[] = Object.values(SOURCES);

/** Indonesian hotel tax (PB1 10%) + typical service charge (11% combined here). */
export const TAX_RATE = 0.21;

export function seriesVar(sourceId: SourceId): string {
  return `var(--series-${SOURCES[sourceId].seriesSlot})`;
}
