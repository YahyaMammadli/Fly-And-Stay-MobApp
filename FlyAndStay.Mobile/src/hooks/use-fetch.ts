import { DependencyList, useCallback, useEffect, useRef, useState } from "react";

import { getErrorMessage, isCancelled } from "@/api/client";

type State<T> = { data: T | null; loading: boolean; error: string | null };

export function useFetch<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: DependencyList, enabled = true) {
  const [state, setState] = useState<State<T>>({ data: null, loading: enabled, error: null });
  const [tick, setTick] = useState(0);
  const fetcherRef = useRef(fetcher);
  const depsKey = JSON.stringify(deps);

  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));

    fetcherRef
      .current(controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => {
        if (isCancelled(err)) return;
        setState((s) => ({ data: s.data, loading: false, error: getErrorMessage(err) }));
      });

    return () => controller.abort();
  }, [depsKey, tick, enabled]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { data: state.data, loading: state.loading, error: state.error, reload };
}
