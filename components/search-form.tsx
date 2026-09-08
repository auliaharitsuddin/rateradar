"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { CalendarIcon, MapPinIcon, SearchIcon, UsersIcon } from "./icons";

const CITY_OPTIONS = ["Bali", "Jakarta", "Bandung", "Yogyakarta"];

interface Props {
  initialCity?: string;
  initialCheckIn: string;
  initialCheckOut: string;
  initialGuests?: number;
  /** Compact layout for the results page header. */
  compact?: boolean;
}

export function SearchForm({
  initialCity = "Bali",
  initialCheckIn,
  initialCheckOut,
  initialGuests = 2,
  compact = false,
}: Props) {
  const router = useRouter();
  const reduce = useReducedMotion();

  const [city, setCity] = useState(initialCity);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (checkOut <= checkIn) {
      setError("Tanggal check-out harus setelah check-in.");
      return;
    }
    setError(null);
    setPending(true);
    const q = new URLSearchParams({ city, checkIn, checkOut, guests: String(guests) });
    router.push(`/search?${q.toString()}`);
  }

  const field =
    "h-12 w-full rounded-lg border border-border bg-surface pl-10 pr-3 text-sm text-foreground transition-colors duration-200 hover:border-border-strong focus:border-primary";
  const labelCls = "mb-1.5 block text-xs font-medium text-muted-fg";

  return (
    <motion.form
      onSubmit={submit}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl border border-border bg-surface p-4 shadow-md ${compact ? "" : "sm:p-5"}`}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_0.9fr_auto]">
        <div>
          <label htmlFor="city" className={labelCls}>
            Kota tujuan
          </label>
          <div className="relative">
            <MapPinIcon
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle-fg"
            />
            <select
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={`${field} cursor-pointer appearance-none pr-8`}
            >
              {CITY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="checkIn" className={labelCls}>
            Check-in
          </label>
          <div className="relative">
            <CalendarIcon
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle-fg"
            />
            <input
              id="checkIn"
              type="date"
              value={checkIn}
              onChange={(e) => {
                setCheckIn(e.target.value);
                if (checkOut <= e.target.value) {
                  const d = new Date(`${e.target.value}T00:00:00Z`);
                  d.setUTCDate(d.getUTCDate() + 1);
                  setCheckOut(d.toISOString().slice(0, 10));
                }
              }}
              className={`${field} cursor-pointer`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="checkOut" className={labelCls}>
            Check-out
          </label>
          <div className="relative">
            <CalendarIcon
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle-fg"
            />
            <input
              id="checkOut"
              type="date"
              value={checkOut}
              min={checkIn}
              onChange={(e) => setCheckOut(e.target.value)}
              className={`${field} cursor-pointer`}
              aria-describedby={error ? "date-error" : undefined}
              aria-invalid={error ? true : undefined}
            />
          </div>
        </div>

        <div>
          <label htmlFor="guests" className={labelCls}>
            Tamu
          </label>
          <div className="relative">
            <UsersIcon
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle-fg"
            />
            <select
              id="guests"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className={`${field} cursor-pointer appearance-none pr-8`}
            >
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <option key={g} value={g}>
                  {g} tamu
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-on-primary transition-colors duration-200 hover:bg-primary-hover disabled:opacity-60 lg:w-auto cursor-pointer"
          >
            {pending ? (
              <>
                <span
                  aria-hidden
                  className="h-4 w-4 animate-spin rounded-full border-2 border-on-primary/40 border-t-on-primary"
                />
                Mencari…
              </>
            ) : (
              <>
                <SearchIcon size={18} />
                Bandingkan
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error sits next to the field it belongs to, announced to screen readers */}
      {error && (
        <p id="date-error" role="alert" className="mt-3 text-sm font-medium text-critical">
          {error}
        </p>
      )}
    </motion.form>
  );
}
