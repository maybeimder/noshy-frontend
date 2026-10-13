import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "dark" | "secondary" | "soft" | "dashed" | "tertiary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: ButtonVariant;
      size?: "md" | "lg";
      loading?: boolean;
      fullWidth?: boolean;
};

// From ref/: pink-strong with white label (4.8:1), ink, white card, beige field, dashed "add", text link.
export const buttonVariants: Record<ButtonVariant, string> = {
      primary:
            "bg-primary-strong text-card shadow-[0_10px_24px_-10px_rgb(201_48_124/0.7)] hover:bg-primary-strong/90",
      dark: "bg-ink text-card hover:bg-plum",
      secondary: "bg-card text-ink shadow-[0_6px_16px_-10px_rgb(43_20_51/0.35)] hover:bg-field",
      soft: "bg-field text-ink hover:bg-line",
      dashed: "border-2 border-dashed border-primary/50 bg-transparent text-primary-strong hover:bg-primary-soft/50",
      tertiary: "bg-transparent text-ink underline-offset-4 hover:underline",
};

export const buttonBase =
      "inline-flex items-center justify-center gap-2 rounded-card px-5 font-bold whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:cursor-not-allowed disabled:opacity-60";

const sizes = { md: "min-h-11 py-2 text-sm", lg: "min-h-14 px-4 py-3 text-base" };

export default function Button({
      variant = "primary",
      size = "md",
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
                  className={`${buttonBase} ${sizes[size]} ${buttonVariants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
                  {...props}
            >
                  {loading && (
                        <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                  )}
                  {children}
            </button>
      );
}
