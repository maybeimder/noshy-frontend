import type { ReactNode } from "react";
import { Squiggle } from "./Doodles";
import Icon, { type IconName } from "./Icon";

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

/** The icon before a title, sized by it. */
export function TitleIcon({ name }: { name: IconName }) {
      return (
            <span aria-hidden className="shrink-0 text-primary-strong">
                  <Icon name={name} className="size-[0.95em]" strokeWidth={2.1} />
            </span>
      );
}

/**
 * Flat highlight across the lower half of a title. The stroke wraps with the text, so long titles
 * stay legible on narrow screens.
 */
export function MarkerText({ children }: { children: ReactNode }) {
      return (
            <span className="marker-draw font-semibold [box-decoration-break:clone] bg-[linear-gradient(180deg,transparent_54%,var(--color-marker)_54%,var(--color-marker)_88%,transparent_88%)] px-1.5 [-webkit-box-decoration-break:clone]">
                  {children}
            </span>
      );
}
