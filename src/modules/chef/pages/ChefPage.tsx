import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { describeFeedback } from "@/modules/feedback/utils/labels";
import type { FeedbackEntry } from "@/modules/feedback/types";
import type { Recipe } from "@/modules/recipes/types";
import DishCover from "@/shared/components/ui/DishArt";
import { Sparkle, Star, Steam } from "@/shared/components/ui/Doodles";
import Icon from "@/shared/components/ui/Icon";
import Mascot from "@/shared/components/ui/Mascot";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";
import { ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import { ApiError } from "@/shared/lib/axios";
import ChefMarkdown from "../components/ChefMarkdown";
import CloseSessionDialog from "../components/CloseSessionDialog";
import { useChefSession } from "../hooks/useChefSession";

const suggestions = ["¿Qué puedo cocinar con lo que tengo?", "Una cena rápida y alta en proteína", "Ideas para no desperdiciar mis verduras"];
// Quick replies under an ongoing conversation (ref/Tu chef.png).
const quickReplies = ["¡Vamos!", "Otra idea", "¿Qué me falta?"];

const stickerPill =
      "sticker inline-flex min-h-10 shrink-0 items-center rounded-full bg-card px-4 text-sm font-extrabold text-ink hover:bg-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:opacity-60";

const sendErrorMessage = (error: Error) => {
      if (!(error instanceof ApiError)) return error.message;
      if (error.code === "CHEF_AGENT_UNAVAILABLE")
            return "Noshy no está disponible ahora mismo. Tu mensaje quedó guardado; vuelve a intentarlo en un momento.";
      if (error.code === "RECIPE_NOT_FOUND") return "No encontramos la receta de esta conversación.";
      return error.message;
};

export default function ChefPage() {
      const [params, setParams] = useSearchParams();
      const recipeId = params.get("receta") ?? undefined;
      const recipeName = params.get("nombre") ?? "esta receta";

      const { sessionId, context, send, close } = useChefSession();
      const [draft, setDraft] = useState("");
      const [closeOpen, setCloseOpen] = useState(false);
      // Detected feedback and saved recipes only come with the reply; keep them next to that message.
      const [extrasByMessage, setExtrasByMessage] = useState<Record<string, { feedback: FeedbackEntry[]; savedRecipe?: Recipe }>>({});
      const endRef = useRef<HTMLDivElement>(null);

      const messages = context.data?.messages ?? [];

      useEffect(() => {
            endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, [messages.length, send.isPending]);

      const submit = (content: string) => {
            const text = content.trim();
            if (!text || send.isPending) return;
            setDraft("");
            send.mutate(
                  { content: text, recipeId },
                  {
                        onSuccess: ({ reply }) => {
                              if (!reply.feedback.length && !reply.savedRecipe) return;
                              setExtrasByMessage((map) => ({ ...map, [reply.message.id]: { feedback: reply.feedback, savedRecipe: reply.savedRecipe } }));
                        },
                  },
            );
      };

      const handleSubmit = (event: FormEvent) => {
            event.preventDefault();
            submit(draft);
      };

      const closeConflict = close.error instanceof ApiError && close.error.code === "PREFERENCES_VERSION_CONFLICT";

      return (
            <>
                  <header className="relative mx-auto max-w-xl rounded-b-[2rem] bg-card px-5 pt-6 pb-5 shadow-[0_12px_32px_-24px_rgb(43_20_51/0.45)]">
                        <Star className="absolute top-4 left-[52%] size-6 rotate-12 text-primary" />
                        <Sparkle className="absolute top-3 left-[62%] size-4 text-primary-strong" />
                        <div className="flex items-center gap-3">
                              <MascotAvatar className="size-16" />
                              <div className="min-w-0 flex-1">
                                    <h1 className="text-[1.75rem] leading-tight font-extrabold text-ink">Noshy</h1>
                                    <p className="flex items-start gap-1.5 text-sm font-bold text-ink-muted">
                                          <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-online" />
                                          Tu chef · conoce tu plan y tu despensa
                                    </p>
                              </div>
                              {sessionId && (
                                    <button
                                          type="button"
                                          onClick={() => {
                                                close.reset();
                                                setCloseOpen(true);
                                          }}
                                          className="min-h-10 shrink-0 rounded-full bg-field px-4 text-sm font-extrabold text-ink hover:bg-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                    >
                                          Terminar
                                    </button>
                              )}
                        </div>
                  </header>

                  <main className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-5 pb-72">
                        {sessionId && context.isPending ? (
                              <LoadingState label="Recuperando tu conversación…" />
                        ) : context.isError && !(context.error instanceof ApiError && context.error.status === 409) ? (
                              <ErrorState message={context.error.message} onRetry={() => context.refetch()} />
                        ) : messages.length === 0 ? (
                              <section className="flex flex-col items-center gap-4 py-4 text-center">
                                    <Mascot className="w-36" />
                                    <h2 className="text-section font-extrabold text-ink">¿Qué cocinamos hoy?</h2>
                                    <p className="text-base text-ink-muted">Pregúntame lo que quieras: adapto recetas a tus metas, restricciones y a lo que tienes en casa.</p>
                                    <ul className="flex w-full flex-col gap-2">
                                          {suggestions.map((suggestion) => (
                                                <li key={suggestion}>
                                                      <button
                                                            type="button"
                                                            onClick={() => submit(suggestion)}
                                                            className="flex min-h-12 w-full items-center justify-between gap-2 rounded-card bg-card px-4 py-3 text-left text-sm font-bold text-ink hover:bg-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                                      >
                                                            {suggestion}
                                                            <Icon name="arrowRight" className="size-5 shrink-0 text-primary-strong" />
                                                      </button>
                                                </li>
                                          ))}
                                    </ul>
                              </section>
                        ) : (
                              <ol aria-label="Conversación" aria-live="polite" className="flex flex-col gap-4">
                                    {messages.map((message) => {
                                          const mine = message.role === "user";
                                          const { feedback = [], savedRecipe } = extrasByMessage[message.id] ?? {};
                                          return (
                                                <li key={message.id} className={`flex flex-col gap-2 ${mine ? "items-end" : "items-start"}`}>
                                                      <span className="sr-only">{mine ? "Tú:" : "Noshy:"}</span>
                                                      {mine ? (
                                                            <p className="max-w-[80%] rounded-[1.25rem] rounded-br-md bg-primary-strong px-4 py-3 font-bold whitespace-pre-wrap text-card">
                                                                  {message.content}
                                                            </p>
                                                      ) : (
                                                            <div className="flex max-w-[90%] items-start gap-2">
                                                                  <MascotAvatar className="mt-1 size-9" />
                                                                  <div className="rounded-[1.25rem] rounded-tl-md bg-card px-4 py-3 text-base text-ink">
                                                                        <ChefMarkdown>{message.content}</ChefMarkdown>
                                                                  </div>
                                                            </div>
                                                      )}
                                                      {savedRecipe && <SavedRecipeCard recipe={savedRecipe} />}
                                                      {feedback.length > 0 && (
                                                            <ul aria-label="Lo que Noshy registró" className="ml-11 flex flex-wrap gap-2">
                                                                  {feedback.map((entry) => (
                                                                        <li key={entry.id} className="inline-flex items-center gap-1 rounded-full bg-mint-soft px-3 py-1 text-xs font-bold text-mint-ink">
                                                                              <Icon name="sparkle" className="size-3.5" />
                                                                              {describeFeedback(entry.eventType, entry.targetName)}
                                                                        </li>
                                                                  ))}
                                                            </ul>
                                                      )}
                                                </li>
                                          );
                                    })}
                                    {send.isPending && (
                                          <li className="flex items-start gap-2">
                                                <MascotAvatar className="mt-1 size-9" />
                                                <p role="status" className="flex items-center gap-2 rounded-[1.25rem] rounded-tl-md bg-card px-4 py-3 text-sm font-semibold text-ink-muted">
                                                      <span aria-hidden className="flex gap-1">
                                                            <span className="size-2 animate-bounce rounded-full bg-primary-strong" />
                                                            <span className="size-2 animate-bounce rounded-full bg-primary-strong [animation-delay:150ms]" />
                                                            <span className="size-2 animate-bounce rounded-full bg-primary-strong [animation-delay:300ms]" />
                                                      </span>
                                                      Noshy está pensando…
                                                </p>
                                          </li>
                                    )}
                              </ol>
                        )}

                        {send.isError && (
                              <div role="alert" className="flex items-start gap-3 rounded-card bg-peach-soft p-4 text-sm font-semibold text-peach-ink">
                                    <Icon name="alert" className="size-5 shrink-0" />
                                    <p>{sendErrorMessage(send.error)}</p>
                              </div>
                        )}
                        <div ref={endRef} />
                  </main>

                  <div className="fixed inset-x-0 bottom-28 z-10 px-4">
                        <div className="mx-auto flex max-w-xl flex-col gap-3">
                              {recipeId && (
                                    <p className="inline-flex items-center gap-2 self-start rounded-full bg-secondary-soft py-1 pr-1 pl-3 text-sm font-bold text-ink">
                                          <Icon name="book" className="size-4" />
                                          Sobre: <span className="max-w-48 truncate">{recipeName}</span>
                                          <button
                                                type="button"
                                                aria-label="Quitar receta de la conversación"
                                                onClick={() => setParams({}, { replace: true })}
                                                className="grid size-8 place-items-center rounded-full hover:bg-secondary/60 focus-visible:outline-2 focus-visible:outline-primary-strong"
                                          >
                                                <Icon name="close" className="size-4" />
                                          </button>
                                    </p>
                              )}
                              {messages.length > 0 && (
                                    <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pt-1 pb-1">
                                          {quickReplies.map((reply) => (
                                                <button key={reply} type="button" disabled={send.isPending} onClick={() => submit(reply)} className={stickerPill}>
                                                      {reply}
                                                </button>
                                          ))}
                                    </div>
                              )}
                              <form onSubmit={handleSubmit} className="flex items-end gap-2 rounded-[1.75rem] bg-card p-2 pl-5 shadow-[0_10px_28px_-16px_rgb(43_20_51/0.45)]">
                                    <label htmlFor="chef-message" className="sr-only">
                                          Mensaje para Noshy
                                    </label>
                                    <textarea
                                          id="chef-message"
                                          rows={1}
                                          value={draft}
                                          maxLength={10_000}
                                          placeholder="Escríbele a Noshy..."
                                          onChange={(e) => setDraft(e.target.value)}
                                          onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                      e.preventDefault();
                                                      submit(draft);
                                                }
                                          }}
                                          className="field-sizing-content max-h-40 min-h-11 flex-1 resize-none bg-transparent py-2.5 text-base text-ink placeholder:text-ink-muted/60 focus-visible:outline-none"
                                    />
                                    <button
                                          type="submit"
                                          aria-label="Enviar"
                                          disabled={!draft.trim() || send.isPending}
                                          className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-strong text-card hover:bg-primary-strong/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                          <Icon name="send" className="size-5" />
                                    </button>
                              </form>
                        </div>
                  </div>

                  {closeOpen && (
                        <CloseSessionDialog
                              open
                              initialPreferences={context.data?.preferencesMarkdown ?? ""}
                              closing={close.isPending}
                              conflict={closeConflict}
                              error={close.error && !closeConflict ? close.error.message : null}
                              onConfirm={(preferences) =>
                                    close.mutate(preferences, {
                                          onSuccess: () => {
                                                setCloseOpen(false);
                                                setExtrasByMessage({});
                                          },
                                    })
                              }
                              onClose={() => setCloseOpen(false)}
                        />
                  )}
            </>
      );
}

