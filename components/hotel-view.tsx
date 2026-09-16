"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { TrendChart, type TrendSeries } from "@/components/charts/trend-chart";
import { CompareBars } from "@/components/charts/compare-bars";
import { StatTile } from "@/components/charts/stat-tile";
import { defaultDates, findHotel, priceHistory, todayIso } from "@/lib/query";
import { quoteFor, coveringSources } from "@/lib/pricing";
import { SOURCES, seriesVar } from "@/lib/sources";
import { idr, longDate } from "@/lib/format";
import { ExternalIcon, MapPinIcon, StarIcon } from "@/components/icons";
import { useLanguage } from "@/lib/language";
import type { SourceId } from "@/lib/types";

/**
 * Full hotel detail page body. Called from both app/hotel/[id]/page.tsx (normal
 * per-request server rendering) and page.static.tsx (GitHub Pages export, which
 * pre-renders one file per hotel id at build time via generateStaticParams) —
 * the render logic is identical either way, only *when* it runs differs.
 */
export function HotelView({ id }: { id: string }) {
  const { t } = useLanguage();
  const hotel = findHotel(id);
  if (!hotel) notFound();

  const { checkIn, checkOut } = defaultDates();
  const today = todayIso();
  const history = priceHistory(id, 30);
  const sources = coveringSources(hotel);

  const quotes = sources
    .map((sid) => quoteFor(hotel, sid, checkIn, checkOut, 2, today))
    .sort((a, b) => a.totalPerNight - b.totalPerNight);
  const cheapest = quotes[0];
  const dearest = quotes[quotes.length - 1];

  const dates = history.map((p) => p.date);
  const series: TrendSeries[] = sources.map((sid) => ({
    id: sid,
    label: SOURCES[sid].name,
    color: seriesVar(sid),
    values: history.map((p) => p.bySource[sid as SourceId] ?? null),
  }));

  const allValues = history.flatMap((p) =>
    Object.values(p.bySource).filter((v): v is number => typeof v === "number"),
  );
  const lowest = allValues.length ? Math.min(...allValues) : 0;
  const highest = allValues.length ? Math.max(...allValues) : 0;
  const average = allValues.length
    ? Math.round(allValues.reduce((a, b) => a + b, 0) / allValues.length)
    : 0;
  const vsAverage = average ? ((cheapest.totalPerNight - average) / average) * 100 : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <nav aria-label={t.hotelView.breadcrumbAria} className="mb-4 text-sm text-subtle-fg">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="-my-2 inline-block py-2 hover:text-primary">
              {t.hotelView.home}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link
              href={`/search?city=${hotel.city}`}
              className="-my-2 inline-block py-2 hover:text-primary"
            >
              {hotel.city}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="font-medium text-muted-fg">{hotel.name}</li>
        </ol>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {hotel.name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-subtle-fg">
            <span className="flex items-center gap-0.5" aria-label={t.hotelView.starsAria(hotel.stars)}>
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <StarIcon key={i} size={13} className="text-accent" />
              ))}
            </span>
            <span className="flex items-center gap-1">
              <MapPinIcon size={14} />
              {hotel.area}, {hotel.city}
            </span>
            <span className="tnum">
              {t.hotelView.ratingReviews(hotel.rating.toFixed(1), hotel.reviews.toLocaleString("id-ID"))}
            </span>
          </div>
        </div>
        <a
          href={cheapest.deepLink}
          rel="nofollow sponsored noopener"
          target="_blank"
          className="flex h-12 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-on-primary transition-colors duration-200 hover:bg-primary-hover cursor-pointer"
        >
          {t.hotelView.bookAt(SOURCES[cheapest.sourceId].name, idr(cheapest.totalPerNight))}
          <ExternalIcon size={16} />
        </a>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label={t.hotelView.statCheapestToday}
          value={idr(cheapest.totalPerNight)}
          hint={SOURCES[cheapest.sourceId].name}
          index={0}
        />
        <StatTile
          label={t.hotelView.statAvg30}
          value={idr(average)}
          delta={vsAverage}
          deltaLabel={t.hotelView.statAvgDeltaLabel}
          invertDelta
          index={1}
        />
        <StatTile label={t.hotelView.statLowest} value={idr(lowest)} hint={t.hotelView.last30Days} index={2} />
        <StatTile label={t.hotelView.statHighest} value={idr(highest)} hint={t.hotelView.last30Days} index={3} />
      </div>

      {/* items-start: without it the grid stretches the shorter card and leaves
          a large empty band under the chart. */}
      <div className="mt-6 grid items-start gap-4 lg:grid-cols-[1.55fr_1fr]">
        <section className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <h2 className="text-base font-semibold text-foreground">{t.hotelView.priceHistory30}</h2>
          <p className="mt-1 mb-4 text-sm text-muted-fg">
            {t.hotelView.priceHistoryBody}
          </p>
          <TrendChart
            dates={dates}
            series={series}
            height={340}
            summary={t.hotelView.chartSummary(hotel.name, series.length, idr(lowest), idr(highest), idr(average))}
          />
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="text-base font-semibold text-foreground">
              {t.hotelView.pricePerOta}
            </h2>
            <p className="tnum mt-1 mb-4 text-sm text-muted-fg">
              {t.hotelView.oneNight(longDate(checkIn))}
            </p>
            <CompareBars
              items={quotes.map((q) => ({
                id: q.sourceId,
                label: SOURCES[q.sourceId].name,
                value: q.totalPerNight,
                color: seriesVar(q.sourceId),
                best: q.sourceId === cheapest.sourceId,
                note: q.promoLabel ?? undefined,
              }))}
              summary={t.hotelView.compareSummary(quotes.length, hotel.name)}
            />
            {dearest.totalPerNight > cheapest.totalPerNight && (
              <p className="mt-4 rounded-lg bg-good-soft px-3 py-2 text-xs font-medium text-good">
                {t.hotelView.chooseSaves(
                  SOURCES[cheapest.sourceId].name,
                  idr(dearest.totalPerNight - cheapest.totalPerNight),
                  SOURCES[dearest.sourceId].name,
                )}
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="text-base font-semibold text-foreground">{t.hotelView.priceBreakdown}</h2>
            <ul className="mt-3 space-y-2.5">
              {quotes.map((q) => (
                <li key={q.sourceId} className="border-b border-border pb-2.5 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 rounded-sm"
                        style={{ background: seriesVar(q.sourceId) }}
                      />
                      {SOURCES[q.sourceId].name}
                    </span>
                    <span className="tnum text-sm font-semibold text-foreground">
                      {idr(q.totalPerNight)}
                    </span>
                  </div>
                  <p className="tnum mt-1 text-xs text-subtle-fg">
                    {t.hotelView.displayed(idr(q.displayedPrice))}
                    {SOURCES[q.sourceId].taxTreatment === "exclusive"
                      ? t.hotelView.plusTax(idr(q.taxAndFees))
                      : t.hotelView.taxIncluded}
                  </p>
                  <p className="mt-0.5 text-xs text-subtle-fg">
                    {q.refundable ? t.hotelView.refundable : t.hotelView.nonRefundable}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
