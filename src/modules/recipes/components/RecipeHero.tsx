import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import DishCover from "@/shared/components/ui/DishArt";
import Icon from "@/shared/components/ui/Icon";
import Photo from "@/shared/components/ui/Photo";

type RecipeHeroProps = {
      recipe: { id: string; title: string; imageUrl: string | null };
      backTo: string;
      /** Top-right controls (share, like, edit…). */
      action?: ReactNode;
      /** Text laid over the bottom of the photo (cuisine, title, meta). */
      children?: ReactNode;
};

export const heroButtonClass =
      "relative grid size-12 shrink-0 place-items-center rounded-full bg-plum/45 text-card backdrop-blur-md transition-colors hover:bg-plum/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card disabled:opacity-60";

// Full-bleed photo with glass buttons; the title sits on a dark scrim at its foot and the page body overlaps it.
export default function RecipeHero({ recipe, backTo, action, children }: RecipeHeroProps) {
      const navigate = useNavigate();

      const goBack = () => {
            const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
            if (idx > 0) navigate(-1);
            else navigate(backTo, { replace: true });
      };

      return (
            <div className={`relative mx-auto max-w-xl overflow-hidden bg-plum ${children ? "min-h-[28rem]" : "h-80"}`}>
                  <span className="absolute inset-0">
                        <Photo
                              url={recipe.imageUrl}
                              alt={`Foto de ${recipe.title}`}
                              width={960}
                              height={1080}
                              className="size-full object-cover"
                              fallback={<DishCover seed={recipe.id} layout="hero" className="size-full" />}
                        />
                  </span>
                  <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(29_9_44/0.45)_0%,transparent_25%,transparent_40%,rgb(29_9_44/0.9)_85%)]" />
                  <div className="absolute top-5 left-5 z-10">
                        <button type="button" onClick={goBack} aria-label="Volver" className={heroButtonClass}>
                              <Icon name="back" />
                        </button>
                  </div>
                  {action && <div className="absolute top-5 right-5 z-10">{action}</div>}
                  {/* Below the buttons: the title block spans the whole photo and would swallow their taps. */}
                  {children && <div className="relative flex min-h-[28rem] flex-col justify-end px-5 pt-24 pb-14 text-card">{children}</div>}
            </div>
      );
}
