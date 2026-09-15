import Link from "next/link";
import { SearchForm } from "@/components/search-form";
import { ResultsList } from "@/components/results-list";
import { SOURCES } from "@/lib/sources";
import { longDate } from "@/lib/format";
import { AlertIcon, SearchIcon } from "@/components/icons";
import type { SearchResponse } from "@/lib/types";

/**
 * Pure render of the search results page. Fed by a resolved (city, dates, result)
 * tuple so it works identically whether that tuple came from a server component
 * reading `searchParams` (normal deployment) or a client component reading
 * `useSearchParams` (static export, which has no server to read query strings at
 * request time — see SearchClient).
 */
export function SearchView({
  known,
  city,
  checkIn,
  checkOut,
  guests,
  result,
}: {
  known: boolean;
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  result: SearchResponse | null;
}) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
      <SearchForm
        initialCity={known ? city : "Bali"}
        initialCheckIn={checkIn}
        initialCheckOut={checkOut}
        initialGuests={guests}
        compact
      />

      {!known || !result ? (
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
              {longDate(checkIn)} → {longDate(checkOut)} · {result.nights} malam · {guests} tamu
            </p>
          </div>

          {/* Degraded-source notice — partial results are never presented as complete */}
          {result.sourcesFailed.length > 0 && (
            <p
              role="status"
              className="mt-3 flex items-start gap-2 rounded-lg border border-border bg-warning-soft px-3 py-2 text-xs font-medium text-warning"
            >
              <AlertIcon size={15} className="mt-px shrink-0" />
              <span>
                Sumber tidak merespons:{" "}
                {result.sourcesFailed.map((id) => SOURCES[id].name).join(", ")}. Perbandingan
                ditampilkan dari sumber yang tersedia.
              </span>
            </p>
          )}

          <ResultsList offers={result.offers} nights={result.nights} city={city} />
        </>
      )}
    </div>
  );
}
