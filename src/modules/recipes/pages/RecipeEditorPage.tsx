import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import IngredientFields, {
      emptyIngredient,
      toDraft,
      validateIngredient,
      type IngredientDraft,
      type IngredientErrors,
} from "@/modules/inventory/components/IngredientFields";
import { UnitsDatalist } from "@/modules/inventory/utils/units";
import PageHeader from "@/shared/components/layout/PageHeader";
import Button from "@/shared/components/ui/Button";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import { EmptyState, ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import TextArea from "@/shared/components/ui/TextArea";
import TextField from "@/shared/components/ui/TextField";
import { useMyRecipe, useRecipeMutations } from "../hooks/useRecipes";
import type { Ingredient, Recipe, RecipeInput } from "../types";

const removeButton =
      "grid size-11 shrink-0 place-items-center rounded-control text-ink-muted hover:bg-primary-soft hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:invisible";

export default function RecipeEditorPage() {
      const { id } = useParams();
      const recipe = useMyRecipe(id);
      const editing = Boolean(id);

      return (
            <div className="min-h-dvh bg-canvas pb-12">
                  <PageHeader title={editing ? "Editar receta" : "Nueva receta"} backTo={editing ? `/recetas/${id}` : "/recetas"} />
                  <UnitsDatalist />
                  <main className="mx-auto max-w-xl px-6 pt-6">
                        {!editing ? (
                              <RecipeForm />
                        ) : recipe.isPending ? (
                              <LoadingState />
                        ) : recipe.isError ? (
                              <ErrorState message={recipe.error.message} onRetry={() => recipe.refetch()} />
                        ) : recipe.data ? (
                              <RecipeForm key={recipe.data.id} initial={recipe.data} />
                        ) : (
                              <EmptyState icon="book" title="Receta no encontrada" description="Puede que la hayas eliminado." />
                        )}
                  </main>
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
      const [ingredients, setIngredients] = useState<IngredientDraft[]>(
            initial ? initial.ingredients.map(toDraft) : [emptyIngredient()],
      );
      const [steps, setSteps] = useState<string[]>(initial?.instructions ?? [""]);
      const [errors, setErrors] = useState<FormErrors>({ rows: {} });
      const saving = create.isPending || update.isPending;
      const saveError = create.error ?? update.error;

      const isBlank = (draft: IngredientDraft) => !draft.name.trim() && !draft.quantity.trim();

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
            if (parsed.length === 0 && Object.keys(next.rows).length === 0)
                  next.ingredients = "Añade al menos un ingrediente.";
            const instructions = steps.map((s) => s.trim()).filter(Boolean);
            if (instructions.length === 0) next.instructions = "Añade al menos un paso.";

            setErrors(next);
            if (next.title || next.ingredients || next.instructions || Object.keys(next.rows).length) return;

            const input: RecipeInput = { title: title.trim(), ingredients: parsed, instructions };
            if (initial) {
                  update.mutate(
                        { id: initial.id, input },
                        { onSuccess: () => navigate(`/recetas/${initial.id}`, { replace: true }) },
                  );
            } else {
                  create.mutate(input, { onSuccess: (recipe) => navigate(`/recetas/${recipe.id}`, { replace: true }) });
            }
      };

      return (
            <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
                  {saveError && <FormAlert>{saveError.message}</FormAlert>}

                  <TextField
                        label="Nombre de la receta"
                        name="title"
                        placeholder="Ej. Pasta rosa con pollo"
                        value={title}
                        onChange={(e) => {
                              setTitle(e.target.value);
                              setErrors((current) => ({ ...current, title: undefined }));
                        }}
                        error={errors.title}
                  />

                  <fieldset className="flex flex-col gap-4">
                        <legend className="mb-2 text-title font-bold text-ink">Ingredientes</legend>
                        {ingredients.map((draft, index) => (
                              <div key={index} className="flex items-start gap-1 rounded-control bg-card p-3">
                                    <div className="min-w-0 flex-1">
                                          <IngredientFields
                                                value={draft}
                                                labelSuffix={` ${index + 1}`}
                                                errors={errors.rows[index]}
                                                onChange={(value) => {
                                                      setIngredients((list) => list.map((item, i) => (i === index ? value : item)));
                                                      setErrors(({ rows, ...rest }) => ({
                                                            ...rest,
                                                            ingredients: undefined,
                                                            rows: { ...rows, [index]: {} },
                                                      }));
                                                }}
                                          />
                                    </div>
                                    <button
                                          type="button"
                                          aria-label={`Quitar ingrediente ${index + 1}`}
                                          disabled={ingredients.length === 1}
                                          onClick={() => setIngredients((list) => list.filter((_, i) => i !== index))}
                                          className={`${removeButton} mt-7`}
                                    >
                                          <Icon name="trash" className="size-5" />
                                    </button>
                              </div>
                        ))}
                        {errors.ingredients && <p className="text-sm text-error">{errors.ingredients}</p>}
                        <Button variant="secondary" onClick={() => setIngredients((list) => [...list, emptyIngredient()])}>
                              <Icon name="plus" className="size-5" />
                              Añadir ingrediente
                        </Button>
                  </fieldset>

                  <fieldset className="flex flex-col gap-4">
                        <legend className="mb-2 text-title font-bold text-ink">Preparación</legend>
                        {steps.map((step, index) => (
                              <div key={index} className="flex items-start gap-2">
                                    <span
                                          aria-hidden
                                          className="mt-2 grid size-8 shrink-0 place-items-center rounded-full bg-secondary-soft text-sm font-bold text-ink"
                                    >
                                          {index + 1}
                                    </span>
                                    <TextArea
                                          label={`Paso ${index + 1}`}
                                          hideLabel
                                          rows={2}
                                          placeholder="Describe este paso"
                                          value={step}
                                          onChange={(e) => {
                                                setSteps((list) => list.map((s, i) => (i === index ? e.target.value : s)));
                                                setErrors((current) => ({ ...current, instructions: undefined }));
                                          }}
                                          className="flex-1"
                                    />
                                    <button
                                          type="button"
                                          aria-label={`Quitar paso ${index + 1}`}
                                          disabled={steps.length === 1}
                                          onClick={() => setSteps((list) => list.filter((_, i) => i !== index))}
                                          className={removeButton}
                                    >
                                          <Icon name="trash" className="size-5" />
                                    </button>
                              </div>
                        ))}
                        {errors.instructions && <p className="text-sm text-error">{errors.instructions}</p>}
                        <Button variant="secondary" onClick={() => setSteps((list) => [...list, ""])}>
                              <Icon name="plus" className="size-5" />
                              Añadir paso
                        </Button>
                  </fieldset>

                  <Button type="submit" fullWidth loading={saving}>
                        {initial ? "Guardar cambios" : "Guardar receta"}
                  </Button>
            </form>
      );
}
