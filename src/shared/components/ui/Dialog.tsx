import { useEffect, useId, useRef, type ReactNode } from "react";
import Icon from "./Icon";

type DialogProps = {
      open: boolean;
      onClose: () => void;
      title: string;
      children: ReactNode;
      /** Action row; the last button is the dominant one. */
      actions?: ReactNode;
      /** "sheet": slides up from the bottom (ref/Crear lista.png). */
      variant?: "center" | "sheet";
      /** Shown before the title (e.g. the mascot avatar). */
      leading?: ReactNode;
};

// Native <dialog>: focus trapping, Escape and the backdrop come from the browser.
export default function Dialog({ open, onClose, title, children, actions, variant = "center", leading }: DialogProps) {
      const ref = useRef<HTMLDialogElement>(null);
      const titleId = useId();
      const sheet = variant === "sheet";

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
                  className={`bg-card p-0 text-ink backdrop:bg-plum/60 ${
                        sheet
                              ? "mx-auto mt-auto mb-0 w-full max-w-xl rounded-t-[2rem]"
                              : "m-auto w-[calc(100%-2rem)] max-w-md rounded-card"
                  }`}
            >
                  <div className={`flex flex-col gap-4 ${sheet ? "px-5 pt-3 pb-8" : "p-6"}`}>
                        {sheet && <span aria-hidden className="mx-auto h-1.5 w-12 rounded-full bg-line" />}
                        <div className="flex items-center gap-3">
                              {leading}
                              <h2 id={titleId} className={`flex-1 font-extrabold ${sheet ? "text-section" : "text-title"}`}>
                                    {title}
                              </h2>
                              <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Cerrar"
                                    className="grid size-11 shrink-0 place-items-center rounded-full bg-field text-ink hover:bg-line focus-visible:outline-2 focus-visible:outline-primary-strong"
                              >
                                    <Icon name="close" className="size-5" />
                              </button>
                        </div>
                        <div className="text-base">{children}</div>
                        {actions && <div className="grid auto-cols-fr grid-flow-col gap-3">{actions}</div>}
                  </div>
            </dialog>
      );
}
