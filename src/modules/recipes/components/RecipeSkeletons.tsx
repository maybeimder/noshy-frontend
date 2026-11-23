import { Sk, SkChips, SkGroup, SkMain, SkRecipeGrid, SkText, times } from "@/shared/components/ui/Skeleton";
import { useRecipeSeed } from "../hooks/useRecipes";
import RecipeHero from "./RecipeHero";
import { useShape } from "@/shared/hooks/useShape";

export type ListShape = { count: number };
export type CookedShape = { count: number; nudge: boolean };
export type FeedShape = { count: number; creators: boolean };

export function MineSkeleton() {
      const { count } = useShape<ListShape>("mine", { count: 1 });
      return (
            <SkGroup>
                  {/* The dashed «Crea una receta» card is taller and sets its row. */}
                  <div aria-hidden className="grid grid-cols-2 gap-3">
                        {times(count + 1).map((i) => {
                              const inLastRow = Math.floor(i / 2) === Math.floor(count / 2);
                              return <Sk key={i} className={`rounded-card ${inLastRow ? "min-h-60" : "min-h-[11.75rem]"}`} />;
                        })}
                  </div>
            </SkGroup>
      );
}

export function GridSkeleton({ name, meta = true }: { name: string; meta?: boolean }) {
      const { count } = useShape<ListShape>(name, { count: 4 });
      return (
            <SkGroup>
                  <SkRecipeGrid count={Math.max(2, count)} meta={meta} />
            </SkGroup>
      );
}

export function FeedSkeleton() {
      const shape = useShape<FeedShape>("feed", { count: 2, creators: false });
      return (
            <SkGroup className="flex flex-col gap-4">
                  {shape.creators && (
                        <div className="-mx-5 flex gap-4 overflow-hidden px-5 py-1">
                              {times(4).map((i) => (
                                    <div key={i} className="flex w-20 shrink-0 flex-col items-center gap-1">
                                          <Sk className="size-[4.5rem] rounded-full" />
                                          <SkText size="xs" w="w-12" />
                                          <Sk className="h-9 w-16 rounded-full" />
                                    </div>
                              ))}
                        </div>
                  )}
                  <SkChips bleed />
                  {shape.count === 0 ? (
                        <Sk className="h-60 rounded-card" />
                  ) : (
                        times(Math.min(3, shape.count)).map((i) => (
                              <div key={i} className="overflow-hidden rounded-card bg-card shadow-soft">
                                    <Sk className="h-48 rounded-none" />
                                    <div className="flex items-center gap-3 px-4 pt-3">
                                          <Sk className="size-11 shrink-0 rounded-full" />
                                          <div className="min-w-0 flex-1">
                                                <SkText size="title" w="w-40" />
                                                <SkText size="xs" w="w-32" />
                                          </div>
                                    </div>
                                    <div className="h-[3.25rem]" />
                              </div>
                        ))
                  )}
            </SkGroup>
      );
}

export function CookedSkeleton() {
      const shape = useShape<CookedShape>("cooked", { count: 4, nudge: false });
      return (
            <SkMain className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-3">
                  {shape.nudge && <Sk className="h-16 rounded-full" />}
                  <SkChips bleed />
                  {shape.count === 0 ? <Sk className="h-48 rounded-card" /> : <SkRecipeGrid count={shape.count} />}
            </SkMain>
      );
}

export function RecipeDetailSkeleton({ id }: { id: string | undefined }) {
      const seed = useRecipeSeed(id);
      return (
            <>
                  {seed ? <RecipeHero recipe={seed} backTo="/recetas" /> : <Sk className="mx-auto h-80 max-w-xl rounded-none" />}
                  <SkMain className="relative mx-auto -mt-10 flex max-w-xl flex-col gap-4 rounded-t-[2rem] bg-canvas px-5 pt-6">
                        <div className="flex flex-col gap-3">
                              <SkText size="sm" w="w-40" />
                              {seed ? <h1 className="text-page leading-tight font-extrabold break-words text-ink">{seed.title}</h1> : <SkText size="page" w="w-64" />}
                              <div className="flex flex-wrap gap-2">
                                    {["w-20", "w-14", "w-16", "w-28", "w-20", "w-20"].map((w, i) => (
                                          <Sk key={i} className={`h-7 rounded-full ${w}`} />
                                    ))}
                              </div>
                        </div>
                        <Sk className="h-11 w-52" />
                        <Sk className="h-14 rounded-full" />
                        <div aria-hidden className="grid grid-cols-2 gap-3">
                              {times(4).map((i) => (
                                    <Sk key={i} className="h-11 rounded-full" />
                              ))}
                        </div>
                        <div aria-hidden className="rounded-card bg-card p-5">
                              <SkText size="section" w="w-36" className="mb-2" />
                              <div className="divide-y divide-line">
                                    {times(4).map((i) => (
                                          <div key={i} className="flex items-center gap-3 py-3">
                                                <Sk className="size-11 shrink-0" />
                                                <div className="min-w-0 flex-1">
                                                      <SkText w="w-32" />
                                                      <SkText size="xs" w="w-24" />
                                                </div>
                                                <SkText size="title" w="w-12" />
                                          </div>
                                    ))}
                              </div>
                        </div>
                  </SkMain>
            </>
      );
}

export function EditorSkeleton() {
      return (
            <SkMain className="mx-auto flex max-w-xl flex-col gap-6 px-5 pt-3">
                  <Sk className="h-36 rounded-[1.75rem]" />
                  {times(2).map((i) => (
                        <div key={i} aria-hidden className="flex flex-col gap-2">
                              <SkText size="sm" w="w-36" />
                              <Sk className="h-12" />
                        </div>
                  ))}
                  <div aria-hidden className="flex flex-col gap-2">
                        <SkText size="sm" w="w-20" />
                        <Sk className="h-11 w-52" />
                  </div>
                  <div aria-hidden className="flex flex-col gap-1">
                        <SkText size="sm" w="w-20" />
                        <SkChips bleed widths={["w-20", "w-20", "w-20"]} />
                  </div>
                  <div aria-hidden className="flex flex-col gap-3">
                        <SkText size="section" w="w-36" className="mb-3" />
                        <Sk className="h-[4.5rem] rounded-card" />
                  </div>
            </SkMain>
      );
}

/** Inside the comments sheet. */
export function CommentsSkeleton() {
      return (
            <SkGroup className="flex flex-col gap-4">
                  {times(2).map((i) => (
                        <div key={i} className="flex gap-3">
                              <Sk className="size-11 shrink-0 rounded-full" />
                              <div className="flex-1">
                                    <SkText size="sm" w="w-32" />
                                    <SkText w="w-full" />
                              </div>
                        </div>
                  ))}
            </SkGroup>
      );
}
