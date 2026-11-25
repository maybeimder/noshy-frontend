import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cookApi } from "@/modules/cook/api/cook.api";
import { useRecipeActions } from "@/modules/recipes/hooks/useRecipes";
import { useShoppingMutations } from "@/modules/shopping-list/hooks/useShoppingList";
import Button, { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import { DishPlate } from "@/shared/components/ui/DishArt";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import MacroTiles from "@/shared/components/ui/MacroTiles";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";
import Photo from "@/shared/components/ui/Photo";
import { ErrorState } from "@/shared/components/ui/QueryState";
import { ApiError, newKey } from "@/shared/lib/axios";
import { formatTime, localDay, relativeDay, formatDate } from "@/shared/lib/format";
import type { RecipeCard } from "@/shared/types/api";
import { useRememberShape } from "@/shared/hooks/useShape";
import { useStickToEnd } from "@/shared/hooks/useStickToEnd";
import ChefCounter from "../components/ChefCounter";
import ChefHeader from "../components/ChefHeader";
import ChefMarkdown from "../components/ChefMarkdown";
import ChefThinking from "../components/ChefThinking";
import Composer from "../components/Composer";
import { ChefBubbles, type ChefShape } from "../components/ChefSkeleton";
import { useChefThread, useThreadId } from "../hooks/useChefThread";
import type { ChefBlock, ChefInput, ChefMessage } from "../types";

/** One line. */
const COMPOSER_HEIGHT = 68;

export default function ChefPage() {
      const [params, setParams] = useSearchParams();
      const recipeId = params.get("receta");
      const prompt = params.get("mensaje");
      const { threadId, error: threadError } = useThreadId(recipeId);
      const { history, messages, send, sendText, feedback } = useChefThread(threadId);
      useRememberShape<ChefShape>("chef", history.data ? { empty: messages.length === 0 } : null);
      const [draft, setDraft] = useState("");
      const [composer, setComposer] = useState(COMPOSER_HEIGHT);
      const [via, setVia] = useState<"keyboard" | "voice">("keyboard");
      const conversation = useRef<HTMLElement>(null);
      const { toEnd, release } = useStickToEnd(conversation);
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
      // Until the first block of the reply arrives; an empty chef message takes no space of its own.
      const thinking = send.isPending && last !== undefined && (last.role === "user" || last.blocks.length === 0);
      const sendInput = (input: ChefInput, options?: Parameters<typeof send.mutate>[1]) => {
            send.mutate(input, options);
            toEnd();
      };

      const submit = () => {
            const text = draft.trim();
            if (!text || send.isPending || !threadId) return;
            setDraft("");
            setVia("keyboard");
            sendInput({ type: "text", text, via }, { onError: () => setDraft((current) => current || text) });
      };

      return (
            <>
                  <ChefHeader recipeId={recipeId} />
                  {/* AppShell already clears the navigation; this also clears the message box above it. */}
                  <main ref={conversation} className="mx-auto flex max-w-xl flex-col gap-6 px-5 pt-3 pb-14">
                        {threadError ? (
                              <ErrorState message={threadError.message} />
                        ) : history.isPending ? (
                              <ChefBubbles />
                        ) : history.isError ? (
                              <ErrorState message={history.error.message} onRetry={() => history.refetch()} />
                        ) : (
                              <>
                                    {history.hasNextPage && (
                                          <Button variant="tertiary" loading={history.isFetchingNextPage} onClick={() => {
                                                      release();
                                                      history.fetchNextPage();
                                                }} className="self-center">
                                                Ver mensajes anteriores
                                          </Button>
                                    )}
                                    {/* The start of the conversation: it stays there, so the first message does not move anything. */}
                                    {!history.hasNextPage && (
                                          <ChefCounter forRecipe={recipeId !== null} disabled={send.isPending || !threadId} onOrder={(text) => sendInput({ type: "text", text, via: "keyboard" })} />
                                    )}
                                    <ol aria-label="Conversación" aria-live="polite" className="flex flex-col gap-6 empty:hidden">
                                          {messages.map((message, index) => (
                                                <MessageRow
                                                      key={message.clientMessageId ?? message.id}
                                                      message={message}
                                                      day={dayOf(message) !== dayOf(messages[index - 1]) ? dayLabel(message) : null}
                                                      // Old quick replies and prompts are history, not buttons.
                                                      interactive={message.id === last?.id && !send.isPending}
                                                      onSend={sendInput}
                                                      onRate={(blockId, rating) => feedback.mutate({ messageId: message.id, blockId, rating })}
                                                />
                                          ))}
                                    </ol>
                                    {thinking && <ChefThinking />}
                                    {(send.error ?? feedback.error) && <FormAlert>{(send.error ?? feedback.error)!.message}</FormAlert>}
                              </>
                        )}
                        {/* Room for the ticket as it grows past one line. */}
                        {composer > COMPOSER_HEIGHT && <div aria-hidden style={{ height: composer - COMPOSER_HEIGHT }} />}
                  </main>

                  {/* The page fades out behind the ticket and the navigation. */}
                  <div aria-hidden className="pointer-events-none fixed inset-x-0 bottom-0 z-[5] h-44 bg-[linear-gradient(0deg,var(--color-canvas)_62%,transparent)]" />
                  <Composer
                        value={draft}
                        onChange={(text) => {
                              setDraft(text);
                              setVia("keyboard");
                        }}
                        onSubmit={submit}
                        canSend={Boolean(draft.trim()) && !send.isPending && Boolean(threadId)}
                        placeholder={dictation.listening ? "Te escucho…" : recipeId ? "Pregunta por esta receta" : "¿Qué se te antoja?"}
                        dictation={dictation}
                        onHeight={setComposer}
                  />
            </>
      );
}

const clock = new Intl.DateTimeFormat("es", { hour: "numeric", minute: "2-digit" });
const dayOf = (message: ChefMessage | undefined) => (message ? localDay(new Date(message.createdAt)) : null);
/** «Hoy», «Ayer», then the date. */
function dayLabel(message: ChefMessage) {
      const day = dayOf(message)!;
      const ago = (Date.now() - new Date(`${day}T00:00:00`).getTime()) / 86_400_000;
      const label = ago < 2 ? relativeDay(day) : formatDate(message.createdAt);
      return label.charAt(0).toUpperCase() + label.slice(1);
}

type MessageRowProps = {
      message: ChefMessage;
      interactive: boolean;
      /** Over the first message of each day. */
      day: string | null;
      onSend: (input: ChefInput) => void;
      onRate: (blockId: string, rating: "up" | "down") => void;
};

// What the user asks is an order ticket; the chef answers on the page itself, and recipes come out as plates.
function MessageRow({ message, interactive, day, onSend, onRate }: MessageRowProps) {
      if (message.role === "chef" && message.blocks.length === 0) return null;
      const divider = day && <p className="self-center rounded-full bg-card/70 px-3 py-1 text-xs font-bold text-ink-muted">{day}</p>;
      if (message.role === "user") {
            const text = message.blocks.map((b) => (b.type === "text" ? b.text : "")).join(" ");
            return (
                  <li className="flex flex-col gap-6">
                        {divider}
                        <div className="msg-in max-w-[85%] min-w-40 origin-bottom-right rotate-[0.6deg] self-end [filter:drop-shadow(0_8px_14px_rgb(46_19_45/0.13))]">
                              <div className="rounded-t-[1.125rem] bg-card ticket-bottom px-4 pt-3 pb-5">
                                    <p className="flex items-center justify-between gap-4 border-b-2 border-dashed border-line pb-2 text-xs font-bold text-primary-strong">
                                          <span className="flex items-center gap-1.5">
                                                <Icon name="receipt" className="size-3.5" strokeWidth={2.25} />
                                                Tu pedido
                                          </span>
                                          <time dateTime={message.createdAt} className="font-semibold text-ink-muted tabular-nums">
                                                {clock.format(new Date(message.createdAt))}
                                          </time>
                                    </p>
                                    <p className="pt-2.5 font-display text-[1.0625rem] leading-snug font-medium [overflow-wrap:anywhere] whitespace-pre-wrap text-ink">{text}</p>
                              </div>
                        </div>
                  </li>
            );
      }
      return (
            <li className="flex min-w-0 flex-col gap-4">
                  {divider}
                  {message.blocks.map((block, index) => (
                        <div key={block.id} className={index === 0 && block.type === "text" ? "flex items-start gap-3" : "contents"}>
                              {index === 0 && block.type === "text" && <MascotAvatar tone="blush" className="size-9" />}
                              <Block block={block} message={message} interactive={interactive} onSend={onSend} onRate={onRate} />
                        </div>
                  ))}
            </li>
      );
}


function Block({ block, message, interactive, onSend, onRate }: { block: ChefBlock } & Omit<MessageRowProps, "day">) {
      const { adapt } = useRecipeActions();
      const [rated, setRated] = useState<"up" | "down" | null>(null);

      switch (block.type) {
            case "text":
                  return (
                        <div className="msg-in min-w-0 flex-1 pt-1 text-[1.0625rem] leading-relaxed text-ink">
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
                                    <button
                                          key={o.id}
                                          type="button"
                                          onClick={() => onSend({ type: "action", action: { type, messageId: message.id, optionId: o.id } })}
                                          className="min-h-11 rounded-full border-2 border-primary/35 bg-card/60 px-4 text-sm font-bold text-primary-strong transition-colors hover:border-primary hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
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

const plateRing = { "--ring-from": "var(--color-rose-soft)", "--ring-to": "var(--color-mustard-soft)" } as CSSProperties;

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
            "grid size-12 shrink-0 place-items-center rounded-full bg-blush text-primary-strong hover:brightness-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:opacity-60";

      return (
            <article className="msg-in relative mt-10 rounded-[2rem] bg-card p-4 shadow-[0_16px_32px_-18px_rgb(46_19_45/0.4)]">
                  <Link to={`/recetas/${recipe.id}`} className="flex items-end gap-3 rounded-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong">
                        {/* The plate comes out of the card, as it is served. */}
                        <span style={plateRing} className="-mt-14 -ml-1 grid size-32 shrink-0 place-items-center rounded-full bg-plate-ring p-2 shadow-[0_12px_22px_-8px_rgb(122_90_100/0.45)]">
                              <span className="block size-full overflow-hidden rounded-full border-[3px] border-card bg-card">
                                    <Photo url={recipe.imageUrl} width={280} height={280} className="size-full object-cover" fallback={<DishPlate seed={recipe.id} className="size-full" />} />
                              </span>
                        </span>
                        <span className="min-w-0 flex-1 pb-1">
                              <span className="block text-xs font-bold text-primary-strong">{recipe.reason?.label ?? recipe.cuisine?.label ?? "Para ti"}</span>
                              <span className="block font-display text-[1.375rem] leading-[1.15] font-semibold text-ink">{recipe.title}</span>
                              {time && (
                                    <span className="mt-1 flex items-center gap-1 text-sm text-ink-muted">
                                          <Icon name="timer" className="size-4" strokeWidth={2} />
                                          {time}
                                    </span>
                              )}
                        </span>
                  </Link>
                  <div className="flex flex-col gap-3 pt-4">
                        <MacroTiles macros={recipe.nutritionPerServing} estimated={recipe.nutritionEstimated} size="sm" />
                        <div className="flex items-center gap-2">
                              {actions.includes("save") && (
                                    <button type="button" aria-label={saved ? "Quitar de guardadas" : "Guardar"} aria-pressed={saved} disabled={save.isPending} onClick={() => save.mutate({ id: recipe.id, on: !saved })} className={`toggle-pop ${round}`}>
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
