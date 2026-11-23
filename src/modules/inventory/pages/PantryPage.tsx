import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import FoodResults from "@/modules/food/components/FoodResults";
import ProductDialog from "@/modules/food/components/ProductDialog";
import type { FoodSearchItem } from "@/modules/food/types";
import Button, { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import { DishPlate } from "@/shared/components/ui/DishArt";
import Dialog from "@/shared/components/ui/Dialog";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import RoundButton from "@/shared/components/ui/RoundButton";
import { MarkerText } from "@/shared/components/ui/ScribbleText";
import { fieldClass } from "@/shared/components/ui/TextField";
import { formatQuantity, plural } from "@/shared/lib/format";
import { tones, toneFor } from "@/shared/lib/tones";
import IngredientFields, {
      emptyIngredient,
      toDraft,
      validateIngredient,
      type IngredientDraft,
      type IngredientErrors,
} from "../components/IngredientFields";
import KitchenHeader from "../components/KitchenHeader";
import { useInventory, useInventoryMutations } from "../hooks/useInventory";
import type { InventoryItem, InventoryItemInput } from "../types";
import { categoryOf, categoryOrder, type Category } from "../utils/categories";

const ago = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

/** «hoy», «ayer», «hace 3 días». */
function addedAgo(iso: string) {
      const days = Math.round((new Date(iso).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86_400_000);
      const text = ago.format(days, "day");
      return days === 0 ? "Añadido hoy" : text.charAt(0).toUpperCase() + text.slice(1);
}

const smallIcon =
      "grid size-11 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-field hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";

export default function PantryPage() {
      const inventory = useInventory();
      const { create, update, remove, addMany } = useInventoryMutations();
      const [draft, setDraft] = useState<IngredientDraft>(emptyIngredient);
      const [errors, setErrors] = useState<IngredientErrors>({});
      const [editing, setEditing] = useState<InventoryItem | null>(null);
      const [toDelete, setToDelete] = useState<InventoryItem | null>(null);
      const [filter, setFilter] = useState<Category | "Todo">("Todo");
      const [searchOpen, setSearchOpen] = useState(false);
      const [addOpen, setAddOpen] = useState(false);
      const [search, setSearch] = useState("");
      // Catalog search (GET /food/products) as the user types the ingredient name.
      const [product, setProduct] = useState<FoodSearchItem | null>(null);
      const [addingId, setAddingId] = useState<string | null>(null);
      const [added, setAdded] = useState<string | null>(null);

      const addFromCatalog = (input: InventoryItemInput, id: string, onDone?: () => void) => {
            setAddingId(id);
            addMany.mutate([input], {
                  onSuccess: () => {
                        setAdded(`${input.name} · ${formatQuantity(input.quantity, input.unit)}`);
                        setDraft((d) => ({ ...emptyIngredient(), unit: d.unit }));
                        onDone?.();
                  },
                  onSettled: () => setAddingId(null),
            });
      };

      const handleAdd = (event: FormEvent) => {
            event.preventDefault();
            const { errors, input } = validateIngredient(draft);
            setErrors(errors);
            if (!input) return;
            create.mutate(input, { onSuccess: () => setDraft({ ...emptyIngredient(), unit: input.unit }) });
      };

      const all = [...(inventory.data ?? [])].sort((a, b) => a.name.localeCompare(b.name, "es"));
      const present = categoryOrder.filter((c) => all.some((item) => categoryOf(item.name) === c));
      const items = all.filter(
            (item) =>
                  (filter === "Todo" || categoryOf(item.name) === filter) &&
                  item.name.toLowerCase().includes(search.trim().toLowerCase()),
      );

      const recent = [...all].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3);
      const showAdd = addOpen || (inventory.isSuccess && all.length === 0);

      return (
            <>
                  <KitchenHeader
                        title="Mi despensa"
                        meta={inventory.data ? `${plural(inventory.data.length, "ingrediente", "ingredientes")} · hoy` : undefined}
                        actions={
                              <>
                                    <RoundButton label={searchOpen ? "Cerrar búsqueda" : "Buscar en la despensa"} onClick={() => setSearchOpen((v) => !v)}>
                                          <Icon name={searchOpen ? "close" : "search"} />
                                    </RoundButton>
                                    <RoundButton tone="primary" label={addOpen ? "Cerrar añadir ingrediente" : "Añadir ingrediente"} onClick={() => setAddOpen((v) => !v)}>
                                          <Icon name={addOpen ? "close" : "plus"} strokeWidth={2.25} />
                                    </RoundButton>
                              </>
                        }
                  />

                  <main className="mx-auto flex max-w-xl flex-col gap-5 px-5 pt-3">
                        {searchOpen && (
                              <label className="relative">
                                    <span className="sr-only">Buscar ingrediente</span>
                                    <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted" />
                                    <input
                                          autoFocus
                                          type="search"
                                          placeholder="Buscar ingrediente…"
                                          value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                          className={`${fieldClass("card")} min-h-12 rounded-full pr-4 pl-12 shadow-soft`}
                                    />
                              </label>
                        )}

                        {showAdd && (
                              <section aria-labelledby="add-item" className="rounded-card bg-card p-4 shadow-soft">
                                    <h2 id="add-item" className="mb-3 text-title font-extrabold text-ink">
                                          Añadir ingrediente
                                    </h2>
                                    <form noValidate onSubmit={handleAdd} className="flex flex-col gap-3">
                                          {create.error && <FormAlert>{create.error.message}</FormAlert>}
                                          <IngredientFields
                                                value={draft}
                                                onChange={(value) => {
                                                      setDraft(value);
                                                      setErrors({});
                                                      setAdded(null);
                                                }}
                                                errors={errors}
                                                trailing={
                                                      <button
                                                            type="submit"
                                                            aria-label="Añadir a la despensa"
                                                            disabled={create.isPending}
                                                            className="grid size-12 place-items-center rounded-full bg-brand text-card shadow-brand hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:opacity-60"
                                                      >
                                                            {create.isPending ? (
                                                                  <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                                                            ) : (
                                                                  <Icon name="plus" strokeWidth={2.25} />
                                                            )}
                                                      </button>
                                                }
                                          />
                                    </form>
                                    {added && (
                                          <p role="status" className="mt-3 flex items-center gap-2 rounded-control bg-mint-soft p-3 text-sm font-bold text-mint-ink">
                                                <Icon name="check" className="size-4" strokeWidth={2.5} />
                                                Añadido: {added}
                                          </p>
                                    )}
                                    {addMany.error && !product && <p className="mt-3 text-sm font-semibold text-error">{addMany.error.message}</p>}
                                    <div className="mt-3 empty:hidden">
                                          <FoodResults
                                                query={draft.name}
                                                listId="food-results"
                                                addingId={addingId}
                                                onQuickAdd={(item) => addFromCatalog({ name: item.name, quantity: item.baseServing.grams, unit: "g" }, item.id)}
                                                onOpen={(item) => {
                                                      addMany.reset();
                                                      setProduct(item);
                                                }}
                                          />
                                    </div>
                              </section>
                        )}

                        {all.length > 0 && (
                              <Link
                                    to="/recetas/generar"
                                    className="group relative flex min-h-36 overflow-hidden rounded-card bg-peach-glow p-5 shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                              >
                                    <span aria-hidden className="absolute -top-4 -right-6 size-28 rounded-full bg-card p-1 shadow-soft">
                                          <DishPlate seed="pantry-a" dish="ensalada" className="size-full" />
                                    </span>
                                    <span aria-hidden className="absolute -right-2 -bottom-6 size-20 rounded-full bg-card p-1 shadow-soft">
                                          <DishPlate seed="pantry-b" dish="curry" className="size-full" />
                                    </span>
                                    <span className="relative flex max-w-[62%] flex-col items-start">
                                          <span className="text-sm font-bold text-ink">Con lo que tienes</span>
                                          <span className="mt-0.5 font-display text-section leading-tight font-extrabold text-ink">te hago algo rico hoy</span>
                                          <span className={`${buttonBase} ${buttonVariants.dark} mt-3 min-h-10 gap-1.5 px-4 text-sm`}>
                                                Ver ideas
                                                <Icon name="arrowRight" className="size-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2.25} />
                                          </span>
                                    </span>
                              </Link>
                        )}

                        {recent.length > 0 && !search && filter === "Todo" && (
                              <section aria-labelledby="recent" className="flex flex-col gap-3">
                                    <h2 id="recent" className="text-section font-extrabold text-ink">
                                          <MarkerText>Recién añadidos</MarkerText>
                                    </h2>
                                    <ul className="grid grid-cols-3 gap-3">
                                          {recent.map((item) => {
                                                const tone = tones[toneFor(item.name)];
                                                return (
                                                      <li key={item.id} className={`flex min-h-32 flex-col items-center justify-center gap-1 rounded-card p-3 text-center ${tone.soft}`}>
                                                            <span aria-hidden className={`grid size-11 place-items-center rounded-full bg-card font-display text-title font-extrabold ${tone.ink}`}>
                                                                  {item.name.trim().charAt(0).toUpperCase()}
                                                            </span>
                                                            <span className="w-full truncate text-sm font-extrabold text-ink">{item.name}</span>
                                                            <span className={`text-xs font-bold ${tone.ink}`}>{addedAgo(item.createdAt)}</span>
                                                      </li>
                                                );
                                          })}
                                    </ul>
                              </section>
                        )}

                        {all.length > 0 && (
                              <div role="group" aria-label="Filtrar por categoría" className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 py-1">
                                    {(["Todo", ...present] as const).map((c) => {
                                          const selected = filter === c;
                                          return (
                                                <button
                                                      key={c}
                                                      type="button"
                                                      aria-pressed={selected}
                                                      onClick={() => setFilter(c)}
                                                      className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-extrabold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
                                                            selected ? "bg-brand text-card shadow-brand" : "bg-card text-ink shadow-soft hover:bg-field"
                                                      }`}
                                                >
                                                      {c === "Todo" ? `Todo · ${all.length}` : c}
                                                </button>
                                          );
                                    })}
                              </div>
                        )}

                        {inventory.isPending ? (
                              <LoadingState />
                        ) : inventory.isError ? (
                              <ErrorState message={inventory.error.message} onRetry={() => inventory.refetch()} />
                        ) : all.length === 0 ? (
                              <EmptyState
                                    icon="pantry"
                                    title="Tu despensa está vacía"
                                    description="Añade lo que tienes en casa y tu chef te dirá qué puedes cocinar y qué te falta."
                              />
                        ) : items.length === 0 ? (
                              <p className="py-6 text-center text-base text-ink-muted">Nada coincide con tu búsqueda.</p>
                        ) : (
                              <ul aria-label="Ingredientes" className="flex flex-col gap-2">
                                    {items.map((item) => {
                                          const tone = tones[toneFor(item.name)];
                                          return (
                                                <li key={item.id} className="flex min-h-16 items-center gap-3 rounded-card bg-card py-2 pr-2 pl-3 shadow-soft">
                                                      <span aria-hidden className={`grid size-11 shrink-0 place-items-center rounded-control font-display text-title font-extrabold ${tone.soft} ${tone.ink}`}>
                                                            {item.name.trim().charAt(0).toUpperCase()}
                                                      </span>
                                                      <div className="min-w-0 flex-1">
                                                            <p className="truncate font-bold text-ink">{item.name}</p>
                                                            <p className="text-sm font-semibold text-ink-muted tabular-nums">
                                                                  {categoryOf(item.name)} · {formatQuantity(item.quantity, item.unit)}
                                                            </p>
                                                      </div>
                                                      <button type="button" className={smallIcon} aria-label={`Editar ${item.name}`} onClick={() => setEditing(item)}>
                                                            <Icon name="edit" className="size-4" />
                                                      </button>
                                                      <button type="button" className={smallIcon} aria-label={`Eliminar ${item.name}`} onClick={() => setToDelete(item)}>
                                                            <Icon name="trash" className="size-4" />
                                                      </button>
                                                </li>
                                          );
                                    })}
                              </ul>
                        )}
                  </main>

                  {product && (
                        <ProductDialog
                              item={product}
                              adding={addingId === product.id}
                              error={addMany.error?.message}
                              onAdd={(input) => addFromCatalog(input, product.id, () => setProduct(null))}
                              onClose={() => setProduct(null)}
                        />
                  )}

                  {editing && (
                        <EditDialog
                              item={editing}
                              saving={update.isPending}
                              error={update.error?.message}
                              onClose={() => {
                                    update.reset();
                                    setEditing(null);
                              }}
                              onSave={(input) => update.mutate({ id: editing.id, input }, { onSuccess: () => setEditing(null) })}
                        />
                  )}

                  <Dialog
                        open={toDelete !== null}
                        onClose={() => setToDelete(null)}
                        title="¿Eliminar ingrediente?"
                        actions={
                              <>
                                    <Button variant="soft" onClick={() => setToDelete(null)}>
                                          Cancelar
                                    </Button>
                                    <Button loading={remove.isPending} onClick={() => toDelete && remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })}>
                                          Eliminar
                                    </Button>
                              </>
                        }
                  >
                        {toDelete && (
                              <p className="text-ink-muted">
                                    Se quitará <strong className="text-ink">{toDelete.name}</strong> ({formatQuantity(toDelete.quantity, toDelete.unit)}) de tu despensa.
                              </p>
                        )}
                        {remove.error && <p className="mt-2 text-sm text-error">{remove.error.message}</p>}
                  </Dialog>
            </>
      );
}

function EditDialog({
      item,
      saving,
      error,
      onSave,
      onClose,
}: {
      item: InventoryItem;
      saving: boolean;
      error?: string;
      onSave: (input: InventoryItemInput) => void;
      onClose: () => void;
}) {
      const [draft, setDraft] = useState(() => toDraft(item));
      const [errors, setErrors] = useState<IngredientErrors>({});
      const submit = () => {
            const { errors, input } = validateIngredient(draft);
            setErrors(errors);
            if (input) onSave(input);
      };

      return (
            <Dialog
                  open
                  onClose={onClose}
                  title={`Editar ${item.name}`}
                  actions={
                        <>
                              <Button variant="soft" onClick={onClose}>
                                    Cancelar
                              </Button>
                              <Button loading={saving} onClick={submit}>
                                    Guardar
                              </Button>
                        </>
                  }
            >
                  <form
                        noValidate
                        onSubmit={(e) => {
                              e.preventDefault();
                              submit();
                        }}
                        className="flex flex-col gap-3"
                  >
                        <IngredientFields
                              value={draft}
                              onChange={(value) => {
                                    setDraft(value);
                                    setErrors({});
                              }}
                              errors={errors}
                              autoFocus
                        />
                        {error && <p className="text-sm text-error">{error}</p>}
                  </form>
            </Dialog>
      );
}
