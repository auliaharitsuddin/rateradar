import type { SourceId } from "./types";

/**
 * Where a source's referral link actually resolves to, given the hotel name,
 * dates and affiliate tag. Shared by the real `/go/[source]` redirect handler
 * (production) and the static-export build (GitHub Pages demo has no server
 * to run that redirect, so its links point straight here instead).
 */
export const OTA_URL: Record<
  SourceId,
  (p: { hotel: string; checkIn: string; checkOut: string; aff: string }) => string
> = {
  booking: (p) =>
    `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(p.hotel)}&checkin=${p.checkIn}&checkout=${p.checkOut}&aid=${p.aff}`,
  agoda: (p) =>
    `https://www.agoda.com/search?q=${encodeURIComponent(p.hotel)}&checkIn=${p.checkIn}&checkOut=${p.checkOut}&cid=${p.aff}`,
  traveloka: (p) =>
    `https://www.traveloka.com/en-id/hotel/search?q=${encodeURIComponent(p.hotel)}&aff=${p.aff}`,
  tiket: (p) => `https://www.tiket.com/hotel/search?q=${encodeURIComponent(p.hotel)}&aff=${p.aff}`,
};
