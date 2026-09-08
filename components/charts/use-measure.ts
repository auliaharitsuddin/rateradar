"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Measures a container so charts render at real pixel sizes rather than being
 * scaled by a viewBox — text stays crisp and axis ticks keep a readable size at
 * every breakpoint. Height is reserved by the caller so there is no layout shift.
 */
export function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set the initial width synchronously after mount.
    setWidth(el.clientWidth);

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = entry.contentRect.width;
        setWidth((prev) => (Math.abs(prev - w) > 0.5 ? w : prev));
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, width };
}
