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

                        <section aria-label="Resumen" className="rounded-card bg-peach-glow p-5 text-ink shadow-soft">
                              <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                          <p className="text-xs font-extrabold tracking-wider uppercase">Llevas en {data.store.name}</p>
                                          <p className="mt-1 flex flex-wrap items-baseline gap-x-2">
                                                <span className="font-display text-metric font-extrabold tabular-nums">{formatMoney(data.totals.spent)}</span>
                                                <span className="text-sm font-bold">de {formatMoney(data.totals.estimated)}</span>
                                          </p>
                                    </div>
                                    {data.totals.savings.amount > 0 && (
                                          <span className="shrink-0 rounded-full bg-card px-3 py-1.5 text-xs font-extrabold tabular-nums">Ahorras {formatMoney(data.totals.savings)}</span>
                                    )}
                              </div>
                              <div role="progressbar" aria-label="Compras hechas" aria-valuemin={0} aria-valuemax={total} aria-valuenow={inCart} className="mt-3 h-2.5 overflow-hidden rounded-full bg-card/70">
                                    <div className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out" style={{ width: `${total ? (inCart / total) * 100 : 0}%` }} />
                              </div>
                              <p className="mt-2 text-sm font-semibold">
                                    {inCart} de {total} en el carrito
                              </p>
                              {data.recipes.length > 0 && <p className="mt-1 truncate text-sm font-semibold">Para {data.recipes.map((r) => r.title).join(", ")}</p>}
                        </section>

                        <label className="flex min-h-11 items-center justify-between gap-3 rounded-card bg-card px-4 py-2 text-sm font-bold text-ink shadow-soft">
                              Modo tienda: por pasillos y con precio real
                              <input type="checkbox" checked={storeMode} onChange={(e) => setStoreMode(e.target.checked)} className="size-6 accent-primary-strong" />
                        </label>

                        {!storeMode && data.filters.length > 2 && (
                              <Chips bleed label="Filtrar" value={filter} onChange={setFilter} options={data.filters.map((f) => ({ id: f.id, label: f.count === undefined ? f.label : `${f.label} · ${f.count}` }))} />
                        )}

                        {groups.map((group) => (
                              <section key={group.id} aria-labelledby={group.id} className="flex flex-col gap-2">
                                    <h2 id={group.id} className="text-title font-extrabold text-ink">
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

                        {inCart > 0 && <Checkout list={data} onDone={setDone} />}
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

      return (
            <li className="flex flex-col gap-2 rounded-card bg-card p-3 shadow-soft">
                  <div className="flex items-center gap-3">
                        <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-3">
                              <input
                                    type="checkbox"
                                    checked={checked}
                                    disabled={ticked !== null}
                                    onChange={(e) => {
                                          setTicked(e.target.checked);
                                          patch.mutate({ listId, itemId: item.id, patch: { checked: e.target.checked } }, { onSettled: () => setTicked(null) });
                                    }}
                                    className={`shrink-0 accent-primary-strong ${storeMode ? "size-8" : "size-6"}`}
                              />
                              <span className="min-w-0 flex-1">
                                    <span className={`block truncate font-bold ${checked ? "text-ink-muted line-through" : "text-ink"}`}>{item.label}</span>
                                    <span className="block truncate text-sm font-semibold text-ink-muted">{[item.quantity.display, item.product?.brand].filter(Boolean).join(" · ")}</span>
                              </span>
                        </label>
                        <button
                              type="button"
                              aria-expanded={priceOpen}
                              aria-label={`Precio de ${item.label}: ${formatMoney(item.price.actual ?? item.price.estimated)}. Cambiar`}
                              onClick={() => {
                                    setPrice(String((item.price.actual ?? item.price.estimated).amount));
                                    setPriceOpen((v) => !v);
                              }}
                              className="min-h-11 shrink-0 rounded-full px-3 text-sm font-extrabold text-ink tabular-nums hover:bg-field focus-visible:outline-2 focus-visible:outline-primary-strong"
                        >
                              {!item.price.actual && "≈ "}
                              {formatMoney(item.price.actual ?? item.price.estimated)}
                        </button>
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
                        <div className="flex items-center gap-3 rounded-control bg-mint-soft p-3">
                              <p className="min-w-0 flex-1 text-sm text-mint-ink">
                                    <strong className="block">
                                          {item.suggestion.product.label} · {formatMoney(item.suggestion.price)}
                                    </strong>
                                    {item.suggestion.reason}
                              </p>
                              <Button variant="secondary" loading={swap.isPending} onClick={() => swap.mutate({ listId, itemId: item.id, suggestionId: item.suggestion!.id })}>
                                    Cambiar
                              </Button>
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
