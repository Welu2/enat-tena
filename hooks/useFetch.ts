"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

interface UseFetchReturn<T> extends UseFetchState<T> {
  refetch: () => void;
}

/**
 * Generic data-fetching hook with loading, error, and data states.
 *
 * @param fetcher - Async function returning the data
 * @param deps   - Dependency array to re-trigger the fetch (default: runs once)
 */
export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: React.DependencyList = []
): UseFetchReturn<T> {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  // Track latest fetcher to avoid stale closures
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const execute = useCallback(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    fetcherRef
      .current()
      .then((data) => {
        if (!cancelled) setState({ data, isLoading: false, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : "An error occurred";
          setState({ data: null, isLoading: false, error: message });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const cleanup = execute();
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { ...state, refetch: execute };
}
