import type { ReactNode } from "react";
import Mascot from "./Mascot";

type AvatarTone = "peach" | "blush" | "white";

const avatarTones: Record<AvatarTone, string> = {
      peach: "bg-secondary-soft",
      blush: "bg-primary-soft",
      // White plate; wrap it in <BrandRing> for the pink ring (nav, chat header, welcome).
      white: "bg-card",
};

/** Round avatar of the mascot (the Noshy logo). */
export function MascotAvatar({ className = "size-14", tone = "peach" }: { className?: string; tone?: AvatarTone }) {
      return (
            <span className={`grid shrink-0 place-items-center overflow-hidden rounded-full ${avatarTones[tone]} ${className}`}>
                  <Mascot className="mt-[15%] size-[95%]" />
            </span>
      );
}

/** Pink gradient ring around a round child (the chef avatar, dish photos). */
export function BrandRing({ children, className = "" }: { children: ReactNode; className?: string }) {
      return <span className={`grid shrink-0 place-items-center rounded-full bg-brand p-[3px] ${className}`}>{children}</span>;
}

type MascotBubbleProps = {
      title: string;
      children: ReactNode;
      /** Decoration placed on the bubble's top-right corner. */
      decoration?: ReactNode;
};

// Noshy "speaking": avatar + white card with the question (sign-up, onboarding).
export default function MascotBubble({ title, children, decoration }: MascotBubbleProps) {
      return (
            <div className="flex items-center gap-3">
                  <MascotAvatar tone="blush" className="size-16" />
                  <div className="relative min-w-0 flex-1 rounded-card rounded-tl-md bg-card px-4 py-3 shadow-soft">
                        {decoration && <span className="absolute -top-3 -right-3">{decoration}</span>}
                        <h2 className="text-title leading-snug font-extrabold text-ink">{title}</h2>
                        <p className="mt-0.5 text-sm text-ink-muted">{children}</p>
                  </div>
            </div>
      );
}
