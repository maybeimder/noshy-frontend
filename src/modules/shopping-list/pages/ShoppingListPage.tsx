import { Link } from "react-router-dom";
import { useInventoryMutations } from "@/modules/inventory/hooks/useInventory";
import PageHeader, { iconButtonClass } from "@/shared/components/layout/PageHeader";
import Button from "@/shared/components/ui/Button";
import Icon from "@/shared/components/ui/Icon";
import { EmptyState } from "@/shared/components/ui/QueryState";
import { formatDate, formatQuantity, plural } from "@/shared/lib/format";
import { itemKey, useSavedShoppingList } from "../hooks/useShoppingList";

export default function ShoppingListPage() {
      const { saved, toggle, removeItems, clear } = useSavedShoppingList();
      const { addMany } = useInventoryMutations();

      if (!saved) {
            return (
                  <>
                        <PageHeader title="Lista de compras" backTo="/recetas" />
                        <main className="mx-auto max-w-xl px-6 pt-6">
                              <EmptyState
                                    icon="cart"
                                    title="No tienes una lista activa"
                                    description="Abre una receta y toca «Lista de compras»: calculamos lo que te falta según tu despensa."
                                    action={
                                          <Link
                                                to="/recetas"
                                                className="inline-flex min-h-11 items-center rounded-control bg-primary px-6 text-sm font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                          >
                                                Ver recetas
                                          </Link>
                                    }
                              />
                        </main>
                  </>
            );
      }

      const { list, checked, createdAt } = saved;
      const checkedItems = list.missingItems.filter((item) => checked.includes(itemKey(item)));

      const moveToPantry = () =>
            addMany.mutate(checkedItems, {
                  onSuccess: () => removeItems(checkedItems.map(itemKey)),
            });

      return (
            <>
                  <PageHeader
                        title="Lista de compras"
                        subtitle={`${list.recipes.map((r) => r.title).join(", ")} · ${formatDate(createdAt)}`}
                        backTo="/recetas"
                        actions={
                              <button type="button" onClick={clear} aria-label="Descartar lista" className={iconButtonClass}>
                                    <Icon name="trash" />
                              </button>
                        }
                  />

                  <main className="mx-auto flex max-w-xl flex-col gap-6 px-6 pt-6 pb-32">
                        <section aria-labelledby="to-buy">
                              <h2 id="to-buy" className="mb-1 text-title font-bold text-ink">
                                    Por comprar
                              </h2>
                              <p className="mb-4 text-sm text-ink-muted">
                                    {list.missingItems.length === 0
                                          ? "Tienes todo en tu despensa. ¡A cocinar!"
                                          : `${plural(checkedItems.length, "marcado", "marcados")} de ${list.missingItems.length}`}
                              </p>
                              <ul className="flex flex-col gap-2">
                                    {list.missingItems.map((item) => {
                                          const key = itemKey(item);
                                          const done = checked.includes(key);
                                          return (
                                                <li key={key}>
                                                      <label className="flex min-h-14 cursor-pointer items-center gap-4 rounded-control bg-card px-4 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-strong">
                                                            <input
                                                                  type="checkbox"
                                                                  checked={done}
                                                                  onChange={() => toggle(key)}
                                                                  className="peer sr-only"
                                                            />
                                                            <span
                                                                  aria-hidden
                                                                  className="grid size-6 shrink-0 place-items-center rounded-md border-2 border-ink-muted text-ink peer-checked:border-ink peer-checked:bg-secondary-soft"
                                                            >
                                                                  {done && <Icon name="check" className="size-4" strokeWidth={3} />}
                                                            </span>
                                                            <span className={`flex-1 text-base ${done ? "text-ink-muted line-through" : "font-semibold text-ink"}`}>
                                                                  {item.name}
                                                            </span>
                                                            <span className="text-sm text-ink-muted tabular-nums">
                                                                  {formatQuantity(item.quantity, item.unit)}
                                                            </span>
                                                      </label>
                                                </li>
                                          );
                                    })}
                              </ul>
                        </section>

                        {list.availableItems.length > 0 && (
                              <details className="group rounded-card bg-card p-4">
                                    <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-control text-base font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong [&::-webkit-details-marker]:hidden">
                                          Ya lo tienes ({list.availableItems.length})
                                          <Icon name="arrowRight" className="size-5 text-ink-muted transition-transform group-open:rotate-90" />
                                    </summary>
                                    <ul className="mt-2 flex flex-col gap-2">
                                          {list.availableItems.map((item) => (
                                                <li key={itemKey(item)} className="flex justify-between gap-4 text-sm">
                                                      <span className="flex items-center gap-2 text-ink">
                                                            <Icon name="check" className="size-4 text-success" strokeWidth={2.5} />
                                                            {item.name}
                                                      </span>
                                                      <span className="text-ink-muted tabular-nums">
                                                            {formatQuantity(item.quantity, item.unit)}
                                                      </span>
                                                </li>
                                          ))}
                                    </ul>
                              </details>
                        )}
                  </main>

                  {checkedItems.length > 0 && (
                        <div className="fixed inset-x-0 bottom-20 z-10 px-6">
                              <div className="mx-auto flex max-w-xl flex-col gap-2 rounded-card bg-card p-4 shadow-[0_8px_24px_-8px_rgb(29_9_44/0.35)]">
                                    {addMany.error && <p className="text-sm text-error">{addMany.error.message}</p>}
                                    <Button fullWidth loading={addMany.isPending} onClick={moveToPantry}>
                                          <Icon name="pantry" className="size-5" />
                                          Pasar {plural(checkedItems.length, "comprado", "comprados")} a la despensa
                                    </Button>
                              </div>
                        </div>
                  )}
            </>
      );
}
