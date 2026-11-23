import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { describeFeedback } from "@/modules/feedback/utils/labels";
import type { FeedbackEntry } from "@/modules/feedback/types";
import type { Recipe } from "@/modules/recipes/types";
import { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import DishCover from "@/shared/components/ui/DishArt";
import Icon from "@/shared/components/ui/Icon";
import { BrandRing, MascotAvatar } from "@/shared/components/ui/MascotBubble";
import { MarkerText } from "@/shared/components/ui/ScribbleText";
import { imageVariant } from "@/shared/lib/images";
import { ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import { ApiError } from "@/shared/lib/axios";
import ChefMarkdown from "../components/ChefMarkdown";
import CloseSessionDialog from "../components/CloseSessionDialog";
import { useChefSession } from "../hooks/useChefSession";

const suggestions = ["¿Qué puedo cocinar con lo que tengo?", "Una cena rápida y alta en proteína", "Ideas para no desperdiciar mis verduras"];
// Quick replies under an ongoing conversation (ref/Tu chef.png).
const quickReplies = ["Otra idea", "¿Qué compro?", "Más proteína", "Algo más rápido"];

const replyPill =
      "inline-flex min-h-11 shrink-0 items-center rounded-full border-2 border-line bg-card px-4 text-sm font-extrabold text-ink hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:opacity-60";

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
                  <header className="sticky top-0 z-10 mx-auto max-w-xl rounded-b-card bg-card/95 px-5 pt-6 pb-4 shadow-soft backdrop-blur">
                        <div className="flex items-center gap-3">
                              <BrandRing className="size-14">
                                    <MascotAvatar tone="white" className="size-full" />
                              </BrandRing>
                              <div className="min-w-0 flex-1">
                                    <h1 className="text-[1.75rem] leading-tight font-extrabold text-ink">
                                          <MarkerText>Tu chef</MarkerText>
                                    </h1>
                                    <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-muted">
                                          <span aria-hidden className="size-2 shrink-0 rounded-full bg-online" />
                                          Conoce tu despensa y tus metas
                                    </p>
                              </div>
                              {sessionId && (
                                    <button
                                          type="button"
                                          aria-label="Terminar y guardar lo aprendido"
                                          title="Terminar y guardar lo aprendido"
                                          onClick={() => {
                                                close.reset();
                                                setCloseOpen(true);
                                          }}
                                          className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-strong hover:bg-rose-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                    >
                                          <Icon name="sliders" />
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
                                    <BrandRing className="size-32 p-1">
                                          <MascotAvatar tone="white" className="size-full" />
                                    </BrandRing>
                                    <h2 className="text-section font-extrabold text-ink">¿Qué cocinamos hoy?</h2>
                                    <p className="text-base text-ink-muted">Pregúntame lo que quieras: adapto recetas a tus metas, restricciones y a lo que tienes en casa.</p>
                                    <ul className="flex w-full flex-col gap-2">
                                          {suggestions.map((suggestion) => (
                                                <li key={suggestion}>
                                                      <button
                                                            type="button"
                                                            onClick={() => submit(suggestion)}
                                                            className="flex min-h-12 w-full items-center justify-between gap-2 rounded-card bg-card px-4 py-3 text-left text-sm font-bold text-ink shadow-soft hover:bg-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
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
                                                            <p className="max-w-[80%] rounded-[1.25rem] rounded-br-md bg-brand px-4 py-3 font-bold whitespace-pre-wrap text-card shadow-brand">
                                                                  {message.content}
                                                            </p>
                                                      ) : (
                                                            <div className="flex max-w-[90%] items-start gap-2">
                                                                  <MascotAvatar tone="blush" className="mt-1 size-9" />
                                                                  <div className="rounded-[1.25rem] rounded-tl-md bg-card px-4 py-3 text-base text-ink shadow-soft">
                                                                        <ChefMarkdown>{message.content}</ChefMarkdown>
                                                                  </div>
                                                            </div>
                                                      )}
                                                      {savedRecipe && <SavedRecipeCard recipe={savedRecipe} />}
                                                      {feedback.length > 0 && (
                                                            <ul aria-label="Lo que Noshy registró" className="ml-11 flex flex-wrap gap-2">
                                                                  {feedback.map((entry) => (
                                                                        <li key={entry.id} className="inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-lilac-ink/30 bg-lilac-soft px-3 py-1 text-xs font-bold text-lilac-ink">
                                                                              <Icon name="sparkle" className="size-3.5" />
                                                                              Aprendí: {describeFeedback(entry.eventType, entry.targetName)}
                                                                        </li>
                                                                  ))}
                                                            </ul>
                                                      )}
                                                </li>
                                          );
                                    })}
                                    {send.isPending && (
                                          <li className="flex items-start gap-2">
                                                <MascotAvatar tone="blush" className="mt-1 size-9" />
                                                <p role="status" className="flex items-center gap-2 rounded-[1.25rem] rounded-tl-md bg-card px-4 py-3 text-sm font-semibold text-ink-muted shadow-soft">
                                                      <span aria-hidden className="flex gap-1">
                                                            <span className="size-2 animate-bounce rounded-full bg-primary-strong" />
                                                            <span className="size-2 animate-bounce rounded-full bg-primary-strong [animation-delay:150ms]" />
                                                            <span className="size-2 animate-bounce rounded-full bg-primary-strong [animation-delay:300ms]" />
                                                      </span>
                                                      Tu chef está pensando…
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
                                                <button key={reply} type="button" disabled={send.isPending} onClick={() => submit(reply)} className={replyPill}>
                                                      {reply}
                                                </button>
                                          ))}
                                    </div>
                              )}
                              <form onSubmit={handleSubmit} className="flex items-end gap-2 rounded-[1.75rem] border-2 border-line bg-card p-1.5 pl-5 shadow-[0_10px_28px_-16px_rgb(43_20_51/0.45)] focus-within:border-primary/50">
                                    <label htmlFor="chef-message" className="sr-only">
                                          Mensaje para Noshy
                                    </label>
                                    <textarea
                                          id="chef-message"
                                          rows={1}
                                          value={draft}
                                          maxLength={10_000}
                                          placeholder="Pregúntale al chef…"
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
                                          className="grid size-12 shrink-0 place-items-center rounded-full bg-brand text-card shadow-brand hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
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
      const facts = [
            [recipe.ingredients.length, recipe.ingredients.length === 1 ? "ingrediente" : "ingredientes", "bg-peach-soft text-peach-ink"],
            [recipe.instructions.length, recipe.instructions.length === 1 ? "paso" : "pasos", "bg-rose-soft text-rose-ink"],
      ] as const;
      return (
            <article className="ml-11 w-[85%] overflow-hidden rounded-card bg-card shadow-[0_16px_32px_-20px_rgb(43_20_51/0.6)]">
                  <div className="relative h-36 bg-plum">
                        {recipe.imageUrl ? (
                              <img src={imageVariant(recipe.imageUrl, 560, 288)} alt="" className="size-full object-cover" />
                        ) : (
                              <DishCover seed={recipe.id} className="size-full" />
                        )}
                        <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgb(29_9_44/0.85)_100%)]" />
                        <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-card/90 px-2.5 py-1 text-xs font-extrabold text-ink">
                              <Icon name="check" className="size-3.5 text-mint-ink" strokeWidth={3} />
                              Guardada
                        </span>
                        <h3 className="absolute right-4 bottom-3 left-4 font-display text-title leading-tight font-extrabold text-card">{recipe.title}</h3>
                  </div>
                  <div className="flex flex-col gap-3 p-3">
                        <div className="grid grid-cols-2 gap-2 text-center">
                              {facts.map(([value, label, tone]) => (
                                    <span key={label} className={`rounded-control p-2 ${tone}`}>
                                          <span className="block font-display text-title font-extrabold">{value}</span>
                                          <span className="text-xs font-bold">{label}</span>
                                    </span>
                              ))}
                        </div>
                        <Link to={`/recetas/${recipe.id}`} className={`${buttonBase} ${buttonVariants.primary} min-h-12 text-sm`}>
                              <Icon name="chef" className="size-5" />
                              Cocinar
                        </Link>
                  </div>
            </article>
      );
}
