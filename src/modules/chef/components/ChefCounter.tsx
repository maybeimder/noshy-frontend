import type { CSSProperties } from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import Mascot from "@/shared/components/ui/Mascot";
import { foodGlyphs, type FoodGlyph } from "@/shared/lib/food-glyphs";

type Plate = { label: string; text: string; glyph: FoodGlyph; ring: [from: string, to: string] };

const mainPlates: Plate[] = [
      { label: "Con lo que tengo", text: "¿Qué puedo cocinar con lo que tengo en mi despensa?", glyph: "carrot", ring: ["peach", "mustard"] },
      { label: "En 15 minutos", text: "Dame algo rico que salga en 15 minutos.", glyph: "egg", ring: ["sky", "lilac"] },
      { label: "Lo que ya vence", text: "¿Qué hago con lo que está por vencer?", glyph: "leafy", ring: ["mint", "sky"] },
      { label: "Un antojo dulce", text: "Se me antoja algo dulce que vaya con mis metas.", glyph: "strawberry", ring: ["rose", "peach"] },
];
const recipePlates: Plate[] = [
      { label: "Cambiar algo", text: "¿Qué puedo cambiar si me falta un ingrediente de esta receta?", glyph: "onion", ring: ["peach", "mustard"] },
      { label: "En airfryer", text: "¿Puedo hacerla en airfryer?", glyph: "drumstick", ring: ["sky", "lilac"] },
      { label: "Más ligera", text: "¿Cómo la hago más ligera?", glyph: "leafy", ring: ["mint", "sky"] },
      { label: "Qué le pongo", text: "¿Con qué la acompaño?", glyph: "rice", ring: ["rose", "peach"] },
];

function question(name: string, hour = new Date().getHours()) {
      const meal = hour >= 5 && hour < 11 ? "desayunamos" : hour >= 11 && hour < 16 ? "almorzamos" : hour >= 16 && hour < 18 ? "merendamos" : "cenamos";
      return name ? `¿Qué ${meal}, ${name}?` : `¿Qué ${meal} hoy?`;
}

/** Where every conversation starts: the chef behind the counter and four plates to order from. */
export default function ChefCounter({ forRecipe, disabled, onOrder }: { forRecipe: boolean; disabled: boolean; onOrder: (text: string) => void }) {
      const { user } = useAuth();
      const plates = forRecipe ? recipePlates : mainPlates;
      return (
            <section aria-label="Pide algo a tu chef" className="pt-1">
                  <div className="relative flex items-end gap-2 px-1">
                        <h2 className="min-w-0 flex-1 pb-6 text-[2.125rem] leading-[1.08] font-semibold text-balance text-ink">{forRecipe ? "¿Qué quieres saber de esta receta?" : question(user?.name.split(" ")[0] ?? "")}</h2>
                        <span aria-hidden className="-mb-3 block w-36 shrink-0">
                              <Mascot className="w-full" />
                        </span>
                  </div>
                  {/* The counter: the chef stands behind it, the plates are on it. */}
                  <div className="relative rounded-[2rem] bg-card px-3 pt-5 pb-4 shadow-soft before:absolute before:inset-x-0 before:-top-1 before:h-5 before:rounded-full before:bg-brand">
                        <ul className="grid grid-cols-4 gap-1 pt-3">
                              {plates.map(({ label, text, glyph, ring }) => {
                                    const art: { d: string; f?: string } = foodGlyphs[glyph];
                                    return (
                                          <li key={label}>
                                                <button
                                                      type="button"
                                                      disabled={disabled}
                                                      aria-label={text}
                                                      onClick={() => onOrder(text)}
                                                      className="group flex w-full flex-col items-center gap-1.5 rounded-card pb-1 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:opacity-60"
                                                >
                                                      <span
                                                            style={{ "--ring-from": `var(--color-${ring[0]}-soft)`, "--ring-to": `var(--color-${ring[1]}-soft)` } as CSSProperties}
                                                            className="grid size-[4.25rem] place-items-center rounded-full bg-plate-ring p-1.5 shadow-[0_8px_16px_-8px_rgb(122_90_100/0.4)] transition-transform duration-200 group-hover:-translate-y-0.5 group-active:scale-90"
                                                      >
                                                            <span className="grid size-full place-items-center rounded-full bg-card shadow-[inset_0_0_0_1px_var(--color-line)]">
                                                                  <svg aria-hidden viewBox="0 0 24 24" className="size-7 text-ink" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                                                                        <path d={art.d} />
                                                                        {art.f && <path d={art.f} fill="currentColor" />}
                                                                  </svg>
                                                            </span>
                                                      </span>
                                                      <span aria-hidden className="px-0.5 text-xs leading-tight font-bold text-balance text-ink">
                                                            {label}
                                                      </span>
                                                </button>
                                          </li>
                                    );
                              })}
                        </ul>
                  </div>
            </section>
      );
}
