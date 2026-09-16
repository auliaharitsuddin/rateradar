"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import type { HotelOffer } from "@/lib/types";
import { SOURCES, seriesVar } from "@/lib/sources";
import { idr } from "@/lib/format";
import { CompareBars } from "./charts/compare-bars";
import { ExternalIcon, MapPinIcon, StarIcon } from "./icons";
import { useLanguage } from "@/lib/language";

/** Deterministic gradient stand-in — no network request, no layout shift, no broken image. */
const GRADIENTS = [
  "linear-gradient(135deg,#1e3a8a,#0d9488)",
  "linear-gradient(135deg,#0f766e,#2563eb)",
  "linear-gradient(135deg,#7c3aed,#2563eb)",
  "linear-gradient(135deg,#b45309,#7c2d12)",
  "linear-gradient(135deg,#0369a1,#0d9488)",
  "linear-gradient(135deg,#1e40af,#6d28d9)",
];

export function HotelCard({ offer, nights, index }: { offer: HotelOffer; nights: number; index: number }) {
  const reduce = useReducedMotion();
  const { t } = useLanguage();
  const { hotel, quotes, cheapest, spread } = offer;
  const gradient = GRADIENTS[Number(hotel.image.split("-")[1] ?? 1) - 1] ?? GRADIENTS[0];

  const items = quotes.map((q) => ({
    id: q.sourceId,
    label: SOURCES[q.sourceId].name,
    value: q.totalPerNight,
    color: seriesVar(q.sourceId),
    best: q.sourceId === cheapest.sourceId,
    note: q.promoLabel ?? undefined,
  }));

  return (
    <motion.article
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.45, delay: Math.min(index, 6) * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      <div className="grid lg:grid-cols-[220px_1fr_260px]">
        {/* Media — aspect ratio reserved so nothing reflows */}
        <div
          className="relative aspect-[16/10] w-full lg:aspect-auto lg:h-full lg:min-h-52"
          style={{ background: gradient }}
          aria-hidden
        >
          <span className="absolute left-3 top-3 rounded-md bg-black/45 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
            {hotel.area.split(",")[0]}
          </span>
        </div>

        {/* Identity */}
        <div className="min-w-0 border-border p-4 lg:border-r">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-base font-semibold leading-snug text-foreground">
              {/* Padding + matching negative margin gives a 44px hit area without
                  moving anything on the page. */}
              <Link
                href={`/hotel/${hotel.id}`}
                className="-my-3 inline-block py-3 hover:text-primary"
              >
                {hotel.name}
              </Link>
            </h3>
            <span className="shrink-0 rounded-lg bg-primary px-2 py-1 text-xs font-bold text-on-primary tnum">
              {hotel.rating.toFixed(1)}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-subtle-fg">
            <span className="flex items-center gap-1" aria-label={t.hotelCard.starsAria(hotel.stars)}>
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <StarIcon key={i} size={12} className="text-accent" />
              ))}
            </span>
            <span className="flex items-center gap-1">
              <MapPinIcon size={13} />
              {hotel.area}
            </span>
            <span className="tnum">{t.hotelCard.reviews(hotel.reviews.toLocaleString("id-ID"))}</span>
          </div>

          <ul className="mt-2.5 flex flex-wrap gap-1.5">
            {hotel.amenities.slice(0, 4).map((a) => (
              <li
                key={a}
                className="rounded-md bg-surface-2 px-2 py-0.5 text-[11px] font-medium text-muted-fg"
              >
                {a}
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <p className="mb-2 text-xs font-medium text-muted-fg">
              {t.hotelCard.priceHeader(quotes.length)}
            </p>
            <CompareBars
              items={items}
              summary={t.hotelCard.compareSummary(
                hotel.name,
                quotes.length,
                SOURCES[cheapest.sourceId].name,
                idr(cheapest.totalPerNight),
              )}
            />
          </div>
        </div>

        {/* Conversion column */}
        <div className="flex flex-col justify-center gap-2 border-t border-border bg-surface-2/50 p-4 lg:border-t-0">
          {spread > 0 && (
            <p className="text-xs font-semibold text-good">
              {t.hotelCard.saveVs(idr(spread))}
            </p>
          )}
          <p className="text-xs text-subtle-fg">{t.hotelCard.cheapestAt(SOURCES[cheapest.sourceId].name)}</p>
          <p className="tnum text-2xl font-bold leading-tight text-foreground">
            {idr(cheapest.totalPerNight)}
          </p>
          <p className="tnum text-xs text-subtle-fg">
            {t.hotelCard.total(idr(cheapest.totalPerNight * nights), nights)}
          </p>

          <a
            href={cheapest.deepLink}
            rel="nofollow sponsored noopener"
            target="_blank"
            className="mt-1 flex h-11 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary transition-colors duration-200 hover:bg-primary-hover cursor-pointer"
          >
            {t.hotelCard.viewAt(SOURCES[cheapest.sourceId].name)}
            <ExternalIcon size={15} />
          </a>
          <Link
            href={`/hotel/${hotel.id}`}
            className="flex h-11 items-center justify-center rounded-lg border border-border-strong px-4 text-sm font-medium text-foreground transition-colors duration-200 hover:bg-surface-2 cursor-pointer"
          >
            {t.hotelCard.priceHistory}
          </Link>
          {cheapest.roomsLeft !== null && (
            <p className="text-center text-[11px] font-medium text-warning">
              {t.hotelCard.roomsLeft(cheapest.roomsLeft)}
            </p>
          )}
        </div>
      </div>
    </motion.article>
  );
}
