import { Link } from "react-router-dom";
import KitchenHeader from "@/modules/inventory/components/KitchenHeader";
import Icon from "@/shared/components/ui/Icon";
import RoundButton from "@/shared/components/ui/RoundButton";

/** Recetas, inside Mi cocina: the gallery of ideas, or your own book («Recetario»). */
export default function RecipesHeader({ book }: { book: boolean }) {
      return (
            <KitchenHeader
                  section="recipes"
                  meta={book ? "Tus recetas" : "Ideas para cocinar hoy"}
                  actions={
                        <>
                              <RoundButton to="/recetas/nueva" label="Nueva receta" tone="primary">
                                    <Icon name="plus" strokeWidth={2} />
                              </RoundButton>
                              <Link
                                    to={book ? "/recetas?ver=explorar" : "/recetas"}
                                    aria-label={book ? "Recetario, abierto. Volver a las ideas" : "Recetario: tus recetas"}
                                    className={`flex h-12 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-[background-color,filter] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong max-[379px]:w-12 max-[379px]:justify-center max-[379px]:px-0 ${
                                          book ? "bg-plum-glow text-card" : "bg-blush text-ink shadow-[0_6px_16px_-8px_rgb(223_32_106/0.22)] hover:brightness-[0.98]"
                                    }`}
                              >
                                    <Icon name={book ? "close" : "book"} className={`size-5 shrink-0 ${book ? "" : "text-primary-strong"}`} strokeWidth={2} />
                                    <span className="max-[379px]:sr-only">Recetario</span>
                              </Link>
                        </>
                  }
            />
      );
}
