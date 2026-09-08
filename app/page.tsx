import Link from "next/link";
import { SearchForm } from "@/components/search-form";
import { defaultDates, searchHotels } from "@/lib/query";
import { CITIES } from "@/lib/seed";
import { SOURCE_LIST, SOURCES, seriesVar } from "@/lib/sources";
import { ChartIcon, CheckIcon, RadarIcon, ShieldIcon } from "@/components/icons";
import { idr, num } from "@/lib/format";

const STEPS = [
  {
    Icon: RadarIcon,
    title: "Satu pencarian, semua OTA",
    body: "Kami menanyakan harga kamar yang sama ke Booking.com, Agoda, Traveloka dan tiket.com, lalu menyusunnya berdampingan.",
  },
  {
    Icon: ShieldIcon,
    title: "Harga all-in, bukan jebakan pajak",
    body: "Sebagian OTA memasang harga sebelum pajak dan service charge. Semua angka di sini sudah dinormalkan ke harga akhir agar adil dibandingkan.",
  },
  {
    Icon: ChartIcon,
    title: "Riwayat harga, bukan tebakan",
    body: "Setiap pencarian menambah observasi harga, sehingga Anda tahu apakah harga hari ini benar-benar murah.",
  },
];

export default function HomePage() {
  const { checkIn, checkOut } = defaultDates();

  // Live preview: the Bali offer with the widest gap between OTAs right now.
  const preview = searchHotels({ city: "Bali", checkIn, checkOut, guests: 2, rooms: 1 }).offers.sort(
    (a, b) => b.spread - a.spread,
  )[0];

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid items-start gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
              <CheckIcon size={13} />
              Data dari 4 OTA · Bali, Jakarta, Bandung, Yogyakarta
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Kamar yang sama, harga berbeda di tiap OTA.
              <span className="block text-primary">Kami tunjukkan selisihnya.</span>
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted-fg">
              RateRadar membandingkan harga akhir hotel lintas OTA lokal dan internasional.
              Kami tidak menjual kamar — Anda memesan langsung di OTA dengan harga terbaik.
            </p>

            {/* Source strip */}
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
              <span className="text-xs font-medium text-subtle-fg">Sumber harga:</span>
              {SOURCE_LIST.map((s) => (
                <span
                  key={s.id}
                  className="flex items-center gap-1.5 text-xs font-medium text-muted-fg"
                >
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ background: seriesVar(s.id) }}
                  />
                  {s.name}
                  {!s.hasPriceApi && (
                    <span className="text-[10px] font-normal text-subtle-fg">(tautan)</span>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Live preview — fills the desktop hero and makes the value proposition concrete */}
          {preview && (
            <div className="rounded-2xl border border-border bg-surface-2/60 p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-subtle-fg">
                Selisih terbesar di Bali hari ini
              </p>
              <p className="mt-2 text-sm font-semibold text-foreground">{preview.hotel.name}</p>
              <p className="text-xs text-subtle-fg">{preview.hotel.area}</p>

              <ul className="mt-4 space-y-2">
                {preview.quotes.map((q) => {
                  const premium = q.totalPerNight - preview.cheapest.totalPerNight;
                  return (
                    <li key={q.sourceId} className="flex items-center gap-2 text-sm">
                      <span
                        aria-hidden
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{ background: seriesVar(q.sourceId) }}
                      />
                      <span className="text-muted-fg">{SOURCES[q.sourceId].name}</span>
                      <span className="tnum ml-auto font-semibold text-foreground">
                        {idr(q.totalPerNight)}
                      </span>
                      <span
                        className="tnum w-20 shrink-0 text-right text-xs font-medium"
                        style={{ color: premium === 0 ? "var(--good)" : "var(--subtle-fg)" }}
                      >
                        {premium === 0 ? "termurah" : `+${idr(premium)}`}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-4 rounded-lg bg-good-soft px-3 py-2 text-xs font-semibold text-good">
                Selisih {idr(preview.spread)} per malam untuk kamar yang sama.
              </p>
            </div>
          )}
          </div>

          <div className="mt-8">
            <SearchForm initialCheckIn={checkIn} initialCheckOut={checkOut} />
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Cara kerjanya
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STEPS.map(({ Icon, title, body }) => (
            <div key={title} className="rounded-xl border border-border bg-surface p-5">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Icon size={20} />
              </span>
              <h3 className="mt-3 text-sm font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-fg">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cities */}
      <section className="mx-auto max-w-7xl px-4 pb-12 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Kota yang dipantau
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CITIES.map((c) => (
            <Link
              key={c.slug}
              href={`/search?city=${c.name}&checkIn=${checkIn}&checkOut=${checkOut}&guests=2`}
              className="group rounded-xl border border-border bg-surface p-4 transition-colors duration-200 hover:border-primary hover:bg-surface-2 cursor-pointer"
            >
              <p className="text-base font-semibold text-foreground group-hover:text-primary">
                {c.label}
              </p>
              <p className="tnum mt-1 text-xs text-subtle-fg">{num(c.properties)} properti</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Pro cross-sell */}
      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-lg font-semibold text-foreground">Punya properti sendiri?</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-fg">
              RateRadar Pro memantau harga kompetitor di sekitar Anda dan mendeteksi saat sebuah OTA
              menjual kamar Anda di bawah harga dasar — pelanggaran rate parity yang menggerus
              penjualan langsung.
            </p>
          </div>
          <Link
            href="/pro"
            className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-foreground px-6 text-sm font-semibold text-background transition-opacity duration-200 hover:opacity-90 cursor-pointer"
          >
            <ChartIcon size={18} />
            Buka RateRadar Pro
          </Link>
        </div>
      </section>
    </div>
  );
}
