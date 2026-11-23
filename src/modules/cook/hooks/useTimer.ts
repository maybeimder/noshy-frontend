import { useEffect, useRef, useState } from "react";

/** Countdown by wall clock, so a sleeping tab does not drift. Calls onEnd once. */
export function useTimer(seconds: number, onEnd: () => void) {
      const [left, setLeft] = useState(seconds);
      const [endsAt, setEndsAt] = useState<number | null>(null);
      const end = useRef(onEnd);
      end.current = onEnd;
      const running = endsAt !== null;

      useEffect(() => {
            if (endsAt === null) return;
            const tick = () => {
                  const next = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
                  setLeft(next);
                  if (next === 0) {
                        setEndsAt(null);
                        end.current();
                  }
            };
            const id = setInterval(tick, 250);
            return () => clearInterval(id);
      }, [endsAt]);

      return {
            left,
            running,
            start: () => setEndsAt(Date.now() + (left > 0 ? left : seconds) * 1000),
            pause: () => setEndsAt(null),
            extend: (extra: number) => {
                  if (endsAt !== null) setEndsAt(endsAt + extra * 1000);
                  else setLeft((value) => value + extra);
            },
      };
}
