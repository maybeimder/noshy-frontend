import { Link } from "react-router-dom";
import type { Recipe } from "@/modules/recipes/types";
import { DishPlate } from "@/shared/components/ui/DishArt";
import { Steam } from "@/shared/components/ui/Doodles";
import Icon from "@/shared/components/ui/Icon";
import { imageVariant } from "@/shared/lib/images";
import { plural } from "@/shared/lib/format";

type FeaturedRecipeProps = {
      recipe: Recipe;
      to: string;
      /** Why this recipe is here: shown as the tilted tag (e.g. "¡Te va a encantar!"). */
      tag?: string;
};

// Dark ciruela card with the dish in a circle: white text is safe on ink (DESIGN.md › Reglas de color).
export default function FeaturedRecipe({ recipe, to, tag }: FeaturedRecipeProps) {
      const meta = [
            recipe.authorName ? `Por ${recipe.authorName.split(" ")[0]}` : null,
            plural(recipe.ingredients.length, "ingrediente", "ingredientes"),
      ]
            .filter(Boolean)
            .join(" · ");

      return (
            <div className="relative mx-5 pt-4">
                  {tag && (
                        <span className="absolute top-0 -left-1 z-10 -rotate-6 rounded-control bg-mustard px-3 py-1.5 font-display text-sm font-extrabold text-ink shadow-[0_4px_12px_-4px_rgb(43_20_51/0.35)]">
                              {tag}
                        </span>
                  )}
                  <Link
                        to={to}
                        className="group relative flex min-h-64 overflow-hidden rounded-[1.75rem] bg-plum p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                  >
                        <span
                              aria-hidden
                              className="absolute -top-10 -right-16 grid size-60 place-items-center overflow-hidden rounded-full bg-plate"
                        >
                              {recipe.imageUrl ? (
                                    <img
                                          src={imageVariant(recipe.imageUrl, 448, 448)}
                                          alt=""
                                          className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                              ) : (
                                    <DishPlate seed={recipe.id} className="size-full" />
                              )}
                        </span>
                        <Steam className="absolute top-8 left-[38%] size-7 text-secondary-soft" />

                        <div className="relative mt-auto flex w-full items-end gap-4">
                              {/* Kept left of the photo circle so text never runs under it. */}
                              <div className="min-w-0 max-w-[68%] flex-1">
                                    <p className="text-sm font-bold text-secondary-soft">{meta}</p>
                                    <h3 className="mt-1 text-section font-extrabold text-card">{recipe.title}</h3>
                              </div>
                              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary-strong text-card transition-transform group-hover:translate-x-1">
                                    <Icon name="arrowRight" className="size-6" strokeWidth={2} />
                              </span>
                        </div>
                  </Link>
            </div>
      );
}
