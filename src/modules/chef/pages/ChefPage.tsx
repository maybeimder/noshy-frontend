import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cookApi } from "@/modules/cook/api/cook.api";
import { useRecipeActions } from "@/modules/recipes/hooks/useRecipes";
import { useShoppingMutations } from "@/modules/shopping-list/hooks/useShoppingList";
import Button, { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import DishCover from "@/shared/components/ui/DishArt";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import MacroTiles from "@/shared/components/ui/MacroTiles";
import { BrandRing, MascotAvatar } from "@/shared/components/ui/MascotBubble";
import { MarkerText } from "@/shared/components/ui/ScribbleText";
import Photo from "@/shared/components/ui/Photo";
import { ErrorState } from "@/shared/components/ui/QueryState";
import RoundButton from "@/shared/components/ui/RoundButton";
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
      const [via, setVia] = useState<"keyboard" | "voice">("keyboard");
      const end = useRef<HTMLDivElement>(null);
      const navigate = useNavigate();
      const dictation = useDictation((text) => {
            setDraft(text);
            setVia("voice");
      });

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
            setVia("keyboard");
            send.mutate({ type: "text", text, via }, { onError: () => setDraft((current) => current || text) });
      };

      return (
            <>
                  <header className="sticky top-0 z-10 mx-auto flex max-w-xl items-center gap-3 bg-canvas/90 px-5 pt-6 pb-3 backdrop-blur">
                        {recipeId && (
                              <RoundButton label="Volver a la receta" onClick={() => navigate(`/recetas/${recipeId}`)}>
                                    <Icon name="back" />
                              </RoundButton>
                        )}
                        <BrandRing className="size-14">
                              <MascotAvatar tone="white" className="size-full" />
                        </BrandRing>
                        <div className="min-w-0 flex-1">
                              <h1 className="text-[1.75rem] leading-tight font-extrabold text-ink">
                                    <MarkerText>Tu chef</MarkerText>
                              </h1>
                              <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-ink-muted">
                                    <span aria-hidden className="size-2 shrink-0 rounded-full bg-online" />
                                    {recipeId ? "Hablando de esta receta" : "Conoce tu despensa y tus metas"}
                              </p>
                        </div>
                        <Link
                              to="/ajustes"
                              aria-label="Ajustes de tu chef"
                              className="grid size-12 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-strong hover:bg-rose-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                        >
                              <Icon name="sliders" />
                        </Link>
                  </header>
                  <main className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-3 pb-44">
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

                  <form
                        onSubmit={submit}
                        className="fixed inset-x-4 bottom-24 z-10 mx-auto flex max-w-xl items-center gap-1 rounded-full border-2 border-line bg-card p-1 pl-4 shadow-[0_12px_32px_-12px_rgb(29_9_44/0.35)] focus-within:border-primary/50"
                  >
                        <label className="min-w-0 flex-1">
                              <span className="sr-only">Mensaje para tu chef</span>
                              <input
                                    value={draft}
                                    onChange={(e) => {
                                          setDraft(e.target.value);
                                          setVia("keyboard");
                                    }}
                                    maxLength={1000}
                                    placeholder={dictation.listening ? "Te escucho…" : "Pregúntale al chef…"}
                                    className="min-h-11 w-full bg-transparent text-base text-ink placeholder:text-ink-muted/70 focus-visible:outline-none"
                              />
                        </label>
                        {dictation.available && (
                              <button
                                    type="button"
                                    aria-label={dictation.listening ? "Dejar de dictar" : "Dictar mensaje"}
                                    aria-pressed={dictation.listening}
                                    onClick={dictation.toggle}
                                    className={`grid size-11 shrink-0 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-primary-strong ${dictation.listening ? "bg-primary-soft text-primary-strong" : "text-ink-muted hover:text-ink"}`}
                              >
                                    <Icon name="mic" className={`size-5 ${dictation.listening ? "animate-pulse" : ""}`} />
                              </button>
                        )}
                        <button
                              type="submit"
                              aria-label="Enviar"
                              disabled={!draft.trim() || send.isPending || !threadId}
                              className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-card shadow-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:opacity-60"
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
            return <li className="max-w-[85%] self-end rounded-card rounded-br-md bg-brand px-4 py-3 font-bold whitespace-pre-wrap text-card shadow-brand">{text}</li>;
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
/** Quick replies rotate through soft tones, like stickers on the counter. */
const replyTones = ["bg-mint-soft text-mint-ink", "bg-peach-soft text-peach-ink", "border-2 border-line bg-card text-ink"];

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
                              {block.options.map((o, index) => (
                                    <button
                                          key={o.id}
                                          type="button"
                                          onClick={() => onSend({ type: "action", action: { type, messageId: message.id, optionId: o.id } })}
                                          className={`min-h-11 rounded-full px-4 text-sm font-extrabold focus-visible:outline-2 focus-visible:outline-primary-strong ${replyTones[index % replyTones.length]}`}
                                    >
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
                                          className={`grid size-11 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-primary-strong ${rated === rating ? "bg-primary-strong text-card" : "bg-card text-ink shadow-soft"}`}
                                    >
                                          <Icon name={rating === "up" ? "thumbUp" : "thumbDown"} className="size-5" />
                                    </button>
                              ))}
                              {block.allowAnotherIdea && interactive && (
                                    <button
                                          type="button"
                                          onClick={() => onSend({ type: "action", action: { type: "anotherIdea", messageId: message.id, blockId: block.targetBlockId } })}
                                          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-primary/40 px-4 text-sm font-extrabold text-primary-strong hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-primary-strong"
                                    >
                                          <Icon name="refresh" className="size-4" strokeWidth={2.25} />
                                          Otra idea
                                    </button>
                              )}
                        </div>
                  );
            case "learnedInsight":
                  return (
                        <p className="flex items-center gap-2 self-start rounded-full border-2 border-dashed border-lilac-ink/30 bg-lilac-soft px-4 py-2 text-sm font-bold text-lilac-ink">
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

      const time = formatTime(recipe.totalTimeMinutes);
      const round =
            "grid size-12 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-strong hover:bg-rose-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:opacity-60";

      return (
            <article className="overflow-hidden rounded-card bg-card shadow-[0_16px_32px_-20px_rgb(43_20_51/0.6)]">
                  <Link to={`/recetas/${recipe.id}`} className="relative block h-44 bg-plum text-card focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-strong">
                        <span className="absolute inset-0">
                              <Photo url={recipe.imageUrl} width={800} height={352} className="size-full object-cover" fallback={<DishCover seed={recipe.id} className="size-full" />} />
                        </span>
                        <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgb(29_9_44/0.9)_100%)]" />
                        {time && (
                              <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-plum/60 px-2.5 py-1 text-xs font-extrabold backdrop-blur-md">
                                    <Icon name="clock" className="size-3.5" />
                                    {time}
                              </span>
                        )}
                        <span className="absolute right-4 bottom-3 left-4">
                              <span className="block text-xs font-bold text-secondary-soft">{[recipe.cuisine?.label, recipe.reason?.label ?? "Para ti"].filter(Boolean).join(" · ")}</span>
                              <span className="block font-display text-section leading-tight font-extrabold">{recipe.title}</span>
                        </span>
                  </Link>
                  <div className="flex flex-col gap-3 p-3">
                        <MacroTiles macros={recipe.nutritionPerServing} size="sm" />
                        <div className="flex items-center gap-2">
                              {actions.includes("save") && (
                                    <button type="button" aria-label={saved ? "Quitar de guardadas" : "Guardar"} aria-pressed={saved} disabled={save.isPending} onClick={() => save.mutate({ id: recipe.id, on: !saved })} className={round}>
                                          <Icon name="bookmark" className={`size-5 ${saved ? "fill-current" : ""}`} />
                                    </button>
                              )}
                              {actions.includes("addToShoppingList") && (
                                    <button
                                          type="button"
                                          aria-label={addRecipe.isSuccess ? "Ya está en tu lista" : "Agregar a la lista de compras"}
                                          disabled={addRecipe.isPending || addRecipe.isSuccess}
                                          onClick={() => addRecipe.mutate({ recipeId: recipe.id })}
                                          className={round}
                                    >
                                          <Icon name={addRecipe.isSuccess ? "check" : "receipt"} className="size-5" />
                                    </button>
                              )}
                              {actions.includes("cook") &&
                                    (activeId ? (
                                          <Link to={`/cocinar/${activeId}`} className={`${buttonBase} ${buttonVariants.primary} min-h-12 flex-1 text-sm`}>
                                                {cook.data ? "Ir a cocinar" : "Continuar la que tienes"}
                                          </Link>
                                    ) : (
                                          <Button className="min-h-12 flex-1" loading={cook.isPending} onClick={() => cook.mutate({ recipeId: recipe.id, servings: 2, key: newKey() })}>
                                                <Icon name="chef" className="size-5" />
                                                Cocinar
                                          </Button>
                                    ))}
                        </div>
                  </div>
                  {error && <p className="px-4 pb-4 text-sm font-semibold text-error">{error.message}</p>}
            </article>
      );
}

type Recognizer = { lang: string; interimResults: boolean; start: () => void; stop: () => void; onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null; onend: (() => void) | null };
const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: new () => Recognizer }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => Recognizer }).webkitSpeechRecognition;

/** Voice to text on the device (contract: no audio goes to the API); the result lands in the box. */
function useDictation(onText: (text: string) => void) {
      const [listening, setListening] = useState(false);
      const rec = useRef<Recognizer | null>(null);
      const latest = useRef(onText);
      latest.current = onText;
      useEffect(() => () => rec.current?.stop(), []);
      return {
            available: Boolean(SpeechRecognition),
            listening,
            toggle: () => {
                  if (!SpeechRecognition) return;
                  if (listening) return rec.current?.stop();
                  const r = new SpeechRecognition();
                  r.lang = "es-CO";
                  r.interimResults = true;
                  r.onresult = (e) => latest.current(Array.from(e.results, (result) => result[0]?.transcript ?? "").join(""));
                  r.onend = () => setListening(false);
                  rec.current = r;
                  setListening(true);
                  r.start();
            },
      };
}
