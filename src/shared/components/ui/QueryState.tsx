import type { ReactNode } from "react";
import Button from "./Button";
import Icon, { type IconName } from "./Icon";

export function LoadingState({ label = "Cargando…" }: { label?: string }) {
      return (
            <div role="status" className="flex flex-col items-center gap-3 py-12 text-ink-muted">
                  <span
                        aria-hidden
                        className="size-8 animate-spin rounded-full border-4 border-primary-soft border-t-primary"
                  />
                  <span className="text-sm">{label}</span>
            </div>
      );
}

export function ErrorState({
      message,
      onRetry,
}: {
      message: string;
      onRetry?: () => void;
}) {
      return (
            <div
                  role="alert"
                  className="flex flex-col items-center gap-4 rounded-card bg-card p-6 text-center"
            >
                  <span className="grid size-12 place-items-center rounded-full bg-primary-soft text-error">
                        <Icon name="alert" />
                  </span>
                  <p className="text-base text-ink">{message}</p>
                  {onRetry && (
                        <Button variant="secondary" onClick={onRetry}>
                              Reintentar
                        </Button>
                  )}
            </div>
      );
}

export function EmptyState({
      icon,
      title,
      description,
      action,
}: {
      icon: IconName;
      title: string;
      description: string;
      action?: ReactNode;
}) {
      return (
            <div className="flex flex-col items-center gap-3 rounded-card bg-card px-6 py-8 text-center">
                  <span className="grid size-14 place-items-center rounded-full bg-secondary-soft text-ink">
                        <Icon name={icon} className="size-7" />
                  </span>
                  <h2 className="text-title font-bold text-ink">{title}</h2>
                  <p className="text-base text-ink-muted">{description}</p>
                  {action && <div className="mt-2">{action}</div>}
            </div>
      );
}
