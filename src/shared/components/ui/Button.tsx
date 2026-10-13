import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: ButtonVariant;
      loading?: boolean;
      fullWidth?: boolean;
};

// Per DESIGN.md: one dominant action per block, ciruela labels on every surface.
const variants: Record<ButtonVariant, string> = {
      primary: "bg-primary text-ink hover:bg-primary/85",
      secondary: "bg-secondary-soft text-ink hover:bg-secondary/60",
      tertiary: "bg-transparent text-ink underline-offset-4 hover:underline",
};

export default function Button({
      variant = "primary",
      loading = false,
      fullWidth = false,
      disabled,
      className = "",
      children,
      type = "button",
      ...props
}: ButtonProps) {
      return (
            <button
                  type={type}
                  disabled={disabled || loading}
                  aria-busy={loading || undefined}
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-6 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
                  {...props}
            >
                  {loading && (
                        <span
                              aria-hidden
                              className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
                        />
                  )}
                  {children}
            </button>
      );
}
