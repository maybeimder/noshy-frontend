import { Link } from "react-router-dom";
import type { Recipe } from "@/modules/recipes/types";
import { DishPlate } from "@/shared/components/ui/DishArt";
import Icon from "@/shared/components/ui/Icon";
import { imageVariant } from "@/shared/lib/images";

const itemClass =
      "flex w-[4.75rem] flex-col items-center gap-2 rounded-control text-xs font-bold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";

// «Lo que más cocinas»: your own recipes as round plates, newest first, plus a dashed «Nueva».
export default function MostCooked({ recipes }: { recipes: Recipe[] }) {
      const shown = [...recipes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);

      return (
            <ul className="scrollbar-none flex gap-3 overflow-x-auto px-5 py-1">
                  {shown.map((recipe) => (
                        <li key={recipe.id} className="shrink-0">
                              <Link to={`/recetas/${recipe.id}`} className={itemClass}>
                                    <span className="grid size-[4.75rem] place-items-center rounded-full bg-card p-1 shadow-soft">
                                          {recipe.imageUrl ? (
                                                <img src={imageVariant(recipe.imageUrl, 160, 160)} alt="" className="size-full rounded-full object-cover" />
                                          ) : (
                                                <DishPlate seed={recipe.id} className="size-full" />
                                          )}
                                    </span>
                                    <span className="w-full truncate text-center">{recipe.title}</span>
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
