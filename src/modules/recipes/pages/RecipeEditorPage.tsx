import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import IngredientSearch from "@/modules/inventory/components/IngredientSearch";
import VerifyEmail from "@/modules/settings/components/VerifyEmail";
import PageHeader from "@/shared/components/layout/PageHeader";
import Button from "@/shared/components/ui/Button";
import Chips from "@/shared/components/ui/Chips";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import ImagePicker from "@/shared/components/ui/ImagePicker";
import { ErrorState } from "@/shared/components/ui/QueryState";
import Stepper from "@/shared/components/ui/Stepper";
import TextField, { fieldClass } from "@/shared/components/ui/TextField";
import { ApiError, newKey } from "@/shared/lib/axios";
import type { UploadedMedia } from "@/shared/lib/upload";
import { parseAmount, unitLabel } from "@/shared/lib/units";
import type { Macros, Unit } from "@/shared/types/api";
import { EditorSkeleton } from "../components/RecipeSkeletons";
import { useMyRecipeMutations, useRecipe } from "../hooks/useRecipes";
import type { Difficulty, Heat, MyRecipePatch, RecipeDetail } from "../types";

const removeButton =
      "grid size-11 shrink-0 place-items-center rounded-control text-ink-muted hover:bg-field hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:invisible";

type IngredientDraft = { ingredientId: string; label: string; amount: string; unit: Unit; units: Unit[]; prep: string };
type StepDraft = { text: string; minutes: string; heat: Heat | "" };

const difficulties: { id: Difficulty; label: string }[] = [
      { id: "easy", label: "Fácil" },
      { id: "medium", label: "Media" },
      { id: "hard", label: "Difícil" },
];
const heatOf = (level: number): Heat | "" => (level >= 8 ? "high" : level >= 5 ? "medium" : level > 0 ? "low" : "");

export default function RecipeEditorPage() {
      const { id } = useParams();
      // As written by the author: the adapted version would overwrite it on save.
      const recipe = useRecipe(id, { adapted: false });

      return (
            <div className="min-h-dvh bg-canvas">
                  <PageHeader title={id ? "Editar receta" : "Nueva receta"} scribble="pink" decoration="star" backTo="/recetas" />
                  {!id ? (
                        <main>
                              <RecipeForm />
                        </main>
                  ) : recipe.isPending ? (
                        <EditorSkeleton />
                  ) : recipe.isError ? (
                        <main className="mx-auto max-w-xl px-5 pt-4">
                              <ErrorState message={recipe.error.message} onRetry={() => recipe.refetch()} />
                        </main>
                  ) : (
                        <main>
                              <RecipeForm key={recipe.data.id} initial={recipe.data} />
                        </main>
                  )}
            </div>
      );
}

function toIngredientDraft(i: RecipeDetail["ingredients"][number]): IngredientDraft {
      return {
            ingredientId: i.ingredientId,
            label: i.label,
            amount: i.quantity.value === null ? "" : String(i.quantity.value).replace(".", ","),
            unit: i.quantity.unit,
            units: [i.quantity.unit],
            prep: i.prep ?? "",
      };
}

