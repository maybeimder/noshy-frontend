import { Link } from "react-router-dom";
import { DishPlate } from "@/shared/components/ui/DishArt";
import Icon from "@/shared/components/ui/Icon";
import Photo from "@/shared/components/ui/Photo";
import { plural } from "@/shared/lib/format";
import type { Home } from "../types";

const itemClass =
      "flex w-[4.75rem] flex-col items-center gap-2 rounded-control text-xs font-bold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";

// «Lo que más cocinas» as round plates, plus a dashed «Nueva».
export default function MostCooked({ recipes }: { recipes: NonNullable<Home["mostCooked"]> }) {
      return (
            <ul className="scrollbar-none flex gap-3 overflow-x-auto px-5 py-1">
                  {recipes.map((recipe) => (
                        <li key={recipe.recipeId} className="shrink-0">
                              <Link to={`/recetas/${recipe.recipeId}`} className={itemClass}>
                                    <span className="grid size-[4.75rem] place-items-center overflow-hidden rounded-full bg-card p-1 shadow-soft">
                                          <Photo url={recipe.imageUrl} width={160} height={160} className="size-full rounded-full object-cover" fallback={<DishPlate seed={recipe.recipeId} className="size-full" />} />
                                    </span>
                                    <span className="w-full truncate text-center">{recipe.title}</span>
                                    <span className="-mt-1.5 font-semibold text-ink-muted">{plural(recipe.timesCooked, "vez", "veces")}</span>
                              </Link>
                        </li>
                  ))}
                  <li className="shrink-0">
                        <Link to="/recetas/nueva" className={itemClass}>
                              <span className="grid size-[4.75rem] place-items-center rounded-full border-2 border-dashed border-primary-strong text-primary-strong">
                                    <Icon name="plus" className="size-7" strokeWidth={2} />
                              </span>
                              Nueva
                        </Link>
                  </li>
            </ul>
      );
}
