import { StatTile } from "@/components/charts/stat-tile";
import { TrendChart, type TrendSeries } from "@/components/charts/trend-chart";
import { CompetitorTable } from "@/components/competitor-table";
import { PropertyPicker } from "@/components/property-picker";
import { proSummary } from "@/lib/query";
import { HOTELS } from "@/lib/seed";
import { SOURCES, seriesVar } from "@/lib/sources";
import { idr, longDate, pct } from "@/lib/format";
import { AlertIcon, CheckIcon, ShieldIcon } from "@/components/icons";
import type { SourceId } from "@/lib/types";

export const dynamic = "force-dynamic";

const DEFAULT_ID = "bali-1";

export default async function ProPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = Array.isArray(sp.id) ? sp.id[0] : sp.id;
  const id = raw && HOTELS.some((h) => h.id === raw) ? raw : DEFAULT_ID;

  const data = proSummary(id, 30);
  if (!data) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-lg font-semibold text-foreground">Properti tidak ditemukan</h1>
      </div>
    );
  }

  const dates = data.series.map((p) => p.date);
  const activeSources = Array.from(
    new Set(data.series.flatMap((p) => Object.keys(p.bySource))),
  ) as SourceId[];

  const series: TrendSeries[] = activeSources.map((sid) => ({
    id: sid,
    label: SOURCES[sid].name,
    color: seriesVar(sid),
    values: data.series.map((p) => p.bySource[sid] ?? null),
  }));

  const critical = data.issues.filter((i) => i.severity === "critical").length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            RateRadar Pro
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {data.propertyName}
          </h1>
          <p className="mt-1 text-sm text-subtle-fg">
            {data.city} · rate intelligence 30 hari terakhir
          </p>
        </div>
        <PropertyPicker hotels={HOTELS} current={id} />
      </header>

      {/* KPI row */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="ADR properti Anda"
          value={idr(data.adr)}
          delta={data.adrDelta}
          deltaLabel={`paruh akhir vs awal ${data.windowDays} hari`}
          hint="Rata-rata harga harian"
          index={0}
        />
        <StatTile
          label={`ADR pasar (${data.windowDays} hari)`}
          value={idr(data.marketAdr)}
          delta={data.vsMarketPct}
          deltaLabel="posisi Anda vs pasar"
          hint={`Median ${data.competitors.length} kompetitor ${data.stars}★ sekitar`}
          index={1}
        />
        <StatTile
          label="Peringkat harga"
          value={`#${data.rank} dari ${data.rankTotal}`}
          hint="1 = termurah di competitive set"
          index={2}
        />
        <StatTile
          label="Pelanggaran parity"
          value={String(data.parityIssues)}
          delta={data.parityIssuesDelta}
          deltaUnit="count"
          deltaLabel="vs 14 hari sebelumnya"
          invertDelta
          hint={critical > 0 ? `${critical} berstatus kritis` : "Tidak ada yang kritis"}
          index={3}
        />
      </div>

      {/* Trend */}
      <section className="mt-6 min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-base font-semibold text-foreground">
            Harga kamar Anda di tiap OTA
          </h2>
          <p className="tnum text-xs text-subtle-fg">
            {dates.length > 0 && `${longDate(dates[0])} → ${longDate(dates[dates.length - 1])}`}
          </p>
        </div>
        <p className="mb-4 text-sm text-muted-fg">
          Garis yang menyimpang ke bawah menandakan sebuah OTA menjual di bawah harga dasar Anda.
        </p>
        <TrendChart
          dates={dates}
          series={series}
          height={300}
          summary={`Harga ${data.propertyName} selama 30 hari di ${series.length} OTA. ADR ${idr(data.adr)}, ${data.parityIssues} pelanggaran rate parity terdeteksi.`}
        />
      </section>

      {/* The table needs the full content width: at lg it was sharing a row with the
          parity panel and its last column fell outside the visible area. */}
      <div className="mt-6 space-y-4">
        {/* Competitive set */}
        <section className="min-w-0 rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <h2 className="text-base font-semibold text-foreground">Competitive set</h2>
          <p className="mt-1 mb-4 text-sm text-muted-fg">
            ADR {data.windowDays} hari untuk kompetitor {data.stars}★ terdekat — basis waktu yang
            sama dengan ADR Anda. Median dihitung dari OTA yang memuat properti tersebut.
          </p>
          <CompetitorTable rows={data.competitors} propertyName={data.propertyName} adr={data.adr} />
        </section>

        {/* Parity monitor */}
        <section className="rounded-2xl border border-border bg-surface p-4 sm:p-5">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <ShieldIcon size={17} />
            </span>
            <h2 className="text-base font-semibold text-foreground">Rate parity</h2>
          </div>
          <p className="mt-2 text-sm text-muted-fg">
            OTA yang menjual di bawah harga dasar{" "}
            <span className="tnum font-medium text-foreground">{idr(data.floorRate)}</span>.
          </p>

          {data.issues.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-border bg-good-soft/40 px-4 py-6 text-center">
              <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-good-soft text-good">
                <CheckIcon size={18} />
              </span>
              <p className="mt-2 text-sm font-medium text-foreground">Parity terjaga</p>
              <p className="mt-1 text-xs text-muted-fg">
                Tidak ada OTA yang menjual di bawah harga dasar dalam 14 hari terakhir.
              </p>
            </div>
          ) : (
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
              {data.issues.map((issue) => (
                <li
                  key={issue.id}
                  className="rounded-lg border p-3"
                  style={{
                    borderColor: issue.severity === "critical" ? "var(--critical)" : "var(--border)",
                    background:
                      issue.severity === "critical" ? "var(--critical-soft)" : "var(--warning-soft)",
                  }}
                >
                  <div className="flex items-start gap-2">
                    <AlertIcon
                      size={15}
                      className="mt-0.5 shrink-0"
                      style={{
                        color:
                          issue.severity === "critical" ? "var(--critical)" : "var(--warning)",
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-baseline gap-x-2 text-sm font-semibold text-foreground">
                        {SOURCES[issue.sourceId].name}
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-bold uppercase"
                          style={{
                            color:
                              issue.severity === "critical" ? "var(--critical)" : "var(--warning)",
                          }}
                        >
                          {issue.severity === "critical" ? "Kritis" : "Perhatian"}
                        </span>
                      </p>
                      <p className="tnum mt-0.5 text-xs text-muted-fg">
                        {longDate(issue.date)} · jual {idr(issue.observedRate)} ({pct(-issue.gapPct)})
                      </p>
                    </div>
                    <span className="tnum shrink-0 text-sm font-bold text-foreground">
                      −{idr(issue.gap)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
