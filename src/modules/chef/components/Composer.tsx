import { useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
import Icon from "@/shared/components/ui/Icon";

type ComposerProps = {
      value: string;
      onChange: (value: string) => void;
      onSubmit: () => void;
      canSend: boolean;
      placeholder: string;
      dictation: { available: boolean; listening: boolean; toggle: () => void };
      /** Its height, so the conversation leaves room for it as it grows. */
      onHeight: (px: number) => void;
};

/** A blank order ticket, torn at the top: what is written on it goes up to the conversation as an order. */
export default function Composer({ value, onChange, onSubmit, canSend, placeholder, dictation, onHeight }: ComposerProps) {
      const form = useRef<HTMLFormElement>(null);
      const area = useRef<HTMLTextAreaElement>(null);

      // Grows with the text, up to the CSS maximum.
      useEffect(() => {
            const el = area.current;
            if (!el) return;
            el.style.height = "auto";
            el.style.height = `${el.scrollHeight}px`;
      }, [value]);

      useEffect(() => {
            const el = form.current;
            if (!el) return;
            const observer = new ResizeObserver(() => onHeight(el.offsetHeight));
            observer.observe(el);
            return () => observer.disconnect();
      }, [onHeight]);

      const submit = (event: FormEvent) => {
            event.preventDefault();
            onSubmit();
      };
      const onKeyDown = (event: KeyboardEvent) => {
            // Enter sends with a keyboard; on a phone it breaks the line, and the button sends.
            if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing || window.matchMedia("(pointer: coarse)").matches) return;
            event.preventDefault();
            onSubmit();
      };

      return (
            <form ref={form} onSubmit={submit} className="fixed inset-x-4 bottom-24 z-10 mx-auto max-w-xl [filter:drop-shadow(0_10px_18px_rgb(46_19_45/0.2))]">
                  <div className="flex items-end gap-1 rounded-b-[1.75rem] bg-card ticket-top px-2 pt-4 pb-2">
                        <label className="min-w-0 flex-1 self-center pl-3">
                              <span className="sr-only">Mensaje para tu chef</span>
                              <textarea
                                    ref={area}
                                    rows={1}
                                    value={value}
                                    onChange={(e) => onChange(e.target.value)}
                                    onKeyDown={onKeyDown}
                                    maxLength={1000}
                                    placeholder={placeholder}
                                    className="block max-h-32 w-full resize-none bg-transparent py-2.5 text-base leading-6 text-ink placeholder:text-ink-muted/70 focus-visible:outline-none"
                              />
                        </label>
                        {dictation.available && (
                              <button
                                    type="button"
                                    aria-label={dictation.listening ? "Dejar de dictar" : "Dictar mensaje"}
                                    aria-pressed={dictation.listening}
                                    onClick={dictation.toggle}
                                    className={`grid size-11 shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-primary-strong ${dictation.listening ? "bg-primary-soft text-primary-strong" : "text-ink-muted hover:text-ink"}`}
                              >
                                    <Icon name="mic" className={`size-5 ${dictation.listening ? "animate-pulse" : ""}`} />
                              </button>
                        )}
                        <button
                              type="submit"
                              aria-label="Enviar"
                              disabled={!canSend}
                              className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-card shadow-brand transition-transform active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:opacity-50 disabled:shadow-none"
                        >
                              <Icon name="send" className="size-5" />
                        </button>
                  </div>
            </form>
      );
}
