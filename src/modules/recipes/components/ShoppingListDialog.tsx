import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "@/modules/inventory/hooks/useInventory";
import { useCreateShoppingList, useSavedShoppingList } from "@/modules/shopping-list/hooks/useShoppingList";
import type { ShoppingListRequest } from "@/modules/shopping-list/types";
import Button from "@/shared/components/ui/Button";
import Dialog from "@/shared/components/ui/Dialog";
import { Sparkle } from "@/shared/components/ui/Doodles";
import Icon from "@/shared/components/ui/Icon";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";
import { formatQuantity } from "@/shared/lib/format";
import type { Recipe } from "../types";

type ShoppingListDialogProps = {
      recipe: Recipe;
      /** Own recipes are looked up by id; others are sent inline. */
      own: boolean;
      open: boolean;
      onClose: () => void;
};

const key = (name: string, unit: string) => `${name.trim().toLowerCase()}::${unit.trim().toLowerCase()}`;

// ref/Crear lista.png: bottom sheet with a live preview of what is missing.
export default function ShoppingListDialog({ recipe, own, open, onClose }: ShoppingListDialogProps) {
      const navigate = useNavigate();
      const create = useCreateShoppingList();
      const { saved } = useSavedShoppingList();
      const inventory = useInventory();
      const [servings, setServings] = useState(1);

      // Same matching as the backend (name + unit) so the preview equals the list it will create.
      const available = new Map<string, number>();
      for (const item of inventory.data ?? []) available.set(key(item.name, item.unit), (available.get(key(item.name, item.unit)) ?? 0) + item.quantity);
      const preview = recipe.ingredients.map((ingredient) => {
            const needed = ingredient.quantity * servings;
            const missing = Math.max(needed - (available.get(key(ingredient.name, ingredient.unit)) ?? 0), 0);
            return { ...ingredient, missing };
      });

      const request: ShoppingListRequest = {
            recipes: [own ? { recipeId: recipe.id, servings } : { title: recipe.title, ingredients: recipe.ingredients, servings }],
      };

      return (
            <Dialog
                  open={open}
                  onClose={onClose}
                  variant="sheet"
                  title="Lista de compras"
                  leading={<MascotAvatar className="size-12" />}
                  actions={
                        <>
                              <Button variant="soft" size="lg" onClick={onClose}>
                                    Cancelar
                              </Button>
                              <Button size="lg" loading={create.isPending} onClick={() => create.mutate(request, { onSuccess: () => navigate("/compras") })}>
                                    Crear lista
                              </Button>
                        </>
                  }
            >
                  <div className="flex flex-col gap-4">
                        <p className="text-ink">
                              Reviso tu despensa y te digo qué te falta para <strong>{recipe.title}</strong>.
                        </p>

                        <div className="flex items-center gap-3 rounded-card bg-field p-4">
                              <div className="min-w-0 flex-1">
                                    <p className="font-display font-extrabold text-ink">¿Cuántas veces la harás?</p>
                                    <p className="text-xs font-semibold text-ink-muted">Ajusto las cantidades</p>
                              </div>
                              <div role="group" aria-label="Veces que la harás" className="flex items-center gap-3">
                                    <button
                                          type="button"
                                          aria-label="Una vez menos"
                                          disabled={servings <= 1}
                                          onClick={() => setServings((n) => Math.max(1, n - 1))}
                                          className="grid size-11 place-items-center rounded-control bg-card text-ink focus-visible:outline-2 focus-visible:outline-primary-strong disabled:opacity-50"
                                    >
                                          <Icon name="minus" />
                                    </button>
                                    <output aria-live="polite" className="w-5 text-center font-display text-section font-extrabold">
                                          {servings}
                                    </output>
                                    <button
                                          type="button"
                                          aria-label="Una vez más"
                                          disabled={servings >= 20}
                                          onClick={() => setServings((n) => Math.min(20, n + 1))}
                                          className="grid size-11 place-items-center rounded-control bg-primary-strong text-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:opacity-50"
                                    >
                                          <Icon name="plus" />
                                    </button>
                              </div>
                        </div>

                        <div>
                              <p className="flex items-center justify-between text-xs font-extrabold tracking-wide text-ink-muted uppercase">
                                    Vas a necesitar
                                    <Sparkle className="size-4 text-secondary" />
                              </p>
                              <ul className="mt-2 flex flex-wrap gap-2">
                                    {preview.map((item) => (
                                          <li
                                                key={key(item.name, item.unit)}
                                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-extrabold ${
                                                      item.missing > 0 ? "bg-peach-soft text-peach-ink" : "bg-mint-soft text-mint-ink"
                                                }`}
                                          >
                                                {item.missing > 0 ? (
                                                      `${item.name} · ${formatQuantity(item.missing, item.unit)}`
                                                ) : (
                                                      <>
                                                            <Icon name="check" className="size-4" strokeWidth={2.5} />
                                                            {item.name} · ya lo tienes
                                                      </>
                                                )}
                                          </li>
                                    ))}
                              </ul>
                        </div>

                        {saved && (
                              <p className="flex items-center gap-1.5 text-xs font-semibold text-ink-muted">
                                    <Icon name="info" className="size-4" />
                                    Esta lista reemplaza tu lista actual.
                              </p>
                        )}
                        {create.error && <p className="text-sm text-error">{create.error.message}</p>}
                  </div>
            </Dialog>
      );
}
