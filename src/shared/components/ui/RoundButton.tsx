import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type Tone = "card" | "primary" | "field";

const toneClass: Record<Tone, string> = {
      card: "bg-card text-ink shadow-[0_6px_16px_-10px_rgb(43_20_51/0.45)] hover:bg-field",
      primary: "bg-primary-strong text-card shadow-[0_8px_18px_-8px_rgb(201_48_124/0.7)] hover:bg-primary-strong/90",
      field: "bg-field text-ink hover:bg-line",
};

export const roundButtonClass = (tone: Tone = "card", size: "md" | "lg" = "md") =>
      `relative grid shrink-0 place-items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
            size === "lg" ? "size-14" : "size-12"
      } ${toneClass[tone]}`;

type Common = { label: string; tone?: Tone; size?: "md" | "lg"; children: ReactNode; badge?: number };

/** Circular icon button from ref/ headers (back, search, cart, +). Always has an accessible name. */
export default function RoundButton({
      label,
      tone,
      size,
      children,
      badge,
      to,
      ...props
}: Common & ({ to: string } | ({ to?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>))) {
      const content = (
            <>
                  {children}
                  {badge ? (
                        <span
                              aria-hidden
                              className="absolute -top-1 -right-1 grid min-w-5 place-items-center rounded-full border-2 border-canvas bg-tomato px-1 text-xs font-extrabold text-card"
                        >
                              {badge}
                        </span>
                  ) : null}
            </>
      );
      const name = badge ? `${label} (${badge})` : label;
      return to ? (
            <Link to={to} aria-label={name} className={roundButtonClass(tone, size)}>
                  {content}
            </Link>
      ) : (
            <button type="button" aria-label={name} className={roundButtonClass(tone, size)} {...props}>
                  {content}
            </button>
      );
}
