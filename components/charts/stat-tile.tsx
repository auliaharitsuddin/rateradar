"use client";

import { motion, useReducedMotion } from "motion/react";
import { pct } from "@/lib/format";
import { TrendDownIcon, TrendUpIcon } from "@/components/icons";

interface Props {
  label: string;
  value: string;
  delta?: number;
  /** What the delta is measured against — never assume "previous period". */
  deltaLabel?: string;
  /** Deltas are percentages by default; counts render as absolute numbers. */
  deltaUnit?: "percent" | "count";
  /** For most metrics up is good; for parity breaches up is bad. */
  invertDelta?: boolean;
  hint?: string;
  index?: number;
}

/**
 * A single headline number. No plot, so no hover layer — the value is the chart.
 * Direction is carried by an icon and a sign, never by colour alone.
 */
export function StatTile({
  label,
  value,
  delta,
  deltaLabel = "vs periode lalu",
  deltaUnit = "percent",
  invertDelta = false,
  hint,
  index = 0,
}: Props) {
  const reduce = useReducedMotion();
  const up = (delta ?? 0) >= 0;
  const good = invertDelta ? !up : up;
  const Icon = up ? TrendUpIcon : TrendDownIcon;
  const deltaText =
    delta === undefined
      ? ""
      : deltaUnit === "count"
        ? `${delta >= 0 ? "+" : "−"}${Math.abs(delta)}`
        : pct(delta);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reduce ? { duration: 0 } : { duration: 0.4, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-xl border border-border bg-surface p-4"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-subtle-fg">{label}</p>
      <p className="tnum mt-2 text-2xl font-semibold leading-tight text-foreground sm:text-[1.75rem]">
        {value}
      </p>
      {delta !== undefined && (
        <p
          className="mt-1.5 flex items-center gap-1 text-xs font-medium"
          style={{ color: good ? "var(--good)" : "var(--critical)" }}
        >
          <Icon size={14} />
          <span className="tnum">{deltaText}</span>
          <span className="font-normal text-subtle-fg">{deltaLabel}</span>
        </p>
      )}
      {hint && <p className="mt-1.5 text-xs text-subtle-fg">{hint}</p>}
    </motion.div>
  );
}
