import { useId, type TextareaHTMLAttributes } from "react";

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> & {
      label: string;
      hideLabel?: boolean;
      error?: string;
      hint?: string;
};

export default function TextArea({
      label,
      hideLabel = false,
      error,
      hint,
      className = "",
      rows = 3,
      ...props
}: TextAreaProps) {
      const id = useId();
      const describedBy =
            [error && `${id}-error`, hint && `${id}-hint`].filter(Boolean).join(" ") ||
            undefined;

      return (
            <div className={`flex flex-col gap-2 ${className}`}>
                  <label
                        htmlFor={id}
                        className={hideLabel ? "sr-only" : "text-sm font-semibold text-ink"}
                  >
                        {label}
                  </label>
                  <textarea
                        id={id}
                        rows={rows}
                        aria-invalid={error ? true : undefined}
                        aria-describedby={describedBy}
                        className={`w-full resize-y rounded-control border bg-card px-4 py-3 text-base text-ink placeholder:text-ink-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
                              error ? "border-2 border-error" : "border-ink-muted"
                        }`}
                        {...props}
                  />
                  {hint && !error && (
                        <p id={`${id}-hint`} className="text-xs text-ink-muted">
                              {hint}
                        </p>
                  )}
                  {error && (
                        <p id={`${id}-error`} className="text-sm text-error">
                              {error}
                        </p>
                  )}
            </div>
      );
}
