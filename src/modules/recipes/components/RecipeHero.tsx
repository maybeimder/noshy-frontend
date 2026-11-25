import { useEffect, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import DishCover from "@/shared/components/ui/DishArt";
import Icon from "@/shared/components/ui/Icon";
import Photo from "@/shared/components/ui/Photo";
import { previousVisit } from "@/shared/lib/visits";

const COMMUNITY = "/recetas?ver=comunidad";

type RecipeHeroProps = {
      recipe: { id: string; title: string; imageUrl: string | null; imageIsReference?: boolean };
      /** Top-right controls (share, like, edit…). */
      action?: ReactNode;
      /** Text laid over the bottom of the photo (cuisine, title, meta). */
      children?: ReactNode;
};

/** Glass over the photo; white once the bar is over the page (`data-solid` on it). */
export const heroButtonClass =
      "pointer-events-auto relative grid size-12 shrink-0 place-items-center rounded-full bg-card/30 text-card backdrop-blur-md transition-[background-color,color,box-shadow] duration-200 group-data-[solid=true]:bg-card group-data-[solid=true]:text-ink group-data-[solid=true]:shadow-[0_6px_18px_-6px_rgb(46_19_45/0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:opacity-60";

// Full-bleed photo; the title sits on a dark scrim at its foot and the page body overlaps it. The buttons stay on top
// while the page scrolls.
export default function RecipeHero({ recipe, action, children }: RecipeHeroProps) {
      const navigate = useNavigate();
      const hero = useRef<HTMLDivElement>(null);
      const [solid, setSolid] = useState(false);

      useEffect(() => {
            const update = () => setSolid((hero.current?.getBoundingClientRect().bottom ?? 0) < 96);
            update();
            window.addEventListener("scroll", update, { passive: true });
            return () => window.removeEventListener("scroll", update);
      }, []);

      const goBack = () => {
            // Back to the list of recipes it was opened from (Comunidad, Recetas); from anywhere else, to Comunidad.
            if (/^\/recetas(\?|$)/.test(previousVisit() ?? "")) navigate(-1);
            else navigate(COMMUNITY, { replace: true, state: { restoreScroll: true } });
      };

      return (
            <>
                  <div data-solid={solid} className="group pointer-events-none fixed inset-x-0 top-0 z-30 mx-auto flex max-w-xl items-center justify-between gap-2 px-5 pt-[max(1.25rem,env(safe-area-inset-top))]">
                        <button type="button" onClick={goBack} aria-label="Volver" className={heroButtonClass}>
                              <Icon name="back" />
                        </button>
                        {action}
                  </div>
                  <div ref={hero} className={`relative mx-auto max-w-xl overflow-hidden bg-plum ${children ? "min-h-[28rem]" : "h-80"}`}>
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
                        <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,rgb(46_19_45/0.4)_0%,transparent_24%,transparent_42%,rgb(46_19_45/0.62)_68%,rgb(46_14_30/0.92)_100%)]" />
                        {recipe.imageIsReference && (
                              <span className="pointer-events-none absolute top-20 right-5 z-10 rounded-full bg-plum/60 px-2.5 py-1 text-xs font-bold text-card backdrop-blur-md">Foto de referencia</span>
                        )}
                        {children && <div className="relative flex min-h-[28rem] flex-col justify-end px-6 pt-24 pb-16 text-card">{children}</div>}
                  </div>
            </>
      );
}
