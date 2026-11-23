import Icon from "@/shared/components/ui/Icon";
import { plural } from "@/shared/lib/format";
import type { RecipeDetail } from "../types";

// ref/Detalle de receta.png: ingredient rows with a status tile, then numbered steps joined by a line.
export default function RecipeBody({ recipe }: { recipe: RecipeDetail }) {
      return (
            <>
                  <section aria-labelledby="ingredients" className="rounded-card bg-card p-5">
                        <div className="mb-2 flex items-baseline justify-between gap-3">
                              <h2 id="ingredients" className="text-section font-extrabold text-ink">
                                    Ingredientes
                              </h2>
                              <span className="text-sm font-bold text-ink-muted">
                                    {recipe.pantryMatch.have}/{recipe.pantryMatch.total} en tu despensa
                              </span>
                        </div>
                        <ul className="flex flex-col divide-y divide-line">
                              {recipe.ingredients.map((ingredient, index) => (
                                    <li key={`${ingredient.ingredientId}-${index}`} className="flex items-center gap-3 py-3">
                                          <span className={`grid size-11 shrink-0 place-items-center rounded-control ${ingredient.inPantry ? "bg-mint-soft text-mint-ink" : "bg-peach-soft text-peach-ink"}`}>
                                                <Icon name={ingredient.inPantry ? "check" : ingredient.inShoppingList ? "cart" : "close"} className="size-5" strokeWidth={2.5} />
                                          </span>
                                          <span className="min-w-0 flex-1">
                                                <span className="block font-bold text-ink">
                                                      {ingredient.label}
                                                      {ingredient.prep && <span className="font-semibold text-ink-muted">, {ingredient.prep}</span>}
                                                </span>
                                                <span className={`block text-xs font-extrabold ${ingredient.inPantry ? "text-mint-ink" : "text-peach-ink"}`}>
                                                      {ingredient.inPantry ? "En tu despensa" : ingredient.inShoppingList ? "En tu lista" : "Te falta"}
                                                </span>
                                          </span>
                                          <span className="font-display text-title font-extrabold text-ink tabular-nums">{ingredient.quantity.display}</span>
                                    </li>
                              ))}
                        </ul>
                  </section>

                  <section aria-labelledby="steps" className="rounded-card bg-card p-5">
                        <h2 id="steps" className="mb-4 text-section font-extrabold text-ink">
                              Preparación
                        </h2>
                        {recipe.steps ? (
                              <ol className="flex flex-col">
                                    {recipe.steps.map((step, index) => (
                                          <li key={index} className="relative flex gap-4 pb-5 last:pb-0">
                                                {index < recipe.steps!.length - 1 && <span aria-hidden className="absolute top-9 bottom-1 left-[15px] w-0.5 rounded-full bg-line" />}
                                                <span aria-hidden className="relative grid size-8 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-extrabold text-card">
                                                      {index + 1}
                                                </span>
                                                <div className="min-w-0 pt-1 text-ink">
                                                      {/* Steps written by users have no title: the backend cuts one from the text. */}
                                                      {!step.text.startsWith(step.title) && <p className="font-bold">{step.title}</p>}
                                                      <p>{step.text}</p>
                                                </div>
                                          </li>
                                    ))}
                              </ol>
                        ) : (
                              <p className="text-ink-muted">{plural(recipe.stepsCount, "paso", "pasos")}. Toca «Cocinar» para verlos uno a uno.</p>
                        )}
                  </section>
            </>
      );
}
