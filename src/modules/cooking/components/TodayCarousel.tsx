import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import DishCover from "@/shared/components/ui/DishArt";
import Icon from "@/shared/components/ui/Icon";
import Photo from "@/shared/components/ui/Photo";
import { formatTime } from "@/shared/lib/format";
import type { RecipeCard } from "@/shared/types/api";

// Full-bleed recipe cards that snap one at a time; the dots follow the scroll.
export default function TodayCarousel({ recipes }: { recipes: RecipeCard[] }) {
      const track = useRef<HTMLUListElement>(null);
      const [active, setActive] = useState(0);

      const onScroll = () => {
            const el = track.current;
            if (!el || !el.firstElementChild) return;
            const width = (el.firstElementChild as HTMLElement).offsetWidth + 12;
            setActive(Math.round(el.scrollLeft / width));
      };

      return (
            <div className="flex flex-col gap-3">
                  <ul ref={track} onScroll={onScroll} className="scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-5 pb-2">
                        {recipes.map((recipe) => {
                              const { have, total } = recipe.pantryMatch;
                              const tags = [recipe.cuisine?.label, ...recipe.tags].filter(Boolean).slice(0, 3);
                              const time = formatTime(recipe.totalTimeMinutes);
                              return (
                                    <li key={recipe.id} className="w-[86%] max-w-sm shrink-0 snap-center">
                                          <Link
                                                to={`/recetas/${recipe.id}`}
                                                className="group relative flex aspect-square flex-col overflow-hidden rounded-card bg-plum text-card shadow-[0_20px_40px_-24px_rgb(43_20_51/0.8)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                          >
                                                <Photo
                                                      url={recipe.imageUrl}
                                                      width={640}
                                                      height={800}
                                                      className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                      fallback={
                                                            <span className="absolute inset-0">
                                                                  <DishCover seed={recipe.id} layout="hero" className="size-full" />
                                                            </span>
                                                      }
                                                />
                                                {/* Dark scrim only where text sits, so white type stays legible on any photo. */}
                                                <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(29_9_44/0.35)_0%,transparent_22%,rgb(29_9_44/0.55)_50%,rgb(29_9_44/0.94)_100%)]" />

                                                {total > 0 && (
                                                      <span className="relative m-4 inline-flex items-center gap-1.5 self-start rounded-full bg-plum/70 px-3 py-1.5 text-xs font-extrabold backdrop-blur-sm">
                                                            <Icon name="sparkle" className="size-3.5 text-secondary" strokeWidth={2.25} />
                                                            {have}/{total} en tu despensa
                                                      </span>
                                                )}

                                                <div className="relative mt-auto flex items-end gap-3 p-5">
                                                      <div className="min-w-0 flex-1">
                                                            <p className="text-sm font-bold text-secondary-soft">{recipe.reason?.label ?? "Para ti"}</p>
                                                            <h3 className="mt-0.5 text-section leading-tight font-extrabold text-balance">{recipe.title}</h3>
                                                            {tags.length > 0 && <p className="mt-1 truncate text-sm text-card/80">{tags.join(" · ")}</p>}
                                                            <p className="mt-2 flex items-center gap-1.5 text-sm font-bold">
                                                                  <Icon name="clock" className="size-4" />
                                                                  {[time, `${recipe.nutritionPerServing.kcal} kcal`].filter(Boolean).join(" · ")}
                                                            </p>
                                                      </div>
                                                      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-card text-ink transition-transform group-hover:translate-x-1">
                                                            <Icon name="arrowRight" className="size-5" strokeWidth={2.25} />
                                                      </span>
                                                </div>
                                          </Link>
                                    </li>
                              );
                        })}
                  </ul>
                  {recipes.length > 1 && (
                        <div aria-hidden className="flex justify-center gap-1.5">
                              {recipes.map((recipe, index) => (
                                    <span key={recipe.id} className={`h-2 rounded-full transition-all duration-300 ${index === active ? "w-6 bg-primary-strong" : "w-2 bg-line"}`} />
                              ))}
                        </div>
                  )}
            </div>
      );
}
