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
