import { Link } from "react-router-dom";
import Icon from "@/shared/components/ui/Icon";
import { plural } from "@/shared/lib/format";
import type { Recipe } from "../types";
import RecipeCover from "./RecipeCover";

type RecipeListItemProps = {
      recipe: Recipe;
      to: string;
      /** Community recipes show their author; own recipes show whether they are public. */
      showAuthor?: boolean;
};

export default function RecipeListItem({ recipe, to, showAuthor = false }: RecipeListItemProps) {
      return (
            <Link
                  to={to}
                  className="group flex items-center gap-4 rounded-card bg-card p-3 transition-colors hover:bg-secondary-soft/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
            >
                  <RecipeCover recipe={recipe} />
                  <div className="min-w-0 flex-1">
                        <h3 className="truncate text-title font-bold text-ink">{recipe.title}</h3>
                        <p className="text-sm text-ink-muted">
                              {plural(recipe.ingredients.length, "ingrediente", "ingredientes")} ·{" "}
                              {plural(recipe.instructions.length, "paso", "pasos")}
                        </p>
                        {showAuthor ? (
                              recipe.authorName && <p className="text-xs text-ink-muted">Por {recipe.authorName}</p>
                        ) : (
                              <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-ink-muted">
                                    <Icon name={recipe.isPublic ? "globe" : "lock"} className="size-3.5" />
                                    {recipe.isPublic ? "Publicada" : "Privada"}
                              </p>
                        )}
                  </div>
                  <Icon name="arrowRight" className="size-5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-1" />
            </Link>
      );
}
