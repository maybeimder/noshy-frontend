import { Link } from "react-router-dom";
import type { Recipe } from "../types";

type RecipeCardProps = {
      recipe: Recipe;
};

export default function RecipeCard({ recipe }: RecipeCardProps) {
      return (
            <Link
                  to={`/recipes/${recipe.id}`}
                  className="group relative block aspect-[10/9] overflow-hidden rounded-card bg-secondary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
            >
                  <img
                        src={recipe.imageUrl}
                        alt=""
                        loading="lazy"
                        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Dark ciruela gradient keeps white text legible on any photo. */}
                  <div className="absolute inset-0 bg-linear-to-t from-ink/90 via-ink/40 via-45% to-transparent to-75%" />

                  <div className="absolute inset-x-0 bottom-0 flex items-end gap-4 p-6">
                        <div className="min-w-0 flex-1">
                              <p className="text-base font-bold text-secondary-soft">
                                    {recipe.cuisine}
                              </p>
                              <h3 className="text-section font-extrabold text-card">
                                    {recipe.title}
                              </h3>
                              <p className="mt-1 text-sm text-card">
                                    {recipe.tags.join(" · ")}
                              </p>
                              <p className="mt-2 flex items-center gap-1 text-xs font-bold text-card">
                                    <svg
                                          viewBox="0 0 24 24"
                                          className="size-4"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth={2}
                                          strokeLinecap="round"
                                          aria-hidden
                                    >
                                          <circle cx="12" cy="13" r="8" />
                                          <path d="M12 9v4l2 2M10 2h4" />
                                    </svg>
                                    <span className="sr-only">Tiempo:</span>
                                    {recipe.duration}
                              </p>
                        </div>
                        <svg
                              viewBox="0 0 24 24"
                              className="size-8 shrink-0 text-card transition-transform group-hover:translate-x-1"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.75}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                        >
                              <path d="M4 12h16M14 6l6 6-6 6" />
                        </svg>
                  </div>
            </Link>
      );
}
