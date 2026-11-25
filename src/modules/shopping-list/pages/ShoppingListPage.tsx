import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import NudgeCard from "@/modules/cooking/components/NudgeCard";
import { useNudge } from "@/modules/cooking/hooks/useHome";
import IngredientSearch from "@/modules/inventory/components/IngredientSearch";
import KitchenHeader from "@/modules/inventory/components/KitchenHeader";
import Button, { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import Chips from "@/shared/components/ui/Chips";
import Dialog from "@/shared/components/ui/Dialog";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon, { type IconName } from "@/shared/components/ui/Icon";
import IngredientIcon from "@/shared/components/ui/IngredientIcon";
import Mascot from "@/shared/components/ui/Mascot";
import QuantityField from "@/shared/components/ui/QuantityField";
import { ErrorState } from "@/shared/components/ui/QueryState";
import RoundButton from "@/shared/components/ui/RoundButton";
import { Sk } from "@/shared/components/ui/Skeleton";
import TextField from "@/shared/components/ui/TextField";
import { useRememberShape } from "@/shared/hooks/useShape";
import { newKey } from "@/shared/lib/axios";
import { formatDate, formatMoney, dayToDate, plural } from "@/shared/lib/format";
import { shareText } from "@/shared/lib/share";
import { formatAmount, parseAmount, unitChoicesFor } from "@/shared/lib/units";
import RecipeSection, { type StoreScope } from "../components/RecipeSection";
import RecipeShopper from "../components/RecipeShopper";
import ShoppingSkeleton, { type ShoppingShape } from "../components/ShoppingSkeleton";
import { useShoppingList, useShoppingMutations } from "../hooks/useShoppingList";
import type { CheckoutResult, ShoppingItem, ShoppingList } from "../types";

export default function ShoppingListPage() {
      // Store mode: same list, in aisle order, with the real price at hand.
      const [storeMode, setStoreMode] = useState(false);
      const [filter, setFilter] = useState("all");
      const [addOpen, setAddOpen] = useState(false);
      const [notice, setNotice] = useState<string | null>(null);
      const [done, setDone] = useState<CheckoutResult | null>(null);
      const [forRecipe, setForRecipe] = useState(false);
      // Store mode opened from a recipe shows only what that recipe still needs.
      const [scope, setScope] = useState<StoreScope | null>(null);
      const shopFor = (next: StoreScope) => {
            setScope(next);
            setFilter("all");
            setStoreMode(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
      };
      const leaveStore = () => {
            setStoreMode(false);
            setScope(null);
      };
      const shopper = <RecipeShopper open={forRecipe} onClose={() => setForRecipe(false)} onShop={shopFor} />;
      const forRecipeButton = (
            <button
                  type="button"
                  onClick={() => setForRecipe(true)}
                  className="group flex items-center gap-3 rounded-card border-2 border-dashed border-primary/40 bg-card/60 p-3 text-left transition-colors hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
            >
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-strong">
                        <Icon name="book" className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                        <span className="block font-display font-extrabold text-ink">Comprar para una receta</span>
                        <span className="block text-sm text-ink-muted">Te digo qué tienes y qué te falta</span>
                  </span>
                  <Icon name="chevronRight" className="size-5 shrink-0 text-primary-strong transition-transform group-hover:translate-x-0.5" />
            </button>
      );
      const list = useShoppingList(storeMode ? "storeLayout" : "category");
      const { addItems, share } = useShoppingMutations();
      const nudge = useNudge("shoppingList");

      const onShare = (data: ShoppingList) =>
            share.mutate(data.id, {
                  onSuccess: async ({ url, text }) => {
                        const token = url.split("/").pop()!;
                        setNotice(await shareText("Lista de compras", `${text}\n${window.location.origin}/l/${token}`));
                  },
                  onError: (error) => setNotice(error.message),
            });

      const add = (
            <section aria-label="Agregar a la lista" className="rounded-card bg-card p-4 shadow-soft">
                  <IngredientSearch label="Buscar para agregar a la lista" onPick={(option) => addItems.mutate([{ ingredientId: option.id }])} />
                  {addItems.error && <p className="mt-2 text-sm font-semibold text-error">{addItems.error.message}</p>}
                  {addItems.isSuccess && (
                        <p role="status" className="mt-2 text-sm font-bold text-mint-ink">
                              Agregado a tu lista.
                        </p>
                  )}
            </section>
      );

      useRememberShape<ShoppingShape>("shopping", list.data === undefined || nudge.isPending || storeMode ? null : shapeOf(list.data, Boolean(nudge.data)));

      if (list.isPending || nudge.isPending) {
            return (
                  <>
                        <KitchenHeader section="pantry" pantryTab="shopping" meta={null} actions={headerRoom} />
                        <ShoppingSkeleton />
                  </>
            );
      }
      if (list.isError) {
            return (
                  <main className="mx-auto max-w-xl px-5 pt-12">
                        <ErrorState message={list.error.message} onRetry={() => list.refetch()} />
                  </main>
            );
      }

      const doneNotice = done && (
            <p role="status" className="rounded-control bg-mint-soft p-4 text-sm font-bold text-mint-ink">
                  Compra terminada: gastaste {formatMoney(done.spent)} y pasé {plural(done.pantryAdded, "producto", "productos")} a tu despensa. Esta semana llevas {formatMoney(done.budget.spentThisWeek)} de{" "}
                  {formatMoney(done.budget.weekly)}.
            </p>
      );

      if (!list.data) {
            return (
                  <>
                        <KitchenHeader section="pantry" pantryTab="shopping" meta="Esta semana" actions={<span className="size-12" />} />
                        <main className="mx-auto flex max-w-xl flex-col gap-5 px-5 pt-3">
                              {doneNotice}
                              <section className="relative overflow-hidden rounded-card bg-peach-glow p-5 pr-36 shadow-soft">
                                    <Mascot className="absolute -right-2 -bottom-4 w-36" />
                                    <h2 className="text-section font-extrabold text-ink">No tienes lista esta semana</h2>
                                    <p className="mt-2 text-sm font-semibold text-ink">Agrega un ingrediente, o abre una receta y toca «Lista de compras».</p>
                                    <Link to="/recetas?ver=explorar" className={`${buttonBase} ${buttonVariants.dark} mt-4 min-h-11 text-sm`}>
                                          Ver recetas
                                    </Link>
                              </section>
                              {forRecipeButton}
                              {add}
                        </main>
                        {shopper}
                  </>
            );
      }

      const data = list.data;
      const { inCart, total } = data.progress;
      const matches = (item: ShoppingItem) =>
            storeMode ? !scope || scope.ingredientIds.includes(item.ingredientId) : filter === "all" || (filter === "fridge" ? item.storage === "fridge" : item.categoryId === filter);
      const byIngredient = new Map(data.groups.flatMap((g) => g.items).map((i) => [i.ingredientId, i]));
      const groups = data.groups.map((g) => ({ ...g, items: g.items.filter(matches) })).filter((g) => g.items.length > 0);
      // A recipe's store run counts only its own items.
      const scopedItems = storeMode && scope ? groups.flatMap((g) => g.items) : null;
      const shownInCart = scopedItems ? scopedItems.filter((i) => i.checked).length : inCart;
      const shownTotal = scopedItems ? scopedItems.length : total;

      return (
            <>
                  <KitchenHeader
                        section="pantry"
                        pantryTab="shopping"
                        meta={`${plural(data.recipes.length, "receta", "recetas")} · semana del ${formatDate(dayToDate(data.weekStart).toISOString())}`}
                        actions={
                              <>
                                    <RoundButton label={addOpen ? "Cerrar agregar" : "Agregar a la lista"} onClick={() => setAddOpen((v) => !v)}>
                                          <Icon name={addOpen ? "close" : "plus"} strokeWidth={2.25} />
                                    </RoundButton>
                                    <RoundButton tone="primary" label="Compartir lista" onClick={() => onShare(data)}>
                                          <Icon name="share" strokeWidth={2.25} />
                                    </RoundButton>
                              </>
                        }
                  />

                  <main className="mx-auto flex max-w-xl flex-col gap-5 px-5 pt-3 pb-48">
                        {doneNotice}
                        {notice && (
                              <p role="status" className="rounded-control bg-field p-3 text-sm font-bold text-ink">
                                    {notice}
                              </p>
                        )}
                        {addOpen && add}
                        {nudge.data && <NudgeCard nudge={nudge.data} />}

                        {storeMode && (
                              <div className="flex items-center gap-3 rounded-card bg-plum-glow p-3 pl-4 text-card shadow-soft">
                                    <Icon name="store" className="size-6 shrink-0 text-secondary" />
                                    <p className="min-w-0 flex-1 text-sm">
                                          <strong className="block font-display text-base">Modo tienda · {data.store.name}</strong>
                                          {scope ? (
                                                <>
                                                      Solo para <strong>{scope.title}</strong>.{" "}
                                                      <button type="button" onClick={() => setScope(null)} className="font-extrabold text-secondary underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-card">
                                                            Ver toda la lista
                                                      </button>
                                                </>
                                          ) : (
                                                "Por pasillos, con el precio real a mano."
                                          )}
                                    </p>
                                    <button
                                          type="button"
                                          onClick={leaveStore}
                                          className="min-h-11 shrink-0 rounded-full bg-card/15 px-4 text-sm font-extrabold hover:bg-card/25 focus-visible:outline-2 focus-visible:outline-card"
                                    >
                                          Salir
                                    </button>
                              </div>
                        )}

                        <section
                              aria-label="Resumen"
                              className="rounded-[1.75rem] bg-[linear-gradient(120deg,color-mix(in_srgb,var(--color-primary)_45%,var(--color-salmon))_0%,var(--color-salmon)_45%,var(--color-secondary)_100%)] p-5 text-ink shadow-[0_18px_36px_-20px_rgb(233_130_95/0.8)]"
                        >
                              <p className="text-xs font-extrabold tracking-wider uppercase">Gastado hasta ahora</p>
                              <p className="mt-1 font-display text-metric leading-none font-extrabold tabular-nums">{formatMoney(data.totals.spent)}</p>
                              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm font-bold">
                                          de {formatMoney(data.totals.estimated)} estimado · {data.store.name}
                                    </p>
                                    {data.totals.savings.amount > 0 && (
                                          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-extrabold text-ink shadow-soft tabular-nums">
                                                <Icon name="tag" className="size-3.5 text-primary-strong" strokeWidth={2.25} />
                                                Ahorras {formatMoney(data.totals.savings)}
                                          </span>
                                    )}
                              </div>
                              <div className="mt-4 flex items-center gap-3">
                                    <div role="progressbar" aria-label="Compras hechas" aria-valuemin={0} aria-valuemax={shownTotal} aria-valuenow={shownInCart} className="h-2.5 flex-1 overflow-hidden rounded-full bg-card/70">
                                          <div className="bar-fill h-full rounded-full bg-plum transition-[width] duration-500 ease-out" style={{ width: `${shownTotal ? (shownInCart / shownTotal) * 100 : 0}%` }} />
                                    </div>
                                    <p className="shrink-0 text-sm font-extrabold tabular-nums">
                                          {shownInCart}/{shownTotal} en el carrito
                                    </p>
                              </div>
                        </section>

                        {!storeMode && (
                              <>
                                    {data.recipes.map((recipe) => (
                                          <RecipeSection key={recipe.recipeId} listId={data.id} recipe={recipe} items={byIngredient} onShop={shopFor} />
                                    ))}
                                    {forRecipeButton}
                              </>
                        )}

                        {!storeMode && data.filters.length > 2 && (
                              <Chips
                                    bleed
                                    label="Filtrar"
                                    value={filter}
                                    onChange={setFilter}
                                    options={data.filters.map((f) => ({ id: f.id, label: f.label, count: f.count, icon: filterIcons[f.id] }))}
                              />
                        )}

                        {groups.map((group) => (
                              <section key={group.id} aria-labelledby={group.id} className="flex flex-col gap-2">
                                    <h2 id={group.id} className={storeMode ? "font-sans text-xs font-extrabold tracking-wider text-ink-muted uppercase" : "sr-only"}>
                                          {group.label}
                                    </h2>
                                    <ul className="flex flex-col divide-y divide-line rounded-[1.75rem] bg-card px-3 shadow-soft">
                                          {/* In the aisle, what is already in the cart sinks to the bottom. */}
                                          {(storeMode ? [...group.items].sort((a, b) => Number(a.checked) - Number(b.checked)) : group.items).map((item) => (
                                                <ItemRow key={item.id} listId={data.id} item={item} storeMode={storeMode} />
                                          ))}
                                    </ul>
                              </section>
                        ))}
                        {total === 0 && <p className="py-6 text-center text-ink-muted">Tu lista está vacía.</p>}
                        {storeMode && scope && groups.length === 0 && <p className="py-6 text-center text-ink-muted">Nada de {scope.title} quedó en la lista.</p>}

                        {storeMode ? (
                              inCart > 0 && <Checkout list={data} onDone={setDone} />
                        ) : (
                              total > 0 && (
                                    <div className="fixed inset-x-4 bottom-24 z-10 mx-auto max-w-xl">
                                          <Button
                                                size="lg"
                                                fullWidth
                                                onClick={() => {
                                                      setScope(null);
                                                      setStoreMode(true);
                                                }}
                                                className="text-title"
                                          >
                                                <Icon name="store" className="size-5" strokeWidth={2} />
                                                Activar modo tienda
                                          </Button>
                                    </div>
                              )
                        )}
                  </main>
                  {shopper}
            </>
      );
}

/** One pictogram per shelf, as in the design's filter row. */
const filterIcons: Record<string, IconName | undefined> = {
      fridge: "fridge",
      produce: "leaf",
      protein: "meat",
      seafood: "fish",
      dairy: "milk",
      bakery: "bread",
      staples: "store",
      spices: "sparkle",
      freezer: "snowflake",
};

const headerRoom = [0, 1].map((i) => <Sk key={i} className="size-12 rounded-full" />);

function shapeOf(list: ShoppingList | null, nudge: boolean): ShoppingShape {
      if (!list) return { hasList: false, nudge, recipes: false, chips: false, groups: [] };
      return {
            hasList: true,
            nudge,
            recipes: list.recipes.length > 0,
            chips: list.filters.length > 2,
            groups: list.groups.slice(0, 4).map((g) => g.items.slice(0, 6).map((i) => ({ suggestion: Boolean(i.suggestion) }))),
      };
}

function ItemRow({ listId, item, storeMode }: { listId: string; item: ShoppingItem; storeMode: boolean }) {
      const { patch, swap } = useShoppingMutations();
      const [editing, setEditing] = useState(false);
      const [priceOpen, setPriceOpen] = useState(false);
      const [price, setPrice] = useState("");
      // The check shows at once; the item and totals come back with the response.
      const [ticked, setTicked] = useState<boolean | null>(null);
      const checked = ticked ?? item.checked;
      const error = patch.error ?? swap.error;

      const price$ = item.price.actual ?? item.price.estimated;

      return (
            <li className="flex flex-col gap-2 py-3">
                  <div className="flex items-center gap-3">
                        <label className={`flex min-w-0 flex-1 cursor-pointer items-center gap-3 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-strong ${storeMode ? "min-h-14" : "min-h-11"}`}>
                              <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={ticked !== null}
                                    onChange={(e) => {
                                          setTicked(e.target.checked);
                                          patch.mutate({ listId, itemId: item.id, patch: { checked: e.target.checked } }, { onSettled: () => setTicked(null) });
                                    }}
                                    className="sr-only"
                              />
                              <span aria-hidden className={`grid shrink-0 place-items-center rounded-full transition-colors ${storeMode ? "size-8" : "size-7"} ${checked ? "bg-primary-strong text-card" : "border-2 border-line bg-card"}`}>
                                    {checked && <Icon name="check" className="pop-in size-4" strokeWidth={3} />}
                              </span>
                              <IngredientIcon label={item.label} icon={item.icon} className="size-10" />
                              <span className="min-w-0 flex-1">
                                    <span className={`block truncate font-display font-extrabold transition-colors ${checked ? "text-ink-muted" : "text-ink"}`}>{item.label}</span>
                                    {item.product?.brand && <span className="block truncate text-xs font-semibold text-ink-muted">{item.product.brand}</span>}
                              </span>
                        </label>
                        <button
                              type="button"
                              aria-expanded={editing}
                              aria-label={`${item.quantity.display} de ${item.label}. Cambiar cantidad o quitar`}
                              onClick={() => setEditing((v) => !v)}
                              className={`relative shrink-0 rounded-full border-2 px-3 py-1 text-sm tabular-nums transition-colors after:absolute after:-inset-2 hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
                                    checked || editing ? "border-primary/60 bg-card font-extrabold text-ink" : "border-transparent bg-field font-semibold text-ink-muted"
                              }`}
                        >
                              {item.quantity.display}
                        </button>
                  </div>
                  <div className="-mt-1 pl-[5.25rem]">
                        <button
                              type="button"
                              aria-expanded={priceOpen}
                              aria-label={`Precio de ${item.label}: ${formatMoney(price$)}. Cambiar`}
                              onClick={() => {
                                    setPrice(String(price$.amount));
                                    setPriceOpen((v) => !v);
                              }}
                              className={`inline-flex min-h-8 items-center gap-1 rounded-full border px-2.5 text-xs tabular-nums transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-primary-strong ${
                                    checked ? "border-line bg-card font-extrabold text-ink" : "border-line/70 font-semibold text-ink-muted"
                              }`}
                        >
                              {!item.price.actual && "≈ "}
                              {formatMoney(price$)}
                              <Icon name="edit" className="size-3" />
                        </button>
                  </div>

                  {editing && <ItemEditor listId={listId} item={item} onClose={() => setEditing(false)} />}

                  {priceOpen && (
                        <form
                              className="flex items-end gap-2"
                              onSubmit={(e) => {
                                    e.preventDefault();
                                    const amount = Number(price.replace(/\D/g, ""));
                                    patch.mutate({ listId, itemId: item.id, patch: { actualPrice: amount > 0 ? { amount, currency: "COP" } : null } }, { onSuccess: () => setPriceOpen(false) });
                              }}
                        >
                              <TextField label="Precio real" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} className="flex-1" />
                              <Button type="submit" loading={patch.isPending}>
                                    Guardar
                              </Button>
                        </form>
                  )}

                  {item.suggestion && (
                        <div className="ml-[5.25rem] flex items-center gap-3 rounded-control bg-primary-soft p-3">
                              <Icon name="sparkle" className="size-4 shrink-0 text-primary-strong" strokeWidth={2.25} />
                              <p className="min-w-0 flex-1 text-sm text-ink">
                                    <strong className="block font-display">
                                          {item.suggestion.product.label} · {formatMoney(item.suggestion.price)}
                                    </strong>
                                    <span className="text-ink-muted">{item.suggestion.reason}</span>
                              </p>
                              <button
                                    type="button"
                                    aria-label={`Cambiar por ${item.suggestion.product.label}`}
                                    disabled={swap.isPending}
                                    onClick={() => swap.mutate({ listId, itemId: item.id, suggestionId: item.suggestion!.id })}
                                    className="grid size-11 shrink-0 place-items-center rounded-full bg-card text-primary-strong shadow-soft focus-visible:outline-2 focus-visible:outline-primary-strong disabled:opacity-60"
                              >
                                    <Icon name="refresh" className="size-5" strokeWidth={2.25} />
                              </button>
                        </div>
                  )}
                  {error && <p className="text-sm font-semibold text-error">{error.message}</p>}
            </li>
      );
}

/** How much to buy of one item, or take it off the list. */
function ItemEditor({ listId, item, onClose }: { listId: string; item: ShoppingItem; onClose: () => void }) {
      const { patch, removeItem } = useShoppingMutations();
      const measured = item.quantity.value !== null && item.quantity.unit !== "toTaste" && item.quantity.unit !== "all" ? { value: item.quantity.value, unit: item.quantity.unit } : null;
      const choices = unitChoicesFor(item.label, item.icon, measured?.unit ?? "unit");
      const [unit, setUnit] = useState(measured?.unit ?? choices.suggested[0]!);
      const [amount, setAmount] = useState(measured ? formatAmount(measured.value) : "");
      const value = parseAmount(amount);
      const error = patch.error ?? removeItem.error;
      return (
            <form
                  className="cook-fade flex flex-col gap-2"
                  onSubmit={(e) => {
                        e.preventDefault();
                        if (value !== null) patch.mutate({ listId, itemId: item.id, patch: { quantity: { value, unit } } }, { onSuccess: onClose });
                  }}
            >
                  <QuantityField label={item.label} choices={choices} unit={unit} onUnit={setUnit} amount={amount} onAmount={setAmount} />
                  <div className="grid grid-cols-2 gap-2">
                        <Button variant="soft" loading={removeItem.isPending} onClick={() => removeItem.mutate({ listId, itemId: item.id })}>
                              <Icon name="trash" className="size-4" />
                              Quitar
                        </Button>
                        <Button type="submit" loading={patch.isPending} disabled={value === null}>
                              Guardar
                        </Button>
                  </div>
                  {error && <p className="text-sm font-semibold text-error">{error.message}</p>}
            </form>
      );
}

function Checkout({ list, onDone }: { list: ShoppingList; onDone: (result: CheckoutResult) => void }) {
      const { checkout } = useShoppingMutations();
      const [open, setOpen] = useState(false);
      const key = useRef(newKey());
      const left = list.progress.total - list.progress.inCart;
      const finish = (carryOverUnchecked: boolean) =>
            checkout.mutate(
                  { listId: list.id, storeId: list.store.id, carryOverUnchecked, key: key.current },
                  {
                        onSuccess: (result) => {
                              key.current = newKey();
                              setOpen(false);
                              onDone(result);
                        },
                        // The answer to a rejected key is replayed, so the next try needs its own.
                        onError: () => (key.current = newKey()),
                  },
            );

      return (
            <>
                  <div className="fixed inset-x-4 bottom-24 z-10 mx-auto max-w-xl">
                        <Button size="lg" fullWidth loading={checkout.isPending} onClick={() => setOpen(true)}>
                              <Icon name="check" className="size-5" strokeWidth={2.25} />
                              Terminar compra
                        </Button>
                  </div>
                  <Dialog
                        open={open}
                        onClose={() => setOpen(false)}
                        title="Terminar compra"
                        actions={
                              left > 0 ? (
                                    <>
                                          <Button variant="soft" loading={checkout.isPending} onClick={() => finish(false)}>
                                                Descartarlos
                                          </Button>
                                          <Button loading={checkout.isPending} onClick={() => finish(true)}>
                                                Pasarlos
                                          </Button>
                                    </>
                              ) : (
                                    <Button loading={checkout.isPending} onClick={() => finish(false)}>
                                          Terminar
                                    </Button>
                              )
                        }
                  >
                        <p className="text-ink-muted">
                              Lo marcado pasa a tu despensa.{left > 0 && ` ¿Pasamos ${plural(left, "producto", "productos")} sin marcar a la próxima lista?`}
                        </p>
                        {checkout.error && <FormAlert>{checkout.error.message}</FormAlert>}
                  </Dialog>
            </>
      );
}
