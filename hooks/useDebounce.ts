"use client";

import { useEffect, useState } from "react";

/**
 * Debounces a value by the specified delay (ms).
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
