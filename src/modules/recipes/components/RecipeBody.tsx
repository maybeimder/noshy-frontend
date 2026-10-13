import Icon from "@/shared/components/ui/Icon";
import { formatQuantity } from "@/shared/lib/format";
import { tones, toneFor } from "@/shared/lib/tones";
import type { Ingredient, RecipeAdaptation } from "../types";

type RecipeBodyProps = {
      ingredients: Ingredient[];
      instructions: string[];
      /** When present, each ingredient is marked as in the pantry or missing. */
      adaptation?: RecipeAdaptation | null;
};

const key = (i: Ingredient) => `${i.name.trim().toLowerCase()}::${i.unit.trim().toLowerCase()}`;

// ref/Detalle de receta.png: ingredient rows with a status tile, then numbered steps joined by a line.
export default function RecipeBody({ ingredients, instructions, adaptation }: RecipeBodyProps) {
      const missing = new Map(adaptation?.missingIngredients.map((i) => [key(i), i]));

      return (
            <>
                  <section aria-labelledby="ingredients" className="rounded-card bg-card p-5">
                        <h2 id="ingredients" className="mb-2 text-section font-extrabold text-ink">
                              Ingredientes
                        </h2>
                        <ul className="flex flex-col divide-y divide-line">
                              {ingredients.map((ingredient, index) => {
                                    const lacking = missing.get(key(ingredient));
                                    const tone = tones[toneFor(ingredient.name)];
                                    return (
                                          <li key={`${key(ingredient)}-${index}`} className="flex items-center gap-3 py-3">
                                                {adaptation ? (
                                                      <span
                                                            className={`grid size-11 shrink-0 place-items-center rounded-control ${
                                                                  lacking ? "bg-peach-soft text-peach-ink" : "bg-mint-soft text-mint-ink"
                                                            }`}
                                                      >
                                                            <Icon name={lacking ? "close" : "check"} className="size-5" strokeWidth={2.5} />
                                                      </span>
                                                ) : (
                                                      <span aria-hidden className={`grid size-11 shrink-0 place-items-center rounded-control font-display font-extrabold ${tone.soft} ${tone.ink}`}>
                                                            {ingredient.name.trim().charAt(0).toUpperCase()}
                                                      </span>
                                                )}
                                                <span className="min-w-0 flex-1">
                                                      <span className="block font-bold text-ink">{ingredient.name}</span>
                                                      {adaptation && (
                                                            <span className={`block text-xs font-extrabold ${lacking ? "text-peach-ink" : "text-mint-ink"}`}>
                                                                  {lacking ? `Te faltan ${formatQuantity(lacking.quantity, lacking.unit)}` : "En tu despensa"}
                                                            </span>
                                                      )}
                                                </span>
                                                <span className="font-display text-title font-extrabold text-ink tabular-nums">
                                                      {formatQuantity(ingredient.quantity, ingredient.unit)}
                                                </span>
                                          </li>
                                    );
                              })}
                        </ul>
                  </section>

                  <section aria-labelledby="steps" className="rounded-card bg-card p-5">
                        <h2 id="steps" className="mb-4 text-section font-extrabold text-ink">
                              Preparación
                        </h2>
                        <ol className="flex flex-col">
                              {instructions.map((step, index) => (
                                    <li key={index} className="relative flex gap-4 pb-5 last:pb-0">
                                          {index < instructions.length - 1 && (
                                                <span aria-hidden className="absolute top-9 bottom-1 left-[15px] w-0.5 rounded-full bg-line" />
                                          )}
                                          <span aria-hidden className="relative grid size-8 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-extrabold text-card">
                                                {index + 1}
                                          </span>
                                          <p className="pt-1 text-base text-ink">{step}</p>
                                    </li>
                              ))}
                        </ol>
                  </section>
            </>
      );
}
