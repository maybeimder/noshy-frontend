import { useParams } from "react-router-dom";
import PageHeader from "@/shared/components/layout/PageHeader";
import Avatar from "@/shared/components/ui/Avatar";
import Button from "@/shared/components/ui/Button";
import LoadMore from "@/shared/components/ui/LoadMore";
import { EmptyState, ErrorState } from "@/shared/components/ui/QueryState";
import { plural } from "@/shared/lib/format";
import FeedCard from "../components/FeedCard";
import { CreatorSkeleton } from "../components/RecipeSkeletons";
import { useCreator, useFeed, useRecipeActions } from "../hooks/useRecipes";

const since = new Intl.DateTimeFormat("es", { month: "long", year: "numeric" });

export default function CreatorPage() {
      const { id = "" } = useParams();
      const creator = useCreator(id);
      const feed = useFeed("trending", { authorId: id });
      const { follow } = useRecipeActions();
      const items = (feed.data?.pages ?? []).flatMap((p) => p.data);

      if (creator.isPending || feed.isPending)
            return (
                  <>
                        <PageHeader title="Creador" icon="community" backTo="/recetas?ver=comunidad" />
                        <CreatorSkeleton />
                  </>
            );
      const c = creator.data;
      return (
            <>
                  <PageHeader title={c?.displayName ?? "Creador"} icon="community" backTo="/recetas?ver=comunidad" />
                  <main className="mx-auto flex max-w-xl flex-col gap-5 px-5 pt-3">
                        {creator.isError || !c ? (
                              <ErrorState message={creator.error?.message ?? ""} onRetry={() => creator.refetch()} />
                        ) : (
                              <section aria-label="Perfil" className="flex items-center gap-4 rounded-[2rem] bg-card p-5 shadow-soft">
                                    <span className="rounded-full bg-story p-[3px]">
                                          <Avatar name={c.displayName} url={c.avatarUrl} size="md" className="size-20 border-[3px] border-card" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                          <p className="text-sm text-ink-muted">Desde {since.format(new Date(c.memberSince))}</p>
                                          <p className="font-bold text-ink">
                                                {plural(c.stats.recipes, "receta", "recetas")} · {plural(c.stats.followers, "seguidor", "seguidores")}
                                          </p>
                                          {!c.isMe && (
                                                <Button variant={c.following ? "soft" : "primary"} loading={follow.isPending} onClick={() => follow.mutate({ id: c.id, on: !c.following })} className="mt-2">
                                                      {c.following ? "Dejar de seguir" : "Seguir"}
                                                </Button>
                                          )}
                                          {follow.error && <p className="mt-1 text-sm font-semibold text-error">{follow.error.message}</p>}
                                    </div>
                              </section>
                        )}
                        {feed.isError ? (
                              <ErrorState message={feed.error.message} onRetry={() => feed.refetch()} />
                        ) : items.length === 0 ? (
                              c && <EmptyState icon="pot" title="Aún no ha publicado recetas" description="Cuando publique una, la verás aquí." />
                        ) : (
                              <ul className="flex flex-col gap-4">
                                    {items.map((item) => (
                                          <FeedCard key={item.recipe.id} item={item} />
                                    ))}
                              </ul>
                        )}
                        <LoadMore query={feed} />
                  </main>
            </>
      );
}
