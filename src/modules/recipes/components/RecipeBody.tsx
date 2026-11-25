import Icon from "@/shared/components/ui/Icon";
import IngredientIcon from "@/shared/components/ui/IngredientIcon";
import { TitleIcon } from "@/shared/components/ui/ScribbleText";
import { plural } from "@/shared/lib/format";
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
                              <h2 id="ingredients" className="flex items-center gap-2 text-section font-semibold text-ink">
                                    <TitleIcon name="carrot" />
                                    Ingredientes
                              </h2>
                              {/* Library recipes are not matched with the pantry: «0/8» would be false. */}
                              {!recipe.nutritionEstimated && (
                                    <span className="inline-flex h-7 items-center rounded-full bg-mint-glow px-3.5 text-xs font-bold whitespace-nowrap text-mint-ink">
                                          {recipe.pantryMatch.have}/{recipe.pantryMatch.total} en tu despensa
                                    </span>
                              )}
                        </div>
                        <ul className="scrollbar-none -mx-5 flex gap-3 overflow-x-auto px-5 pt-2 pb-1">
                              {recipe.ingredients.map((ingredient, index) => {
                                    const missing = !ingredient.inPantry && !ingredient.inShoppingList;
                                    return (
                                          <li key={`${ingredient.ingredientId}-${index}`} className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5 text-center">
                                                <span className="relative block size-16">
                                                      <IngredientIcon label={ingredient.label} icon={ingredient.icon} shape="circle" className="size-full" />
                                                      {ingredient.inPantry ? (
                                                            <span className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full bg-protein text-card">
                                                                  <Icon name="check" className="size-3.5" strokeWidth={3} />
                                                                  <span className="sr-only">En tu despensa</span>
                                                            </span>
                                                      ) : ingredient.inShoppingList ? (
                                                            <span className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full bg-sky-ink text-card">
                                                                  <Icon name="cart" className="size-3.5" strokeWidth={2.5} />
                                                                  <span className="sr-only">En tu lista</span>
                                                            </span>
                                                      ) : onAdd ? (
                                                            <button
                                                                  type="button"
                                                                  aria-label={`Agregar ${ingredient.label} a la lista`}
                                                                  disabled={adding === ingredient.ingredientId}
                                                                  onClick={() => onAdd(ingredient)}
                                                                  className="absolute -top-1.5 -right-2 grid size-7 place-items-center rounded-full bg-brand text-card before:absolute before:-inset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:opacity-60"
                                                            >
                                                                  <Icon name="plus" className="size-4" strokeWidth={2.5} />
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
                        <h2 id="steps" className="mb-4 flex items-center gap-2 text-section font-semibold text-ink">
                              <TitleIcon name="list" />
                              Preparación
                        </h2>
                        {recipe.steps ? (
                              <ol className="flex flex-col">
                                    {recipe.steps.map((step, index) => (
                                          <li key={index} className="relative flex gap-4 pb-5 last:pb-0">
                                                {index < recipe.steps!.length - 1 && <span aria-hidden className="absolute top-9 bottom-1 left-[15px] w-0.5 rounded-full bg-line" />}
                                                <span aria-hidden className="relative grid size-8 shrink-0 place-items-center rounded-full bg-blush font-display text-base font-semibold text-primary-strong">
                                                      {index + 1}
                                                </span>
                                                <div className="min-w-0 pt-1 text-ink">
                                                      {/* Steps written by users have no title: the backend cuts one from the text. */}
                                                      {!step.text.startsWith(step.title) && <p className="font-bold">{step.title}</p>}
                                                      <p>{step.text}</p>
                                                      {step.ingredients && step.ingredients.length > 0 && (
                                                            <ul aria-label={`Ingredientes del paso ${index + 1}`} className="mt-2.5 flex flex-wrap gap-1.5">
                                                                  {step.ingredients.map((item, i) => (
                                                                        <li key={`${item.ingredientId ?? item.label}-${i}`} className="inline-flex min-h-8 items-center gap-1.5 rounded-full bg-field py-1 pr-3 pl-1 text-xs text-ink-muted">
                                                                              <IngredientIcon label={item.label} icon={recipe.ingredients.find((x) => x.ingredientId === item.ingredientId)?.icon} shape="circle" className="size-6 text-xs!" />
                                                                              <span className="font-bold text-ink">{item.label}</span>
                                                                              {item.quantity.display}
                                                                        </li>
                                                                  ))}
                                                            </ul>
                                                      )}
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
