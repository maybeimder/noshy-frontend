import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInventory } from "@/modules/inventory/hooks/useInventory";
import type { InventoryItem } from "@/modules/inventory/types";
import PageHeader from "@/shared/components/layout/PageHeader";
import Button from "@/shared/components/ui/Button";
import { Steam } from "@/shared/components/ui/Doodles";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import MascotBubble from "@/shared/components/ui/MascotBubble";
import { ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import { fieldClass } from "@/shared/components/ui/TextField";
import { formatQuantity } from "@/shared/lib/format";
import { foodErrorMessage, useGenerateRecipe } from "../hooks/useFood";

const MAX_INGREDIENTS = 12; // backend recipeGenerationSchema

/** Grams for the AI only when the pantry unit says so; otherwise the writer picks an amount. */
const gramsOf = (item: InventoryItem) => {
      const unit = item.unit.trim().toLowerCase();
      if (unit === "g") return item.quantity;
      if (unit === "kg") return item.quantity * 1000;
      return undefined;
};

const chip = (selected: boolean) =>
      `inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 px-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
            selected ? "border-ink bg-ink text-card" : "border-line bg-card text-ink hover:bg-field"
      }`;

// POST /food/recipes/generate: pick pantry ingredients (plus extras), servings and notes.
export default function GenerateRecipePage() {
      const navigate = useNavigate();
      const inventory = useInventory();
      const generate = useGenerateRecipe();
      const [selected, setSelected] = useState<string[] | null>(null);
      const [extras, setExtras] = useState<string[]>([]);
      const [extra, setExtra] = useState("");
      const [servings, setServings] = useState(2);
      const [notes, setNotes] = useState("");

      const items = inventory.data ?? [];
      // Until the user touches the list, the first few pantry items are pre-selected.
      const chosen = selected ?? items.slice(0, 4).map((i) => i.id);
      const total = chosen.length + extras.length;
      const full = total >= MAX_INGREDIENTS;

      const toggle = (id: string) =>
            setSelected(chosen.includes(id) ? chosen.filter((c) => c !== id) : full ? chosen : [...chosen, id]);

      const addExtra = () => {
            const value = extra.trim();
            if (value && !full && !extras.some((e) => e.toLowerCase() === value.toLowerCase())) setExtras((e) => [...e, value]);
            setExtra("");
      };

      const submit = () => {
            const ingredients = [
                  ...items.filter((i) => chosen.includes(i.id)).map((i) => ({ name: i.name, ...(gramsOf(i) ? { grams: gramsOf(i) } : {}) })),
                  ...extras.map((name) => ({ name })),
            ];
            generate.mutate(
                  { ingredients, servings, ...(notes.trim() ? { notes: notes.trim() } : {}) },
                  { onSuccess: (recipe) => navigate(`/recetas/generada/${recipe.id}`) },
            );
      };

      return (
            <div className="min-h-dvh bg-canvas">
                  <PageHeader title="Genera una receta" scribble="pink" decoration="star" backTo="/despensa" />

                  <main className="mx-auto flex max-w-xl flex-col gap-6 px-5 pt-3">
                        <MascotBubble title="¿Con qué cocinamos?">Elige lo que quieras usar y te escribo una receta con sus macros.</MascotBubble>

                        {generate.error && <FormAlert>{foodErrorMessage(generate.error)}</FormAlert>}

                        <section aria-labelledby="gen-ingredients" className="flex flex-col gap-3">
                              <h2 id="gen-ingredients" className="flex items-center gap-2 text-section font-extrabold text-ink">
                                    Ingredientes
                                    <span className="grid min-w-7 place-items-center rounded-full bg-rose-soft px-2 text-sm text-rose-ink">{total}</span>
                              </h2>
                              {inventory.isPending ? (
                                    <LoadingState />
                              ) : inventory.isError ? (
                                    <ErrorState message={inventory.error.message} onRetry={() => inventory.refetch()} />
                              ) : (
                                    <>
                                          {items.length === 0 && <p className="text-sm text-ink-muted">Tu despensa está vacía: escribe abajo los ingredientes que quieres usar.</p>}
                                          <div role="group" aria-label="De tu despensa" className="flex flex-wrap gap-2">
                                                {items.map((item) => {
                                                      const on = chosen.includes(item.id);
                                                      return (
                                                            <button key={item.id} type="button" aria-pressed={on} disabled={!on && full} onClick={() => toggle(item.id)} className={`${chip(on)} disabled:opacity-50`}>
                                                                  {on && <Icon name="check" className="size-4" strokeWidth={3} />}
                                                                  {item.name}
                                                                  <span className={`text-xs font-semibold ${on ? "text-card/80" : "text-ink-muted"}`}>{formatQuantity(item.quantity, item.unit)}</span>
                                                            </button>
                                                      );
                                                })}
                                                {extras.map((name) => (
                                                      <button key={name} type="button" aria-pressed onClick={() => setExtras((e) => e.filter((x) => x !== name))} className={chip(true)}>
                                                            <Icon name="close" className="size-4" strokeWidth={2.5} />
                                                            {name}
                                                      </button>
                                                ))}
                                          </div>
                                          <div className="flex gap-2">
                                                <label className="flex-1">
                                                      <span className="sr-only">Otro ingrediente</span>
                                                      <input
                                                            value={extra}
                                                            maxLength={60}
                                                            placeholder="Otro, ej. limón"
                                                            onChange={(e) => setExtra(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                  if (e.key === "Enter") {
                                                                        e.preventDefault();
                                                                        addExtra();
                                                                  }
                                                            }}
                                                            className={`${fieldClass("card")} min-h-12 px-4`}
                                                      />
                                                </label>
                                                <Button variant="dark" onClick={addExtra} disabled={!extra.trim() || full} className="min-h-12">
                                                      Añadir
                                                </Button>
                                          </div>
                                          {full && <p className="text-xs font-semibold text-ink-muted">Máximo {MAX_INGREDIENTS} ingredientes por receta.</p>}
                                    </>
                              )}
                        </section>

                        <div className="relative flex items-center gap-3 rounded-card bg-secondary-soft p-5">
                              <Steam className="absolute -top-7 left-1/3 size-6 text-wine" />
                              <div className="min-w-0 flex-1">
                                    <h2 className="text-title font-extrabold text-ink">Porciones</h2>
                                    <p className="text-sm text-ink">Calculo las macros por porción</p>
                              </div>
                              <div role="group" aria-label="Porciones" className="flex items-center gap-3">
                                    <button
                                          type="button"
                                          aria-label="Una porción menos"
                                          disabled={servings <= 1}
                                          onClick={() => setServings((n) => Math.max(1, n - 1))}
                                          className="grid size-12 place-items-center rounded-control bg-card text-ink focus-visible:outline-2 focus-visible:outline-primary-strong disabled:opacity-50"
                                    >
                                          <Icon name="minus" />
                                    </button>
                                    <output aria-live="polite" className="w-6 text-center font-display text-section font-extrabold">
                                          {servings}
                                    </output>
                                    <button
                                          type="button"
                                          aria-label="Una porción más"
                                          disabled={servings >= 12}
                                          onClick={() => setServings((n) => Math.min(12, n + 1))}
                                          className="grid size-12 place-items-center rounded-control bg-primary-strong text-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:opacity-50"
                                    >
                                          <Icon name="plus" />
                                    </button>
                              </div>
                        </div>

                        <label className="flex flex-col gap-2">
                              <span className="text-sm font-bold text-ink">Algo que deba saber (opcional)</span>
                              <textarea
                                    rows={2}
                                    maxLength={300}
                                    value={notes}
                                    placeholder="Ej. algo rápido, sin horno"
                                    onChange={(e) => setNotes(e.target.value)}
                                    className={`${fieldClass("card")} resize-y px-4 py-3`}
                              />
                        </label>

                        <div className="sticky bottom-0 -mx-5 rounded-t-[2rem] bg-card px-5 pt-4 pb-6 shadow-[0_-12px_32px_-20px_rgb(43_20_51/0.35)]">
                              <Button size="lg" fullWidth loading={generate.isPending} disabled={total === 0} onClick={submit}>
                                    {!generate.isPending && <Icon name="star4" className="size-5" />}
                                    {generate.isPending ? "Noshy está cocinando la receta…" : "Generar receta"}
                              </Button>
                              {generate.isPending && <p className="mt-2 text-center text-xs font-semibold text-ink-muted">Puede tardar unos segundos.</p>}
                        </div>
                  </main>
            </div>
      );
}
