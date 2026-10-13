import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Button from "@/shared/components/ui/Button";
import DishCover from "@/shared/components/ui/DishArt";
import Icon from "@/shared/components/ui/Icon";
import { ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import { foodErrorMessage, useLibraryBrowse } from "../hooks/useFood";
import type { LibraryBrowseFilters, LibraryRecipeCard, LibrarySort } from "../types";

const sorts: { value: LibrarySort; label: string }[] = [
      { value: "random", label: "Al azar" },
      { value: "recent", label: "Recientes" },
      { value: "oldest", label: "Antiguas" },
];
const sizes: { value?: number; label: string }[] = [{ label: "Todas" }, { value: 5, label: "≤ 5 ingredientes" }, { value: 10, label: "≤ 10" }];

const pill = (selected: boolean) =>
      `min-h-10 shrink-0 rounded-full px-4 text-sm font-extrabold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
            selected ? "bg-ink text-card" : "bg-card text-ink hover:bg-field"
      }`;

// "Explorar": the ~2.2 M recipe library, paged with cursors (GET /food/library/browse).
export default function LibraryFeed() {
      const [filters, setFilters] = useState<LibraryBrowseFilters>({ sort: "random" });
      const [seed, setSeed] = useState(0);
      const feed = useLibraryBrowse(filters, seed);
      const sentinel = useRef<HTMLDivElement>(null);
      const items = feed.data?.pages.flatMap((page) => page.items) ?? [];

      // Load the next page when the end of the list scrolls into view.
      useEffect(() => {
            const node = sentinel.current;
            if (!node || !feed.hasNextPage) return;
            const observer = new IntersectionObserver(
                  (entries) => {
                        if (entries[0]?.isIntersecting && !feed.isFetchingNextPage) feed.fetchNextPage();
                  },
                  { rootMargin: "400px" },
            );
            observer.observe(node);
            return () => observer.disconnect();
      }, [feed.hasNextPage, feed.isFetchingNextPage, feed.fetchNextPage, items.length]);

      return (
            <div className="flex flex-col gap-4">
                  <p className="flex items-start gap-2 rounded-control bg-lilac-soft p-3 text-sm font-semibold text-lilac-ink">
                        <Icon name="globe" className="mt-0.5 size-4 shrink-0" />
                        Más de 2 millones de recetas del mundo (en inglés). Toca una y Noshy te ayuda a cocinar tu versión.
                  </p>

                  <div role="group" aria-label="Orden" className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5">
                        {sorts.map(({ value, label }) => (
                              <button key={value} type="button" aria-pressed={filters.sort === value} onClick={() => setFilters((f) => ({ ...f, sort: value }))} className={pill(filters.sort === value)}>
                                    {label}
                              </button>
                        ))}
                        {filters.sort === "random" && (
                              <button type="button" onClick={() => setSeed((s) => s + 1)} className={`${pill(false)} inline-flex items-center gap-1.5`}>
                                    <Icon name="sparkle" className="size-4 text-primary-strong" />
                                    Barajar
                              </button>
                        )}
                  </div>
                  <div role="group" aria-label="Ingredientes" className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5">
                        {sizes.map(({ value, label }) => (
                              <button
                                    key={label}
                                    type="button"
                                    aria-pressed={filters.maxIngredients === value}
                                    onClick={() => setFilters((f) => ({ ...f, maxIngredients: value }))}
                                    className={pill(filters.maxIngredients === value)}
                              >
                                    {label}
                              </button>
                        ))}
                  </div>

                  {feed.isPending ? (
                        <LoadingState label="Buscando recetas…" />
                  ) : feed.isError ? (
                        <ErrorState message={foodErrorMessage(feed.error)} onRetry={() => feed.refetch()} />
                  ) : items.length === 0 ? (
                        <p className="py-6 text-center text-base text-ink-muted">No hay recetas con ese filtro.</p>
                  ) : (
                        <>
                              <ul aria-label="Recetas para explorar" className="grid grid-cols-2 gap-3">
                                    {items.map((recipe) => (
                                          <li key={recipe.id}>
                                                <LibraryCard recipe={recipe} />
                                          </li>
                                    ))}
                              </ul>
                              <div ref={sentinel} />
                              {feed.isFetchingNextPage ? (
                                    <LoadingState label="Cargando más…" />
                              ) : feed.hasNextPage ? (
                                    <Button variant="secondary" onClick={() => feed.fetchNextPage()} className="self-center">
                                          Cargar más
                                    </Button>
                              ) : (
                                    <p className="text-center text-sm text-ink-muted">¡Llegaste al final!</p>
                              )}
                              {feed.isFetchNextPageError && <p className="text-center text-sm font-semibold text-error">No pudimos cargar más recetas.</p>}
                        </>
                  )}
            </div>
      );
}

function LibraryCard({ recipe }: { recipe: LibraryRecipeCard }) {
      const tag = recipe.tags.mealTypes[0] ?? recipe.tags.diet[0] ?? recipe.tags.proteins[0];
      return (
            <Link
                  to={`/explorar/${recipe.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-card bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
            >
                  <div className="relative h-32">
                        <DishCover seed={String(recipe.id)} className="size-full" />
                        {tag && <span className="absolute bottom-3 left-3 rounded-full bg-card px-3 py-1 text-xs font-extrabold text-ink">{tag}</span>}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-3">
                        <h3 lang="en" className="line-clamp-2 text-base leading-tight font-extrabold text-ink">
                              {recipe.title}
                        </h3>
                        <p className="text-xs font-semibold text-ink-muted">
                              {recipe.nIngredients} {recipe.nIngredients === 1 ? "ingrediente" : "ingredientes"}
                        </p>
                  </div>
            </Link>
      );
}
