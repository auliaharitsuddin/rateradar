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
import type { SourceId } from "@/lib/types";

/**
 * Full hotel detail page body. Called from both app/hotel/[id]/page.tsx (normal
 * per-request server rendering) and page.static.tsx (GitHub Pages export, which
 * pre-renders one file per hotel id at build time via generateStaticParams) —
 * the render logic is identical either way, only *when* it runs differs.
 */
export async function HotelView({ id }: { id: string }) {
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
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-subtle-fg">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="-my-2 inline-block py-2 hover:text-primary">
              Beranda
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
            <span className="flex items-center gap-0.5" aria-label={`${hotel.stars} bintang`}>
              {Array.from({ length: hotel.stars }).map((_, i) => (
                <StarIcon key={i} size={13} className="text-accent" />
              ))}
            </span>
            <span className="flex items-center gap-1">
              <MapPinIcon size={14} />
              {hotel.area}, {hotel.city}
            </span>
            <span className="tnum">
              {hotel.rating.toFixed(1)}/10 · {hotel.reviews.toLocaleString("id-ID")} ulasan
            </span>
          </div>
        </div>
        <a
          href={cheapest.deepLink}
          rel="nofollow sponsored noopener"
          target="_blank"
          className="flex h-12 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-on-primary transition-colors duration-200 hover:bg-primary-hover cursor-pointer"
        >
          Pesan di {SOURCES[cheapest.sourceId].name} · {idr(cheapest.totalPerNight)}
          <ExternalIcon size={16} />
        </a>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Termurah hari ini"
          value={idr(cheapest.totalPerNight)}
          hint={SOURCES[cheapest.sourceId].name}
          index={0}
        />
        <StatTile
          label="Rata-rata 30 hari"
          value={idr(average)}
          delta={vsAverage}
          deltaLabel="harga hari ini vs rata-rata"
          invertDelta
          index={1}
        />
        <StatTile label="Terendah tercatat" value={idr(lowest)} hint="Dalam 30 hari terakhir" index={2} />
        <StatTile label="Tertinggi tercatat" value={idr(highest)} hint="Dalam 30 hari terakhir" index={3} />
      </div>

      {/* items-start: without it the grid stretches the shorter card and leaves
          a large empty band under the chart. */}
      <div className="mt-6 grid items-start gap-4 lg:grid-cols-[1.55fr_1fr]">
        <section className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <h2 className="text-base font-semibold text-foreground">Riwayat harga 30 hari</h2>
          <p className="mt-1 mb-4 text-sm text-muted-fg">
            Harga all-in per malam untuk 1 kamar, 2 tamu. Celah pada garis berarti sumber tidak
            mengembalikan harga hari itu.
          </p>
          <TrendChart
            dates={dates}
            series={series}
            height={340}
            summary={`Riwayat harga ${hotel.name} selama 30 hari di ${series.length} OTA. Terendah ${idr(lowest)}, tertinggi ${idr(highest)}, rata-rata ${idr(average)}.`}
          />
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="text-base font-semibold text-foreground">
              Harga per OTA
            </h2>
            <p className="tnum mt-1 mb-4 text-sm text-muted-fg">
              {longDate(checkIn)} · 1 malam
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
              summary={`Perbandingan ${quotes.length} OTA untuk ${hotel.name}.`}
            />
            {dearest.totalPerNight > cheapest.totalPerNight && (
              <p className="mt-4 rounded-lg bg-good-soft px-3 py-2 text-xs font-medium text-good">
                Memilih {SOURCES[cheapest.sourceId].name} menghemat{" "}
                {idr(dearest.totalPerNight - cheapest.totalPerNight)} per malam dibanding{" "}
                {SOURCES[dearest.sourceId].name}.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
            <h2 className="text-base font-semibold text-foreground">Rincian harga</h2>
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
                    Tampil {idr(q.displayedPrice)}
                    {SOURCES[q.sourceId].taxTreatment === "exclusive"
                      ? ` + pajak & layanan ${idr(q.taxAndFees)}`
                      : " (sudah termasuk pajak)"}
                  </p>
                  <p className="mt-0.5 text-xs text-subtle-fg">
                    {q.refundable ? "Bisa dibatalkan" : "Non-refundable"}
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
