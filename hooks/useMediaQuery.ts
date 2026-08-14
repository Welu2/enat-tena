"use client";

import { useEffect, useState } from "react";

/**
 * Tracks a CSS media query, e.g. `useMediaQuery("(min-width: 768px)")`.
 * Returns `false` during SSR to avoid hydration mismatches.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
