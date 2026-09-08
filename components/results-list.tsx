"use client";

import { useMemo, useState } from "react";
import type { HotelOffer } from "@/lib/types";
import { HotelCard } from "./hotel-card";
import { SearchIcon } from "./icons";

type SortKey = "cheapest" | "savings" | "rating";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "cheapest", label: "Harga termurah" },
  { key: "savings", label: "Selisih terbesar" },
  { key: "rating", label: "Rating tertinggi" },
];

const STAR_FILTERS = [0, 3, 4, 5];

export function ResultsList({
  offers,
  nights,
  city,
}: {
  offers: HotelOffer[];
  nights: number;
  city: string;
}) {
  const [sort, setSort] = useState<SortKey>("cheapest");
  const [minStars, setMinStars] = useState(0);

  const visible = useMemo(() => {
    const filtered = offers.filter((o) => o.hotel.stars >= minStars);
    const sorted = [...filtered];
    if (sort === "cheapest") sorted.sort((a, b) => a.cheapest.totalPerNight - b.cheapest.totalPerNight);
    if (sort === "savings") sorted.sort((a, b) => b.spread - a.spread);
    if (sort === "rating") sorted.sort((a, b) => b.hotel.rating - a.hotel.rating);
    return sorted;
  }, [offers, sort, minStars]);

  return (
    <>
      {/* Filters in one row above the results */}
      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-border bg-surface px-4 py-3">
        <p className="tnum text-sm font-medium text-foreground">
          {visible.length} properti
          {minStars > 0 && <span className="font-normal text-subtle-fg"> (difilter)</span>}
        </p>

        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-xs font-medium text-muted-fg">
            Urutkan
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="h-10 cursor-pointer rounded-lg border border-border bg-surface px-3 text-sm text-foreground hover:border-border-strong"
          >
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-fg">Bintang</span>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter bintang minimum">
            {STAR_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setMinStars(s)}
                aria-pressed={minStars === s}
                className={`h-10 min-w-11 rounded-lg border px-3 text-sm font-medium transition-colors duration-200 cursor-pointer ${
                  minStars === s
                    ? "border-primary bg-primary text-on-primary"
                    : "border-border text-muted-fg hover:bg-surface-2 hover:text-foreground"
                }`}
              >
                {s === 0 ? "Semua" : `${s}+`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-border bg-surface p-10 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-surface-2 text-subtle-fg">
            <SearchIcon size={22} />
          </span>
          <h2 className="mt-4 text-base font-semibold text-foreground">
            Tidak ada properti yang cocok
          </h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-fg">
            Tidak ada hotel {minStars}+ bintang di {city} untuk tanggal ini. Longgarkan filter
            bintang untuk melihat lebih banyak pilihan.
          </p>
          <button
            type="button"
            onClick={() => setMinStars(0)}
            className="mt-5 h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-on-primary hover:bg-primary-hover cursor-pointer"
          >
            Tampilkan semua bintang
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {visible.map((offer, i) => (
            <HotelCard key={offer.hotel.id} offer={offer} nights={nights} index={i} />
          ))}
        </div>
      )}
    </>
  );
}