/** Recipe the chef saved for you, as a card in the conversation. */
function SavedRecipeCard({ recipe }: { recipe: Recipe }) {
      return (
            <Link
                  to={`/recetas/${recipe.id}`}
                  className="group ml-11 block w-[80%] overflow-hidden rounded-card bg-card shadow-[0_10px_24px_-18px_rgb(43_20_51/0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
            >
                  <div className="relative h-28">
                        <DishCover seed={recipe.id} className="size-full" />
                        <Steam className="absolute top-8 left-6 size-6 text-plate/80" />
                        <span className="absolute top-2 right-2 inline-flex rotate-3 items-center gap-1 rounded-control bg-mustard px-2 py-1 font-display text-xs font-extrabold text-ink">
                              <Icon name="check" className="size-3.5" strokeWidth={3} />
                              Guardada
                        </span>
                  </div>
                  <div className="flex flex-col gap-3 p-4">
                        <h3 className="font-display text-title leading-tight font-extrabold text-ink">{recipe.title}</h3>
                        <div className="grid grid-cols-2 gap-2 text-center">
                              <span className="rounded-control bg-peach-soft p-2">
                                    <span className="block font-display text-title font-extrabold text-peach-ink">{recipe.ingredients.length}</span>
                                    <span className="text-xs font-bold text-peach-ink">{recipe.ingredients.length === 1 ? "ingrediente" : "ingredientes"}</span>
                              </span>
                              <span className="rounded-control bg-rose-soft p-2">
                                    <span className="block font-display text-title font-extrabold text-rose-ink">{recipe.instructions.length}</span>
                                    <span className="text-xs font-bold text-rose-ink">{recipe.instructions.length === 1 ? "paso" : "pasos"}</span>
                              </span>
                        </div>
                  </div>
            </Link>
      );
}
