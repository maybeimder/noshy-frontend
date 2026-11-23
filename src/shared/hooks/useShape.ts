import { useEffect } from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useUserValue } from "@/shared/lib/user-store";

/**
 * How a screen looked last time (how many rows, which optional blocks), so its skeleton takes the same
 * room. Only counts and flags, never content.
 */
export function useShape<T extends object>(name: string, fallback: T): T {
      const { user } = useAuth();
      const [saved] = useUserValue<Partial<T>>(user?.id ?? "anon", `shape:${name}`);
      return { ...fallback, ...saved };
}

export function useRememberShape<T extends object>(name: string, shape: T | null) {
      const { user } = useAuth();
      const [saved, save] = useUserValue<T>(user?.id ?? "anon", `shape:${name}`);
      const next = shape && JSON.stringify(shape);
      const before = JSON.stringify(saved);
      useEffect(() => {
            if (next && next !== before) save(JSON.parse(next) as T);
      }, [next, before, save]);
}
