"use client";

import { useMemo, useState } from "react";
import { useMeasure } from "./use-measure";
import { axisDate, idrCompact, idr, longDate } from "@/lib/format";
import { TableIcon } from "@/components/icons";

export interface TrendSeries {
  id: string;
  label: string;
  color: string;
  /** Values aligned to `dates`; null marks a genuinely missing observation. */
  values: (number | null)[];
}

interface Props {
  dates: string[];
  series: TrendSeries[];
  height?: number;
  /** Screen-reader summary of the chart's headline insight. */
  summary: string;
}

const PAD = { top: 14, right: 16, bottom: 30, left: 62 };

/** "Nice" rounded step so the y axis lands on readable numbers. */
function niceScale(min: number, max: number, ticks = 4) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    const base = Number.isFinite(max) && max > 0 ? max : 1;
    return { lo: 0, hi: base * 1.2, step: (base * 1.2) / ticks };
  }
  const span = max - min;
  const rawStep = span / ticks;
  const mag = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const norm = rawStep / mag;
  const niceNorm = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10;
  const step = niceNorm * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  return { lo, hi, step };
}

export function TrendChart({ dates, series, height = 280, summary }: Props) {
  const { ref, width } = useMeasure<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const { lo, hi, step } = useMemo(() => {
    const all = series.flatMap((s) => s.values).filter((v): v is number => v !== null);
    if (all.length === 0) return { lo: 0, hi: 1, step: 0.25 };
    return niceScale(Math.min(...all), Math.max(...all));
  }, [series]);

  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = Math.max(0, height - PAD.top - PAD.bottom);

  const x = (i: number) => (dates.length <= 1 ? 0 : (i / (dates.length - 1)) * innerW);
  const y = (v: number) => (hi === lo ? innerH : innerH - ((v - lo) / (hi - lo)) * innerH);

  const ticks = useMemo(() => {
    const out: number[] = [];
    for (let v = lo; v <= hi + step * 0.5; v += step) out.push(v);
    return out;
  }, [lo, hi, step]);

  /** Break the path at gaps so a missing day is a hole, not an invented straight line. */
  function pathFor(values: (number | null)[]): string {
    let d = "";
    let pen = false;
    values.forEach((v, i) => {
      if (v === null) {
        pen = false;
        return;
      }
      const cmd = pen ? "L" : "M";
      d += `${cmd}${x(i).toFixed(1)},${y(v).toFixed(1)} `;
      pen = true;
    });
    return d.trim();
  }

  // Show at most ~6 x labels so ticks never collide on a narrow screen.
  const labelEvery = Math.max(1, Math.ceil(dates.length / (width < 480 ? 4 : 6)));

  const hasData = dates.length > 0 && series.some((s) => s.values.some((v) => v !== null));

  function handleMove(e: React.PointerEvent<SVGSVGElement>) {
    if (innerW <= 0 || dates.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left - PAD.left;
    const idx = Math.round((px / innerW) * (dates.length - 1));
    setHover(Math.min(dates.length - 1, Math.max(0, idx)));
  }

  if (!hasData) {
    return (
      <div
        className="grid place-items-center rounded-xl border border-dashed border-border bg-surface-2 text-sm text-subtle-fg"
        style={{ height }}
      >
        <div className="text-center px-4">
          <p className="font-medium text-muted-fg">Belum ada data harga</p>
          <p className="mt-1">Data muncul setelah observasi pertama terkumpul.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Legend — identity is never carried by colour alone */}
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        {series.map((s) => (
          <span key={s.id} className="flex items-center gap-1.5 text-xs font-medium text-muted-fg">
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-sm"
              style={{ background: s.color }}
            />
            {s.label}
          </span>
        ))}
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          aria-expanded={showTable}
          className="ml-auto flex h-11 cursor-pointer items-center gap-1.5 rounded-md px-3 text-xs font-medium text-subtle-fg transition-colors duration-200 hover:bg-surface-2 hover:text-foreground"
        >
          <TableIcon size={14} />
          {showTable ? "Sembunyikan tabel" : "Lihat tabel"}
        </button>
      </div>

      <div ref={ref} className="relative w-full" style={{ height }}>
        {width > 0 && (
          <svg
            width={width}
            height={height}
            role="img"
            aria-label={summary}
            className="touch-pan-y"
            onPointerMove={handleMove}
            onPointerLeave={() => setHover(null)}
          >
            <g transform={`translate(${PAD.left},${PAD.top})`}>
              {/* Recessive grid */}
              {ticks.map((t) => (
                <g key={t}>
                  <line
                    x1={0}
                    x2={innerW}
                    y1={y(t)}
                    y2={y(t)}
                    stroke="var(--grid)"
                    strokeWidth={1}
                  />
                  <text
                    x={-10}
                    y={y(t)}
                    textAnchor="end"
                    dominantBaseline="middle"
                    className="tnum"
                    fontSize={11}
                    fill="var(--axis)"
                  >
                    {idrCompact(t)}
                  </text>
                </g>
              ))}

              {/* x labels */}
              {dates.map((d, i) =>
                i % labelEvery === 0 || i === dates.length - 1 ? (
                  <text
                    key={d}
                    x={x(i)}
                    y={innerH + 20}
                    textAnchor={i === 0 ? "start" : i === dates.length - 1 ? "end" : "middle"}
                    className="tnum"
                    fontSize={11}
                    fill="var(--axis)"
                  >
                    {axisDate(d)}
                  </text>
                ) : null,
              )}

              {/* Crosshair */}
              {hover !== null && (
                <line
                  x1={x(hover)}
                  x2={x(hover)}
                  y1={0}
                  y2={innerH}
                  stroke="var(--border-strong)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
              )}

              {/* Series */}
              {series.map((s) => (
                <path
                  key={s.id}
                  d={pathFor(s.values)}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {/* Hover markers — 2px surface ring keeps overlapping dots readable */}
              {hover !== null &&
                series.map((s) => {
                  const v = s.values[hover];
                  if (v === null || v === undefined) return null;
                  return (
                    <circle
                      key={s.id}
                      cx={x(hover)}
                      cy={y(v)}
                      r={4.5}
                      fill={s.color}
                      stroke="var(--surface)"
                      strokeWidth={2}
                    />
                  );
                })}
            </g>
          </svg>
        )}

        {/* Tooltip — flips side near the right edge so it never overflows */}
        {hover !== null && width > 0 && (
          <div
            className="pointer-events-none absolute top-2 z-10 min-w-44 rounded-lg border border-border bg-surface p-3 shadow-lg"
            style={
              x(hover) + PAD.left > width / 2
                ? { right: Math.max(8, width - (x(hover) + PAD.left) + 12) }
                : { left: Math.max(8, x(hover) + PAD.left + 12) }
            }
          >
            <p className="mb-2 text-xs font-semibold text-foreground">{longDate(dates[hover])}</p>
            <ul className="space-y-1">
              {series.map((s) => {
                const v = s.values[hover];
                return (
                  <li key={s.id} className="flex items-center gap-2 text-xs">
                    <span
                      aria-hidden
                      className="h-2 w-2 shrink-0 rounded-sm"
                      style={{ background: s.color }}
                    />
                    <span className="text-muted-fg">{s.label}</span>
                    <span className="tnum ml-auto font-medium text-foreground">
                      {v === null || v === undefined ? "—" : idr(v)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Table alternative — a chart alone is not screen-reader friendly */}
      {showTable && (
        <div className="thin-scroll mt-4 max-h-72 overflow-auto rounded-lg border border-border">
          <table className="w-full text-left text-xs">
            <caption className="sr-only">{summary}</caption>
            <thead className="sticky top-0 bg-surface-2 text-muted-fg">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium">Tanggal</th>
                {series.map((s) => (
                  <th key={s.id} scope="col" className="px-3 py-2 text-right font-medium">
                    {s.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dates.map((d, i) => (
                <tr key={d} className="border-t border-border">
                  <th scope="row" className="px-3 py-1.5 font-normal text-muted-fg">
                    {axisDate(d)}
                  </th>
                  {series.map((s) => (
                    <td key={s.id} className="tnum px-3 py-1.5 text-right text-foreground">
                      {s.values[i] === null || s.values[i] === undefined ? "—" : idr(s.values[i] as number)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
