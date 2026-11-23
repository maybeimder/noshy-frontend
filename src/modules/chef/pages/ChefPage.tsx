import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cookApi } from "@/modules/cook/api/cook.api";
import { useRecipeActions } from "@/modules/recipes/hooks/useRecipes";
import { useShoppingMutations } from "@/modules/shopping-list/hooks/useShoppingList";
import PageHeader from "@/shared/components/layout/PageHeader";
import Button from "@/shared/components/ui/Button";
import DishCover from "@/shared/components/ui/DishArt";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";
import Photo from "@/shared/components/ui/Photo";
import { ErrorState } from "@/shared/components/ui/QueryState";
import RoundButton from "@/shared/components/ui/RoundButton";
import { fieldClass } from "@/shared/components/ui/TextField";
import { ApiError, newKey } from "@/shared/lib/axios";
import { formatTime } from "@/shared/lib/format";
import type { RecipeCard } from "@/shared/types/api";
import { useRememberShape } from "@/shared/hooks/useShape";
import ChefMarkdown from "../components/ChefMarkdown";
import { ChefBubbles, type ChefShape } from "../components/ChefSkeleton";
import { useChefThread, useThreadId } from "../hooks/useChefThread";
import type { ChefBlock, ChefInput, ChefMessage } from "../types";

export default function ChefPage() {
      const [params, setParams] = useSearchParams();
      const recipeId = params.get("receta");
      const prompt = params.get("mensaje");
      const { threadId, error: threadError } = useThreadId(recipeId);
      const { history, messages, send, sendText, feedback } = useChefThread(threadId);
      useRememberShape<ChefShape>("chef", history.data ? { empty: messages.length === 0 } : null);
      const [draft, setDraft] = useState("");
      const end = useRef<HTMLDivElement>(null);

      // A prompt in the URL (nudges, «Pedirle una receta») fills the box; the user decides to send it.
      useEffect(() => {
            if (!prompt) return;
            setDraft(prompt);
            setParams(recipeId ? { receta: recipeId } : {}, { replace: true });
      }, [prompt, recipeId, setParams]);

      const last = messages.at(-1);
      useEffect(() => {
            end.current?.scrollIntoView({ block: "end" });
      }, [last?.id, last?.blocks.length]);

      const submit = (event: FormEvent) => {
            event.preventDefault();
            const text = draft.trim();
            if (!text || send.isPending || !threadId) return;
            setDraft("");
            send.mutate({ type: "text", text, via: "keyboard" }, { onError: () => setDraft((current) => current || text) });
      };

      return (
            <>
                  <PageHeader
                        title="Tu chef"
                        subtitle={recipeId ? "Sobre esta receta" : undefined}
                        backTo={recipeId ? `/recetas/${recipeId}` : undefined}
                        actions={
                              <RoundButton to="/ajustes" label="Ajustes de tu chef">
                                    <Icon name="sliders" />
                              </RoundButton>
                        }
                  />
                  <main className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-3 pb-24">
                        {threadError ? (
                              <ErrorState message={threadError.message} />
                        ) : history.isPending ? (
                              <ChefBubbles />
                        ) : history.isError ? (
                              <ErrorState message={history.error.message} onRetry={() => history.refetch()} />
                        ) : (
                              <>
                                    {history.hasNextPage && (
                                          <Button variant="tertiary" loading={history.isFetchingNextPage} onClick={() => history.fetchNextPage()} className="self-center">
                                                Ver mensajes anteriores
                                          </Button>
                                    )}
                                    {messages.length === 0 && (
                                          <div className="flex items-center gap-3 rounded-card bg-card p-4 shadow-soft">
                                                <MascotAvatar tone="blush" className="size-14" />
                                                <p className="text-ink">¡Hola! Pídeme una idea, pregúntame por un ingrediente o cuéntame qué se te antoja.</p>
                                          </div>
                                    )}
                                    <ol aria-label="Conversación" aria-live="polite" className={`flex flex-col justify-end gap-4 ${messages.length ? "min-h-[calc(100dvh-13rem)]" : ""}`}>
                                          {messages.map((message) => (
                                                <MessageRow
                                                      key={message.id}
                                                      message={message}
                                                      // Old quick replies and prompts are history, not buttons.
                                                      interactive={message.id === last?.id && !send.isPending}
                                                      waiting={send.isPending && message.id === last?.id}
                                                      onSend={(input) => send.mutate(input)}
                                                      onRate={(blockId, rating) => feedback.mutate({ messageId: message.id, blockId, rating })}
                                                />
                                          ))}
                                    </ol>
                                    {send.isPending && last?.role === "user" && (
                                          <p role="status" className="text-sm font-semibold text-ink-muted">
                                                Tu chef está pensando…
                                          </p>
                                    )}
                                    {(send.error ?? feedback.error) && <FormAlert>{(send.error ?? feedback.error)!.message}</FormAlert>}
                              </>
                        )}
                        <div ref={end} />
                  </main>

                  <form onSubmit={submit} className="fixed inset-x-4 bottom-24 z-10 mx-auto flex max-w-xl gap-2 rounded-full bg-card p-1.5 shadow-[0_12px_32px_-12px_rgb(29_9_44/0.35)]">
                        <label className="min-w-0 flex-1">
                              <span className="sr-only">Mensaje para tu chef</span>
                              <input value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={1000} placeholder="Escríbele a tu chef…" className={`${fieldClass("card")} min-h-11 rounded-full px-4`} />
                        </label>
                        <button
                              type="submit"
                              aria-label="Enviar"
                              disabled={!draft.trim() || send.isPending || !threadId}
                              className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:opacity-60"
                        >
                              <Icon name="send" className="size-5" />
                        </button>
                  </form>
            </>
      );
}

