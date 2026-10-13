import type { ReactNode } from "react";
import Mascot from "./Mascot";

/** Round peach avatar of the mascot. */
export function MascotAvatar({ className = "size-14" }: { className?: string }) {
      return (
            <span className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-secondary-soft ${className}`}>
                  <Mascot className="mt-[15%] size-[95%]" />
            </span>
      );
}

type MascotBubbleProps = {
      title: string;
      children: ReactNode;
      /** Decoration placed on the bubble's top-right corner. */
      decoration?: ReactNode;
};

// Noshy "speaking": avatar + white speech bubble (plan onboarding steps).
export default function MascotBubble({ title, children, decoration }: MascotBubbleProps) {
      return (
            <div className="flex items-center gap-3">
                  <MascotAvatar />
                  <div className="relative rounded-card rounded-tl-md bg-card px-4 py-3 shadow-[0_6px_16px_-12px_rgb(43_20_51/0.4)]">
                        {decoration && <span className="absolute -top-3 -right-3">{decoration}</span>}
                        <h2 className="text-title font-extrabold text-ink">{title}</h2>
                        <p className="text-sm text-ink">{children}</p>
                  </div>
            </div>
      );
}
