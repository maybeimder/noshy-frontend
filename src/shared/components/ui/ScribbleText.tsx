import type { ReactNode } from "react";
import { Squiggle } from "./Doodles";

const colors = { pink: "text-primary-strong", orange: "text-secondary" };

type ScribbleTextProps = {
      children: ReactNode;
      color?: keyof typeof colors;
};

/** Underlines its children with the hand-drawn squiggle (the highlighted word in ref/ titles). */
export default function ScribbleText({ children, color = "pink" }: ScribbleTextProps) {
      return (
            <span className="relative inline-block whitespace-nowrap">
                  {children}
                  <Squiggle className={`absolute -bottom-2 left-0 h-3 w-full ${colors[color]}`} />
            </span>
      );
}

/**
 * Felt-tip highlight across the lower half of a title (refactor: «¿Qué quieres lograr?»).
 * The stroke wraps with the text, so long titles stay legible on narrow screens.
 */
export function MarkerText({ children }: { children: ReactNode }) {
      return (
            <span className="[box-decoration-break:clone] bg-[linear-gradient(176deg,transparent_52%,color-mix(in_srgb,var(--color-primary)_42%,transparent)_54%,color-mix(in_srgb,var(--color-primary)_42%,transparent)_88%,transparent_90%)] px-1 [-webkit-box-decoration-break:clone]">
                  {children}
            </span>
      );
}
