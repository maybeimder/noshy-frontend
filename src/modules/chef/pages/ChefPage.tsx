import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { describeFeedback } from "@/modules/feedback/utils/labels";
import type { FeedbackEntry } from "@/modules/feedback/types";
import type { Recipe } from "@/modules/recipes/types";
import PageHeader from "@/shared/components/layout/PageHeader";
import Button from "@/shared/components/ui/Button";
import Icon from "@/shared/components/ui/Icon";
import { ErrorState, LoadingState } from "@/shared/components/ui/QueryState";
import { ApiError } from "@/shared/lib/axios";
import { plural } from "@/shared/lib/format";
import ChefMarkdown from "../components/ChefMarkdown";
import CloseSessionDialog from "../components/CloseSessionDialog";
import { useChefSession } from "../hooks/useChefSession";

const suggestions = [
      "¿Qué puedo cocinar con lo que tengo?",
      "Una cena rápida y alta en proteína",
      "Ideas para no desperdiciar mis verduras",
];

const sendErrorMessage = (error: Error) => {
      if (!(error instanceof ApiError)) return error.message;
      if (error.code === "CHEF_AGENT_UNAVAILABLE")
            return "Tu chef no está disponible ahora mismo. Tu mensaje quedó guardado; vuelve a intentarlo en un momento.";
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
      const [extrasByMessage, setExtrasByMessage] = useState<
            Record<string, { feedback: FeedbackEntry[]; savedRecipe?: Recipe }>
      >({});
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
                              setExtrasByMessage((map) => ({
                                    ...map,
                                    [reply.message.id]: { feedback: reply.feedback, savedRecipe: reply.savedRecipe },
                              }));
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
                  <PageHeader
                        title="Tu chef"
                        subtitle="Conoce tu plan y tu despensa"
                        actions={
                              sessionId && (
                                    <Button
                                          variant="tertiary"
                                          onClick={() => {
                                                close.reset();
                                                setCloseOpen(true);
                                          }}
                                    >
                                          Terminar
                                    </Button>
                              )
                        }
                  />

                  <main className="mx-auto flex max-w-xl flex-col gap-4 px-6 pt-6 pb-48">
                        {sessionId && context.isPending ? (
                              <LoadingState label="Recuperando tu conversación…" />
                        ) : context.isError && !(context.error instanceof ApiError && context.error.status === 409) ? (
                              <ErrorState message={context.error.message} onRetry={() => context.refetch()} />
                        ) : messages.length === 0 ? (
                              <section className="flex flex-col items-center gap-4 py-8 text-center">
                                    <span className="grid size-16 place-items-center rounded-full bg-primary-soft text-primary-strong">
                                          <Icon name="chef" className="size-8" />
                                    </span>
                                    <h2 className="text-section font-bold text-ink">¿Qué cocinamos hoy?</h2>
                                    <p className="text-base text-ink-muted">
                                          Pregúntame lo que quieras: adapto recetas a tus metas, restricciones y a lo que tienes en casa.
                                    </p>
                                    <ul className="flex w-full flex-col gap-2">
                                          {suggestions.map((suggestion) => (
                                                <li key={suggestion}>
                                                      <button
                                                            type="button"
                                                            onClick={() => submit(suggestion)}
                                                            className="flex min-h-11 w-full items-center justify-between gap-2 rounded-control bg-card px-4 py-3 text-left text-sm font-semibold text-ink hover:bg-secondary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                                      >
                                                            {suggestion}
                                                            <Icon name="arrowRight" className="size-5 shrink-0 text-ink-muted" />
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
                                                      <span className="sr-only">{mine ? "Tú:" : "Chef:"}</span>
                                                      {mine ? (
                                                            <p className="max-w-[85%] rounded-card rounded-br-sm bg-secondary-soft px-4 py-3 text-base whitespace-pre-wrap text-ink">
                                                                  {message.content}
                                                            </p>
                                                      ) : (
                                                            <div className="max-w-[85%] rounded-card rounded-bl-sm bg-card px-4 py-3 text-base text-ink">
                                                                  <ChefMarkdown>{message.content}</ChefMarkdown>
                                                            </div>
                                                      )}
                                                      {savedRecipe && (
                                                            <Link
                                                                  to={`/recetas/${savedRecipe.id}`}
                                                                  className="group flex w-[85%] items-center gap-3 rounded-card border-2 border-ink bg-secondary-soft p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                                            >
                                                                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-card text-success">
                                                                        <Icon name="check" className="size-5" strokeWidth={2.5} />
                                                                  </span>
                                                                  <span className="min-w-0 flex-1">
                                                                        <span className="block text-xs font-semibold text-ink-muted">Guardada en tus recetas</span>
                                                                        <span className="block truncate text-title font-bold text-ink">{savedRecipe.title}</span>
                                                                        <span className="block text-sm text-ink-muted">
                                                                              {plural(savedRecipe.ingredients.length, "ingrediente", "ingredientes")} ·{" "}
                                                                              {plural(savedRecipe.instructions.length, "paso", "pasos")}
                                                                        </span>
                                                                  </span>
                                                                  <Icon name="arrowRight" className="size-5 shrink-0 text-ink transition-transform group-hover:translate-x-1" />
                                                            </Link>
                                                      )}
                                                      {feedback.length > 0 && (
                                                            <ul aria-label="Lo que tu chef registró" className="flex max-w-[85%] flex-wrap gap-2">
                                                                  {feedback.map((entry) => (
                                                                        <li
                                                                              key={entry.id}
                                                                              className="inline-flex items-center gap-1 rounded-full border border-line bg-card px-3 py-1 text-xs text-ink-muted"
                                                                        >
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
                                          <li className="flex items-start">
                                                <p role="status" className="flex items-center gap-2 rounded-card rounded-bl-sm bg-card px-4 py-3 text-sm text-ink-muted">
                                                      <span aria-hidden className="flex gap-1">
                                                            <span className="size-2 animate-bounce rounded-full bg-primary" />
                                                            <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:150ms]" />
                                                            <span className="size-2 animate-bounce rounded-full bg-primary [animation-delay:300ms]" />
                                                      </span>
                                                      Tu chef está pensando…
                                                </p>
                                          </li>
                                    )}
                              </ol>
                        )}

                        {send.isError && (
                              <div role="alert" className="flex items-start gap-3 rounded-control border border-warning bg-card p-4 text-sm text-warning">
                                    <Icon name="alert" className="size-5 shrink-0" />
                                    <p>{sendErrorMessage(send.error)}</p>
                              </div>
                        )}
                        <div ref={endRef} />
                  </main>

                  <div className="fixed inset-x-0 bottom-16 z-10 bg-canvas/95 px-4 pt-2 pb-4 backdrop-blur">
                        <div className="mx-auto flex max-w-xl flex-col gap-2">
                              {recipeId && (
                                    <p className="inline-flex items-center gap-2 self-start rounded-full bg-secondary-soft py-1 pr-1 pl-3 text-sm text-ink">
                                          <Icon name="book" className="size-4" />
                                          Sobre: <strong className="max-w-48 truncate">{recipeName}</strong>
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
                              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                                    <label htmlFor="chef-message" className="sr-only">
                                          Mensaje para tu chef
                                    </label>
                                    <textarea
                                          id="chef-message"
                                          rows={1}
                                          value={draft}
                                          maxLength={10_000}
                                          placeholder="Escribe a tu chef…"
                                          onChange={(e) => setDraft(e.target.value)}
                                          onKeyDown={(e) => {
                                                if (e.key === "Enter" && !e.shiftKey) {
                                                      e.preventDefault();
                                                      submit(draft);
                                                }
                                          }}
                                          className="field-sizing-content max-h-40 min-h-11 flex-1 resize-none rounded-control border border-ink-muted bg-card px-4 py-2.5 text-base text-ink placeholder:text-ink-muted/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                    />
                                    <button
                                          type="submit"
                                          aria-label="Enviar"
                                          disabled={!draft.trim() || send.isPending}
                                          className="grid size-11 shrink-0 place-items-center rounded-control bg-primary text-ink hover:bg-primary/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:cursor-not-allowed disabled:opacity-50"
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
