import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import IngredientFields, {
      emptyIngredient,
      toDraft,
      validateIngredient,
      type IngredientDraft,
      type IngredientErrors,
} from "@/modules/inventory/components/IngredientFields";
import PageHeader from "@/shared/components/layout/PageHeader";
import Button from "@/shared/components/ui/Button";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon, { type IconName } from "@/shared/components/ui/Icon";
import ImagePicker from "@/shared/components/ui/ImagePicker";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import TextField, { fieldClass } from "@/shared/components/ui/TextField";
import { useMyRecipe, useRecipeMutations } from "../hooks/useRecipes";
import type { Ingredient, Recipe, RecipeInput } from "../types";

/** Navigation state read by the detail page to warn when the server ignored the photo. */
export type PhotoNotSavedState = { photoNotSaved?: boolean };

const removeButton =
      "grid size-11 shrink-0 place-items-center rounded-control text-ink-muted hover:bg-field hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:invisible";

// Recipe metadata from the reference that the API cannot store yet (backend/recommendation.md §5).
const extras: { label: string; icon: IconName }[] = [
      { label: "Tiempo", icon: "clock" },
      { label: "Porciones", icon: "user" },
      { label: "Etiqueta", icon: "plus" },
];

export default function RecipeEditorPage() {
      const { id } = useParams();
      const recipe = useMyRecipe(id);
      const editing = Boolean(id);

      return (
            <div className="min-h-dvh bg-canvas">
                  <PageHeader title={editing ? "Editar receta" : "Nueva receta"} scribble="pink" decoration="star" backTo={editing ? `/recetas/${id}` : "/recetas"} />
                  {!editing ? (
                        <RecipeForm />
                  ) : recipe.isPending ? (
                        <LoadingState />
                  ) : recipe.isError ? (
                        <main className="mx-auto max-w-xl px-5 pt-4">
                              <ErrorState message={recipe.error.message} onRetry={() => recipe.refetch()} />
                        </main>
                  ) : recipe.data ? (
                        <RecipeForm key={recipe.data.id} initial={recipe.data} />
                  ) : (
                        <main className="mx-auto max-w-xl px-5 pt-4">
                              <EmptyState icon="book" title="Receta no encontrada" description="Puede que la hayas eliminado." />
                        </main>
                  )}
            </div>
      );
}

type FormErrors = {
      title?: string;
      ingredients?: string;
      instructions?: string;
      rows: Record<number, IngredientErrors>;
};

