import { Link } from "react-router-dom";
import { useInventoryMutations } from "@/modules/inventory/hooks/useInventory";
import { categoryOf } from "@/modules/inventory/utils/categories";
import PageHeader from "@/shared/components/layout/PageHeader";
import Button, { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import Icon from "@/shared/components/ui/Icon";
import Mascot from "@/shared/components/ui/Mascot";
import RoundButton from "@/shared/components/ui/RoundButton";
import { formatDate, formatQuantity } from "@/shared/lib/format";
import { tones, toneFor } from "@/shared/lib/tones";
import { itemKey, useSavedShoppingList } from "../hooks/useShoppingList";

export default function ShoppingListPage() {
      const { saved, toggle, removeItems, clear } = useSavedShoppingList();
      const { addMany } = useInventoryMutations();

      if (!saved) {
            return (
                  <>
                        <PageHeader title="Lista de compras" decoration="sparkle" backTo="/recetas" />
                        <main className="mx-auto max-w-xl px-5 pt-3">
                              <section className="relative overflow-hidden rounded-[1.75rem] bg-secondary-soft p-5 pr-36">
                                    <Mascot className="absolute -right-2 -bottom-4 w-36" />
                                    <h2 className="text-section font-extrabold text-ink">No tienes una lista activa</h2>
                                    <p className="mt-2 text-sm font-semibold text-ink">
                                          Abre una receta y toca «Lista de compras»: te digo qué te falta según tu despensa.
                                    </p>
                                    <Link to="/recetas" className={`${buttonBase} ${buttonVariants.primary} mt-4 min-h-12 text-sm`}>
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

      const moveToPantry = () => addMany.mutate(checkedItems, { onSuccess: () => removeItems(checkedItems.map(itemKey)) });

      return (
            <>
                  <PageHeader
                        title="Lista de compras"
                        decoration="sparkle"
                        backTo="/recetas"
                        actions={
                              <RoundButton label="Descartar lista" onClick={clear}>
                                    <Icon name="trash" className="size-6 text-error" />
                              </RoundButton>
                        }
                  />

                  <main className="mx-auto flex max-w-xl flex-col gap-5 px-5 pt-3 pb-48">
                        <section aria-label="Resumen" className="relative overflow-hidden rounded-[1.75rem] bg-secondary-soft p-5 pr-36">
                              <Mascot className="absolute -right-1 -bottom-3 w-32" />
                              <p className="text-xs font-extrabold text-rust">Para · {formatDate(createdAt)}</p>
                              <h2 className="mt-1 text-section leading-tight font-extrabold text-ink">{list.recipes.map((r) => r.title).join(", ")}</h2>
                              <p className="mt-4 flex items-baseline gap-2 text-sm font-bold text-ink">
                                    <span className="font-display text-page font-extrabold">{checkedItems.length}</span>
                                    de {total} {total === 1 ? "comprado" : "comprados"}
                              </p>
                              <div
                                    role="progressbar"
                                    aria-label="Compras hechas"
                                    aria-valuemin={0}
                                    aria-valuemax={total}
                                    aria-valuenow={checkedItems.length}
                                    className="mt-2 h-2 overflow-hidden rounded-full bg-card"
                              >
                                    <div className="h-full rounded-full bg-primary-strong transition-[width]" style={{ width: `${Math.max(3, progress * 100)}%` }} />
                              </div>
                        </section>

                        <section aria-labelledby="to-buy" className="flex flex-col gap-3">
                              <h2 id="to-buy" className="text-section font-extrabold text-ink">
                                    Por comprar
                              </h2>
                              {total === 0 ? (
                                    <p className="rounded-card bg-card p-4 font-semibold text-ink">Tienes todo en tu despensa. ¡A cocinar!</p>
                              ) : (
                                    <ul className="flex flex-col gap-2">
                                          {list.missingItems.map((item) => {
                                                const key = itemKey(item);
                                                const done = checked.includes(key);
                                                const tone = tones[toneFor(item.name)];
                                                return (
                                                      <li key={key}>
                                                            <label className="flex min-h-16 cursor-pointer items-center gap-3 rounded-card bg-card px-4 py-3 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-strong">
                                                                  <input type="checkbox" checked={done} onChange={() => toggle(key)} className="peer sr-only" />
                                                                  <span
                                                                        aria-hidden
                                                                        className="grid size-7 shrink-0 place-items-center rounded-lg border-2 border-line text-card peer-checked:border-primary-strong peer-checked:bg-primary-strong"
                                                                  >
                                                                        {done && <Icon name="check" className="size-4" strokeWidth={3} />}
                                                                  </span>
                                                                  <span aria-hidden className={`grid size-11 shrink-0 place-items-center rounded-control font-display font-extrabold ${tone.soft} ${tone.ink}`}>
                                                                        {item.name.trim().charAt(0).toUpperCase()}
                                                                  </span>
                                                                  <span className="min-w-0 flex-1">
                                                                        <span className={`block font-bold ${done ? "text-ink-muted line-through" : "text-ink"}`}>{item.name}</span>
                                                                        <span className="block text-xs font-semibold text-ink-muted">Despensa · {categoryOf(item.name)}</span>
                                                                  </span>
                                                                  <span className="font-display text-title font-extrabold text-ink tabular-nums">{formatQuantity(item.quantity, item.unit)}</span>
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
                                                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-mint-soft text-mint-ink">
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

                  {total > 0 && (
                        <div className="fixed inset-x-0 bottom-28 z-10 px-5">
                              <div className="mx-auto flex max-w-xl flex-col gap-2">
                                    {addMany.error && <p className="rounded-control bg-card p-2 text-sm text-error">{addMany.error.message}</p>}
                                    <Button size="lg" fullWidth loading={addMany.isPending} disabled={checkedItems.length === 0} onClick={moveToPantry}>
                                          <Icon name="pantry" className="size-5" />
                                          Pasar lo comprado a mi despensa
                                    </Button>
                              </div>
                        </div>
                  )}
            </>
      );
}
