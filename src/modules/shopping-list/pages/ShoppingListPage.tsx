import { useState } from "react";
import { Link } from "react-router-dom";
import KitchenHeader from "@/modules/inventory/components/KitchenHeader";
import { useInventoryMutations } from "@/modules/inventory/hooks/useInventory";
import { categoryOf, categoryOrder, type Category } from "@/modules/inventory/utils/categories";
import Button, { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import Icon from "@/shared/components/ui/Icon";
import Mascot from "@/shared/components/ui/Mascot";
import RoundButton from "@/shared/components/ui/RoundButton";
import { formatDate, formatQuantity, plural } from "@/shared/lib/format";
import { tones, toneFor } from "@/shared/lib/tones";
import { itemKey, useSavedShoppingList } from "../hooks/useShoppingList";

export default function ShoppingListPage() {
      const { saved, toggle, removeItems, clear } = useSavedShoppingList();
      const { addMany } = useInventoryMutations();
      const [filter, setFilter] = useState<Category | "Todo">("Todo");
      const [shared, setShared] = useState<string | null>(null);

      if (!saved) {
            return (
                  <>
                        <KitchenHeader title="Lista de compras" />
                        <main className="mx-auto max-w-xl px-5 pt-3">
                              <section className="relative overflow-hidden rounded-card bg-peach-glow p-5 pr-36 shadow-soft">
                                    <Mascot className="absolute -right-2 -bottom-4 w-36" />
                                    <h2 className="text-section font-extrabold text-ink">No tienes una lista activa</h2>
                                    <p className="mt-2 text-sm font-semibold text-ink">
                                          Abre una receta y toca «Lista de compras»: te digo qué te falta según tu despensa.
                                    </p>
                                    <Link to="/recetas" className={`${buttonBase} ${buttonVariants.dark} mt-4 min-h-12 text-sm`}>
                                          Ver recetas
                                    </Link>
                              </section>
                        </main>
                  </>
            );
      }

      const { list, checked, createdAt } = saved;
      const checkedItems = list.missingItems.filter((item) => checked.includes(itemKey(item)));
      const total = list.missingItems.length;
      const progress = total ? checkedItems.length / total : 1;
      const present = categoryOrder.filter((c) => list.missingItems.some((item) => categoryOf(item.name) === c));
      const shown = list.missingItems.filter((item) => filter === "Todo" || categoryOf(item.name) === filter);

      const moveToPantry = () => addMany.mutate(checkedItems, { onSuccess: () => removeItems(checkedItems.map(itemKey)) });

      // Plain-text list for WhatsApp or notes: the native share sheet, or the clipboard as a fallback.
      const share = async () => {
            const text = [`Lista de compras · ${list.recipes.map((r) => r.title).join(", ")}`, ...list.missingItems.map((i) => `• ${i.name} — ${formatQuantity(i.quantity, i.unit)}`)].join("\n");
            try {
                  if (navigator.share) {
                        await navigator.share({ title: "Lista de compras", text });
                        return;
                  }
                  await navigator.clipboard.writeText(text);
                  setShared("Lista copiada. Pégala donde quieras.");
            } catch (error) {
                  if (error instanceof DOMException && error.name === "AbortError") return;
                  setShared("No pudimos compartirla desde este navegador.");
            }
      };

      return (
            <>
                  <KitchenHeader
                        title="Lista de compras"
                        meta={`${plural(list.recipes.length, "receta", "recetas")} · desde el ${formatDate(createdAt)}`}
                        actions={
                              <>
                                    <RoundButton label="Descartar lista" onClick={clear}>
                                          <Icon name="trash" className="size-6 text-error" />
                                    </RoundButton>
                                    <RoundButton tone="primary" label="Compartir lista" onClick={share}>
                                          <Icon name="share" strokeWidth={2.25} />
                                    </RoundButton>
                              </>
                        }
                  />

                  <main className="mx-auto flex max-w-xl flex-col gap-5 px-5 pt-3 pb-48">
                        {shared && (
                              <p role="status" className="flex items-center gap-2 rounded-control bg-mint-soft p-3 text-sm font-bold text-mint-ink">
                                    <Icon name="check" className="size-4" strokeWidth={2.5} />
                                    {shared}
                              </p>
                        )}

                        <section aria-label="Resumen" className="rounded-card bg-peach-glow p-5 shadow-soft">
                              <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                          <p className="text-xs font-extrabold tracking-wider text-ink uppercase">En el carrito</p>
                                          <p className="mt-1 flex items-baseline gap-2 text-ink">
                                                <span className="font-display text-metric font-extrabold tabular-nums">{checkedItems.length}</span>
                                                <span className="text-sm font-bold">de {total}</span>
                                          </p>
                                    </div>
                                    <span className="shrink-0 rounded-full bg-card px-3 py-1.5 text-xs font-extrabold text-ink tabular-nums">
                                          {plural(list.availableItems.length, "ya en casa", "ya en casa")}
                                    </span>
                              </div>
                              <div
                                    role="progressbar"
                                    aria-label="Compras hechas"
                                    aria-valuemin={0}
                                    aria-valuemax={total}
                                    aria-valuenow={checkedItems.length}
                                    className="mt-3 h-2.5 overflow-hidden rounded-full bg-card/70"
                              >
                                    <div className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out" style={{ width: `${Math.max(3, progress * 100)}%` }} />
                              </div>
                              <p className="mt-3 truncate text-sm font-semibold text-ink">Para {list.recipes.map((r) => r.title).join(", ")}</p>
                              {checkedItems.length === 0 && total > 0 && <p className="mt-1 text-xs font-bold text-ink">Toca cada producto cuando lo eches al carrito.</p>}
                        </section>

                        {present.length > 1 && (
                              <div role="group" aria-label="Filtrar por categoría" className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 py-1">
                                    {(["Todo", ...present] as const).map((c) => {
                                          const selected = filter === c;
                                          const count = c === "Todo" ? total : list.missingItems.filter((i) => categoryOf(i.name) === c).length;
                                          return (
                                                <button
                                                      key={c}
                                                      type="button"
                                                      aria-pressed={selected}
                                                      onClick={() => setFilter(c)}
                                                      className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-extrabold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
                                                            selected ? "bg-brand text-card shadow-brand" : "bg-card text-ink shadow-soft hover:bg-field"
                                                      }`}
                                                >
                                                      {c}
                                                      <span className={`rounded-full px-1.5 text-xs tabular-nums ${selected ? "bg-card/25" : "bg-field"}`}>{count}</span>
                                                </button>
                                          );
                                    })}
                              </div>
                        )}

                        <section aria-labelledby="to-buy" className="flex flex-col gap-3">
                              <h2 id="to-buy" className="sr-only">
                                    Por comprar
                              </h2>
                              {total === 0 ? (
                                    <p className="rounded-card bg-card p-4 font-semibold text-ink shadow-soft">Tienes todo en tu despensa. ¡A cocinar!</p>
                              ) : (
                                    <ul className="flex flex-col gap-2">
                                          {shown.map((item) => {
                                                const key = itemKey(item);
                                                const done = checked.includes(key);
                                                const tone = tones[toneFor(item.name)];
                                                return (
                                                      <li key={key}>
                                                            <label
                                                                  className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-card px-3 py-2 shadow-soft transition-colors has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-strong ${
                                                                        done ? "bg-card/60" : "bg-card"
                                                                  }`}
                                                            >
                                                                  <input type="checkbox" checked={done} onChange={() => toggle(key)} className="sr-only" />
                                                                  <span
                                                                        aria-hidden
                                                                        className={`grid size-7 shrink-0 place-items-center rounded-full ${done ? "bg-primary-strong text-card" : "border-2 border-line"}`}
                                                                  >
                                                                        {done && <Icon name="check" className="size-4" strokeWidth={3} />}
                                                                  </span>
                                                                  <span aria-hidden className={`grid size-10 shrink-0 place-items-center rounded-control font-display font-extrabold ${tone.soft} ${tone.ink}`}>
                                                                        {item.name.trim().charAt(0).toUpperCase()}
                                                                  </span>
                                                                  <span className="min-w-0 flex-1">
                                                                        <span className={`block truncate font-bold ${done ? "text-ink-muted line-through" : "text-ink"}`}>{item.name}</span>
                                                                        <span className="block text-xs font-semibold text-ink-muted">{categoryOf(item.name)}</span>
                                                                  </span>
                                                                  <span className="shrink-0 rounded-full bg-field px-3 py-1 text-sm font-extrabold text-ink tabular-nums">
                                                                        {formatQuantity(item.quantity, item.unit)}
                                                                  </span>
                                                            </label>
                                                      </li>
                                                );
                                          })}
                                    </ul>
                              )}
                        </section>

                        {list.availableItems.length > 0 && (
                              <section aria-labelledby="have" className="flex flex-col gap-3">
                                    <h2 id="have" className="flex items-center gap-2 text-section font-extrabold text-ink">
                                          Ya lo tienes
                                          <span className="grid min-w-7 place-items-center rounded-full bg-mint-soft px-2 text-sm text-mint-ink">{list.availableItems.length}</span>
                                    </h2>
                                    <ul className="flex flex-col divide-y divide-line rounded-card bg-card/70 px-4">
                                          {list.availableItems.map((item) => (
                                                <li key={itemKey(item)} className="flex items-center gap-3 py-3">
                                                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-mint-soft text-mint-ink">
                                                            <Icon name="check" className="size-4" strokeWidth={2.5} />
                                                      </span>
                                                      <span className="flex-1 font-bold text-ink">{item.name}</span>
                                                      <span className="text-xs font-extrabold text-mint-ink">En tu despensa</span>
                                                </li>
                                          ))}
                                    </ul>
                              </section>
                        )}
                  </main>

                  {/* Only once something is ticked: a disabled bar would sit translucent over the list. */}
                  {checkedItems.length > 0 && (
                        <div className="fixed inset-x-0 bottom-28 z-10 px-5">
                              <div className="mx-auto flex max-w-xl flex-col gap-2">
                                    {addMany.error && <p className="rounded-control bg-card p-2 text-sm text-error">{addMany.error.message}</p>}
                                    <Button size="lg" fullWidth arrow loading={addMany.isPending} onClick={moveToPantry}>
                                          Pasar {checkedItems.length} a mi despensa
                                    </Button>
                              </div>
                        </div>
                  )}
            </>
      );
}
