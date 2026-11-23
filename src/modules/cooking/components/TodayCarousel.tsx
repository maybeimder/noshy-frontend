import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { InventoryItem } from "@/modules/inventory/types";
import type { Recipe } from "@/modules/recipes/types";
import DishCover from "@/shared/components/ui/DishArt";
import Icon from "@/shared/components/ui/Icon";
import { imageVariant } from "@/shared/lib/images";
import { plural } from "@/shared/lib/format";

export type TodayPick = { recipe: Recipe; to: string; reason: string };

const norm = (value: string) => value.trim().toLowerCase();

/** «4/5 en tu despensa»: recipe ingredients whose name matches something in the pantry. */
function pantryMatch(recipe: Recipe, inventory: InventoryItem[]) {
      const names = inventory.map((item) => norm(item.name));
      const have = recipe.ingredients.filter((ing) => names.some((n) => n.includes(norm(ing.name)) || norm(ing.name).includes(n))).length;
      return { have, total: recipe.ingredients.length };
}

// Full-bleed recipe cards that snap one at a time; the dots follow the scroll.
export default function TodayCarousel({ picks, inventory }: { picks: TodayPick[]; inventory: InventoryItem[] }) {
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
                        {picks.map(({ recipe, to, reason }) => {
                              const { have, total } = pantryMatch(recipe, inventory);
                              const tags = recipe.ingredients.slice(0, 3).map((i) => i.name);
                              return (
                                    <li key={recipe.id} className="w-[86%] max-w-sm shrink-0 snap-center">
                                          <Link
                                                to={to}
                                                className="group relative flex aspect-square flex-col overflow-hidden rounded-card bg-plum text-card shadow-[0_20px_40px_-24px_rgb(43_20_51/0.8)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                          >
                                                {recipe.imageUrl ? (
                                                      <img
                                                            src={imageVariant(recipe.imageUrl, 640, 800)}
                                                            alt=""
                                                            className="absolute inset-0 size-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                                      />
                                                ) : (
                                                      <span className="absolute inset-0">
                                                            <DishCover seed={recipe.id} layout="hero" className="size-full" />
                                                      </span>
                                                )}
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
                                                            <p className="text-sm font-bold text-secondary-soft">{reason}</p>
                                                            <h3 className="mt-0.5 text-section leading-tight font-extrabold text-balance">{recipe.title}</h3>
                                                            {tags.length > 0 && <p className="mt-1 truncate text-sm text-card/80">{tags.join(" · ")}</p>}
                                                            <p className="mt-2 flex items-center gap-1.5 text-sm font-bold">
                                                                  <Icon name="book" className="size-4" />
                                                                  {plural(recipe.instructions.length, "paso", "pasos")}
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
                  {picks.length > 1 && (
                        <div aria-hidden className="flex justify-center gap-1.5">
                              {picks.map(({ recipe }, index) => (
                                    <span key={recipe.id} className={`h-2 rounded-full transition-all duration-300 ${index === active ? "w-6 bg-primary-strong" : "w-2 bg-line"}`} />
                              ))}
                        </div>
                  )}
            </div>
      );
}