type MessageRowProps = {
      message: ChefMessage;
      interactive: boolean;
      waiting: boolean;
      onSend: (input: ChefInput) => void;
      onRate: (blockId: string, rating: "up" | "down") => void;
};

function MessageRow({ message, interactive, waiting, onSend, onRate }: MessageRowProps) {
      if (message.role === "user") {
            const text = message.blocks.map((b) => (b.type === "text" ? b.text : "")).join(" ");
            return <li className="max-w-[85%] self-end rounded-card rounded-br-md bg-plum px-4 py-3 whitespace-pre-wrap text-card">{text}</li>;
      }
      return (
            <li className="flex flex-col gap-3">
                  {message.blocks.map((block) => (
                        <Block key={block.id} block={block} message={message} interactive={interactive} onSend={onSend} onRate={onRate} />
                  ))}
                  {waiting && message.blocks.length === 0 && (
                        <p role="status" className="text-sm font-semibold text-ink-muted">
                              Tu chef está pensando…
                        </p>
                  )}
            </li>
      );
}

const pill = "min-h-11 rounded-full bg-primary-soft px-4 text-sm font-bold text-rose-ink hover:bg-rose-soft/70 focus-visible:outline-2 focus-visible:outline-primary-strong disabled:opacity-60";

function Block({ block, message, interactive, onSend, onRate }: { block: ChefBlock } & Omit<MessageRowProps, "waiting">) {
      const { adapt } = useRecipeActions();
      const [rated, setRated] = useState<"up" | "down" | null>(null);

      switch (block.type) {
            case "text":
                  return (
                        <div className="max-w-[92%] self-start rounded-card rounded-tl-md bg-card px-4 py-3 text-ink shadow-soft">
                              <ChefMarkdown>{block.text}</ChefMarkdown>
                        </div>
                  );
            case "recipeCard":
                  return <ChefRecipe recipe={block.recipe} actions={block.actions} />;
            case "quickReplies":
            case "suggestedPrompts": {
                  if (!interactive) return null;
                  const type = block.type === "quickReplies" ? "quickReply" : "suggestedPrompt";
                  return (
                        <div className="flex flex-wrap gap-2">
                              {block.options.map((o) => (
                                    <button key={o.id} type="button" onClick={() => onSend({ type: "action", action: { type, messageId: message.id, optionId: o.id } })} className={pill}>
                                          {o.label}
                                    </button>
                              ))}
                        </div>
                  );
            }
            case "feedbackPrompt":
                  return (
                        <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-semibold text-ink-muted">{block.label}</span>
                              {(["up", "down"] as const).map((rating) => (
                                    <button
                                          key={rating}
                                          type="button"
                                          aria-pressed={rated === rating}
                                          aria-label={rating === "up" ? "Me gusta la idea" : "No me gusta la idea"}
                                          onClick={() => {
                                                setRated(rating);
                                                onRate(block.targetBlockId, rating);
                                          }}
                                          className={`grid size-11 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-primary-strong ${rated === rating ? "bg-ink text-card" : "bg-card text-ink shadow-soft"}`}
                                    >
                                          <Icon name={rating === "up" ? "thumbUp" : "thumbDown"} className="size-5" />
                                    </button>
                              ))}
                              {block.allowAnotherIdea && interactive && (
                                    <button type="button" onClick={() => onSend({ type: "action", action: { type: "anotherIdea", messageId: message.id, blockId: block.targetBlockId } })} className={pill}>
                                          Otra idea
                                    </button>
                              )}
                        </div>
                  );
            case "learnedInsight":
                  return (
                        <p className="flex items-center gap-2 self-start rounded-full bg-lilac-soft px-4 py-2 text-sm font-bold text-lilac-ink">
                              <Icon name="sparkle" className="size-4" />
                              {block.text}
                        </p>
                  );
            case "adaptationProposal":
                  return (
                        <section aria-label="Propuesta de tu chef" className="flex flex-col gap-2 rounded-card bg-mint-soft p-4 text-sm text-mint-ink">
                              <p className="font-extrabold">{block.summary}</p>
                              <ul className="list-disc pl-5">
                                    {block.changes.map((change) => (
                                          <li key={change}>{change}</li>
                                    ))}
                              </ul>
                              {adapt.isSuccess ? (
                                    <Link to={`/recetas/${block.recipeId}`} className="font-bold underline underline-offset-4">
                                          Aplicada. Ver la receta
                                    </Link>
                              ) : (
                                    <Button variant="secondary" loading={adapt.isPending} onClick={() => adapt.mutate({ recipeId: block.recipeId, proposalId: block.proposalId })}>
                                          Aplicar
                                    </Button>
                              )}
                              {adapt.error && <p className="font-semibold text-error">{adapt.error.message}</p>}
                        </section>
                  );
      }
}

