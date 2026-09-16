"use client";

import { useMemo, useState } from "react";
import type { CompetitorRow, SourceId } from "@/lib/types";
import { SOURCE_LIST, seriesVar } from "@/lib/sources";
import { idr } from "@/lib/format";
import { useLanguage } from "@/lib/language";

type SortKey = "name" | "distanceKm" | "median" | "vsYou";
type Dir = "asc" | "desc";

export function CompetitorTable({
  rows,
  propertyName,
  adr,
}: {
  rows: CompetitorRow[];
  propertyName: string;
  adr: number;
}) {
  const { t } = useLanguage();
  const [key, setKey] = useState<SortKey>("distanceKm");
  const [dir, setDir] = useState<Dir>("asc");

  const sorted = useMemo(() => {
    const out = [...rows];
    out.sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      const cmp = typeof av === "string" ? av.localeCompare(String(bv)) : Number(av) - Number(bv);
      return dir === "asc" ? cmp : -cmp;
    });
    return out;
  }, [rows, key, dir]);

  function toggle(next: SortKey) {
    if (next === key) {
      setDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setKey(next);
      setDir(next === "name" ? "asc" : "desc");
    }
  }

  function ariaSort(col: SortKey): "ascending" | "descending" | "none" {
    if (col !== key) return "none";
    return dir === "asc" ? "ascending" : "descending";
  }

  const th = "whitespace-nowrap px-3 text-left text-xs font-semibold text-muted-fg";
  // The button fills the header cell so the sort control is a full-height target
  // rather than just the text line box.
  const sortBtn =
    "flex h-11 w-full cursor-pointer items-center gap-1 hover:text-foreground";

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-surface-2 px-4 py-8 text-center text-sm text-subtle-fg">
        {t.competitorTable.empty}
      </p>
    );
  }

  return (
    // The table is the one element allowed to scroll sideways — inside its own container
    <div className="thin-scroll -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[46rem] border-collapse text-sm">
        <caption className="sr-only">
          {t.competitorTable.caption(propertyName, idr(adr))}
        </caption>
        <thead>
          <tr className="border-b border-border">
            <th scope="col" className={th} aria-sort={ariaSort("name")}>
              <button type="button" onClick={() => toggle("name")} className={sortBtn}>
                {t.competitorTable.colProperty}
              </button>
            </th>
            <th scope="col" className={`${th} text-right`} aria-sort={ariaSort("distanceKm")}>
              <button type="button" onClick={() => toggle("distanceKm")} className={`${sortBtn} ml-auto`}>
                {t.competitorTable.colDistance}
              </button>
            </th>
            {SOURCE_LIST.map((s) => (
              <th key={s.id} scope="col" className={`${th} py-2.5 text-right`}>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-sm"
                    style={{ background: seriesVar(s.id) }}
                  />
                  {s.name}
                </span>
              </th>
            ))}
            <th scope="col" className={`${th} text-right`} aria-sort={ariaSort("median")}>
              <button type="button" onClick={() => toggle("median")} className={`${sortBtn} ml-auto`}>
                {t.competitorTable.colMedian}
              </button>
            </th>
            <th scope="col" className={`${th} text-right`} aria-sort={ariaSort("vsYou")}>
              <button type="button" onClick={() => toggle("vsYou")} className={`${sortBtn} ml-auto`}>
                {t.competitorTable.colVsYou}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {/* The property's own row, pinned for reference */}
          <tr className="border-b border-border bg-primary/5">
            <th
              scope="row"
              className="whitespace-nowrap px-3 py-2.5 text-left text-sm font-semibold text-primary"
            >
              {propertyName}
              <span className="ml-2 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-on-primary">
                {t.competitorTable.youTag}
              </span>
            </th>
            <td className="tnum px-3 py-2.5 text-right text-subtle-fg">—</td>
            {SOURCE_LIST.map((s) => (
              <td key={s.id} className="tnum px-3 py-2.5 text-right text-subtle-fg">
                —
              </td>
            ))}
            <td className="tnum px-3 py-2.5 text-right font-semibold text-foreground">{idr(adr)}</td>
            <td className="tnum px-3 py-2.5 text-right text-subtle-fg">—</td>
          </tr>

          {sorted.map((row) => (
            <tr key={row.hotelId} className="border-b border-border last:border-0 hover:bg-surface-2">
              <th
                scope="row"
                className="whitespace-nowrap px-3 py-2.5 text-left text-sm font-medium text-foreground"
              >
                {row.name}
                <span className="tnum ml-2 text-xs font-normal text-subtle-fg">{row.stars}★</span>
              </th>
              <td className="tnum px-3 py-2.5 text-right text-muted-fg">{t.competitorTable.km(row.distanceKm)}</td>
              {SOURCE_LIST.map((s) => {
                const v = row.rates[s.id as SourceId];
                return (
                  <td key={s.id} className="tnum px-3 py-2.5 text-right text-muted-fg">
                    {v ? idr(v) : <span className="text-subtle-fg">—</span>}
                  </td>
                );
              })}
              <td className="tnum px-3 py-2.5 text-right font-semibold text-foreground">
                {idr(row.median)}
              </td>
              <td className="tnum px-3 py-2.5 text-right font-medium">
                <span style={{ color: row.vsYou >= 0 ? "var(--good)" : "var(--critical)" }}>
                  {row.vsYou >= 0 ? "+" : "−"}
                  {idr(Math.abs(row.vsYou)).replace("Rp", "Rp ").trim()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
