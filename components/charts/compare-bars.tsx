"use client";

import { motion, useReducedMotion } from "motion/react";
import { idr } from "@/lib/format";
import { useLanguage } from "@/lib/language";

export interface CompareItem {
  id: string;
  label: string;
  value: number;
  color: string;
  best?: boolean;
  note?: string;
}

interface Props {
  items: CompareItem[];
  summary: string;
}

/**
 * Cross-OTA price comparison.
 *
 * The bar encodes the *premium over the cheapest source*, not the absolute price.
 * Absolute prices on a zero baseline are useless here: competing OTAs quote within
 * a few percent of each other, so every bar renders at 90–100% width and the chart
 * says nothing. The premium is still a real zero-based quantity — nothing is
 * truncated — and it answers the question the user actually has: how much extra
 * does this source cost? Absolute prices stay as direct labels on every row.
 */
export function CompareBars({ items, summary }: Props) {
  const reduce = useReducedMotion();
  const { t } = useLanguage();

  const cheapest = Math.min(...items.map((i) => i.value));
  const premiums = items.map((i) => i.value - cheapest);
  const maxPremium = Math.max(...premiums, 1);

  return (
    <div>
      <p className="sr-only">{summary}</p>
      <ul className="space-y-2.5">
        {items.map((item, idx) => {
          const premium = item.value - cheapest;
          const isCheapest = premium === 0;
          return (
            <li key={item.id}>
              <div className="mb-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 self-center rounded-sm"
                  style={{ background: item.color }}
                />
                <span className="text-sm font-medium text-foreground">{item.label}</span>
                {isCheapest && (
                  <span className="rounded-full bg-good-soft px-2 py-0.5 text-[11px] font-semibold text-good">
                    {t.compareBars.cheapestBadge}
                  </span>
                )}
                {item.note && <span className="text-xs text-subtle-fg">{item.note}</span>}
                <span className="tnum ml-auto text-sm font-semibold text-foreground">
                  {idr(item.value)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Track reserves height so the animated fill never shifts layout */}
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                  {!isCheapest && (
                    <motion.div
                      className="h-full w-full origin-left rounded-full"
                      style={{ background: item.color }}
                      initial={reduce ? { scaleX: premium / maxPremium } : { scaleX: 0 }}
                      animate={{ scaleX: premium / maxPremium }}
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { duration: 0.55, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }
                      }
                    />
                  )}
                </div>
                <span
                  className="tnum w-24 shrink-0 text-right text-xs font-medium"
                  style={{ color: isCheapest ? "var(--good)" : "var(--muted-fg)" }}
                >
                  {isCheapest ? t.home.cheapestTag : `+${idr(premium)}`}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
