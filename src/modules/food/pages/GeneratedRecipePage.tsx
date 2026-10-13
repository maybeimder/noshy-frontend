import { useNavigate, useParams } from "react-router-dom";
import RecipeBody from "@/modules/recipes/components/RecipeBody";
import { RecipeTitle } from "@/modules/recipes/components/RecipeIntro";
import { useRecipeMutations } from "@/modules/recipes/hooks/useRecipes";
import type { Recipe } from "@/modules/recipes/types";
import PageHeader from "@/shared/components/layout/PageHeader";
import Button from "@/shared/components/ui/Button";
import DishCover from "@/shared/components/ui/DishArt";
import Icon from "@/shared/components/ui/Icon";
import Mascot from "@/shared/components/ui/Mascot";
import { ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import { roundButtonClass } from "@/shared/components/ui/RoundButton";
import MacroTiles from "../components/MacroTiles";
import { foodErrorMessage, useGeneratedRecipe } from "../hooks/useFood";
import type { GeneratedRecipe } from "../types";
import { formatNutrient } from "../utils/nutrients";

// Tag groups from the backend (food-tags.ts) with their tone; allergens are shown apart as a warning.
const tagGroups: { key: keyof GeneratedRecipe["tags"]; className: string }[] = [
      { key: "mealTypes", className: "bg-peach-soft text-peach-ink" },
      { key: "diet", className: "bg-lilac-soft text-lilac-ink" },
      { key: "nutrition", className: "bg-rose-soft text-rose-ink" },
      { key: "effort", className: "bg-mint-soft text-mint-ink" },
      { key: "proteins", className: "bg-mustard-soft text-mustard-ink" },
];

/** Shape RecipeTitle/RecipeBody expect (grams as the unit). */
const asRecipe = (g: GeneratedRecipe): Recipe => ({
      id: g.id,
      title: g.title,
      ingredients: g.ingredients.map((i) => ({ name: i.name, quantity: i.grams, unit: "g" })),
      instructions: g.steps,
      isPublic: false,
      createdAt: new Date().toISOString(),
});

export default function GeneratedRecipePage() {
      const { id } = useParams();
      const navigate = useNavigate();
      const generated = useGeneratedRecipe(id);
      const { create } = useRecipeMutations();

      if (generated.isPending) return <LoadingState label="Cargando tu receta…" />;
      if (generated.isError) {
            return (
                  <>
                        <PageHeader title="Receta generada" backTo="/recetas/generar" />
                        <main className="mx-auto max-w-xl px-5 pt-4">
                              <ErrorState message={foodErrorMessage(generated.error)} onRetry={() => generated.refetch()} />
                        </main>
                  </>
            );
      }

      const g = generated.data;
      const recipe = asRecipe(g);
      const save = () =>
            create.mutate(
                  { title: g.title, ingredients: recipe.ingredients, instructions: g.steps },
                  { onSuccess: (saved) => navigate(`/recetas/${saved.id}`, { replace: true }) },
            );

      return (
            <div className="min-h-dvh bg-canvas">
                  <div className="relative mx-auto h-64 max-w-xl overflow-hidden">
                        <DishCover seed={g.id} layout="hero" className="size-full" />
                        <div className="absolute top-5 left-5">
                              <button type="button" aria-label="Volver" onClick={() => navigate("/recetas/generar")} className={roundButtonClass("card")}>
                                    <Icon name="back" />
                              </button>
                        </div>
                  </div>

                  <main className="relative mx-auto -mt-10 flex max-w-xl flex-col gap-4 rounded-t-[2rem] bg-canvas px-5 pt-6">
                        <RecipeTitle
                              recipe={recipe}
                              tag="Con IA"
                              chips={
                                    <>
                                          <li className="inline-flex items-center gap-1 rounded-full bg-card px-3 py-1.5 text-ink">
                                                <Icon name="user" className="size-3.5" strokeWidth={2.25} />
                                                {g.servings} {g.servings === 1 ? "porción" : "porciones"}
                                          </li>
                                          {tagGroups.flatMap(({ key, className }) =>
                                                g.tags[key].map((tag) => (
                                                      <li key={`${key}-${tag}`} className={`rounded-full px-3 py-1.5 ${className}`}>
                                                            {tag}
                                                      </li>
                                                )),
                                          )}
                                    </>
                              }
                        />

                        {g.tags.allergens.length > 0 && (
                              <p className="flex items-start gap-2 rounded-control bg-peach-soft p-3 text-sm font-semibold text-peach-ink">
                                    <Icon name="alert" className="size-4 shrink-0" />
                                    Contiene: {g.tags.allergens.join(", ")}
                              </p>
                        )}

                        <section aria-labelledby="macros" className="flex flex-col gap-3 rounded-card bg-card p-5">
                              <div className="flex items-baseline justify-between gap-2">
                                    <h2 id="macros" className="text-section font-extrabold text-ink">
                                          Por porción
                                    </h2>
                                    <span className="text-xs font-bold text-ink-muted">Total: {formatNutrient(g.macros.total, "kcal")} kcal</span>
                              </div>
                              <MacroTiles nutrients={g.macros.perServing} />
                        </section>

                        <RecipeBody ingredients={recipe.ingredients} instructions={g.steps} />

                        {g.notes && (
                              <section className="relative rounded-[1.75rem] bg-secondary-soft p-5 pr-28">
                                    <Mascot className="pointer-events-none absolute -top-6 right-2 w-24" />
                                    <h2 className="text-title font-extrabold text-ink">El consejo de Noshy</h2>
                                    <p className="mt-1 text-sm font-semibold text-ink">{g.notes}</p>
                              </section>
                        )}

                        {g.warnings.length > 0 && (
                              <ul aria-label="Avisos" className="flex flex-col gap-2">
                                    {g.warnings.map((warning) => (
                                          <li key={warning} className="flex items-start gap-2 rounded-control bg-mustard-soft p-3 text-xs font-semibold text-mustard-ink">
                                                <Icon name="info" className="size-4 shrink-0" />
                                                {warning}
                                          </li>
                                    ))}
                              </ul>
                        )}

                        <div className="sticky bottom-0 -mx-5 mt-2 flex flex-col gap-2 rounded-t-[2rem] bg-card px-5 pt-4 pb-6 shadow-[0_-12px_32px_-20px_rgb(43_20_51/0.35)]">
                              {create.error && <p className="text-sm font-semibold text-error">{create.error.message}</p>}
                              <div className="grid grid-cols-[2fr_3fr] gap-3">
                                    <Button variant="soft" size="lg" onClick={() => navigate("/recetas/generar")}>
                                          Otra idea
                                    </Button>
                                    <Button size="lg" loading={create.isPending} onClick={save}>
                                          <Icon name="book" className="size-5" />
                                          Guardar receta
                                    </Button>
                              </div>
                        </div>
                  </main>
            </div>
      );
}
