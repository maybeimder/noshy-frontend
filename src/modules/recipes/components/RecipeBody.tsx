import Icon from "@/shared/components/ui/Icon";
import { formatQuantity } from "@/shared/lib/format";
import type { Ingredient, RecipeAdaptation } from "../types";

type RecipeBodyProps = {
      ingredients: Ingredient[];
      instructions: string[];
      /** When present, each ingredient is marked as in the pantry or missing. */
      adaptation?: RecipeAdaptation | null;
};

const key = (i: Ingredient) => `${i.name.trim().toLowerCase()}::${i.unit.trim().toLowerCase()}`;

export default function RecipeBody({ ingredients, instructions, adaptation }: RecipeBodyProps) {
      const missing = new Map(adaptation?.missingIngredients.map((i) => [key(i), i]));

      return (
            <>
                  <section aria-labelledby="ingredients" className="rounded-card bg-card p-6">
                        <h2 id="ingredients" className="mb-4 text-title font-bold text-ink">
                              Ingredientes
                        </h2>
                        <ul className="flex flex-col divide-y divide-line">
                              {ingredients.map((ingredient, index) => {
                                    const lacking = missing.get(key(ingredient));
                                    return (
                                          <li key={`${key(ingredient)}-${index}`} className="flex items-center gap-3 py-3">
                                                {adaptation && (
                                                      <span
                                                            className={`grid size-6 shrink-0 place-items-center rounded-full ${
                                                                  lacking ? "bg-primary-soft text-error" : "bg-secondary-soft text-success"
                                                            }`}
                                                      >
                                                            <Icon name={lacking ? "close" : "check"} className="size-3.5" strokeWidth={3} />
                                                      </span>
                                                )}
                                                <span className="flex-1 text-base text-ink">{ingredient.name}</span>
                                                <span className="text-right text-sm text-ink-muted tabular-nums">
                                                      {formatQuantity(ingredient.quantity, ingredient.unit)}
                                                      {adaptation && (
                                                            <span className={`block text-xs ${lacking ? "text-error" : "text-success"}`}>
                                                                  {lacking
                                                                        ? `Faltan ${formatQuantity(lacking.quantity, lacking.unit)}`
                                                                        : "En tu despensa"}
                                                            </span>
                                                      )}
                                                </span>
                                          </li>
                                    );
                              })}
                        </ul>
                  </section>

                  <section aria-labelledby="steps" className="rounded-card bg-card p-6">
                        <h2 id="steps" className="mb-4 text-title font-bold text-ink">
                              Preparación
                        </h2>
                        <ol className="flex flex-col gap-4">
                              {instructions.map((step, index) => (
                                    <li key={index} className="flex gap-4">
                                          <span
                                                aria-hidden
                                                className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary-soft text-sm font-bold text-ink"
                                          >
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
