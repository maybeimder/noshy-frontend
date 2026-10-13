import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import DishCover from "@/shared/components/ui/DishArt";
import { imageVariant } from "@/shared/lib/images";
import { plural } from "@/shared/lib/format";
import type { Recipe } from "../types";

type RecipeGridCardProps = {
      recipe: Recipe;
      to: string;
      /** Chip over the cover: "Privada", "Preparada", author… */
      badge?: ReactNode;
};

export const coverBadge = "absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold";

// ref/Recetas.png: vivid cover (photo or illustrated dish) over a white body.
export default function RecipeGridCard({ recipe, to, badge }: RecipeGridCardProps) {
      const [failed, setFailed] = useState(false);
      const photo = recipe.imageUrl && !failed ? recipe.imageUrl : null;

      return (
            <Link
                  to={to}
                  className="group flex h-full flex-col overflow-hidden rounded-card bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
            >
                  <div className="relative h-36">
                        {photo ? (
                              <img src={imageVariant(photo, 400, 288)} alt="" loading="lazy" onError={() => setFailed(true)} className="size-full object-cover" />
                        ) : (
                              <DishCover seed={recipe.id} className="size-full" />
                        )}
                        {badge}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-3">
                        <h3 className="text-base leading-tight font-extrabold text-ink">{recipe.title}</h3>
                        <p className="text-xs font-semibold text-ink-muted">
                              {plural(recipe.ingredients.length, "ingrediente", "ingredientes")} · {plural(recipe.instructions.length, "paso", "pasos")}
                        </p>
                  </div>
            </Link>
      );
}
