/** Locale-aware formatting. Fixed locale so server and client render identically. */

const IDR = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const IDR_COMPACT = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const NUM = new Intl.NumberFormat("id-ID");

export function idr(value: number): string {
  return IDR.format(Math.round(value)).replace(/\s/g, " ");
}

export function idrCompact(value: number): string {
  return `Rp${IDR_COMPACT.format(Math.round(value))}`;
}

export function num(value: number): string {
  return NUM.format(value);
}

export function pct(value: number, digits = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

const MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const DAYS_ID = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function parts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return { y, m, d, dow: date.getUTCDay() };
}

/** "05 Agu" */
export function shortDate(iso: string): string {
  const { m, d } = parts(iso);
  return `${String(d).padStart(2, "0")} ${MONTHS_ID[m - 1]}`;
}

/** "Rab, 05 Agu 2026" */
export function longDate(iso: string): string {
  const { y, m, d, dow } = parts(iso);
  return `${DAYS_ID[dow]}, ${String(d).padStart(2, "0")} ${MONTHS_ID[m - 1]} ${y}`;
}

/** "5 Agu" — compact axis tick */
export function axisDate(iso: string): string {
  const { m, d } = parts(iso);
  return `${d} ${MONTHS_ID[m - 1]}`;
}
