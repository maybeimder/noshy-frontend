import { useId, useState, type InputHTMLAttributes, type ReactNode } from "react";
import Icon from "./Icon";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "size"> & {
      label: string;
      hideLabel?: boolean;
      error?: string;
      hint?: string;
      /** Text or node shown inside the field on the right (e.g. "kcal"). */
      suffix?: ReactNode;
      /** "field": beige filled (default) · "card": white, for use on beige/peach surfaces. */
      tone?: "field" | "card";
      size?: "md" | "lg";
};

export const fieldClass = (tone: "field" | "card", error?: string) =>
      `w-full rounded-control text-ink placeholder:text-ink-muted/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
            tone === "field" ? "bg-field" : "bg-card"
      } ${error ? "ring-2 ring-error" : ""}`;

export default function TextField({
      label,
      hideLabel = false,
      error,
      hint,
      suffix,
      tone = "field",
      size = "md",
      type = "text",
      className = "",
      ...props
}: TextFieldProps) {
      const id = useId();
      const [revealed, setRevealed] = useState(false);
      const isPassword = type === "password";
      const describedBy = [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") || undefined;
      const padRight = isPassword || suffix ? "pr-14" : "pr-4";

      return (
            <div className={`flex flex-col gap-2 ${className}`}>
                  <label htmlFor={id} className={hideLabel ? "sr-only" : "text-sm font-bold text-ink"}>
                        {label}
                  </label>

                  <div className="relative">
                        <input
                              id={id}
                              type={isPassword && revealed ? "text" : type}
                              aria-invalid={error ? true : undefined}
                              aria-describedby={describedBy}
                              className={`${fieldClass(tone, error)} pl-4 ${padRight} ${
                                    size === "lg" ? "min-h-14 py-3 font-display text-section font-bold" : "min-h-12 py-3 text-base"
                              }`}
                              {...props}
                        />
                        {suffix && !isPassword && (
                              <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-bold text-ink-muted">
                                    {suffix}
                              </span>
                        )}
                        {isPassword && (
                              <button
                                    type="button"
                                    onClick={() => setRevealed((value) => !value)}
                                    aria-label={revealed ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    aria-pressed={revealed}
                                    className="absolute inset-y-0 right-1 grid w-11 place-items-center rounded-control text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-primary-strong"
                              >
                                    <svg
                                          viewBox="0 0 24 24"
                                          className="size-5"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth={1.75}
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          aria-hidden
                                    >
                                          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                          <circle cx="12" cy="12" r="3" />
                                          {revealed && <path d="M4 4l16 16" />}
                                    </svg>
                              </button>
                        )}
                  </div>

                  {hint && !error && (
                        <p id={`${id}-hint`} className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
                              <Icon name="info" className="size-4" />
                              {hint}
                        </p>
                  )}
                  {error && (
                        <p id={`${id}-error`} className="flex items-start gap-1 text-sm font-semibold text-error">
                              <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
                              {error}
                        </p>
                  )}
            </div>
      );
}
