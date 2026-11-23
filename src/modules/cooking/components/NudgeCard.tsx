import { Link } from "react-router-dom";
import Icon from "@/shared/components/ui/Icon";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";
import { useDismissNudge } from "../hooks/useHome";
import type { Nudge } from "../types";
import { actionLink } from "../utils/actions";

// Plum nudge from the chef: one tap to act on it, or dismiss.
export default function NudgeCard({ nudge }: { nudge: Nudge }) {
      const dismiss = useDismissNudge();
      return (
            <div className="flex items-center gap-1 rounded-full bg-plum-glow p-2 text-card shadow-[0_16px_32px_-20px_rgb(43_20_51/0.8)]">
                  <Link
                        to={actionLink(nudge.action)}
                        onClick={() => dismiss.mutate({ id: nudge.id, reason: "acted" })}
                        className="flex min-w-0 flex-1 items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card"
                  >
                        <MascotAvatar tone="white" className="size-12" />
                        <span className="min-w-0 flex-1">
                              <span className="block truncate font-display text-base font-extrabold">{nudge.title}</span>
                              <span className="block truncate text-sm text-card/80">{nudge.body}</span>
                        </span>
                  </Link>
                  <button
                        type="button"
                        aria-label="Descartar aviso"
                        disabled={dismiss.isPending}
                        onClick={() => dismiss.mutate({ id: nudge.id, reason: "dismissed" })}
                        className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-card/20 focus-visible:outline-2 focus-visible:outline-card"
                  >
                        <Icon name="close" className="size-5" />
                  </button>
            </div>
      );
}
