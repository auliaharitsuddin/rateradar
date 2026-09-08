import Link from "next/link";
import { SearchForm } from "@/components/search-form";
import { ResultsList } from "@/components/results-list";
import { defaultDates, resolveCitySlug, searchHotels } from "@/lib/query";
import { SOURCES } from "@/lib/sources";
import { longDate } from "@/lib/format";
import { AlertIcon, SearchIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const fallback = defaultDates();

  const city = first(sp.city) ?? "Bali";
  const rawIn = first(sp.checkIn);
  const rawOut = first(sp.checkOut);
  const checkIn = rawIn && ISO.test(rawIn) ? rawIn : fallback.checkIn;
  const checkOutCandidate = rawOut && ISO.test(rawOut) ? rawOut : fallback.checkOut;
  // Guard against an out-of-order range arriving via a hand-edited URL.
  const checkOut = checkOutCandidate > checkIn ? checkOutCandidate : fallback.checkOut > checkIn ? fallback.checkOut : checkIn;

  const guestsRaw = Number(first(sp.guests) ?? 2);
  const guests = Number.isInteger(guestsRaw) && guestsRaw >= 1 && guestsRaw <= 6 ? guestsRaw : 2;

  const known = resolveCitySlug(city);
  const result = known
    ? searchHotels({ city, checkIn, checkOut, guests, rooms: 1 })
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <SearchForm
        initialCity={known ? city : "Bali"}
        initialCheckIn={checkIn}
        initialCheckOut={checkOut}
        initialGuests={guests}
        compact
      />

      {!known ? (
        <div className="mt-10 rounded-2xl border border-border bg-surface p-8 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-surface-2 text-subtle-fg">
            <SearchIcon size={22} />
          </span>
          <h1 className="mt-4 text-lg font-semibold text-foreground">
            Kota &ldquo;{city}&rdquo; belum dipantau
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-fg">
            Saat ini RateRadar memantau Bali, Jakarta, Bandung, dan Yogyakarta. Pilih salah satu di
            atas untuk melihat perbandingan harga.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-hover cursor-pointer"
          >
            Kembali ke beranda
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Hotel di {city}
            </h1>
            <p className="tnum text-sm text-subtle-fg">
              {longDate(checkIn)} → {longDate(checkOut)} · {result!.nights} malam · {guests} tamu
            </p>
          </div>

          {/* Degraded-source notice — partial results are never presented as complete */}
          {result!.sourcesFailed.length > 0 && (
            <p
              role="status"
              className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-warning-soft px-3 py-2 text-xs font-medium text-warning"
            >
              <AlertIcon size={15} className="mt-px shrink-0" />
              <span>
                Sumber tidak merespons:{" "}
                {result!.sourcesFailed.map((id) => SOURCES[id].name).join(", ")}. Perbandingan
                ditampilkan dari sumber yang tersedia.
              </span>
            </p>
          )}

          <ResultsList
            offers={result!.offers}
            nights={result!.nights}
            city={city}
          />
        </>
      )}
    </div>
  );
}
