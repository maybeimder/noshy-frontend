import { useCallback, useSyncExternalStore } from "react";
import { userStorage } from "./storage";

// Per-user values in localStorage that every component sees update at once.
const listeners = new Set<() => void>();
const cache = new Map<string, unknown>();
const subscribe = (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
};

export function readUserValue<T>(userId: string, name: string): T | null {
      const key = `${userId}:${name}`;
      // Cached so useSyncExternalStore gets the same reference until the next write.
      if (!cache.has(key)) cache.set(key, userStorage.get<T>(userId, name));
      return cache.get(key) as T | null;
}

export function writeUserValue<T>(userId: string, name: string, value: T | null) {
      if (value === null) userStorage.remove(userId, name);
      else userStorage.set(userId, name, value);
      cache.set(`${userId}:${name}`, value);
      listeners.forEach((listener) => listener());
}

export function useUserValue<T>(userId: string, name: string) {
      const value = useSyncExternalStore(subscribe, () => readUserValue<T>(userId, name));
      const setValue = useCallback((next: T | null) => writeUserValue(userId, name, next), [userId, name]);
      return [value, setValue] as const;
}
