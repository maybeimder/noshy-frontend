import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import Avatar from "@/shared/components/ui/Avatar";
import DishCover from "@/shared/components/ui/DishArt";
import Icon from "@/shared/components/ui/Icon";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";
import Photo from "@/shared/components/ui/Photo";
import { formatTime } from "@/shared/lib/format";
import { useRecipeActions } from "../hooks/useRecipes";
import type { FeedItem } from "../types";
import CommentsDialog from "./CommentsDialog";

/** A community recipe: full photo, its author, likes, comments and the chef. */
export default function FeedCard({ item }: { item: FeedItem }) {
      const { like } = useRecipeActions();
      const { user } = useAuth();
      const [commentsOpen, setCommentsOpen] = useState(false);
      const { recipe, author, viewer, stats, compatibility } = item;
      const error = like.error;
      const n = recipe.nutritionPerServing;
      const time = formatTime(recipe.totalTimeMinutes);
      const tag = "inline-flex h-7 items-center gap-1.5 rounded-full bg-tag px-2.5 text-xs font-bold whitespace-nowrap text-card";
      const stat =
            "inline-flex min-h-11 items-center gap-1.5 rounded-full px-1.5 text-sm font-bold text-card tabular-nums hover:bg-card/15 focus-visible:outline-2 focus-visible:outline-card disabled:opacity-60";

      return (
            <li className="relative isolate flex min-h-[24.5rem] flex-col overflow-hidden rounded-[2.25rem] bg-plum text-card shadow-[0_20px_40px_-22px_rgb(46_19_45/0.7)]">
                  <span className="absolute inset-0 -z-10">
                        <Photo url={recipe.imageUrl} width={720} height={900} className="size-full object-cover" fallback={<DishCover seed={recipe.id} layout="hero" className="size-full" />} />
                  </span>
                  <span aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(46_19_45/0.35)_0%,transparent_24%,rgb(46_19_45/0.25)_42%,rgb(38_14_37/0.95)_100%)]" />

                  <div className="flex items-start justify-between gap-2 p-4">
                        <Link
                              to={`/creador/${author.id}`}
                              className="relative inline-flex items-center gap-2 rounded-full bg-card/20 py-1 pr-3.5 pl-1 text-sm font-bold backdrop-blur-md after:absolute after:-inset-1 hover:bg-card/30 focus-visible:outline-2 focus-visible:outline-card"
                        >
                              <Avatar name={author.displayName} url={author.avatarUrl} size="xs" className="size-7 text-sm" />
                              {author.displayName}
                        </Link>
                        {item.chefConsultable && (
                              <span title="Chef consultable" className="rounded-full bg-brand p-[3px] shadow-brand">
                                    <MascotAvatar tone="blush" className="size-10" />
                                    <span className="sr-only">Chef consultable</span>
                              </span>
                        )}
                  </div>

                  <Link to={`/recetas/${recipe.id}`} className="mt-auto block px-5 pt-20 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-card">
                        {!compatibility.ok && (
                              <span className={"mb-2 inline-flex items-center rounded-full bg-peach-soft px-2.5 py-1 text-xs font-extrabold text-peach-ink"}>
                                    {compatibility.adaptable ? "Tu chef la adapta" : `Tiene ${compatibility.conflicts.map((c) => c.label.toLowerCase()).join(", ")}`}
                              </span>
                        )}
                        {recipe.cuisine && <span className="block text-base text-card/85">{recipe.cuisine.label}</span>}
                        <span className="mt-0.5 block font-display text-[1.6875rem] leading-[1.85rem] font-medium">{recipe.title}</span>
                  </Link>
                  <ul className="flex flex-wrap gap-1.5 px-5 pt-2">
                        {time && (
                              <li className={tag}>
                                    <Icon name="timer" className="size-3.5" strokeWidth={2} />
                                    {time}
                              </li>
                        )}
                        {recipe.difficulty && (
                              <li className={`${tag} text-fat-glow`}>
                                    <Icon name="gauge" className="size-3.5" strokeWidth={2} />
                                    {recipe.difficulty.label}
                              </li>
                        )}
                        <li className={`${tag} gap-2 font-extrabold tabular-nums`} aria-label={`${n.kcal} kcal, ${Math.round(n.proteinG)} g de proteína, ${Math.round(n.carbsG)} g de carbohidratos y ${Math.round(n.fatG)} g de grasa`}>
                              {(
                                    [
                                          [n.kcal, "kcal", "text-kcal-glow"],
                                          [n.proteinG, "p", "text-protein-glow"],
                                          [n.carbsG, "c", "text-carbs-glow"],
                                          [n.fatG, "f", "text-fat-glow"],
                                    ] as const
                              ).map(([value, unit, color]) => (
                                    <span key={unit} aria-hidden className={color}>
                                          {Math.round(value)}
                                          <span className="ml-px text-[0.625rem]">{unit}</span>
                                    </span>
                              ))}
                        </li>
                  </ul>
                  <div className="flex items-center gap-1.5 px-3.5 pt-2 pb-4">
                        <button type="button" aria-pressed={viewer.liked} aria-label={`Me gusta (${stats.likes})`} disabled={like.isPending} onClick={() => like.mutate({ id: recipe.id, on: !viewer.liked })} className={`toggle-pop ${stat}`}>
                              <Icon name="heart" className={`size-5 ${viewer.liked ? "fill-current text-primary" : ""}`} />
                              {stats.likes}
                        </button>
                        <button type="button" aria-label={`Comentarios (${stats.comments})`} onClick={() => setCommentsOpen(true)} className={stat}>
                              <Icon name="comment" className="size-5" />
                              {stats.comments}
                        </button>
                        {item.chefConsultable && (
                              <Link
                                    to={`/chef?receta=${recipe.id}`}
                                    className="mr-1.5 ml-auto inline-flex min-h-9 shrink-0 items-center gap-2 rounded-full bg-card px-4 text-[0.8125rem] font-bold whitespace-nowrap text-primary-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card"
                              >
                                    <Icon name="chats" className="size-4" strokeWidth={2} />
                                    Pregúntale al chef
                              </Link>
                        )}
                  </div>
                  {error && <p className="px-5 pb-3 text-sm font-semibold text-secondary-soft">{error.message}</p>}
                  <CommentsDialog recipeId={recipe.id} canModerate={author.id === user?.id} open={commentsOpen} onClose={() => setCommentsOpen(false)} />
            </li>
      );
}
