import { useEffect, useId, useRef, type ReactNode } from "react";
import Icon from "./Icon";

type DialogProps = {
      open: boolean;
      onClose: () => void;
      title: string;
      children: ReactNode;
      /** Action row; the first button is the dominant one. */
      actions?: ReactNode;
};

// Native <dialog>: focus trapping, Escape and the backdrop come from the browser.
export default function Dialog({ open, onClose, title, children, actions }: DialogProps) {
      const ref = useRef<HTMLDialogElement>(null);
      const titleId = useId();

      useEffect(() => {
            const dialog = ref.current;
            if (!dialog) return;
            if (open && !dialog.open) dialog.showModal();
            if (!open && dialog.open) dialog.close();
      }, [open]);

      return (
            <dialog
                  ref={ref}
                  aria-labelledby={titleId}
                  onClose={onClose}
                  onClick={(event) => {
                        if (event.target === ref.current) onClose();
                  }}
                  className="m-auto w-[calc(100%-2rem)] max-w-md rounded-card bg-card p-0 text-ink backdrop:bg-ink/50"
            >
                  <div className="flex flex-col gap-4 p-6">
                        <div className="flex items-start justify-between gap-4">
                              <h2 id={titleId} className="text-title font-bold">
                                    {title}
                              </h2>
                              <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Cerrar"
                                    className="-mt-2 -mr-2 grid size-11 shrink-0 place-items-center rounded-control text-ink-muted hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-primary-strong"
                              >
                                    <Icon name="close" />
                              </button>
                        </div>
                        <div className="text-base">{children}</div>
                        {actions && (
                              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                    {actions}
                              </div>
                        )}
                  </div>
            </dialog>
      );
}
