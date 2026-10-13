import { Link } from "react-router-dom";
import type { Recipe } from "@/modules/recipes/types";
import Icon from "@/shared/components/ui/Icon";
import { imageVariant } from "@/shared/lib/images";

// Vivid avatar colours from ref/Inicio.png. The initial is decorative (the name is the label below).
const surfaces = ["bg-secondary", "bg-primary-strong", "bg-violet", "bg-cobalt", "bg-teal", "bg-tomato"];

type Cook = { name: string; avatarUrl?: string | null };

/** Unique community authors, most recent publisher first. */
export function cooksFrom(recipes: Recipe[]): Cook[] {
      const byName = new Map<string, Cook>();
      const sorted = [...recipes].sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));
      for (const recipe of sorted) {
            if (recipe.authorName && !byName.has(recipe.authorName)) {
                  byName.set(recipe.authorName, { name: recipe.authorName, avatarUrl: recipe.authorAvatarUrl });
            }
      }
      return [...byName.values()];
}

const itemClass =
      "flex w-16 flex-col items-center gap-2 rounded-control text-xs font-bold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";

export default function CooksRow({ cooks }: { cooks: Cook[] }) {
      return (
            <nav aria-label="Cocineros de la comunidad">
                  <ul className="scrollbar-none flex gap-4 overflow-x-auto px-5 py-2">
                        <li className="shrink-0">
                              <Link to="/recetas/nueva" className={itemClass}>
                                    <span className="grid size-16 place-items-center rounded-full border-2 border-dashed border-primary-strong bg-transparent text-primary-strong">
                                          <Icon name="plus" className="size-7" strokeWidth={2} />
                                    </span>
                                    Publicar
                              </Link>
                        </li>
                        {cooks.map((cook, index) => (
                              <li key={cook.name} className="shrink-0">
                                    <Link
                                          to={`/recetas?${new URLSearchParams({ ver: "comunidad", autor: cook.name })}`}
                                          aria-label={`Recetas de ${cook.name}`}
                                          className={itemClass}
                                    >
                                          <span className="rounded-full bg-primary-strong p-0.5">
                                                {cook.avatarUrl ? (
                                                      <img
                                                            src={imageVariant(cook.avatarUrl, 120, 120)}
                                                            alt=""
                                                            className="size-15 rounded-full border-[3px] border-canvas object-cover"
                                                      />
                                                ) : (
                                                      <span
                                                            aria-hidden
                                                            className={`grid size-15 place-items-center rounded-full border-[3px] border-canvas font-display text-section font-extrabold text-card ${surfaces[index % surfaces.length]}`}
                                                      >
                                                            {cook.name.charAt(0).toUpperCase()}
                                                      </span>
                                                )}
                                          </span>
                                          <span className="w-full truncate text-center" aria-hidden>
                                                {cook.name.split(" ")[0]}
                                          </span>
                                    </Link>
                              </li>
                        ))}
                  </ul>
            </nav>
      );
}
