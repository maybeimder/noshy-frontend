import { Link } from "react-router-dom";
import Icon from "@/shared/components/ui/Icon";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";
import { useDismissNudge } from "../hooks/useHome";
import type { Nudge } from "../types";
import { actionLink } from "../utils/actions";

// Nudge from the chef: one tap to act on it, or dismiss. Plum on Inicio, lilac on Mi cocina.
export default function NudgeCard({ nudge, tone = "plum" }: { nudge: Nudge; tone?: "plum" | "lilac" }) {
      const plum = tone === "plum";
      const dismiss = useDismissNudge();
      return (
            <div className={`flex items-center gap-1 p-2 ${plum ? "rounded-full bg-plum-glow text-card shadow-[0_16px_32px_-20px_rgb(43_20_51/0.8)]" : "rounded-[2rem] bg-lilac-glow py-2.5 pl-3 text-plum"}`}>
                  <Link
                        to={actionLink(nudge.action)}
                        onClick={() => dismiss.mutate({ id: nudge.id, reason: "acted" })}
                        className={`flex min-w-0 flex-1 items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 ${plum ? "focus-visible:outline-card" : "focus-visible:outline-primary-strong"}`}
                  >
                        <MascotAvatar tone={plum ? "white" : "blush"} className="size-12" />
                        <span className="min-w-0 flex-1">
                              <span className={plum ? "block truncate font-display text-base font-extrabold" : "block text-sm font-bold"}>{nudge.title}</span>
                              <span className={plum ? "block truncate text-sm text-card/80" : "block text-sm font-bold"}>{nudge.body}</span>
                        </span>
                  </Link>
                  <button
                        type="button"
                        aria-label="Descartar aviso"
                        disabled={dismiss.isPending}
                        onClick={() => dismiss.mutate({ id: nudge.id, reason: "dismissed" })}
                        className={`grid size-11 shrink-0 place-items-center rounded-full focus-visible:outline-2 ${plum ? "hover:bg-card/20 focus-visible:outline-card" : "text-plum/45 hover:bg-card/60 hover:text-plum focus-visible:outline-primary-strong"}`}
                  >
                        <Icon name="close" className={plum ? "size-5" : "size-4"} />
                  </button>
            </div>
      );
}
