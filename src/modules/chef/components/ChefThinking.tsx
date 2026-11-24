import type { CSSProperties } from "react";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";

// «Tu chef está pensando»: the chef beside a bubble where three wisps of steam rise in turn.
export default function ChefThinking() {
      return (
            <div role="status" className="msg-in flex items-end gap-2 self-start">
                  <MascotAvatar tone="blush" className="size-9" />
                  <span className="flex items-center gap-3 rounded-card rounded-bl-md bg-card px-4 py-3 shadow-soft">
                        <span aria-hidden className="flex h-4 items-end gap-1.5">
                              {[0, 160, 320].map((delay) => (
                                    <span key={delay} className="steam-dot size-2 rounded-full bg-primary" style={{ "--delay": `${delay}ms` } as CSSProperties} />
                              ))}
                        </span>
                        <span className="text-sm font-semibold text-ink-muted">Tu chef está pensando…</span>
                  </span>
            </div>
      );
}
