import { useCallback, useEffect, useRef, type RefObject } from "react";

/**
 * Keeps the window at its end while `content` grows (new messages, a reply being written, photos that
 * load, the keyboard opening), unless the reader scrolled up to look at something.
 */
export function useStickToEnd(content: RefObject<HTMLElement | null>) {
      const stick = useRef(true);

      const toEnd = useCallback(() => {
            stick.current = true;
            window.scrollTo({ top: document.documentElement.scrollHeight });
      }, []);
      const release = useCallback(() => {
            stick.current = false;
      }, []);

      useEffect(() => {
            const el = content.current;
            if (!el) return;
            let lastY = window.scrollY;
            const onScroll = () => {
                  const left = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
                  if (left < 80) stick.current = true;
                  // Only going up counts as leaving: growth alone also puts the end further away.
                  else if (window.scrollY < lastY - 1) stick.current = false;
                  lastY = window.scrollY;
            };
            const follow = () => {
                  if (stick.current) toEnd();
            };
            const observer = new ResizeObserver(follow);
            observer.observe(el);
            window.addEventListener("scroll", onScroll, { passive: true });
            window.addEventListener("resize", follow);
            window.visualViewport?.addEventListener("resize", follow);
            return () => {
                  observer.disconnect();
                  window.removeEventListener("scroll", onScroll);
                  window.removeEventListener("resize", follow);
                  window.visualViewport?.removeEventListener("resize", follow);
            };
      }, [content, toEnd]);

      return { toEnd, release };
}
