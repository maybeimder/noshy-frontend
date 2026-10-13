import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../ui/Icon";

type PageHeaderProps = {
      title: string;
      subtitle?: string;
      /** Where "back" goes when there is no history (e.g. a deep link). */
      backTo?: string;
      actions?: ReactNode;
};

export const iconButtonClass =
      "grid size-11 shrink-0 place-items-center rounded-control text-ink transition-colors hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";

export default function PageHeader({ title, subtitle, backTo, actions }: PageHeaderProps) {
      const navigate = useNavigate();

      const goBack = () => {
            // history.state.idx is set by react-router; 0 means this page opened the tab.
            const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
            if (idx > 0) navigate(-1);
            else navigate(backTo ?? "/", { replace: true });
      };

      return (
            <header className="sticky top-0 z-10 bg-canvas/95 shadow-[0_8px_24px_-16px_rgb(29_9_44/0.25)] backdrop-blur">
                  <div className="mx-auto flex min-h-16 max-w-xl items-center gap-2 px-4 py-2">
                        {backTo !== undefined && (
                              <button type="button" onClick={goBack} aria-label="Volver" className={iconButtonClass}>
                                    <Icon name="back" />
                              </button>
                        )}
                        <div className={`min-w-0 flex-1 ${backTo === undefined ? "pl-2" : ""}`}>
                              <h1 className="truncate text-section font-bold text-ink">{title}</h1>
                              {subtitle && <p className="truncate text-sm text-ink-muted">{subtitle}</p>}
                        </div>
                        {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
                  </div>
            </header>
      );
}
