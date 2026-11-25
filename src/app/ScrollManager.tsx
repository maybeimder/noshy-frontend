import { useLayoutEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";
import { rememberVisit } from "@/shared/lib/visits";

const positions = new Map<string, number>();
/** Frames to wait for a screen to be tall enough to go back to where it was. */
const RESTORE_FRAMES = 30;

/** A new screen starts at the top; going back to one lands where it was left. */
export default function ScrollManager() {
      const { pathname, search, state } = useLocation();
      const type = useNavigationType();
      // Filters in the query are the same screen; the tab of /recetas is not.
      const screen = `${pathname}?${new URLSearchParams(search).get("ver") ?? ""}`;
      const restore = type === "POP" || (state as { restoreScroll?: boolean } | null)?.restoreScroll === true;

      useLayoutEffect(() => {
            window.history.scrollRestoration = "manual";
      }, []);

      useLayoutEffect(() => rememberVisit(pathname + search), [pathname, search]);

      useLayoutEffect(() => {
            const target = restore ? (positions.get(screen) ?? 0) : 0;
            let frame = 0;
            let left = RESTORE_FRAMES;
            const go = () => {
                  window.scrollTo(0, target);
                  if (left-- > 0 && Math.abs(window.scrollY - target) > 1) frame = requestAnimationFrame(go);
            };
            go();
            const stop = () => cancelAnimationFrame(frame);
            const save = () => positions.set(screen, window.scrollY);
            // The user's own scroll wins over a restore still in progress.
            window.addEventListener("wheel", stop, { passive: true });
            window.addEventListener("touchstart", stop, { passive: true });
            window.addEventListener("scroll", save, { passive: true });
            return () => {
                  stop();
                  window.removeEventListener("wheel", stop);
                  window.removeEventListener("touchstart", stop);
                  window.removeEventListener("scroll", save);
            };
            // `restore` describes how this screen was reached, so it is read once per screen.
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [screen]);

      return null;
}
