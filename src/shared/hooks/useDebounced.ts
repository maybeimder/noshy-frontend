import { useEffect, useState } from "react";

/** Value that only updates after `delay` ms without changes (search-as-you-type). */
export function useDebounced<T>(value: T, delay = 300) {
      const [debounced, setDebounced] = useState(value);
      useEffect(() => {
            const timer = setTimeout(() => setDebounced(value), delay);
            return () => clearTimeout(timer);
      }, [value, delay]);
      return debounced;
}
