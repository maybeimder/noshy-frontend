import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import PageHeader from "@/shared/components/layout/PageHeader";
import Button from "@/shared/components/ui/Button";
import Dialog from "@/shared/components/ui/Dialog";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import RoundButton from "@/shared/components/ui/RoundButton";
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
import { useInventory, useInventoryMutations } from "../hooks/useInventory";
import type { InventoryItem, InventoryItemInput } from "../types";
import { categoryOf, categoryOrder, type Category } from "../utils/categories";

const smallIcon =
      "grid size-9 place-items-center rounded-full text-ink-muted hover:bg-field hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";

export default function PantryPage() {
      const inventory = useInventory();
      const { create, update, remove } = useInventoryMutations();
      const [draft, setDraft] = useState<IngredientDraft>(emptyIngredient);
      const [errors, setErrors] = useState<IngredientErrors>({});
      const [editing, setEditing] = useState<InventoryItem | null>(null);
      const [toDelete, setToDelete] = useState<InventoryItem | null>(null);
      const [filter, setFilter] = useState<Category | "Todo">("Todo");
      const [searchOpen, setSearchOpen] = useState(false);
      const [search, setSearch] = useState("");

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

      return (
            <>
                  <PageHeader
                        title="Mi despensa"
                        scribble="pink"
                        decoration="star"
                        subtitle={inventory.data ? plural(inventory.data.length, "ingrediente guardado", "ingredientes guardados") : undefined}
                        actions={
                              <RoundButton label={searchOpen ? "Cerrar búsqueda" : "Buscar en la despensa"} onClick={() => setSearchOpen((v) => !v)}>
                                    <Icon name={searchOpen ? "close" : "search"} />
                              </RoundButton>
                        }
                  />

                  <main className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-3">
                        {searchOpen && (
                              <label>
                                    <span className="sr-only">Buscar ingrediente</span>
                                    <input
                                          autoFocus
                                          type="search"
                                          placeholder="Buscar ingrediente…"
                                          value={search}
                                          onChange={(e) => setSearch(e.target.value)}
                                          className={`${fieldClass("card")} min-h-12 px-4`}
                                    />
                              </label>
                        )}

                        <section aria-labelledby="add-item" className="rounded-card bg-card p-4 shadow-[0_8px_24px_-18px_rgb(43_20_51/0.4)]">
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
                                          }}
                                          errors={errors}
                                          trailing={
                                                <button
                                                      type="submit"
                                                      aria-label="Añadir a la despensa"
                                                      disabled={create.isPending}
                                                      className="grid size-12 place-items-center rounded-control bg-primary-strong text-card shadow-[0_8px_18px_-8px_rgb(201_48_124/0.7)] hover:bg-primary-strong/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:opacity-60"
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
                        </section>

                        {all.length > 0 && (
                              <div role="group" aria-label="Filtrar por categoría" className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5">
                                    {(["Todo", ...present] as const).map((c) => {
                                          const selected = filter === c;
                                          return (
                                                <button
                                                      key={c}
                                                      type="button"
                                                      aria-pressed={selected}
                                                      onClick={() => setFilter(c)}
                                                      className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-extrabold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
                                                            selected ? "bg-ink text-card" : "bg-card text-ink hover:bg-field"
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
                                    description="Añade lo que tienes en casa y Noshy te dirá qué puedes cocinar y qué te falta."
                              />
                        ) : items.length === 0 ? (
                              <p className="py-6 text-center text-base text-ink-muted">Nada coincide con tu búsqueda.</p>
                        ) : (
                              <ul aria-label="Ingredientes" className="grid grid-cols-2 gap-3">
                                    {items.map((item) => {
                                          const tone = tones[toneFor(item.name)];
                                          return (
                                                <li key={item.id} className="flex flex-col gap-3 rounded-card bg-card p-4">
                                                      <div className="flex items-start justify-between">
                                                            <span aria-hidden className={`grid size-11 place-items-center rounded-control font-display text-title font-extrabold ${tone.soft} ${tone.ink}`}>
                                                                  {item.name.trim().charAt(0).toUpperCase()}
                                                            </span>
                                                            <span className="-mr-2 flex">
                                                                  <button type="button" className={smallIcon} aria-label={`Editar ${item.name}`} onClick={() => setEditing(item)}>
                                                                        <Icon name="edit" className="size-4" />
                                                                  </button>
                                                                  <button type="button" className={smallIcon} aria-label={`Eliminar ${item.name}`} onClick={() => setToDelete(item)}>
                                                                        <Icon name="trash" className="size-4" />
                                                                  </button>
                                                            </span>
                                                      </div>
                                                      <div className="min-w-0">
                                                            <p className="truncate text-base font-bold text-ink">{item.name}</p>
                                                            <p className={`font-display text-title font-extrabold tabular-nums ${tone.ink}`}>
                                                                  {formatQuantity(item.quantity, item.unit)}
                                                            </p>
                                                      </div>
                                                </li>
                                          );
                                    })}
                              </ul>
                        )}

                        {all.length > 0 && (
                              <Link
                                    to="/chef"
                                    className="group flex items-center gap-3 rounded-card bg-card p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                              >
                                    <MascotAvatar className="size-14 rounded-control" />
                                    <span className="min-w-0 flex-1">
                                          <span className="block font-display text-base font-bold text-ink">Con esto te hago algo rico</span>
                                          <span className="block text-sm font-bold text-primary-strong">Pregúntale a Noshy</span>
                                    </span>
                                    <Icon name="arrowRight" className="size-6 shrink-0 text-ink transition-transform group-hover:translate-x-1" />
                              </Link>
                        )}
                  </main>

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
