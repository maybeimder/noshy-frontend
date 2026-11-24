import Icon from "@/shared/components/ui/Icon";
import IngredientIcon from "@/shared/components/ui/IngredientIcon";
import { plural } from "@/shared/lib/format";
import { tones, toneFor } from "@/shared/lib/tones";
import type { RecipeDetail, RecipeIngredient } from "../types";

type RecipeBodyProps = {
      recipe: RecipeDetail;
      /** «+» on a missing ingredient: adds it to the shopping list. */
      onAdd?: (ingredient: RecipeIngredient) => void;
      adding?: string | null;
};

// Ingredients as round tiles (✓ in the pantry, + to buy), then the steps joined by a line.
export default function RecipeBody({ recipe, onAdd, adding }: RecipeBodyProps) {
      return (
            <>
                  <section aria-labelledby="ingredients">
                        <div className="mb-3 flex items-center justify-between gap-3">
                              <h2 id="ingredients" className="text-section font-extrabold text-ink">
                                    Ingredientes
                              </h2>
                              <span className="rounded-full bg-mint-soft px-3 py-1 text-xs font-extrabold text-mint-ink">
                                    {recipe.pantryMatch.have}/{recipe.pantryMatch.total} en tu despensa
                              </span>
                        </div>
                        <ul className="scrollbar-none -mx-5 flex gap-3 overflow-x-auto px-5 pt-2 pb-1">
                              {recipe.ingredients.map((ingredient, index) => {
                                    const tone = tones[toneFor(ingredient.label)];
                                    const missing = !ingredient.inPantry && !ingredient.inShoppingList;
                                    return (
                                          <li key={`${ingredient.ingredientId}-${index}`} className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5 text-center">
                                                <span className={`relative grid size-16 place-items-center rounded-full ${tone.soft}`}>
                                                      <IngredientIcon label={ingredient.label} icon={ingredient.icon} shape="bare" className="size-full" />
                                                      {ingredient.inPantry ? (
                                                            <span className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-canvas bg-mint-ink text-card">
                                                                  <Icon name="check" className="size-3.5" strokeWidth={3} />
                                                                  <span className="sr-only">En tu despensa</span>
                                                            </span>
                                                      ) : ingredient.inShoppingList ? (
                                                            <span className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full border-2 border-canvas bg-sky-ink text-card">
                                                                  <Icon name="cart" className="size-3.5" strokeWidth={2.5} />
                                                                  <span className="sr-only">En tu lista</span>
                                                            </span>
                                                      ) : onAdd ? (
                                                            <button
                                                                  type="button"
                                                                  aria-label={`Agregar ${ingredient.label} a la lista`}
                                                                  disabled={adding === ingredient.ingredientId}
                                                                  onClick={() => onAdd(ingredient)}
                                                                  className="absolute -top-2 -right-2 grid size-8 place-items-center rounded-full border-2 border-canvas bg-primary-strong text-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:opacity-60"
                                                            >
                                                                  <Icon name="plus" className="size-4" strokeWidth={3} />
                                                            </button>
                                                      ) : null}
                                                </span>
                                                <span className="w-full text-xs leading-tight font-bold text-ink">{ingredient.label}</span>
                                                <span className={`text-xs font-semibold ${missing ? "text-primary-strong" : "text-ink-muted"}`}>{ingredient.quantity.display}</span>
                                          </li>
                                    );
                              })}
                        </ul>
                  </section>

                  <section aria-labelledby="steps" className="rounded-card bg-card p-5 shadow-soft">
                        <h2 id="steps" className="mb-4 text-section font-extrabold text-ink">
                              Preparación
                        </h2>
                        {recipe.steps ? (
                              <ol className="flex flex-col">
                                    {recipe.steps.map((step, index) => (
                                          <li key={index} className="relative flex gap-4 pb-5 last:pb-0">
                                                {index < recipe.steps!.length - 1 && <span aria-hidden className="absolute top-9 bottom-1 left-[15px] w-0.5 rounded-full bg-line" />}
                                                <span aria-hidden className="relative grid size-8 shrink-0 place-items-center rounded-full bg-primary-soft font-serif text-base font-bold text-primary-strong">
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
                              <p className="text-ink-muted">{plural(recipe.stepsCount, "paso", "pasos")}. Toca «Modo cocina» para verlos uno a uno.</p>
                        )}
                  </section>
            </>
      );
}
