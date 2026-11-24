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
import Icon from "@/shared/components/ui/Icon";
import IngredientIcon from "@/shared/components/ui/IngredientIcon";
import Mascot from "@/shared/components/ui/Mascot";
import { ErrorState } from "@/shared/components/ui/QueryState";
import RoundButton from "@/shared/components/ui/RoundButton";
import { Sk } from "@/shared/components/ui/Skeleton";
import TextField from "@/shared/components/ui/TextField";
import { useRememberShape } from "@/shared/hooks/useShape";
import { newKey } from "@/shared/lib/axios";
import { formatDate, formatMoney, dayToDate, plural } from "@/shared/lib/format";
import { shareText } from "@/shared/lib/share";
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
                        <KitchenHeader title="Lista de compras" meta={null} actions={headerRoom} />
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
                        <KitchenHeader title="Lista de compras" meta="Esta semana" actions={<span className="size-12" />} />
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
                              {add}
                        </main>
                  </>
            );
      }

      const data = list.data;
      const { inCart, total } = data.progress;
      const matches = (item: ShoppingItem) => storeMode || filter === "all" || (filter === "fridge" ? item.storage === "fridge" : item.categoryId === filter);
      const groups = data.groups.map((g) => ({ ...g, items: g.items.filter(matches) })).filter((g) => g.items.length > 0);

      return (
            <>
                  <KitchenHeader
                        title="Lista de compras"
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

                  <main className="mx-auto flex max-w-xl flex-col gap-5 px-5 pt-3 pb-28">
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
                                          Por pasillos, con el precio real a mano.
                                    </p>
                                    <button
                                          type="button"
                                          onClick={() => setStoreMode(false)}
                                          className="min-h-11 shrink-0 rounded-full bg-card/15 px-4 text-sm font-extrabold hover:bg-card/25 focus-visible:outline-2 focus-visible:outline-card"
                                    >
                                          Salir
                                    </button>
                              </div>
                        )}

                        <section aria-label="Resumen" className="rounded-card bg-[linear-gradient(110deg,var(--color-secondary)_0%,var(--color-salmon)_60%,var(--color-primary)_100%)] p-5 text-ink shadow-soft">
                              <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                          <p className="text-xs font-extrabold tracking-wider uppercase">Gastado hasta ahora</p>
                                          <p className="mt-1 font-display text-metric font-extrabold tabular-nums">{formatMoney(data.totals.spent)}</p>
                                          <p className="text-sm font-bold">
                                                de {formatMoney(data.totals.estimated)} estimado · {data.store.name}
                                          </p>
                                    </div>
                                    {data.totals.savings.amount > 0 && (
                                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-card/90 px-3 py-1.5 text-xs font-extrabold text-rose-ink tabular-nums">
                                                <Icon name="tag" className="size-3.5" strokeWidth={2.25} />
                                                Ahorras {formatMoney(data.totals.savings)}
                                          </span>
                                    )}
                              </div>
                              <div className="mt-4 flex items-center gap-3">
                                    <div role="progressbar" aria-label="Compras hechas" aria-valuemin={0} aria-valuemax={total} aria-valuenow={inCart} className="h-2.5 flex-1 overflow-hidden rounded-full bg-card/60">
                                          <div className="h-full rounded-full bg-plum transition-[width] duration-500 ease-out" style={{ width: `${total ? (inCart / total) * 100 : 0}%` }} />
                                    </div>
                                    <p className="shrink-0 text-sm font-extrabold tabular-nums">
                                          {inCart}/{total} en el carrito
                                    </p>
                              </div>
                              {data.recipes.length > 0 && <p className="mt-2 truncate text-sm font-semibold">Para {data.recipes.map((r) => r.title).join(", ")}</p>}
                        </section>

                        {!storeMode && data.filters.length > 2 && (
                              <Chips
                                    bleed
                                    label="Filtrar"
                                    value={filter}
                                    onChange={setFilter}
                                    options={data.filters.map((f) => ({ id: f.id, label: f.count === undefined ? f.label : `${f.label} ${f.count}`, icon: f.id === "fridge" ? ("pantry" as const) : f.id === "all" ? undefined : ("sprout" as const) }))}
                              />
                        )}

                        {groups.map((group) => (
                              <section key={group.id} aria-labelledby={group.id} className="flex flex-col gap-2">
                                    <h2 id={group.id} className={data.groups.length > 1 || storeMode ? "font-sans text-xs font-extrabold tracking-wider text-ink-muted uppercase" : "sr-only"}>
                                          {group.label}
                                    </h2>
                                    <ul className="flex flex-col gap-2">
                                          {/* In the aisle, what is already in the cart sinks to the bottom. */}
                                          {(storeMode ? [...group.items].sort((a, b) => Number(a.checked) - Number(b.checked)) : group.items).map((item) => (
                                                <ItemRow key={item.id} listId={data.id} item={item} storeMode={storeMode} />
                                          ))}
                                    </ul>
                              </section>
                        ))}
                        {total === 0 && <p className="py-6 text-center text-ink-muted">Tu lista está vacía.</p>}

                        {storeMode ? (
                              inCart > 0 && <Checkout list={data} onDone={setDone} />
                        ) : (
                              total > 0 && (
                                    <div className="fixed inset-x-4 bottom-24 z-10 mx-auto max-w-xl">
                                          <Button size="lg" fullWidth arrow="store" onClick={() => setStoreMode(true)}>
                                                Activar modo tienda
                                          </Button>
                                    </div>
                              )
                        )}
                  </main>
            </>
      );
}

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
      const [priceOpen, setPriceOpen] = useState(false);
      const [price, setPrice] = useState("");
      // The check shows at once; the item and totals come back with the response.
      const [ticked, setTicked] = useState<boolean | null>(null);
      const checked = ticked ?? item.checked;
      const error = patch.error ?? swap.error;

      const price$ = item.price.actual ?? item.price.estimated;

      return (
            <li className={`flex flex-col gap-2 rounded-card p-3 shadow-soft transition-colors ${checked ? "bg-card/70" : "bg-card"}`}>
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
                                    {checked && <Icon name="check" className="size-4" strokeWidth={3} />}
                              </span>
                              <IngredientIcon label={item.label} icon={item.icon} />
                              <span className="min-w-0 flex-1">
                                    <span className={`block truncate font-display font-extrabold ${checked ? "text-ink-muted line-through" : "text-ink"}`}>{item.label}</span>
                                    {item.product?.brand && <span className="block truncate text-xs font-semibold text-ink-muted">{item.product.brand}</span>}
                              </span>
                        </label>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                              <span className={`rounded-full border-2 px-2.5 py-0.5 text-sm font-extrabold tabular-nums ${checked ? "border-primary text-ink" : "border-transparent bg-field text-ink-muted"}`}>
                                    {item.quantity.display}
                              </span>
                              <button
                                    type="button"
                                    aria-expanded={priceOpen}
                                    aria-label={`Precio de ${item.label}: ${formatMoney(price$)}. Cambiar`}
                                    onClick={() => {
                                          setPrice(String(price$.amount));
                                          setPriceOpen((v) => !v);
                                    }}
                                    className="inline-flex min-h-8 items-center gap-1 rounded-full px-1.5 text-xs font-extrabold text-ink-muted tabular-nums hover:bg-field hover:text-ink focus-visible:outline-2 focus-visible:outline-primary-strong"
                              >
                                    {!item.price.actual && "≈ "}
                                    {formatMoney(price$)}
                                    <Icon name="edit" className="size-3.5" />
                              </button>
                        </div>
                  </div>

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
                        <div className="ml-10 flex items-center gap-3 rounded-control border-2 border-dashed border-primary/30 bg-primary-soft/60 p-3">
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
