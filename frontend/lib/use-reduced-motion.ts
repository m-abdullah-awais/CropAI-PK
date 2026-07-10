"use client";

import * as React from "react";

// Tracks the user's reduced-motion preference for JS-driven animation (e.g. Recharts,
// which ignores the CSS media query). CSS animations should use the media query directly.
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}
