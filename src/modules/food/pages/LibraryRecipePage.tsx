import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "@/shared/components/layout/PageHeader";
import Button from "@/shared/components/ui/Button";
import DishCover from "@/shared/components/ui/DishArt";
import Icon from "@/shared/components/ui/Icon";
import { ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import { roundButtonClass } from "@/shared/components/ui/RoundButton";
import ScribbleText from "@/shared/components/ui/ScribbleText";
import { foodErrorMessage, useLibraryRecipe } from "../hooks/useFood";
import type { LibraryRecipe } from "../types";
import { generatorLink } from "../utils/links";

const tagTone: Record<string, string> = {
      mealTypes: "bg-peach-soft text-peach-ink",
      diet: "bg-lilac-soft text-lilac-ink",
      proteins: "bg-mustard-soft text-mustard-ink",
      effort: "bg-mint-soft text-mint-ink",
      nutrition: "bg-rose-soft text-rose-ink",
};

// GET /food/library/recipes/:id — a reference recipe from the dataset (English, free-text amounts).
export default function LibraryRecipePage() {
      const { id } = useParams();
      const navigate = useNavigate();
      const recipe = useLibraryRecipe(id);

      if (recipe.isPending) return <LoadingState />;
      if (recipe.isError) {
            return (
                  <>
                        <PageHeader title="Explorar" backTo="/recetas?ver=explorar" />
                        <main className="mx-auto max-w-xl px-5 pt-4">
                              <ErrorState message={foodErrorMessage(recipe.error)} onRetry={() => recipe.refetch()} />
                        </main>
                  </>
            );
      }

      const r = recipe.data;
      const goBack = () => {
            const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
            if (idx > 0) navigate(-1);
            else navigate("/recetas?ver=explorar", { replace: true });
      };

      return (
            <>
                  <div className="relative mx-auto h-64 max-w-xl overflow-hidden">
                        <DishCover seed={String(r.id)} layout="hero" className="size-full" />
                        <div className="absolute top-5 left-5">
                              <button type="button" aria-label="Volver" onClick={goBack} className={roundButtonClass("card")}>
                                    <Icon name="back" />
                              </button>
                        </div>
                  </div>

                  <main className="relative mx-auto -mt-10 flex max-w-xl flex-col gap-4 rounded-t-[2rem] bg-canvas px-5 pt-6">
                        <div className="flex flex-col gap-3">
                              <span className="-rotate-3 self-start rounded-control bg-mustard px-2.5 py-1 font-display text-sm font-extrabold text-ink">Del mundo</span>
                              <h1 lang="en" className="pb-2 text-page leading-tight font-extrabold break-words text-ink">
                                    <ScribbleText color="orange">{r.title}</ScribbleText>
                              </h1>
                              <ul className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                                    <li className="rounded-full bg-card px-3 py-1.5 text-ink">
                                          {r.nIngredients} {r.nIngredients === 1 ? "ingrediente" : "ingredientes"}
                                    </li>
                                    {(Object.keys(tagTone) as (keyof LibraryRecipe["tags"])[]).flatMap((group) =>
                                          r.tags[group].map((tag) => (
                                                <li key={`${group}-${tag}`} className={`rounded-full px-3 py-1.5 ${tagTone[group]}`}>
                                                      {tag}
                                                </li>
                                          )),
                                    )}
                              </ul>
                              {r.tags.allergens.length > 0 && (
                                    <p className="flex items-start gap-2 rounded-control bg-peach-soft p-3 text-sm font-semibold text-peach-ink">
                                          <Icon name="alert" className="size-4 shrink-0" />
                                          Contiene: {r.tags.allergens.join(", ")}
                                    </p>
                              )}
                        </div>

                        <Button size="lg" fullWidth onClick={() => navigate(generatorLink(r))}>
                              <Icon name="star4" className="size-5" />
                              Cocinar mi versión con Noshy
                        </Button>
                        <p className="-mt-2 text-center text-xs font-semibold text-ink-muted">
                              Noshy la adapta a tu plan, en español y con macros.
                        </p>

                        <section aria-labelledby="lib-ingredients" className="rounded-card bg-card p-5">
                              <h2 id="lib-ingredients" className="mb-2 text-section font-extrabold text-ink">
                                    Ingredientes
                              </h2>
                              <ul lang="en" className="flex flex-col divide-y divide-line">
                                    {r.ingredients.map((line, index) => (
                                          <li key={index} className="py-2.5 text-base text-ink">
                                                {line}
                                          </li>
                                    ))}
                              </ul>
                        </section>

                        <section aria-labelledby="lib-steps" className="rounded-card bg-card p-5">
                              <h2 id="lib-steps" className="mb-4 text-section font-extrabold text-ink">
                                    Preparación
                              </h2>
                              <ol lang="en" className="flex flex-col">
                                    {r.directions.map((step, index) => (
                                          <li key={index} className="relative flex gap-4 pb-5 last:pb-0">
                                                {index < r.directions.length - 1 && <span aria-hidden className="absolute top-9 bottom-1 left-[15px] w-0.5 rounded-full bg-line" />}
                                                <span aria-hidden className="relative grid size-8 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-extrabold text-card">
                                                      {index + 1}
                                                </span>
                                                <p className="pt-1 text-base text-ink">{step}</p>
                                          </li>
                                    ))}
                              </ol>
                        </section>

                        {r.url && (
                              <a
                                    href={r.url.startsWith("http") ? r.url : `https://${r.url}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mx-auto inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-extrabold text-ink-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                              >
                                    <Icon name="globe" className="size-4" />
                                    Ver la receta original{r.source ? ` · ${r.source}` : ""}
                              </a>
                        )}
                  </main>
            </>
      );
}
