import { useState } from "react";
import { Link } from "react-router-dom";
import { useRecipe } from "@/modules/recipes/hooks/useRecipes";
import Button from "@/shared/components/ui/Button";
import { DishPlate } from "@/shared/components/ui/DishArt";
import Icon from "@/shared/components/ui/Icon";
import IngredientIcon from "@/shared/components/ui/IngredientIcon";
import Photo from "@/shared/components/ui/Photo";
import { Sk } from "@/shared/components/ui/Skeleton";
import { plural } from "@/shared/lib/format";
import { useShoppingMutations } from "../hooks/useShoppingList";
import type { ShoppingItem, ShoppingList } from "../types";

/** What store mode narrows to when it opens from a recipe. */
export type StoreScope = { title: string; ingredientIds: string[] };

type RecipeSectionProps = {
      listId: string;
      recipe: ShoppingList["recipes"][number];
      /** Every item on the list by ingredient, unfiltered. */
      items: Map<string, ShoppingItem>;
      onShop: (scope: StoreScope) => void;
};

/**
 * One recipe on the list: what it needs, what is already at home, what is left to buy,
 * and the way to the store with only those.
 */
export default function RecipeSection({ listId, recipe, items, onShop }: RecipeSectionProps) {
      const detail = useRecipe(recipe.recipeId, { servings: recipe.servings });
      const { addItems, removeRecipe } = useShoppingMutations();
      const removeButton = (
            <>
                  <Button variant="tertiary" loading={removeRecipe.isPending} onClick={() => removeRecipe.mutate({ listId, recipeId: recipe.recipeId })} className="self-center text-ink-muted!">
                        <Icon name="trash" className="size-4" />
                        Quitar esta receta
                  </Button>
                  {removeRecipe.error && <p className="text-sm font-semibold text-error">{removeRecipe.error.message}</p>}
            </>
      );
      const [open, setOpen] = useState(true);
      const headingId = `recipe-${recipe.recipeId}`;

      if (detail.isPending) return <Sk className="h-44 rounded-[1.75rem]" />;
      // A recipe that no longer loads should not hide the rest of the list, nor stay on it forever.
      if (detail.isError)
            return (
                  <section aria-label={recipe.title} className="flex flex-col gap-1 rounded-[1.75rem] bg-card p-4 shadow-soft">
                        <p className="font-display font-extrabold text-ink">{recipe.title}</p>
                        <p className="text-sm text-ink-muted">No pudimos abrir esta receta.</p>
                        {removeButton}
                  </section>
            );

      const ingredients = detail.data.ingredients;
      const have = ingredients.filter((i) => i.inPantry);
      const toBuy = ingredients.filter((i) => !i.inPantry);
      const notListed = toBuy.filter((i) => !items.has(i.ingredientId));
      const inCart = toBuy.filter((i) => items.get(i.ingredientId)?.checked).length;
      const allHome = toBuy.length === 0;

      const goShop = () => {
            const scope = { title: recipe.title, ingredientIds: toBuy.map((i) => i.ingredientId) };
            if (notListed.length === 0) return onShop(scope);
            // Anything the list lost since (removed, bought elsewhere) goes back on before the store.
            addItems.mutate(
                  notListed.map((i) => ({
                        ingredientId: i.ingredientId,
                        ...(i.quantity.value !== null && i.quantity.unit !== "toTaste" && i.quantity.unit !== "all" ? { quantity: { value: i.quantity.value, unit: i.quantity.unit } } : {}),
                        sourceRecipeId: recipe.recipeId,
                  })),
                  { onSuccess: () => onShop(scope) },
            );
      };

      return (
            <section aria-labelledby={headingId} className="overflow-hidden rounded-[1.75rem] bg-card shadow-soft">
                  <button
                        type="button"
                        aria-expanded={open}
                        onClick={() => setOpen((v) => !v)}
                        className="flex w-full items-center gap-3 bg-[linear-gradient(120deg,var(--color-rose-soft),var(--color-peach-soft))] p-3 pr-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-strong"
                  >
                        <span className="size-14 shrink-0 overflow-hidden rounded-full border-[3px] border-card bg-card shadow-soft">
                              <Photo url={detail.data.imageUrl} width={112} height={112} className="size-full object-cover" fallback={<DishPlate seed={recipe.recipeId} className="size-full" />} />
                        </span>
                        <span className="min-w-0 flex-1">
                              <span className="block text-xs font-extrabold tracking-wider text-rose-ink uppercase">Para cocinar</span>
                              <span id={headingId} className="block truncate font-display text-title font-extrabold text-ink">
                                    {recipe.title}
                              </span>
                              <span className="block text-sm font-semibold text-ink-muted">
                                    {plural(recipe.servings, "porción", "porciones")} · tienes {have.length} de {ingredients.length}
                              </span>
                        </span>
                        <Icon name="chevronDown" className={`size-5 shrink-0 text-ink-muted transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2.5} />
                  </button>

                  {open && (
                        <div className="cook-fade flex flex-col gap-4 p-4">
                              {toBuy.length > 0 && (
                                    <Group title={`Te ${toBuy.length === 1 ? "falta" : "faltan"} ${toBuy.length}`} tone="missing">
                                          {toBuy.map((i) => {
                                                const listed = items.get(i.ingredientId);
                                                return (
                                                      <Row key={i.ingredientId} label={i.label} icon={i.icon} need={i.quantity.display}>
                                                            {listed?.checked ? (
                                                                  <Status tone="cart">
                                                                        <Icon name="check" className="size-3" strokeWidth={3} />
                                                                        En el carrito
                                                                  </Status>
                                                            ) : listed ? (
                                                                  <Status tone="list">En tu lista</Status>
                                                            ) : (
                                                                  <Status tone="missing">Sin agregar</Status>
                                                            )}
                                                      </Row>
                                                );
                                          })}
                                    </Group>
                              )}

                              {have.length > 0 && (
                                    <Group title={`Ya ${have.length === 1 ? "tienes 1" : `tienes ${have.length}`}`} tone="have">
                                          {have.map((i) => (
                                                <Row key={i.ingredientId} label={i.label} icon={i.icon} need={i.quantity.display}>
                                                      <Status tone="have">
                                                            <Icon name="check" className="size-3" strokeWidth={3} />
                                                            En tu despensa
                                                      </Status>
                                                </Row>
                                          ))}
                                    </Group>
                              )}

                              {allHome ? (
                                    <div className="flex items-center gap-3 rounded-control bg-mint-soft p-3 text-mint-ink">
                                          <Icon name="check" className="size-5 shrink-0" strokeWidth={2.5} />
                                          <p className="min-w-0 flex-1 text-sm font-bold">Tienes todo para esta receta.</p>
                                          <Link to={`/recetas/${recipe.recipeId}`} className="shrink-0 text-sm font-extrabold underline underline-offset-2">
                                                Ver receta
                                          </Link>
                                    </div>
                              ) : inCart === toBuy.length ? (
                                    <p className="rounded-control bg-mint-soft p-3 text-sm font-bold text-mint-ink">Ya está todo en el carrito.</p>
                              ) : (
                                    <div className="flex flex-col gap-3 rounded-[1.5rem] bg-plum-glow p-4 text-card">
                                          <p className="font-display text-title leading-snug font-extrabold">
                                                ¿Vamos a comprar {toBuy.length === 1 ? "lo que falta" : `los ${toBuy.length} que faltan`}?
                                          </p>
                                          <p className="-mt-2 text-sm text-card/80">Abro el modo tienda solo con los ingredientes de esta receta.</p>
                                          {addItems.error && <p className="text-sm font-bold text-card">{addItems.error.message}</p>}
                                          <Button size="lg" fullWidth arrow="store" loading={addItems.isPending} onClick={goShop}>
                                                Sí, ir a comprar
                                          </Button>
                                    </div>
                              )}
                              {removeButton}
                        </div>
                  )}
            </section>
      );
}

function Group({ title, tone, children }: { title: string; tone: "missing" | "have"; children: React.ReactNode }) {
      return (
            <div className="flex flex-col gap-1">
                  <h3 className={`font-sans text-xs font-extrabold tracking-wider uppercase ${tone === "missing" ? "text-rose-ink" : "text-mint-ink"}`}>{title}</h3>
                  <ul className="flex flex-col divide-y divide-line">{children}</ul>
            </div>
      );
}

function Row({ label, icon, need, children }: { label: string; icon: string; need: string; children: React.ReactNode }) {
      return (
            <li className="flex items-center gap-3 py-2">
                  <IngredientIcon label={label} icon={icon} shape="circle" className="size-9" />
                  <span className="min-w-0 flex-1">
                        <span className="block truncate font-bold text-ink">{label}</span>
                        <span className="block text-xs text-ink-muted">
                              Necesitas <strong className="text-ink tabular-nums">{need}</strong>
                        </span>
                  </span>
                  {children}
            </li>
      );
}

const statusTones = {
      missing: "bg-primary-soft text-rose-ink",
      list: "bg-sky-soft text-sky-ink",
      cart: "bg-primary-strong text-card",
      have: "bg-mint-soft text-mint-ink",
};

function Status({ tone, children }: { tone: keyof typeof statusTones; children: React.ReactNode }) {
      return <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold ${statusTones[tone]}`}>{children}</span>;
}
