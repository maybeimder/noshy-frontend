import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import DishCover from "@/shared/components/ui/DishArt";
import { Star, Steam } from "@/shared/components/ui/Doodles";
import Icon from "@/shared/components/ui/Icon";
import { roundButtonClass } from "@/shared/components/ui/RoundButton";
import { imageVariant } from "@/shared/lib/images";
import type { Recipe } from "../types";

type RecipeHeroProps = {
      recipe: Recipe;
      backTo: string;
      /** Top-right control (edit button on own recipes). */
      action?: ReactNode;
};

// Full-bleed cover with floating round buttons; the page body overlaps it with a rounded top.
export default function RecipeHero({ recipe, backTo, action }: RecipeHeroProps) {
      const navigate = useNavigate();
      const [failed, setFailed] = useState(false);
      const photo = recipe.imageUrl && !failed ? recipe.imageUrl : null;

      const goBack = () => {
            const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
            if (idx > 0) navigate(-1);
            else navigate(backTo, { replace: true });
      };

      return (
            <div className="relative mx-auto h-80 max-w-xl overflow-hidden">
                  {photo ? (
                        <img
                              src={imageVariant(photo, 960, 640)}
                              alt={`Foto de ${recipe.title}`}
                              onError={() => setFailed(true)}
                              className="size-full object-cover"
                        />
                  ) : (
                        <DishCover seed={recipe.id} layout="hero" className="size-full" />
                  )}
                  {!photo && <Steam className="absolute top-3 left-1/2 size-7 -translate-x-1/2 text-plate/80" />}
                  {photo && recipe.imageSource === "pexels" && (
                        // Shape + text, not colour alone: this photo was picked automatically.
                        <span className="absolute bottom-14 left-5 inline-flex items-center gap-1 rounded-full bg-card/95 px-3 py-1 text-xs font-extrabold text-ink">
                              <Icon name="sparkle" className="size-3.5" />
                              Foto sugerida
                        </span>
                  )}
                  <Star className="absolute right-12 bottom-16 size-6 rotate-12 text-secondary" />
                  <div className="absolute top-5 left-5">
                        <button type="button" onClick={goBack} aria-label="Volver" className={roundButtonClass("card")}>
                              <Icon name="back" />
                        </button>
                  </div>
                  {action && <div className="absolute top-5 right-5">{action}</div>}
            </div>
      );
}