function RecipeForm({ initial }: { initial?: RecipeDetail }) {
      const navigate = useNavigate();
      const { create, update, publish } = useMyRecipeMutations();
      // Created on the first save; later saves update it.
      const [recipeId, setRecipeId] = useState(initial?.id ?? null);
      const [createKey] = useState(newKey);
      // An older server does not return the steps: saving an empty list would erase them.
      const stepsKnown = !initial || initial.steps !== undefined;
      const [title, setTitle] = useState(initial?.title ?? "");
      const [cover, setCover] = useState<UploadedMedia | null>(null);
      const [minutes, setMinutes] = useState(initial && initial.totalTimeMinutes.max > 0 ? String(initial.totalTimeMinutes.max) : "");
      const [servings, setServings] = useState(initial?.servings.value ?? 2);
      const [difficulty, setDifficulty] = useState<Difficulty | "">(initial?.difficulty?.id ?? "");
      const [ingredients, setIngredients] = useState<IngredientDraft[]>(() => initial?.ingredients.map(toIngredientDraft) ?? []);
      const [steps, setSteps] = useState<StepDraft[]>(() => {
            const loaded = initial?.steps?.map((s) => ({ text: s.text, minutes: s.timerSeconds ? String(Math.round((s.timerSeconds / 60) * 10) / 10).replace(".", ",") : "", heat: heatOf(s.heatLevel) })) ?? [];
            return loaded.length ? loaded : [{ text: "", minutes: "", heat: "" }];
      });
      const [consultable, setConsultable] = useState<boolean | null>(null);
      const [errors, setErrors] = useState<Record<string, string>>({});
      const [saved, setSaved] = useState<{ macros: Macros | null; partial: boolean } | null>(null);
      const busy = create.isPending || update.isPending || publish.isPending;
      const error = create.error ?? update.error ?? publish.error;
      const needsEmail = publish.error instanceof ApiError && publish.error.code === "EMAIL_NOT_VERIFIED";
      const details = error instanceof ApiError ? Object.values(error.fieldErrors) : [];

      /** Validates and saves the draft; null when something is missing. */
      const saveDraft = async (): Promise<string | null> => {
            const next: Record<string, string> = {};
            if (title.trim().length < 2) next.title = "Ponle un nombre de al menos 2 letras.";
            const totalTime = minutes.trim() ? parseAmount(minutes) : null;
            if (minutes.trim() && (totalTime === null || totalTime > 1440)) next.minutes = "Escribe los minutos, hasta 1440.";
            const parsedIngredients = ingredients.map((i, index) => {
                  const value = parseAmount(i.amount);
                  if (value === null) next[`ingredient-${index}`] = "Escribe la cantidad.";
                  return { ingredientId: i.ingredientId, quantity: { value: value ?? 1, unit: i.unit }, ...(i.prep.trim() ? { prep: i.prep.trim() } : {}) };
            });
            const parsedSteps = steps
                  .filter((s) => s.text.trim())
                  .map((s, index) => {
                        const time = s.minutes.trim() ? parseAmount(s.minutes) : null;
                        if (s.minutes.trim() && time === null) next.steps = `Revisa los minutos del paso ${index + 1}.`;
                        return { text: s.text.trim(), ...(time ? { timerSeconds: Math.round(time * 60) } : {}), ...(s.heat ? { heat: s.heat } : {}) };
                  });
            setErrors(next);
            publish.reset();
            if (Object.keys(next).length) return null;

            const patch: MyRecipePatch = {
                  title: title.trim(),
                  servings,
                  ingredients: parsedIngredients,
                  ...(stepsKnown || parsedSteps.length ? { steps: parsedSteps } : {}),
                  ...(totalTime ? { totalTimeMinutes: Math.round(totalTime) } : {}),
                  ...(difficulty ? { difficulty } : {}),
                  ...(cover ? { coverMediaId: cover.id } : {}),
                  ...(consultable !== null ? { chefConsultable: { enabled: consultable, useMyStyle: consultable, suggestSubstitutes: consultable } } : {}),
            };
            try {
                  const id = recipeId ?? (await create.mutateAsync({ title: title.trim(), key: createKey })).id;
                  setRecipeId(id);
                  const result = await update.mutateAsync({ id, patch });
                  setSaved({ macros: result.nutritionPerServing, partial: result.nutritionStatus === "partial" });
                  return id;
            } catch {
                  return null; // shown from the mutation's error
            }
      };

      const onSave = async (event: FormEvent) => {
            event.preventDefault();
            await saveDraft();
      };
      const onPublish = async () => {
            const id = await saveDraft();
            if (id) publish.mutate(id, { onSuccess: () => navigate("/recetas", { replace: true }) });
      };
      const setIngredient = (index: number, change: Partial<IngredientDraft>) => setIngredients((list) => list.map((item, i) => (i === index ? { ...item, ...change } : item)));
      const setStep = (index: number, change: Partial<StepDraft>) => setSteps((list) => list.map((item, i) => (i === index ? { ...item, ...change } : item)));

      return (
            <form noValidate onSubmit={onSave} className="mx-auto flex max-w-xl flex-col gap-6 px-5 pt-3">
                  <ImagePicker label="Foto de la receta" purpose="recipeCover" value={cover?.url ?? initial?.imageUrl ?? null} onChange={setCover} removable={false} />

                  <TextField label="Nombre de la receta" tone="card" maxLength={120} placeholder="Ej. Pasta rosa con pollo" value={title} onChange={(e) => setTitle(e.target.value)} error={errors.title} />
                  <TextField label="Tiempo total" tone="card" inputMode="numeric" suffix="min" value={minutes} onChange={(e) => setMinutes(e.target.value)} error={errors.minutes} />
                  <div className="flex flex-col gap-2">
                        <span className="text-sm font-bold text-ink">Porciones</span>
                        <Stepper label="Porciones" value={servings} min={1} max={20} onChange={setServings} suffix="porciones" />
                  </div>
                  <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-ink">Dificultad</span>
                        <Chips<Difficulty | ""> bleed label="Dificultad" options={difficulties} value={difficulty} onChange={setDifficulty} />
                  </div>

                  <fieldset className="flex flex-col gap-3">
                        <legend className="mb-3 font-display text-section font-extrabold text-ink">Ingredientes</legend>
                        <ul className="flex flex-col gap-2">
                              {ingredients.map((item, index) => (
                                    <li key={`${item.ingredientId}-${index}`} className="flex flex-col gap-2 rounded-card bg-card p-3">
                                          <div className="flex items-center gap-2">
                                                <span className="min-w-0 flex-1 truncate font-bold text-ink">{item.label}</span>
                                                <button type="button" aria-label={`Quitar ${item.label}`} onClick={() => setIngredients((list) => list.filter((_, i) => i !== index))} className={removeButton}>
                                                      <Icon name="trash" className="size-5" />
                                                </button>
                                          </div>
                                          <div className="grid grid-cols-[1fr_auto] gap-2">
                                                <TextField label={`Cantidad de ${item.label}`} hideLabel placeholder="Cantidad" inputMode="decimal" value={item.amount} onChange={(e) => setIngredient(index, { amount: e.target.value })} error={errors[`ingredient-${index}`]} />
                                                <select
                                                      aria-label={`Unidad de ${item.label}`}
                                                      value={item.unit}
                                                      onChange={(e) => setIngredient(index, { unit: e.target.value as Unit })}
                                                      className={`${fieldClass("field")} h-12 px-4`}
                                                >
                                                      {item.units.map((u) => (
                                                            <option key={u} value={u}>
                                                                  {unitLabel(u)}
                                                            </option>
                                                      ))}
                                                </select>
                                          </div>
                                          <TextField label={`Preparación de ${item.label}`} hideLabel placeholder="Preparación (opcional): en cubos…" maxLength={80} value={item.prep} onChange={(e) => setIngredient(index, { prep: e.target.value })} />
                                    </li>
                              ))}
                        </ul>
                        <div className="rounded-card bg-card p-3">
                              <IngredientSearch
                                    label="Agregar ingrediente"
                                    placeholder="Agregar ingrediente…"
                                    onPick={(o) => setIngredients((list) => [...list, { ingredientId: o.id, label: o.label, amount: "", unit: o.defaultUnit, units: o.allowedUnits, prep: "" }])}
                              />
                        </div>
                  </fieldset>

                  <fieldset className="flex flex-col gap-3">
                        <legend className="mb-3 font-display text-section font-extrabold text-ink">Preparación</legend>
                        {!stepsKnown && (
                              <p className="flex items-start gap-2 rounded-control bg-peach-soft p-3 text-sm font-semibold text-peach-ink">
                                    <Icon name="info" className="size-5 shrink-0" />
                                    El servidor todavía no devuelve los pasos guardados ({initial?.stepsCount}). Si los dejas vacíos se conservan; si escribes aquí, los reemplazas.
                              </p>
                        )}
                        {steps.map((step, index) => (
                              <div key={index} className="flex items-start gap-3 rounded-card bg-card p-3">
                                    <span aria-hidden className="mt-2 grid size-8 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-extrabold text-card">
                                          {index + 1}
                                    </span>
                                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                                          <textarea
                                                aria-label={`Paso ${index + 1}`}
                                                rows={2}
                                                maxLength={1000}
                                                placeholder="Describe este paso"
                                                value={step.text}
                                                onChange={(e) => setStep(index, { text: e.target.value })}
                                                className={`${fieldClass("field")} min-h-20 resize-y px-4 py-3`}
                                          />
                                          <div className="grid grid-cols-2 gap-2">
                                                <TextField label={`Temporizador del paso ${index + 1}`} hideLabel placeholder="Timer" inputMode="decimal" suffix="min" value={step.minutes} onChange={(e) => setStep(index, { minutes: e.target.value })} />
                                                <select aria-label={`Calor del paso ${index + 1}`} value={step.heat} onChange={(e) => setStep(index, { heat: e.target.value as Heat | "" })} className={`${fieldClass("field")} h-12 px-4`}>
                                                      <option value="">Sin calor</option>
                                                      <option value="low">Bajo</option>
                                                      <option value="medium">Medio</option>
                                                      <option value="high">Alto</option>
                                                </select>
                                          </div>
                                    </div>
                                    <button type="button" aria-label={`Quitar paso ${index + 1}`} disabled={steps.length === 1} onClick={() => setSteps((list) => list.filter((_, i) => i !== index))} className={removeButton}>
                                          <Icon name="trash" className="size-5" />
                                    </button>
                              </div>
                        ))}
                        {errors.steps && <p className="text-sm font-semibold text-error">{errors.steps}</p>}
                        <Button variant="dashed" size="lg" onClick={() => setSteps((list) => [...list, { text: "", minutes: "", heat: "" }])}>
                              <Icon name="plus" className="size-5" strokeWidth={2.25} />
                              Añadir paso
                        </Button>
                  </fieldset>

                  <label className="flex min-h-11 items-center justify-between gap-3 rounded-card bg-card p-4 text-sm font-bold text-ink">
                        Que otras personas le pregunten al chef por esta receta
                        <input type="checkbox" checked={consultable ?? initial?.chefConsultable ?? false} onChange={(e) => setConsultable(e.target.checked)} className="size-6 shrink-0 accent-primary-strong" />
                  </label>

                  {error && !needsEmail && <FormAlert>{[error.message, ...details].join(" ")}</FormAlert>}
                  {Object.keys(errors).length > 0 && <FormAlert>Revisa los campos marcados.</FormAlert>}
                  {needsEmail && <VerifyEmail onVerified={onPublish} />}
                  {saved && !error && (
                        <p role="status" className="rounded-control bg-mint-soft p-3 text-sm font-bold text-mint-ink">
                              Borrador guardado.
                              {saved.macros && ` ${saved.macros.kcal} kcal por porción${saved.partial ? " (aproximado)" : ""}.`}
                        </p>
                  )}

                  <div className="sticky bottom-0 -mx-5 mt-2 grid grid-cols-2 gap-3 rounded-t-[2rem] bg-card px-5 pt-4 pb-6 shadow-[0_-12px_32px_-20px_rgb(43_20_51/0.35)]">
                        <Button type="submit" variant="soft" size="lg" loading={create.isPending || update.isPending} disabled={busy}>
                              Guardar
                        </Button>
                        <Button size="lg" loading={publish.isPending} disabled={busy} onClick={onPublish}>
                              Publicar
                        </Button>
                  </div>
            </form>
      );
}
