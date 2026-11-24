import { Link } from "react-router-dom";
import Icon from "@/shared/components/ui/Icon";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";
import { useDismissNudge } from "../hooks/useHome";
import type { Nudge } from "../types";
import { actionLink } from "../utils/actions";

// Nudge from the chef: one tap to act on it, or dismiss. Plum on Inicio, blush on Mi cocina.
export default function NudgeCard({ nudge, tone = "plum" }: { nudge: Nudge; tone?: "plum" | "blush" }) {
      const plum = tone === "plum";
      const dismiss = useDismissNudge();
      return (
            <div className={`flex items-center gap-1 p-2 ${plum ? "rounded-full bg-plum-glow text-card shadow-[0_16px_32px_-20px_rgb(43_20_51/0.8)]" : "rounded-card bg-primary-soft text-ink"}`}>
                  <Link
                        to={actionLink(nudge.action)}
                        onClick={() => dismiss.mutate({ id: nudge.id, reason: "acted" })}
                        className={`flex min-w-0 flex-1 items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 ${plum ? "focus-visible:outline-card" : "focus-visible:outline-primary-strong"}`}
                  >
                        <MascotAvatar tone="white" className="size-12" />
                        <span className="min-w-0 flex-1">
                              <span className={`block font-display text-base font-extrabold ${plum ? "truncate" : ""}`}>{nudge.title}</span>
                              <span className={`block text-sm ${plum ? "truncate text-card/80" : "text-ink-muted"}`}>{nudge.body}</span>
                        </span>
                  </Link>
                  <button
                        type="button"
                        aria-label="Descartar aviso"
                        disabled={dismiss.isPending}
                        onClick={() => dismiss.mutate({ id: nudge.id, reason: "dismissed" })}
                        className={`grid size-11 shrink-0 place-items-center rounded-full focus-visible:outline-2 ${plum ? "hover:bg-card/20 focus-visible:outline-card" : "text-ink-muted hover:bg-card focus-visible:outline-primary-strong"}`}
                  >
                        <Icon name="close" className="size-5" />
                  </button>
            </div>
      );
}
