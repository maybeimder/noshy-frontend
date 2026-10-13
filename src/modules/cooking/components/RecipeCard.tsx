import { Link } from "react-router-dom";
import RecipeCover from "@/modules/recipes/components/RecipeCover";
import type { Recipe } from "@/modules/recipes/types";
import Icon from "@/shared/components/ui/Icon";
import { plural } from "@/shared/lib/format";

type RecipeCardProps = {
      recipe: Recipe;
      to: string;
};

export default function RecipeCard({ recipe, to }: RecipeCardProps) {
      return (
            <Link
                  to={to}
                  className="group flex h-full flex-col overflow-hidden rounded-card bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
            >
                  <RecipeCover recipe={recipe} size="lg" />
                  <div className="flex flex-1 items-end gap-4 p-4">
                        <div className="min-w-0 flex-1">
                              {recipe.authorName && (
                                    <p className="text-sm font-semibold text-ink-muted">Por {recipe.authorName}</p>
                              )}
                              <h3 className="text-section font-extrabold text-ink">{recipe.title}</h3>
                              <p className="mt-1 text-sm text-ink-muted">
                                    {plural(recipe.ingredients.length, "ingrediente", "ingredientes")} ·{" "}
                                    {plural(recipe.instructions.length, "paso", "pasos")}
                              </p>
                        </div>
                        <Icon
                              name="arrowRight"
                              className="size-8 shrink-0 text-ink transition-transform group-hover:translate-x-1"
                        />
                  </div>
            </Link>
      );
}
