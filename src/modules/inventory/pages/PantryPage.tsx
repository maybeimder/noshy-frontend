import { useState, type FormEvent } from "react";
import PageHeader from "@/shared/components/layout/PageHeader";
import Button from "@/shared/components/ui/Button";
import Dialog from "@/shared/components/ui/Dialog";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import { formatQuantity, plural } from "@/shared/lib/format";
import IngredientFields, {
      emptyIngredient,
      toDraft,
      validateIngredient,
      type IngredientDraft,
      type IngredientErrors,
} from "../components/IngredientFields";
import { useInventory, useInventoryMutations } from "../hooks/useInventory";
import type { InventoryItem } from "../types";
import { UnitsDatalist } from "../utils/units";

const rowIconButton =
      "grid size-11 place-items-center rounded-control text-ink-muted hover:bg-primary-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";

export default function PantryPage() {
      const inventory = useInventory();
      const { create, update, remove } = useInventoryMutations();
      const [draft, setDraft] = useState<IngredientDraft>(emptyIngredient);
      const [errors, setErrors] = useState<IngredientErrors>({});
      const [editingId, setEditingId] = useState<string | null>(null);
      const [toDelete, setToDelete] = useState<InventoryItem | null>(null);

      const handleAdd = (event: FormEvent) => {
            event.preventDefault();
            const { errors, input } = validateIngredient(draft);
            setErrors(errors);
            if (!input) return;
            create.mutate(input, { onSuccess: () => setDraft({ ...emptyIngredient(), unit: input.unit }) });
      };

      const items = [...(inventory.data ?? [])].sort((a, b) => a.name.localeCompare(b.name, "es"));

      return (
            <>
                  <PageHeader
                        title="Mi despensa"
                        subtitle={inventory.data ? plural(inventory.data.length, "ingrediente", "ingredientes") : undefined}
                  />
                  <UnitsDatalist />

                  <main className="mx-auto flex max-w-xl flex-col gap-6 px-6 pt-6">
                        <section aria-labelledby="add-item" className="rounded-card bg-card p-4">
                              <h2 id="add-item" className="mb-4 text-title font-bold text-ink">
                                    Añadir ingrediente
                              </h2>
                              <form noValidate onSubmit={handleAdd} className="flex flex-col gap-4">
                                    {create.error && <FormAlert>{create.error.message}</FormAlert>}
                                    <IngredientFields
                                          value={draft}
                                          onChange={(value) => {
                                                setDraft(value);
                                                setErrors({});
                                          }}
                                          errors={errors}
                                    />
                                    <Button type="submit" loading={create.isPending}>
                                          <Icon name="plus" className="size-5" />
                                          Añadir a la despensa
                                    </Button>
                              </form>
                        </section>

                        {inventory.isPending ? (
                              <LoadingState />
                        ) : inventory.isError ? (
                              <ErrorState message={inventory.error.message} onRetry={() => inventory.refetch()} />
                        ) : items.length === 0 ? (
                              <EmptyState
                                    icon="pantry"
                                    title="Tu despensa está vacía"
                                    description="Añade lo que tienes en casa y tu chef te dirá qué puedes cocinar y qué te falta."
                              />
                        ) : (
                              <ul aria-label="Ingredientes" className="flex flex-col gap-2">
                                    {items.map((item) =>
                                          editingId === item.id ? (
                                                <EditRow
                                                      key={item.id}
                                                      item={item}
                                                      saving={update.isPending}
                                                      error={update.error?.message}
                                                      onCancel={() => setEditingId(null)}
                                                      onSave={(input) =>
                                                            update.mutate(
                                                                  { id: item.id, input },
                                                                  { onSuccess: () => setEditingId(null) },
                                                            )
                                                      }
                                                />
                                          ) : (
                                                <li
                                                      key={item.id}
                                                      className="flex items-center gap-2 rounded-control bg-card py-2 pr-2 pl-4"
                                                >
                                                      <span className="min-w-0 flex-1 truncate text-base font-semibold text-ink">
                                                            {item.name}
                                                      </span>
                                                      <span className="shrink-0 text-sm text-ink-muted tabular-nums">
                                                            {formatQuantity(item.quantity, item.unit)}
                                                      </span>
                                                      <button
                                                            type="button"
                                                            className={rowIconButton}
                                                            aria-label={`Editar ${item.name}`}
                                                            onClick={() => {
                                                                  update.reset();
                                                                  setEditingId(item.id);
                                                            }}
                                                      >
                                                            <Icon name="edit" className="size-5" />
                                                      </button>
                                                      <button
                                                            type="button"
                                                            className={rowIconButton}
                                                            aria-label={`Eliminar ${item.name}`}
                                                            onClick={() => setToDelete(item)}
                                                      >
                                                            <Icon name="trash" className="size-5" />
                                                      </button>
                                                </li>
                                          ),
                                    )}
                              </ul>
                        )}
                  </main>

                  <Dialog
                        open={toDelete !== null}
                        onClose={() => setToDelete(null)}
                        title="¿Eliminar ingrediente?"
                        actions={
                              <>
                                    <Button variant="tertiary" onClick={() => setToDelete(null)}>
                                          Cancelar
                                    </Button>
                                    <Button
                                          loading={remove.isPending}
                                          onClick={() =>
                                                toDelete &&
                                                remove.mutate(toDelete.id, { onSuccess: () => setToDelete(null) })
                                          }
                                    >
                                          Eliminar
                                    </Button>
                              </>
                        }
                  >
                        {toDelete && (
                              <p className="text-ink-muted">
                                    Se quitará <strong className="text-ink">{toDelete.name}</strong> (
                                    {formatQuantity(toDelete.quantity, toDelete.unit)}) de tu despensa.
                              </p>
                        )}
                        {remove.error && <p className="mt-2 text-sm text-error">{remove.error.message}</p>}
                  </Dialog>
            </>
      );
}

function EditRow({
      item,
      saving,
      error,
      onSave,
      onCancel,
}: {
      item: InventoryItem;
      saving: boolean;
      error?: string;
      onSave: (input: { name: string; quantity: number; unit: string }) => void;
      onCancel: () => void;
}) {
      const [draft, setDraft] = useState(() => toDraft(item));
      const [errors, setErrors] = useState<IngredientErrors>({});

      return (
            <li className="rounded-control border-2 border-ink bg-card p-4">
                  <form
                        noValidate
                        className="flex flex-col gap-3"
                        onSubmit={(event) => {
                              event.preventDefault();
                              const { errors, input } = validateIngredient(draft);
                              setErrors(errors);
                              if (input) onSave(input);
                        }}
                        onKeyDown={(event) => event.key === "Escape" && onCancel()}
                  >
                        <IngredientFields value={draft} onChange={setDraft} errors={errors} autoFocus />
                        {error && <p className="text-sm text-error">{error}</p>}
                        <div className="flex justify-end gap-2">
                              <Button variant="tertiary" onClick={onCancel}>
                                    Cancelar
                              </Button>
                              <Button type="submit" loading={saving}>
                                    Guardar
                              </Button>
                        </div>
                  </form>
            </li>
      );
}
