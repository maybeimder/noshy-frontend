import type { ButtonHTMLAttributes, ReactNode } from "react";
import Icon, { type IconName } from "./Icon";

export type ButtonVariant = "primary" | "dark" | "secondary" | "soft" | "blush" | "dashed" | "tertiary";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
      variant?: ButtonVariant;
      size?: "md" | "lg";
      loading?: boolean;
      fullWidth?: boolean;
      /** Label on the left, arrow (or another icon) in a round badge on the right (main action). */
      arrow?: boolean | IconName;
};

// Pink gradient pill with a white label on its deep end (4.8:1), ink, white card, beige, blush, dashed "add", text link.
export const buttonVariants: Record<ButtonVariant, string> = {
      primary: "bg-brand text-card shadow-brand hover:brightness-105",
      dark: "bg-ink text-card hover:bg-plum",
      secondary: "bg-card text-ink shadow-soft hover:bg-field",
      soft: "bg-field text-ink hover:bg-line",
      blush: "bg-primary-soft text-rose-ink hover:bg-rose-soft/70",
      dashed: "border-2 border-dashed border-primary/50 bg-transparent text-primary-strong hover:bg-primary-soft/50",
      tertiary: "bg-transparent text-ink underline-offset-4 hover:underline",
};

/** Shape and states without alignment; buttonBase centres the label. */
export const buttonCore =
      "inline-flex min-w-0 items-center gap-2 rounded-full px-5 font-bold whitespace-nowrap transition-[filter,background-color,transform] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:cursor-not-allowed disabled:opacity-60";

export const buttonBase = `${buttonCore} justify-center`;

const sizes = { md: "min-h-11 py-2 text-sm", lg: "min-h-14 px-5 py-3 text-base" };

/** The translucent round arrow at the end of primary CTAs. */
export function ArrowBadge({ icon = "arrowRight" }: { icon?: IconName }) {
      return (
            <span aria-hidden className="-mr-2 grid size-10 shrink-0 place-items-center rounded-full bg-card/25 text-card">
                  <Icon name={icon} className="size-5" strokeWidth={2.25} />
            </span>
      );
}

export default function Button({
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      arrow = false,
      disabled,
      className = "",
      children,
      type = "button",
      ...props
}: ButtonProps) {
      const content: ReactNode = arrow ? (
            <>
                  <span className="flex min-w-0 items-center gap-2 truncate">
                        {loading && <Spinner />}
                        {children}
                  </span>
                  {!loading && <ArrowBadge icon={arrow === true ? "arrowRight" : arrow} />}
            </>
      ) : (
            <>
                  {loading && <Spinner />}
                  {children}
            </>
      );

      return (
            <button
                  type={type}
                  disabled={disabled || loading}
                  aria-busy={loading || undefined}
                  className={`${buttonCore} ${sizes[size]} ${buttonVariants[variant]} ${arrow ? "justify-between pr-4" : "justify-center"} ${fullWidth ? "w-full" : ""} ${className}`}
                  {...props}
            >
                  {content}
            </button>
      );
}

function Spinner() {
      return <span aria-hidden className="size-4 shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent" />;
}
