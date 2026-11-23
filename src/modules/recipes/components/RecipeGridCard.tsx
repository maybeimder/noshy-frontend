import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import DishCover from "@/shared/components/ui/DishArt";
import Photo from "@/shared/components/ui/Photo";

type RecipeGridCardProps = {
      recipe: { id: string; title: string; imageUrl: string | null };
      to?: string;
      /** Line under the title («25 min · 520 kcal»). */
      meta?: string;
      /** Chip over the cover: status, author… */
      badge?: ReactNode;
};

export const coverBadge = "absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-card px-3 py-1 text-xs font-extrabold text-ink";

// ref/Recetas.png: vivid cover (photo or illustrated dish) over a white body.
export default function RecipeGridCard({ recipe, to = `/recetas/${recipe.id}`, meta, badge }: RecipeGridCardProps) {
      return (
            <Link
                  to={to}
                  className="group flex h-full flex-col overflow-hidden rounded-card bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
            >
                  <div className="relative h-36">
                        <Photo url={recipe.imageUrl} width={400} height={288} className="size-full object-cover" fallback={<DishCover seed={recipe.id} className="size-full" />} />
                        {badge}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-3">
                        <h3 className="text-base leading-tight font-extrabold text-ink">{recipe.title || "Sin nombre"}</h3>
                        {meta && <p className="text-xs font-semibold text-ink-muted">{meta}</p>}
                  </div>
            </Link>
      );
}
