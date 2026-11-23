import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import DishCover from "@/shared/components/ui/DishArt";
import { Star, Steam } from "@/shared/components/ui/Doodles";
import Icon from "@/shared/components/ui/Icon";
import { roundButtonClass } from "@/shared/components/ui/RoundButton";
import Photo from "@/shared/components/ui/Photo";

type RecipeHeroProps = {
      recipe: { id: string; title: string; imageUrl: string | null };
      backTo: string;
      /** Top-right control (like, edit…). */
      action?: ReactNode;
};

// Full-bleed cover with floating round buttons; the page body overlaps it with a rounded top.
export default function RecipeHero({ recipe, backTo, action }: RecipeHeroProps) {
      const navigate = useNavigate();

      const goBack = () => {
            const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
            if (idx > 0) navigate(-1);
            else navigate(backTo, { replace: true });
      };

      return (
            <div className="relative mx-auto h-80 max-w-xl overflow-hidden">
                  <Photo
                        url={recipe.imageUrl}
                        alt={`Foto de ${recipe.title}`}
                        width={960}
                        height={640}
                        className="size-full object-cover"
                        fallback={
                              <>
                                    <DishCover seed={recipe.id} layout="hero" className="size-full" />
                                    <Steam className="absolute top-3 left-1/2 size-7 -translate-x-1/2 text-plate/80" />
                              </>
                        }
                  />
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