function RecipeForm({ initial }: { initial?: Recipe }) {
      const navigate = useNavigate();
      const { create, update } = useRecipeMutations();
      const [title, setTitle] = useState(initial?.title ?? "");
      const [ingredients, setIngredients] = useState<IngredientDraft[]>(initial ? initial.ingredients.map(toDraft) : [emptyIngredient()]);
      const [steps, setSteps] = useState<string[]>(initial?.instructions ?? [""]);
      const [imageUrl, setImageUrl] = useState<string | null>(initial?.imageUrl ?? null);
      // Only send the photo when it changed, so a suggested photo is not re-labelled as an upload.
      const [imageTouched, setImageTouched] = useState(false);
      const [errors, setErrors] = useState<FormErrors>({ rows: {} });
      const [extrasNote, setExtrasNote] = useState(false);
      const saving = create.isPending || update.isPending;
      const saveError = create.error ?? update.error;

      const isBlank = (draft: IngredientDraft) => !draft.name.trim() && !draft.quantity.trim();
      const filledIngredients = ingredients.filter((d) => !isBlank(d)).length;

      const handleSubmit = (event: FormEvent) => {
            event.preventDefault();
            const next: FormErrors = { rows: {} };
            const parsed: Ingredient[] = [];

            if (title.trim().length < 2) next.title = "Ponle un nombre de al menos 2 letras.";
            ingredients.forEach((draft, index) => {
                  if (isBlank(draft)) return; // empty trailing rows are ignored
                  const { errors, input } = validateIngredient(draft);
                  if (input) parsed.push(input);
                  else next.rows[index] = errors;
            });
            if (parsed.length === 0 && Object.keys(next.rows).length === 0) next.ingredients = "Añade al menos un ingrediente.";
            const instructions = steps.map((s) => s.trim()).filter(Boolean);
            if (instructions.length === 0) next.instructions = "Añade al menos un paso.";

            setErrors(next);
            if (next.title || next.ingredients || next.instructions || Object.keys(next.rows).length) return;

            const input: RecipeInput = { title: title.trim(), ingredients: parsed, instructions, ...(imageTouched ? { imageUrl } : {}) };
            // Until the backend stores photos it silently drops imageUrl: tell the user instead of pretending.
            const done = (recipe: Recipe) => {
                  const state: PhotoNotSavedState = { photoNotSaved: imageTouched && imageUrl !== null && recipe.imageUrl !== imageUrl };
                  navigate(`/recetas/${recipe.id}`, { replace: true, state });
            };
            if (initial) update.mutate({ id: initial.id, input }, { onSuccess: done });
            else create.mutate(input, { onSuccess: done });
      };

      return (
            <form noValidate onSubmit={handleSubmit} className="mx-auto flex max-w-xl flex-col gap-6 px-5 pt-3">
                  {saveError && <FormAlert>{saveError.message}</FormAlert>}

                  <ImagePicker
                        label="Foto de la receta"
                        purpose="recipe"
                        value={imageUrl}
                        onChange={(url) => {
                              setImageUrl(url);
                              setImageTouched(true);
                        }}
                        hint={initial?.imageSource === "pexels" && !imageTouched ? "Te sugerí una; cámbiala por la tuya" : undefined}
                  />

                  <div className="flex flex-col gap-3">
                        <TextField
                              label="Nombre de la receta"
                              name="title"
                              tone="card"
                              placeholder="Ej. Pasta rosa con pollo"
                              value={title}
                              onChange={(e) => {
                                    setTitle(e.target.value);
                                    setErrors((current) => ({ ...current, title: undefined }));
                              }}
                              error={errors.title}
                        />
                        <div className="flex flex-wrap gap-2">
                              {extras.map(({ label, icon }) => (
                                    <button
                                          key={label}
                                          type="button"
                                          aria-expanded={extrasNote}
                                          onClick={() => setExtrasNote((v) => !v)}
                                          className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-card px-4 text-sm font-extrabold text-ink hover:bg-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                    >
                                          <Icon name={icon} className="size-4 text-primary-strong" strokeWidth={2.25} />
                                          {label}
                                    </button>
                              ))}
                        </div>
                        {extrasNote && (
                              <p role="status" className="flex items-start gap-2 rounded-control bg-field p-3 text-sm font-semibold text-ink-muted">
                                    <Icon name="info" className="size-4 shrink-0" />
                                    Muy pronto podrás guardar el tiempo, las porciones y etiquetas de tus recetas.
                              </p>
                        )}
                  </div>

                  <fieldset className="flex flex-col gap-3">
                        <legend className="mb-3 flex items-center gap-2 font-display text-section font-extrabold text-ink">
                              Ingredientes
                              <span className="grid min-w-7 place-items-center rounded-full bg-rose-soft px-2 text-sm text-rose-ink">{filledIngredients}</span>
                        </legend>
                        <div className="flex flex-col gap-3 rounded-card bg-card p-3">
                              {ingredients.map((draft, index) => (
                                    <IngredientFields
                                          key={index}
                                          value={draft}
                                          labelSuffix={` ${index + 1}`}
                                          errors={errors.rows[index]}
                                          onChange={(value) => {
                                                setIngredients((list) => list.map((item, i) => (i === index ? value : item)));
                                                setErrors(({ rows, ...rest }) => ({ ...rest, ingredients: undefined, rows: { ...rows, [index]: {} } }));
                                          }}
                                          trailing={
                                                <button
                                                      type="button"
                                                      aria-label={`Quitar ingrediente ${index + 1}`}
                                                      disabled={ingredients.length === 1}
                                                      onClick={() => setIngredients((list) => list.filter((_, i) => i !== index))}
                                                      className={removeButton}
                                                >
                                                      <Icon name="trash" className="size-5" />
                                                </button>
                                          }
                                    />
                              ))}
                        </div>
                        {errors.ingredients && <p className="text-sm font-semibold text-error">{errors.ingredients}</p>}
                        <Button variant="dashed" size="lg" onClick={() => setIngredients((list) => [...list, emptyIngredient()])}>
                              <Icon name="plus" className="size-5" strokeWidth={2.25} />
                              Añadir ingrediente
                        </Button>
                  </fieldset>

                  <fieldset className="flex flex-col gap-3">
                        <legend className="mb-3 font-display text-section font-extrabold text-ink">Preparación</legend>
                        {steps.map((step, index) => (
                              <div key={index} className="flex items-start gap-3">
                                    <span aria-hidden className="mt-3 grid size-8 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-extrabold text-card">
                                          {index + 1}
                                    </span>
                                    <label className="flex-1">
                                          <span className="sr-only">Paso {index + 1}</span>
                                          <textarea
                                                rows={2}
                                                placeholder="Describe este paso"
                                                value={step}
                                                onChange={(e) => {
                                                      setSteps((list) => list.map((s, i) => (i === index ? e.target.value : s)));
                                                      setErrors((current) => ({ ...current, instructions: undefined }));
                                                }}
                                                className={`${fieldClass("card")} min-h-20 resize-y px-4 py-3`}
                                          />
                                    </label>
                                    {steps.length > 1 && (
                                          <button
                                                type="button"
                                                aria-label={`Quitar paso ${index + 1}`}
                                                onClick={() => setSteps((list) => list.filter((_, i) => i !== index))}
                                                className={removeButton}
                                          >
                                                <Icon name="trash" className="size-5" />
                                          </button>
                                    )}
                              </div>
                        ))}
                        {errors.instructions && <p className="text-sm font-semibold text-error">{errors.instructions}</p>}
                        <Button variant="dashed" size="lg" onClick={() => setSteps((list) => [...list, ""])}>
                              <Icon name="plus" className="size-5" strokeWidth={2.25} />
                              Añadir paso
                        </Button>
                  </fieldset>

                  <div className="sticky bottom-0 -mx-5 mt-2 rounded-t-[2rem] bg-card px-5 pt-4 pb-6 shadow-[0_-12px_32px_-20px_rgb(43_20_51/0.35)]">
                        <Button type="submit" size="lg" fullWidth loading={saving}>
                              <Icon name="check" className="size-5" strokeWidth={2.25} />
                              {initial ? "Guardar cambios" : "Guardar receta"}
                        </Button>
                  </div>
            </form>
      );
}
