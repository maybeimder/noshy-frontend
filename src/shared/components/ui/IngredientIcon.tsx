import { foodGlyphFor, foodGlyphs, foodGradient } from "@/shared/lib/food-glyphs";
import { hash } from "@/shared/lib/tones";

type IngredientIconProps = {
      label: string;
      icon?: string | null;
      /** "tile": rounded square · "circle": round, both on the food's gradient · "disc": white circle (cards on a tinted surface) · "bare": glyph only. */
      shape?: "tile" | "circle" | "disc" | "bare";
      /** Text colour class instead of ink. */
      color?: string;
      className?: string;
};

const shapes = { tile: "rounded-control", circle: "rounded-full", disc: "rounded-full bg-card", bare: "" };

/** The ingredient's pictogram in ink on its own pastel gradient; same input, same look across screens. */
export default function IngredientIcon({ label, icon, shape = "tile", color = "text-ink", className = "size-11" }: IngredientIconProps) {
      const name = foodGlyphFor(label, icon);
      const glyph: { d: string; f?: string } | null = name && foodGlyphs[name];
      const tinted = shape === "tile" || shape === "circle";
      return (
            <span
                  aria-hidden
                  style={tinted ? { backgroundImage: foodGradient(name, hash(label.trim().toLowerCase())) } : undefined}
                  className={`grid shrink-0 place-items-center font-display text-title font-semibold ${shapes[shape]} ${color} ${className}`}
            >
                  {glyph ? (
                        <svg viewBox="0 0 24 24" className="size-[56%]" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                              <path d={glyph.d} />
                              {glyph.f && <path d={glyph.f} fill="currentColor" />}
                        </svg>
                  ) : (
                        label.trim().charAt(0).toUpperCase()
                  )}
            </span>
      );
}
