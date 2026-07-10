"use client";

import * as React from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect;

// Count-up number. SSR/no-JS renders the final value (accessible + no flash of 0);
// on the client it counts up once when scrolled into view. Reduced motion shows the
// final value instantly. Drives textContent via a ref so there is no per-frame re-render.
export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 1.1,
  className,
}: {
  value: number;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const done = React.useRef(false);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduced = useReducedMotion();

  const fmt = React.useCallback(
    (v: number) =>
      v.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [decimals],
  );

  // Before paint, reset to 0 so the count-up does not flash the final value first.
  useIsoLayoutEffect(() => {
    const node = ref.current;
    if (node && !reduced && !done.current) node.textContent = fmt(0);
  }, [reduced, fmt]);

  React.useEffect(() => {
    const node = ref.current;
    if (!node || reduced || !inView || done.current) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        node.textContent = fmt(v);
      },
      onComplete: () => {
        done.current = true;
        node.textContent = fmt(value);
      },
    });
    return () => controls.stop();
  }, [inView, value, reduced, duration, fmt]);

  return (
    <span ref={ref} className={className}>
      {fmt(value)}
    </span>
  );
}
