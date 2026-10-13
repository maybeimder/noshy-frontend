import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import Icon from "@/shared/components/ui/Icon";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";
import ScribbleText from "@/shared/components/ui/ScribbleText";
import { plural } from "@/shared/lib/format";
import type { Recipe } from "../types";
import { chefLink } from "../utils/links";

/** Mustard tag + underlined title + info chips (ref/Detalle de receta.png). */
export function RecipeTitle({ recipe, tag, chips }: { recipe: Recipe; tag: string; chips: ReactNode }) {
      return (
            <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                        <span className="-rotate-3 rounded-control bg-mustard px-2.5 py-1 font-display text-sm font-extrabold text-ink">{tag}</span>
                        <h1 className="pb-2 text-page leading-tight font-extrabold break-words text-ink">
                              <ScribbledTitle title={recipe.title} />
                        </h1>
                  </div>
                  <ul className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                        {chips}
                        <li className="rounded-full bg-peach-soft px-3 py-1.5 text-peach-ink">{plural(recipe.ingredients.length, "ingrediente", "ingredientes")}</li>
                        <li className="rounded-full bg-rose-soft px-3 py-1.5 text-rose-ink">{plural(recipe.instructions.length, "paso", "pasos")}</li>
                  </ul>
            </div>
      );
}

/** Short titles are underlined whole (as in the reference); long ones only on the last word, so they can wrap. */
function ScribbledTitle({ title }: { title: string }) {
      if (title.length <= 16) return <ScribbleText color="orange">{title}</ScribbleText>;
      const cut = title.lastIndexOf(" ");
      return (
            <>
                  {title.slice(0, cut + 1)}
                  <ScribbleText color="orange">{title.slice(cut + 1)}</ScribbleText>
            </>
      );
}

/** "Lista de compras" + "Pregúntale a Noshy" white buttons. */
export function RecipeQuickActions({ recipe, onShopping }: { recipe: Recipe; onShopping: () => void }) {
      return (
            <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={onShopping} className={`${buttonBase} ${buttonVariants.secondary} min-h-12 gap-1.5 px-2 text-[0.8125rem]`}>
                        <Icon name="cart" className="size-5 text-tomato" />
                        Lista de compras
                  </button>
                  <Link to={chefLink(recipe.id, recipe.title)} className={`${buttonBase} ${buttonVariants.secondary} min-h-12 gap-1.5 px-2 text-[0.8125rem]`}>
                        <MascotAvatar className="size-6" />
                        Pregúntale a Noshy
                  </Link>
            </div>
      );
}
