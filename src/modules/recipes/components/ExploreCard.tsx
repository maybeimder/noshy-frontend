import { Link } from "react-router-dom";
import DishCover from "@/shared/components/ui/DishArt";
import Icon from "@/shared/components/ui/Icon";
import Photo from "@/shared/components/ui/Photo";
import { formatTime } from "@/shared/lib/format";
import type { RecipeCard } from "@/shared/types/api";
import { useRecipeActions, useSyncSaved } from "../hooks/useRecipes";

type ExploreCardProps = { recipe: RecipeCard; featured?: boolean };

// A recipe from the backend catalog as a photo card: pantry match on top, save in reach, title on a dark foot.
export default function ExploreCard({ recipe, featured = false }: ExploreCardProps) {
      const { save } = useRecipeActions();
      useSyncSaved(recipe.id, recipe.isSaved);
      const { have, total } = recipe.pantryMatch;
      const complete = total > 0 && have === total;
      const meta = [formatTime(recipe.totalTimeMinutes), `${recipe.nutritionEstimated ? "≈ " : ""}${recipe.nutritionPerServing.kcal} kcal`].filter(Boolean).join(" · ");

      return (
            <article className={`relative isolate overflow-hidden rounded-card bg-plum text-card shadow-[0_18px_36px_-24px_rgb(43_20_51/0.8)] ${featured ? "aspect-[4/3]" : "aspect-[4/5]"}`}>
                  <span className="absolute inset-0 -z-10">
                        <Photo
                              url={recipe.imageUrl}
                              width={featured ? 800 : 400}
                              height={featured ? 600 : 500}
                              className="size-full object-cover"
                              fallback={<DishCover seed={recipe.id} layout="hero" className="size-full" />}
                        />
                  </span>
                  <span aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(29_9_44/0.35)_0%,transparent_30%,rgb(29_9_44/0.5)_55%,rgb(29_9_44/0.94)_100%)]" />

                  <Link
                        to={`/recetas/${recipe.id}`}
                        className={`flex size-full flex-col justify-end focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-card ${featured ? "p-5" : "p-3"}`}
                  >
                        {recipe.cuisine && <span className="text-xs font-bold text-secondary-soft">{recipe.cuisine.label}</span>}
                        <span className={`mt-0.5 font-display leading-tight font-extrabold text-balance ${featured ? "text-section" : "text-base"}`}>{recipe.title}</span>
                        {meta && (
                              <span className="mt-1 flex items-center gap-1 text-xs font-bold text-card/85">
                                    <Icon name="clock" className="size-3.5" />
                                    {meta}
                              </span>
                        )}
                  </Link>

                  {/* Library recipes are not matched with the pantry: say where they come from instead of «0/8». */}
                  {recipe.nutritionEstimated ? (
                        <span className="pointer-events-none absolute top-3 left-3 inline-flex items-center rounded-full bg-plum/60 px-2.5 py-1 text-xs font-extrabold text-card backdrop-blur-md">Recetario</span>
                  ) : (
                        total > 0 && (
                              <span
                                    className={`pointer-events-none absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold ${
                                          complete ? "bg-mint-soft text-mint-ink" : "bg-plum/60 text-card backdrop-blur-md"
                                    }`}
                              >
                                    <Icon name={complete ? "check" : "pantry"} className="size-3.5" strokeWidth={2.5} />
                                    {have}/{total}
                                    <span className={featured ? "" : "sr-only"}> en tu despensa</span>
                              </span>
                        )
                  )}
                  <button
                        type="button"
                        aria-label={recipe.isSaved ? `Quitar ${recipe.title} de guardadas` : `Guardar ${recipe.title}`}
                        aria-pressed={recipe.isSaved}
                        disabled={save.isPending}
                        onClick={() => save.mutate({ id: recipe.id, on: !recipe.isSaved })}
                        className="toggle-pop absolute top-2 right-2 z-10 grid size-11 place-items-center rounded-full bg-plum/45 text-card backdrop-blur-md hover:bg-plum/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card disabled:opacity-60"
                  >
                        <Icon name="bookmark" className={`size-5 ${recipe.isSaved ? "fill-current text-primary" : ""}`} />
                  </button>
            </article>
      );
}
