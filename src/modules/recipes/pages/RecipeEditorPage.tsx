import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import IngredientSearch from "@/modules/inventory/components/IngredientSearch";
import VerifyEmail from "@/modules/settings/components/VerifyEmail";
import Button from "@/shared/components/ui/Button";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import ImagePicker from "@/shared/components/ui/ImagePicker";
import { ErrorState } from "@/shared/components/ui/QueryState";
import MacroTiles from "@/shared/components/ui/MacroTiles";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";
import RoundButton from "@/shared/components/ui/RoundButton";
import TextField, { fieldClass } from "@/shared/components/ui/TextField";
import { ApiError, newKey } from "@/shared/lib/axios";
import type { UploadedMedia } from "@/shared/lib/upload";
import { parseAmount, unitLabel } from "@/shared/lib/units";
import type { Macros, Unit } from "@/shared/types/api";
import { EditorSkeleton } from "../components/RecipeSkeletons";
import { useMyRecipeMutations, useRecipe } from "../hooks/useRecipes";
import type { ChefConsultable, Difficulty, Heat, MyRecipePatch, RecipeDetail } from "../types";

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
      const navigate = useNavigate();
      // As written by the author: the adapted version would overwrite it on save.
      const recipe = useRecipe(id, { adapted: false });

      return (
            <div className="min-h-dvh bg-canvas">
                  <header className="mx-auto grid max-w-xl grid-cols-[3rem_1fr_auto] items-center gap-3 px-5 pt-6 pb-3">
                        <RoundButton label="Cerrar" onClick={() => navigate(id ? `/recetas/${id}` : "/recetas", { replace: true })}>
                              <Icon name="close" />
                        </RoundButton>
                        <h1 className="text-center font-display text-title font-extrabold text-ink">{id ? "Editar receta" : "Nueva receta"}</h1>
                        <button
                              type="submit"
                              form="recipe-form"
                              className="min-h-11 rounded-control px-1 text-sm font-extrabold text-primary-strong focus-visible:outline-2 focus-visible:outline-primary-strong"
                        >
                              Borrador
                        </button>
                  </header>
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
      const [consultable, setConsultable] = useState<ChefConsultable | null>(null);
      const chef: ChefConsultable = consultable ?? { enabled: initial?.chefConsultable ?? false, useMyStyle: true, suggestSubstitutes: true };
      const [open, setOpen] = useState<{ ingredients: boolean; steps: boolean }>({ ingredients: !initial, steps: !initial });
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
                  ...(consultable !== null ? { chefConsultable: consultable } : {}),
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

      const macros = saved?.macros ?? (initial ? initial.nutritionPerServing : null);
      const timed = steps.filter((st) => st.text.trim() && st.minutes.trim()).length;
      const written = steps.filter((st) => st.text.trim()).length;
      const levelIndex = difficulties.findIndex((d) => d.id === difficulty);
      const tile = "flex min-h-20 flex-col justify-between gap-1 rounded-card bg-primary-soft p-3 text-ink";
      const tileLabel = "flex items-center gap-1 text-xs font-extrabold text-rose-ink";
      const toggleChip = (on: boolean) =>
            `inline-flex min-h-10 items-center gap-1.5 rounded-full px-3 text-xs font-extrabold focus-visible:outline-2 focus-visible:outline-card ${on ? "bg-card/20 text-card" : "bg-transparent text-card/60 ring-1 ring-card/30"}`;

      return (
            <form id="recipe-form" noValidate onSubmit={onSave} className="mx-auto flex max-w-xl flex-col gap-5 px-5 pt-1 pb-6">
                  <ImagePicker label="Foto de la receta" purpose="recipeCover" shape="hero" value={cover?.url ?? initial?.imageUrl ?? null} onChange={setCover} removable={false}>
                        <label htmlFor="recipe-title" className="text-xs font-extrabold tracking-wider text-secondary-soft uppercase">
                              Nombre
                        </label>
                        <input
                              id="recipe-title"
                              maxLength={120}
                              placeholder="Ponle nombre a tu receta"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              aria-invalid={errors.title ? true : undefined}
                              className="w-full rounded-control bg-transparent font-display text-section leading-tight font-extrabold text-card placeholder:text-card/60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-card"
                        />
                        {errors.title && <p className="text-sm font-bold text-secondary-soft">{errors.title}</p>}
                  </ImagePicker>

                  <div className="grid grid-cols-3 gap-2">
                        <label className={tile}>
                              <span className={tileLabel}>
                                    <Icon name="clock" className="size-4" />
                                    Tiempo
                              </span>
                              <span className="flex items-baseline gap-1">
                                    <input
                                          inputMode="numeric"
                                          placeholder="—"
                                          value={minutes}
                                          onChange={(e) => setMinutes(e.target.value)}
                                          aria-invalid={errors.minutes ? true : undefined}
                                          className="w-12 rounded bg-transparent font-display text-title font-extrabold tabular-nums placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-primary-strong"
                                    />
                                    <span className="text-sm font-bold">min</span>
                              </span>
                        </label>
                        <div className={tile}>
                              <span className={tileLabel}>
                                    <Icon name="community" className="size-4" />
                                    Porciones
                              </span>
                              <span role="group" aria-label="Porciones" className="flex items-center justify-between">
                                    <button type="button" aria-label="Una porción menos" disabled={servings <= 1} onClick={() => setServings((n) => Math.max(1, n - 1))} className="grid size-8 place-items-center rounded-full bg-card/70 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-primary-strong">
                                          <Icon name="minus" className="size-4" strokeWidth={2.5} />
                                    </button>
                                    <output aria-live="polite" className="font-display text-title font-extrabold tabular-nums">
                                          {servings}
                                    </output>
                                    <button type="button" aria-label="Una porción más" disabled={servings >= 20} onClick={() => setServings((n) => Math.min(20, n + 1))} className="grid size-8 place-items-center rounded-full bg-card/70 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-primary-strong">
                                          <Icon name="plus" className="size-4" strokeWidth={2.5} />
                                    </button>
                              </span>
                        </div>
                        <button
                              type="button"
                              onClick={() => setDifficulty(difficulties[(levelIndex + 1) % difficulties.length]!.id)}
                              aria-label={`Nivel: ${difficulties[levelIndex]?.label ?? "sin elegir"}. Cambiar`}
                              className={`${tile} text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong`}
                        >
                              <span className={tileLabel}>
                                    <Icon name="flame" className="size-4" />
                                    Nivel
                              </span>
                              <span className="font-display text-title font-extrabold">{difficulties[levelIndex]?.label ?? "Elegir"}</span>
                        </button>
                  </div>
                  {errors.minutes && <p className="-mt-3 text-sm font-semibold text-error">{errors.minutes}</p>}

                  <section aria-labelledby="macros" className="flex flex-col gap-3">
                        <div className="flex items-baseline justify-between gap-3">
                              <h2 id="macros" className="text-title font-extrabold text-ink">
                                    Macros por porción
                              </h2>
                              <span className="flex items-center gap-1 text-xs font-extrabold text-primary-strong">
                                    <Icon name="sparkle" className="size-3.5" strokeWidth={2.25} />
                                    {saved?.partial ? "Aproximadas por tu chef" : "Calculadas por tu chef"}
                              </span>
                        </div>
                        {macros && macros.kcal > 0 ? (
                              <MacroTiles macros={macros} />
                        ) : (
                              <p className="rounded-card bg-card p-4 text-sm text-ink-muted shadow-soft">Agrega ingredientes y guarda el borrador: tu chef calcula las macros.</p>
                        )}
                  </section>

                  <section className="overflow-hidden rounded-card bg-card shadow-soft">
                        <button
                              type="button"
                              aria-expanded={open.ingredients}
                              onClick={() => setOpen((o) => ({ ...o, ingredients: !o.ingredients }))}
                              className="flex min-h-16 w-full items-center gap-3 p-3 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-strong"
                        >
                              <span className="grid size-11 shrink-0 place-items-center rounded-control bg-rose-soft text-rose-ink">
                                    <Icon name="cart" className="size-5" />
                              </span>
                              <span className="min-w-0 flex-1">
                                    <span className="block font-display font-extrabold text-ink">Ingredientes</span>
                                    <span className="block text-sm text-ink-muted">
                                          {ingredients.length === 0 ? "Aún no hay ninguno" : `${ingredients.length} ${ingredients.length === 1 ? "añadido" : "añadidos"}${macros && macros.kcal > 0 ? " · macros calculados" : ""}`}
                                    </span>
                              </span>
                              <Icon name="chevronRight" className={`size-5 shrink-0 text-ink-muted transition-transform ${open.ingredients ? "rotate-90" : ""}`} />
                        </button>
                        {open.ingredients && (
                              <div className="flex flex-col gap-3 border-t border-line p-3">
                                    <ul className="flex flex-col gap-2">
                                          {ingredients.map((item, index) => (
                                                <li key={`${item.ingredientId}-${index}`} className="flex flex-col gap-2 rounded-control bg-field p-3">
                                                      <div className="flex items-center gap-2">
                                                            <span className="min-w-0 flex-1 truncate font-bold text-ink">{item.label}</span>
                                                            <button type="button" aria-label={`Quitar ${item.label}`} onClick={() => setIngredients((list) => list.filter((_, i) => i !== index))} className={removeButton}>
                                                                  <Icon name="trash" className="size-5" />
                                                            </button>
                                                      </div>
                                                      <div className="grid grid-cols-[1fr_auto] gap-2">
                                                            <TextField label={`Cantidad de ${item.label}`} hideLabel tone="card" placeholder="Cantidad" inputMode="decimal" value={item.amount} onChange={(e) => setIngredient(index, { amount: e.target.value })} error={errors[`ingredient-${index}`]} />
                                                            <select
                                                                  aria-label={`Unidad de ${item.label}`}
                                                                  value={item.unit}
                                                                  onChange={(e) => setIngredient(index, { unit: e.target.value as Unit })}
                                                                  className={`${fieldClass("card")} h-12 px-4`}
                                                            >
                                                                  {item.units.map((u) => (
                                                                        <option key={u} value={u}>
                                                                              {unitLabel(u)}
                                                                        </option>
                                                                  ))}
                                                            </select>
                                                      </div>
                                                      <TextField label={`Preparación de ${item.label}`} hideLabel tone="card" placeholder="Preparación (opcional): en cubos…" maxLength={80} value={item.prep} onChange={(e) => setIngredient(index, { prep: e.target.value })} />
                                                </li>
                                          ))}
                                    </ul>
                                    <IngredientSearch
                                          label="Agregar ingrediente"
                                          placeholder="Agregar ingrediente…"
                                          onPick={(o) => setIngredients((list) => [...list, { ingredientId: o.id, label: o.label, amount: "", unit: o.defaultUnit, units: o.allowedUnits, prep: "" }])}
                                    />
                              </div>
                        )}
                  </section>

                  <section className="overflow-hidden rounded-card bg-card shadow-soft">
                        <button
                              type="button"
                              aria-expanded={open.steps}
                              onClick={() => setOpen((o) => ({ ...o, steps: !o.steps }))}
                              className="flex min-h-16 w-full items-center gap-3 p-3 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-strong"
                        >
                              <span className="grid size-11 shrink-0 place-items-center rounded-control bg-peach-soft text-peach-ink">
                                    <Icon name="receipt" className="size-5" />
                              </span>
                              <span className="min-w-0 flex-1">
                                    <span className="block font-display font-extrabold text-ink">Pasos</span>
                                    <span className="block text-sm text-ink-muted">
                                          {written === 0 ? "Cuenta cómo se prepara" : `${written} ${written === 1 ? "paso" : "pasos"}${timed ? ` · ${timed} con temporizador` : ""}`}
                                    </span>
                              </span>
                              <Icon name="chevronRight" className={`size-5 shrink-0 text-ink-muted transition-transform ${open.steps ? "rotate-90" : ""}`} />
                        </button>
                        {open.steps && (
                              <div className="flex flex-col gap-3 border-t border-line p-3">
                                    {!stepsKnown && (
                                          <p className="flex items-start gap-2 rounded-control bg-peach-soft p-3 text-sm font-semibold text-peach-ink">
                                                <Icon name="info" className="size-5 shrink-0" />
                                                El servidor todavía no devuelve los pasos guardados ({initial?.stepsCount}). Si los dejas vacíos se conservan; si escribes aquí, los reemplazas.
                                          </p>
                                    )}
                                    {steps.map((step, index) => (
                                          <div key={index} className="flex items-start gap-3 rounded-control bg-field p-3">
                                                <span aria-hidden className="mt-2 w-6 shrink-0 font-serif text-[1.5rem] leading-none font-bold text-primary-strong">
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
                                                            className={`${fieldClass("card")} min-h-20 resize-y px-4 py-3`}
                                                      />
                                                      <div className="grid grid-cols-2 gap-2">
                                                            <TextField label={`Temporizador del paso ${index + 1}`} hideLabel tone="card" placeholder="Timer" inputMode="decimal" suffix="min" value={step.minutes} onChange={(e) => setStep(index, { minutes: e.target.value })} />
                                                            <select aria-label={`Calor del paso ${index + 1}`} value={step.heat} onChange={(e) => setStep(index, { heat: e.target.value as Heat | "" })} className={`${fieldClass("card")} h-12 px-4`}>
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
                                          Agregar paso
                                    </Button>
                              </div>
                        )}
                  </section>

                  <section aria-labelledby="consultable" className="flex flex-col gap-3 rounded-card bg-plum-glow p-4 text-card shadow-[0_18px_36px_-22px_rgb(43_20_51/0.8)]">
                        <div className="flex items-center gap-3">
                              <MascotAvatar tone="white" className="size-12" />
                              <div className="min-w-0 flex-1">
                                    <h2 id="consultable" className="font-display text-title font-extrabold">
                                          Activar Chef consultable
                                    </h2>
                                    <p className="text-sm text-card/80">Responderá dudas y adaptará tu receta a cada persona</p>
                              </div>
                              <button
                                    type="button"
                                    role="switch"
                                    aria-checked={chef.enabled}
                                    aria-labelledby="consultable"
                                    onClick={() => setConsultable({ ...chef, enabled: !chef.enabled })}
                                    className={`relative h-8 w-14 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card ${chef.enabled ? "bg-brand" : "bg-card/25"}`}
                              >
                                    <span aria-hidden className={`absolute top-1 size-6 rounded-full bg-card shadow-soft transition-[left] ${chef.enabled ? "left-7" : "left-1"}`} />
                              </button>
                        </div>
                        {chef.enabled && (
                              <div className="flex flex-wrap gap-2">
                                    {(
                                          [
                                                ["useMyStyle", "Con mi estilo"],
                                                ["suggestSubstitutes", "Sugerir sustitutos"],
                                          ] as const
                                    ).map(([key, label]) => (
                                          <button key={key} type="button" aria-pressed={chef[key]} onClick={() => setConsultable({ ...chef, [key]: !chef[key] })} className={toggleChip(chef[key])}>
                                                {chef[key] && <Icon name="check" className="size-3.5" strokeWidth={3} />}
                                                {label}
                                          </button>
                                    ))}
                              </div>
                        )}
                  </section>

                  {error && !needsEmail && <FormAlert>{[error.message, ...details].join(" ")}</FormAlert>}
                  {Object.keys(errors).length > 0 && <FormAlert>Revisa los campos marcados.</FormAlert>}
                  {needsEmail && <VerifyEmail onVerified={onPublish} />}
                  {saved && !error && (
                        <p role="status" className="rounded-control bg-mint-soft p-3 text-sm font-bold text-mint-ink">
                              Borrador guardado.
                              {saved.macros && ` ${saved.macros.kcal} kcal por porción${saved.partial ? " (aproximado)" : ""}.`}
                        </p>
                  )}

                  <div className="sticky bottom-0 -mx-5 mt-1 bg-canvas/95 px-5 pt-3 pb-6 backdrop-blur">
                        <Button size="lg" fullWidth arrow="send" loading={busy} onClick={onPublish}>
                              Publicar en la comunidad
                        </Button>
                  </div>
            </form>
      );
}
