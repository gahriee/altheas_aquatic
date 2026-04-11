import { useState, useEffect } from 'react';

/**
 * ----------------------------------------
 * useDebounce
 * ----------------------------------------
 * A hook that delays updating a value until a specified amount of time 
 * has passed since the last change. Useful for search filtering.
 */
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}