function ChefRecipe({ recipe, actions }: { recipe: RecipeCard; actions: ("save" | "addToShoppingList" | "cook")[] }) {
      const { save } = useRecipeActions();
      const { addRecipe } = useShoppingMutations();
      const queryClient = useQueryClient();
      const cook = useMutation({ mutationFn: cookApi.start, onSuccess: (session) => queryClient.setQueryData(["cookingSession", session.id], session) });
      const saved = save.isSuccess ? save.variables.on : recipe.isSaved;
      const activeId = cook.data?.id ?? (cook.error instanceof ApiError && cook.error.code === "SESSION_ALREADY_ACTIVE" ? String(cook.error.details.sessionId) : null);
      const error = save.error ?? addRecipe.error ?? (activeId ? null : cook.error);

      return (
            <article className="overflow-hidden rounded-card bg-card shadow-soft">
                  <Link to={`/recetas/${recipe.id}`} className="block focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-strong">
                        <span className="block h-40">
                              <Photo url={recipe.imageUrl} width={800} height={320} className="size-full object-cover" fallback={<DishCover seed={recipe.id} className="size-full" />} />
                        </span>
                        <span className="block p-4">
                              <span className="block font-display text-title font-extrabold text-ink">{recipe.title}</span>
                              <span className="block text-sm font-semibold text-ink-muted">
                                    {[formatTime(recipe.totalTimeMinutes), `${recipe.nutritionPerServing.kcal} kcal`, `${recipe.pantryMatch.have}/${recipe.pantryMatch.total} en tu despensa`].filter(Boolean).join(" · ")}
                              </span>
                        </span>
                  </Link>
                  <div className="flex flex-wrap gap-2 px-4 pb-4">
                        {actions.includes("cook") &&
                              (activeId ? (
                                    <Link to={`/cocinar/${activeId}`} className={`${pill} content-center`}>
                                          {cook.data ? "Ir a cocinar" : "Continuar la que tienes en curso"}
                                    </Link>
                              ) : (
                                    <button type="button" disabled={cook.isPending} onClick={() => cook.mutate({ recipeId: recipe.id, servings: 2, key: newKey() })} className={pill}>
                                          Cocinar
                                    </button>
                              ))}
                        {actions.includes("save") && (
                              <button type="button" aria-pressed={saved} disabled={save.isPending} onClick={() => save.mutate({ id: recipe.id, on: !saved })} className={pill}>
                                    {saved ? "Guardada" : "Guardar"}
                              </button>
                        )}
                        {actions.includes("addToShoppingList") && (
                              <button type="button" disabled={addRecipe.isPending || addRecipe.isSuccess} onClick={() => addRecipe.mutate({ recipeId: recipe.id })} className={pill}>
                                    {addRecipe.isSuccess ? "En tu lista" : "A la lista"}
                              </button>
                        )}
                  </div>
                  {error && <p className="px-4 pb-4 text-sm font-semibold text-error">{error.message}</p>}
            </article>
      );
}
