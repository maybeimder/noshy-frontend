import { useId, useState, type InputHTMLAttributes } from "react";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
      label: string;
      error?: string;
      hint?: string;
};

export default function TextField({
      label,
      error,
      hint,
      type = "text",
      className = "",
      ...props
}: TextFieldProps) {
      const id = useId();
      const [revealed, setRevealed] = useState(false);
      const isPassword = type === "password";
      const describedBy =
            [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") ||
            undefined;

      return (
            <div className={`flex flex-col gap-2 ${className}`}>
                  <label htmlFor={id} className="text-sm font-semibold text-ink">
                        {label}
                  </label>

                  <div className="relative">
                        <input
                              id={id}
                              type={isPassword && revealed ? "text" : type}
                              aria-invalid={error ? true : undefined}
                              aria-describedby={describedBy}
                              className={`min-h-11 w-full rounded-control border bg-card px-4 py-3 text-base text-ink placeholder:text-ink-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
                                    error ? "border-2 border-error" : "border-ink-muted"
                              } ${isPassword ? "pr-12" : ""}`}
                              {...props}
                        />
                        {isPassword && (
                              <button
                                    type="button"
                                    onClick={() => setRevealed((value) => !value)}
                                    aria-label={revealed ? "Ocultar contraseña" : "Mostrar contraseña"}
                                    aria-pressed={revealed}
                                    className="absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-control text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-primary-strong"
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
                        <p id={`${id}-hint`} className="text-xs text-ink-muted">
                              {hint}
                        </p>
                  )}
                  {error && (
                        <p
                              id={`${id}-error`}
                              className="flex items-start gap-1 text-sm text-error"
                        >
                              <svg
                                    viewBox="0 0 24 24"
                                    className="mt-0.5 size-4 shrink-0"
                                    fill="currentColor"
                                    aria-hidden
                              >
                                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm-1 5h2v7h-2Zm0 9h2v2h-2Z" />
                              </svg>
                              {error}
                        </p>
                  )}
            </div>
      );
}
