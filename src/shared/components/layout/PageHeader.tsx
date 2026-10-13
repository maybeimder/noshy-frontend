import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkle, Star } from "../ui/Doodles";
import Icon from "../ui/Icon";
import { roundButtonClass } from "../ui/RoundButton";
import ScribbleText from "../ui/ScribbleText";

type PageHeaderProps = {
      title: string;
      subtitle?: string;
      /** Where "back" goes when there is no history (e.g. a deep link). */
      backTo?: string;
      actions?: ReactNode;
      /** Hand-drawn underline under the title (ref: "Mi despensa", "Recetas"). */
      scribble?: "pink" | "orange";
      decoration?: "star" | "sparkle";
};

/** Kept for screens that place their own icon buttons in `actions`. */
export const iconButtonClass = roundButtonClass("card");

export default function PageHeader({ title, subtitle, backTo, actions, scribble, decoration }: PageHeaderProps) {
      const navigate = useNavigate();

      const goBack = () => {
            // history.state.idx is set by react-router; 0 means this page opened the tab.
            const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
            if (idx > 0) navigate(-1);
            else navigate(backTo ?? "/", { replace: true });
      };

      return (
            <header className="mx-auto flex max-w-xl items-center gap-3 px-6 pt-6 pb-2">
                  {backTo !== undefined && (
                        <button type="button" onClick={goBack} aria-label="Volver" className={roundButtonClass("card")}>
                              <Icon name="back" />
                        </button>
                  )}
                  <div className="relative min-w-0 flex-1">
                        <h1 className={`inline-block max-w-full text-[1.75rem] leading-tight font-extrabold text-ink ${scribble ? "pb-2" : "truncate"}`}>
                              {scribble ? <ScribbleText color={scribble}>{title}</ScribbleText> : title}
                        </h1>
                        {decoration === "star" && <Star className="absolute top-0 ml-2 inline size-6 rotate-12 text-primary" />}
                        {decoration === "sparkle" && <Sparkle className="absolute top-0 ml-2 inline size-4 text-secondary" />}
                        {subtitle && <p className={`truncate text-sm font-semibold text-ink-muted ${scribble ? "mt-2" : ""}`}>{subtitle}</p>}
                  </div>
                  {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
            </header>
      );
}
