import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Custom hook to debounce a value by a specified delay (defaults to 3000ms / 3s).
 */
export function useDebounceValue<T>(value: T, delayMs: number = 3000): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delayMs]);

  return debouncedValue;
}

/**
 * Creates a debounced callback that delays invocation by delayMs (defaults to 3000ms / 3s).
 */
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number = 3000
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedFn = useCallback(
    (...args: Args) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        callbackRef.current(...args);
      }, delayMs);
    },
    [delayMs]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return debouncedFn;
}
