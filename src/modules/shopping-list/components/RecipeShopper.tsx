import { useMemo, useState } from "react";
import { usePantry } from "@/modules/inventory/hooks/useInventory";
import { useMyRecipes, useRecipe, useRecommendations, useSavedRecipes } from "@/modules/recipes/hooks/useRecipes";
import type { RecipeIngredient } from "@/modules/recipes/types";
import Button from "@/shared/components/ui/Button";
import Chips from "@/shared/components/ui/Chips";
import { DishPlate } from "@/shared/components/ui/DishArt";
import Dialog from "@/shared/components/ui/Dialog";
import Icon from "@/shared/components/ui/Icon";
import IngredientIcon from "@/shared/components/ui/IngredientIcon";
import Photo from "@/shared/components/ui/Photo";
import { ErrorState } from "@/shared/components/ui/QueryState";
import { Sk, times } from "@/shared/components/ui/Skeleton";
import Stepper from "@/shared/components/ui/Stepper";
import { plural } from "@/shared/lib/format";
import { useShoppingMutations } from "../hooks/useShoppingList";
import type { StoreScope } from "./RecipeSection";

type Source = "saved" | "mine" | "forYou";

/** Rows while a list or a recipe loads, in the shape they will take. */
function LoadingState() {
      return (
            <div aria-busy className="flex flex-col gap-2">
                  {times(3).map((i) => (
                        <Sk key={i} className="h-16 rounded-card" />
                  ))}
                  <span className="sr-only">Cargando…</span>
            </div>
      );
}
type Pick = { id: string; title: string; imageUrl: string | null };

/** «Comprar para una receta»: pick one, see what you have and what you lack, add what is missing. */
export default function RecipeShopper({ open, onClose, onShop }: { open: boolean; onClose: () => void; onShop: (scope: StoreScope) => void }) {
      const [picked, setPicked] = useState<Pick | null>(null);
      const close = () => {
            setPicked(null);
            onClose();
      };
      return (
            <Dialog open={open} onClose={close} variant="sheet" title={picked ? picked.title : "Comprar para una receta"}>
                  {open && (picked ? <Plan
                                    recipe={picked}
                                    onBack={() => setPicked(null)}
                                    onDone={close}
                                    onShop={(scope) => {
                                          close();
                                          onShop(scope);
                                    }}
                              /> : <Picker onPick={setPicked} />)}
            </Dialog>
      );
}

function Picker({ onPick }: { onPick: (recipe: Pick) => void }) {
      const saved = useSavedRecipes();
      const [source, setSource] = useState<Source>(saved.recipes.length ? "saved" : "forYou");
      const mine = useMyRecipes();
      const forYou = useRecommendations({ source: "forYou" });

      const list: Pick[] =
            source === "saved"
                  ? saved.recipes
                  : source === "mine"
                    ? (mine.data?.pages ?? []).flatMap((p) => p.data).map((r) => ({ id: r.id, title: r.title, imageUrl: r.coverImageUrl }))
                    : (forYou.data?.pages ?? []).flatMap((p) => p.data);
      const loading = source === "saved" ? saved.pending && !saved.recipes.length : source === "mine" ? mine.isPending : forYou.isPending;

      return (
            <div className="flex flex-col gap-3">
                  <p className="text-sm text-ink-muted">Elige una receta y te digo qué tienes en tu despensa y qué te falta comprar.</p>
                  <Chips
                        label="De dónde"
                        value={source}
                        onChange={setSource}
                        options={[
                              { id: "saved", label: "Guardadas", icon: "bookmark" },
                              { id: "mine", label: "Mis recetas", icon: "book" },
                              { id: "forYou", label: "Para ti", icon: "sparkle" },
                        ]}
                  />
                  {loading ? (
                        <LoadingState />
                  ) : list.length === 0 ? (
                        <p className="rounded-control bg-field p-4 text-sm text-ink-muted">
                              {source === "saved" ? "Aún no guardas recetas. Usa el marcador en una receta o «Guardar» en el chat." : "No hay recetas aquí todavía."}
                        </p>
                  ) : (
                        <ul className="flex max-h-[50dvh] flex-col gap-2 overflow-y-auto">
                              {list.map((recipe) => (
                                    <li key={recipe.id}>
                                          <button
                                                type="button"
                                                onClick={() => onPick(recipe)}
                                                className="flex w-full items-center gap-3 rounded-card bg-field p-2 pr-3 text-left transition-colors hover:bg-line focus-visible:outline-2 focus-visible:outline-primary-strong"
                                          >
                                                <span className="size-14 shrink-0 overflow-hidden rounded-control bg-card">
                                                      <Photo url={recipe.imageUrl} width={112} height={112} className="size-full object-cover" fallback={<DishPlate seed={recipe.id} className="size-full" />} />
                                                </span>
                                                <span className="min-w-0 flex-1 font-display font-extrabold text-ink">{recipe.title}</span>
                                                <Icon name="chevronRight" className="size-5 shrink-0 text-ink-muted" />
                                          </button>
                                    </li>
                              ))}
                        </ul>
                  )}
            </div>
      );
}

