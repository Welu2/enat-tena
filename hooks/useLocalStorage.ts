"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Type-safe localStorage hook with SSR safety.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const item = localStorage.getItem(key);
      if (item !== null) {
        setStoredValue(JSON.parse(item) as T);
      }
    } catch {
      // localStorage unavailable or parse error — keep initial value
    }
  }, [key]);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const nextValue = value instanceof Function ? value(prev) : value;
        try {
          localStorage.setItem(key, JSON.stringify(nextValue));
        } catch {
          // quota exceeded or unavailable
        }
        return nextValue;
      });
    },
    [key]
  );

  return [storedValue, setValue];
}