type Row = RecipeIngredient & { have: string | null; status: "have" | "list" | "missing" };

function Plan({ recipe, onBack, onDone, onShop }: { recipe: Pick; onBack: () => void; onDone: () => void; onShop: (scope: StoreScope) => void }) {
      const [servings, setServings] = useState<number>();
      const detail = useRecipe(recipe.id, { servings });
      const pantry = usePantry({ sort: "name" });
      const { addItems } = useShoppingMutations();
      const [skip, setSkip] = useState<string[]>([]);

      // The recipe only says whether you have something; the pantry says how much.
      const byIngredient = useMemo(() => new Map((pantry.data?.pages ?? []).flatMap((p) => p.data).map((i) => [i.ingredientId, i])), [pantry.data]);
      const rows: Row[] = (detail.data?.ingredients ?? []).map((i) => {
            const item = byIngredient.get(i.ingredientId);
            const have = item ? (item.quantity?.display ?? (item.remainingPct !== null ? `te queda ${item.remainingPct}%` : "sí")) : null;
            return { ...i, have, status: i.inPantry ? "have" : i.inShoppingList ? "list" : "missing" };
      });
      const missing = rows.filter((r) => r.status === "missing");
      const chosen = missing.filter((r) => !skip.includes(r.ingredientId));
      const listed = rows.filter((r) => r.status === "list");
      const shop = () => onShop({ title: recipe.title, ingredientIds: rows.filter((r) => r.status !== "have").map((r) => r.ingredientId) });

      if (detail.isPending) return <LoadingState />;
      if (detail.isError) return <ErrorState message={detail.error.message} onRetry={() => detail.refetch()} />;
      const r = detail.data;

      if (addItems.isSuccess) {
            const n = addItems.data.added + addItems.data.merged;
            return (
                  <div className="flex flex-col items-center gap-3 py-4 text-center">
                        <span className="pop-in grid size-14 place-items-center rounded-full bg-mint-soft text-mint-ink">
                              <Icon name="check" className="size-7" strokeWidth={2.5} />
                        </span>
                        <p className="font-display text-title font-extrabold text-ink">{n > 0 ? `Agregué ${plural(n, "ingrediente", "ingredientes")} a tu lista` : "Ya tenías todo en tu lista"}</p>
                        <p className="text-sm text-ink-muted">
                              Para {r.title}, {plural(r.servings.value, "porción", "porciones")}. Lo verás en tu lista, en su propia sección.
                        </p>
                        <div className="mt-2 flex w-full flex-col gap-3 rounded-[1.5rem] bg-plum-glow p-4 text-left text-card">
                              <p className="font-display text-title leading-snug font-extrabold">¿Quieres ir a comprar estos ingredientes ahora?</p>
                              <p className="-mt-2 text-sm text-card/80">Abro el modo tienda solo con lo que le falta a esta receta.</p>
                              <Button size="lg" fullWidth arrow="store" onClick={shop}>
                                    Sí, activar modo tienda
                              </Button>
                        </div>
                        <Button variant="soft" fullWidth onClick={onDone}>
                              Más tarde
                        </Button>
                  </div>
            );
      }

      return (
            <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between gap-3">
                        <button type="button" onClick={onBack} className="inline-flex min-h-11 items-center gap-1 rounded-full text-sm font-bold text-primary-strong focus-visible:outline-2 focus-visible:outline-primary-strong">
                              <Icon name="back" className="size-4" strokeWidth={2.5} />
                              Otra receta
                        </button>
                        <Stepper label="Porciones" value={r.servings.value} min={r.servings.min} max={r.servings.max} onChange={setServings} suffix="porciones" />
                  </div>

                  <p className="text-sm font-semibold text-ink-muted">
                        {r.pantryMatch.have}/{r.pantryMatch.total} en tu despensa · te {missing.length === 1 ? "falta 1" : `faltan ${missing.length}`}
                  </p>

                  <ul className="flex max-h-[45dvh] flex-col divide-y divide-line overflow-y-auto rounded-card bg-field/60 px-3">
                        {rows.map((row) => {
                              const off = skip.includes(row.ingredientId);
                              const statusChip =
                                    row.status === "have" ? (
                                          <>
                                                <span className="rounded-full bg-mint-soft px-2 py-0.5 text-xs font-extrabold text-mint-ink">Tienes{row.have && row.have !== "sí" ? ` ${row.have}` : ""}</span>
                                                {/* Most pantry items are stored without an amount; say so instead of implying enough. */}
                                                {(!row.have || row.have === "sí") && <span className="italic">sin cantidad anotada</span>}
                                          </>
                                    ) : row.status === "list" ? (
                                          <span className="rounded-full bg-sky-soft px-2 py-0.5 text-xs font-extrabold text-sky-ink">Ya en tu lista</span>
                                    ) : (
                                          <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-extrabold text-rose-ink">Te falta</span>
                                    );
                              return (
                                    <li key={row.ingredientId} className="flex items-center gap-3 py-2.5">
                                          <IngredientIcon label={row.label} icon={row.icon} className="size-10" />
                                          <span className="min-w-0 flex-1">
                                                <span className="block truncate font-bold text-ink">{row.label}</span>
                                                <span className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted">
                                                      Necesitas <strong className="text-ink">{row.quantity.display}</strong>
                                                      {statusChip}
                                                </span>
                                          </span>
                                          {row.status === "missing" && (
                                                <label className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full has-focus-visible:outline-2 has-focus-visible:outline-primary-strong">
                                                      <input
                                                            type="checkbox"
                                                            checked={!off}
                                                            onChange={() => setSkip((s) => (off ? s.filter((x) => x !== row.ingredientId) : [...s, row.ingredientId]))}
                                                            aria-label={`Comprar ${row.label}`}
                                                            className="sr-only"
                                                      />
                                                      <span aria-hidden className={`grid size-7 place-items-center rounded-full ${off ? "border-2 border-line bg-card" : "bg-primary-strong text-card"}`}>
                                                            {!off && <Icon name="check" className="pop-in size-4" strokeWidth={3} />}
                                                      </span>
                                                </label>
                                          )}
                                    </li>
                              );
                        })}
                  </ul>

                  {addItems.error && <p className="text-sm font-semibold text-error">{addItems.error.message}</p>}
                  {/* Everything missing is already on the list: straight to the store. */}
                  {chosen.length === 0 && listed.length > 0 ? (
                        <Button size="lg" fullWidth arrow="store" onClick={shop}>
                              Ir a comprar {plural(listed.length, "ingrediente", "ingredientes")}
                        </Button>
                  ) : (
                  <Button
                        size="lg"
                        fullWidth
                        arrow="cart"
                        loading={addItems.isPending}
                        disabled={chosen.length === 0}
                        onClick={() =>
                              addItems.mutate(
                                    chosen.map((i) => ({
                                          ingredientId: i.ingredientId,
                                          ...(i.quantity.value !== null && i.quantity.unit !== "toTaste" && i.quantity.unit !== "all" ? { quantity: { value: i.quantity.value, unit: i.quantity.unit } } : {}),
                                          sourceRecipeId: r.id,
                                    })),
                              )
                        }
                  >
                        {chosen.length ? `Agregar ${plural(chosen.length, "ingrediente", "ingredientes")} a la lista` : missing.length ? "Elige qué comprar" : "Ya tienes todo"}
                  </Button>
                  )}
            </div>
      );
}
