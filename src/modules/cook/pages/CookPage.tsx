import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/modules/settings/hooks/useSettings";
import Button from "@/shared/components/ui/Button";
import Dialog from "@/shared/components/ui/Dialog";
import Icon from "@/shared/components/ui/Icon";
import { EmptyState, ErrorState } from "@/shared/components/ui/QueryState";
import RoundButton from "@/shared/components/ui/RoundButton";
import { cookApi, type CookingEvent, type CookingSession } from "../api/cook.api";
import { useRememberShape } from "@/shared/hooks/useShape";
import CookSkeleton, { type CookShape } from "../components/CookSkeleton";
import CookFinish from "../components/CookFinish";
import { useTimer } from "../hooks/useTimer";

const FLUSH_MS = 5000;

export default function CookPage() {
      const { id = "" } = useParams();
      const session = useQuery({ queryKey: ["cookingSession", id], queryFn: () => cookApi.session(id), staleTime: Infinity });

      return (
            <div className="min-h-dvh bg-canvas">
                  {session.isPending ? (
                        <CookSkeleton />
                  ) : session.isError ? (
                        <main className="mx-auto max-w-xl px-5 pt-12">
                              <ErrorState message={session.error.message} onRetry={() => session.refetch()} />
                        </main>
                  ) : session.data.status !== "active" || session.data.steps.length === 0 ? (
                        <main className="mx-auto max-w-xl px-5 pt-12">
                              <EmptyState icon="check" title="Esta receta ya terminó" description="Puedes empezarla de nuevo desde su página." />
                        </main>
                  ) : (
                        <Cooking key={session.data.id} session={session.data} />
                  )}
            </div>
      );
}

/** Events go in batches; a failed batch stays queued. */
function useEventQueue(sessionId: string) {
      const queue = useRef<CookingEvent[]>([]);
      const sending = useRef(false);
      const flush = async () => {
            if (sending.current || queue.current.length === 0) return;
            sending.current = true;
            const batch = queue.current.slice(0, 100);
            try {
                  await cookApi.events({ id: sessionId, events: batch });
                  queue.current = queue.current.slice(batch.length);
            } catch {
                  // Offline in the kitchen is normal: try again on the next tick.
            } finally {
                  sending.current = false;
            }
      };
      const latest = useRef(flush);
      latest.current = flush;
      useEffect(() => {
            const id = setInterval(() => void latest.current(), FLUSH_MS);
            return () => {
                  clearInterval(id);
                  void latest.current();
            };
      }, []);
      return { push: (event: CookingEvent) => void queue.current.push(event), flush };
}

function useWakeLock() {
      useEffect(() => {
            let lock: WakeLockSentinel | null = null;
            let gone = false;
            const ask = async () => {
                  if (document.visibilityState !== "visible") return;
                  lock = (await navigator.wakeLock?.request("screen").catch(() => null)) ?? null;
                  if (gone) void lock?.release();
            };
            void ask();
            document.addEventListener("visibilitychange", ask);
            return () => {
                  gone = true;
                  document.removeEventListener("visibilitychange", ask);
                  void lock?.release();
            };
      }, []);
}

function Cooking({ session }: { session: CookingSession }) {
      const navigate = useNavigate();
      const queryClient = useQueryClient();
      const settings = useSettings();
      const [stepIndex, setStepIndex] = useState(Math.min(session.currentStepIndex, session.steps.length - 1));
      const [finishing, setFinishing] = useState(false);
      const [leaving, setLeaving] = useState(false);
      const [speechOn, setSpeechOn] = useState<boolean | null>(null);
      const { push, flush } = useEventQueue(session.id);
      useWakeLock();

      const step = session.steps[stepIndex]!;
      const speak = speechOn ?? settings.data?.chef.readStepsAloud ?? false;
      useRememberShape<CookShape>("cook", { ingredients: step.ingredients.length });
      const isLast = stepIndex === session.steps.length - 1;

      useEffect(() => {
            if (!("speechSynthesis" in window)) return;
            speechSynthesis.cancel();
            if (!speak || finishing) return;
            const words = new SpeechSynthesisUtterance([step.title, ...step.subSteps.map((s) => s.text)].join(". "));
            words.lang = "es-CO";
            speechSynthesis.speak(words);
            return () => speechSynthesis.cancel();
      }, [speak, step, finishing]);

      const go = (next: number) => {
            setStepIndex(next);
            push({ type: "stepEntered", stepIndex: next, at: new Date().toISOString() });
            window.scrollTo({ top: 0 });
      };

      const abandon = useMutation({
            mutationFn: () => cookApi.abandon({ id: session.id, atStepIndex: stepIndex }),
            onSuccess: () => {
                  void queryClient.invalidateQueries({ queryKey: ["home"] });
                  queryClient.removeQueries({ queryKey: ["cookingSession", session.id] });
                  navigate(`/recetas/${session.recipe.id}`, { replace: true });
            },
      });
      /** Leaves it active, to continue from Inicio. */
      const pause = async () => {
            await flush();
            queryClient.removeQueries({ queryKey: ["cookingSession", session.id] });
            void queryClient.invalidateQueries({ queryKey: ["home"] });
            navigate("/", { replace: true });
      };

      if (finishing) return <CookFinish session={session} onBack={() => setFinishing(false)} />;

      return (
            <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-5 px-5 pt-5 pb-32">
                  <header className="flex items-center gap-3">
                        <RoundButton label="Salir" onClick={() => setLeaving(true)}>
                              <Icon name="close" />
                        </RoundButton>
                        <p className="min-w-0 flex-1 truncate font-display text-title font-extrabold text-ink">{session.recipe.title}</p>
                        {"speechSynthesis" in window && (
                              <label className="flex min-h-11 items-center gap-2 text-sm font-bold text-ink">
                                    Leer
                                    <input type="checkbox" checked={speak} onChange={(e) => setSpeechOn(e.target.checked)} className="size-6 accent-primary-strong" />
                              </label>
                        )}
                  </header>
                  <div role="progressbar" aria-label="Avance" aria-valuemin={1} aria-valuemax={session.steps.length} aria-valuenow={stepIndex + 1} className="flex gap-1">
                        {session.steps.map((s) => (
                              <span key={s.index} className={`h-1.5 flex-1 rounded-full ${s.index <= stepIndex ? "bg-brand" : "bg-line"}`} />
                        ))}
                  </div>

                  <section aria-live="polite">
                        <p className="text-sm font-bold text-ink-muted">
                              Paso {stepIndex + 1} de {session.steps.length}
                        </p>
                        <h1 className="mt-1 text-page leading-tight font-extrabold text-ink">{step.title}</h1>
                        <ul className="mt-3 flex flex-wrap gap-2 text-sm font-extrabold">
                              {step.heat.level > 0 && (
                                    <li className="inline-flex items-center gap-1 rounded-full bg-peach-soft px-3 py-1.5 text-peach-ink">
                                          <Icon name="flame" className="size-4" />
                                          Fuego {step.heat.label.toLowerCase()}
                                    </li>
                              )}
                              {step.equipment && <li className="rounded-full bg-card px-3 py-1.5 text-ink">{step.equipment}</li>}
                        </ul>
                  </section>

                  {step.ingredients.length > 0 && (
                        <ul aria-label="Ingredientes de este paso" className="divide-y divide-line rounded-card bg-card px-4 shadow-soft">
                              {step.ingredients.map((i, index) => (
                                    <li key={index} className="flex items-baseline justify-between gap-3 py-2 text-ink">
                                          <span>
                                                <strong>{i.label}</strong>
                                                {i.prep && <span className="text-ink-muted">, {i.prep}</span>}
                                          </span>
                                          <span className="shrink-0 font-bold">{i.quantity.display}</span>
                                    </li>
                              ))}
                        </ul>
                  )}

                  <ol className="flex flex-col gap-3">
                        {step.subSteps.map((sub) => (
                              <li key={`${step.index}-${sub.index}`} className="flex flex-col gap-3 rounded-card bg-card p-4 shadow-soft">
                                    {sub.heatChange && (
                                          <p className="inline-flex items-center gap-2 self-start rounded-full bg-tomato px-3 py-1.5 text-sm font-extrabold text-card">
                                                <Icon name="flame" className="size-4" />
                                                {sub.heatChange.message}
                                          </p>
                                    )}
                                    <p className="text-title leading-relaxed text-ink">{sub.text}</p>
                                    {sub.timerSeconds ? <Timer seconds={sub.timerSeconds} label={sub.shortLabel} onEvent={(e) => push({ ...e, stepIndex: step.index, subStepIndex: sub.index, at: new Date().toISOString() })} /> : null}
                              </li>
                        ))}
                  </ol>
                  {step.doneWhen && (
                        <p className="rounded-control bg-mint-soft p-4 text-mint-ink">
                              <strong>Listo cuando</strong> {step.doneWhen}
                        </p>
                  )}

                  <div className="fixed inset-x-0 bottom-0 mx-auto grid max-w-xl grid-cols-2 gap-3 bg-canvas/95 px-5 pt-3 pb-6 backdrop-blur">
                        <Button variant="soft" size="lg" disabled={stepIndex === 0} onClick={() => go(stepIndex - 1)}>
                              Atrás
                        </Button>
                        <Button
                              size="lg"
                              onClick={() => {
                                    if (!isLast) return go(stepIndex + 1);
                                    void flush();
                                    setFinishing(true);
                              }}
                        >
                              {isLast ? "Terminar" : "Siguiente"}
                        </Button>
                  </div>

                  <Dialog
                        open={leaving}
                        onClose={() => setLeaving(false)}
                        title="¿Sales de la cocina?"
                        actions={
                              <>
                                    <Button variant="soft" loading={abandon.isPending} onClick={() => abandon.mutate()}>
                                          Cancelar receta
                                    </Button>
                                    <Button onClick={pause}>Seguir después</Button>
                              </>
                        }
                  >
                        <p className="text-ink-muted">Si sigues después, la encuentras en Inicio justo en este paso.</p>
                        {abandon.error && <p className="mt-2 text-sm font-semibold text-error">{abandon.error.message}</p>}
                  </Dialog>
            </main>
      );
}

type TimerEvent = { type: "timerPaused" | "timerResumed" } | { type: "timerExtended"; addedSeconds: number };

function Timer({ seconds, label, onEvent }: { seconds: number; label: string; onEvent: (event: TimerEvent) => void }) {
      const [ended, setEnded] = useState(false);
      const started = useRef(false);
      const timer = useTimer(seconds, () => {
            setEnded(true);
            navigator.vibrate?.([300, 150, 300]);
      });
      const clock = `${String(Math.floor(timer.left / 60)).padStart(2, "0")}:${String(timer.left % 60).padStart(2, "0")}`;

      return (
            <div className={`flex flex-wrap items-center gap-3 rounded-control p-3 ${ended && !timer.running ? "bg-mustard-soft" : "bg-field"}`}>
                  <span role="timer" aria-label={`Temporizador: ${label}`} className="font-display text-section font-extrabold text-ink tabular-nums">
                        {clock}
                  </span>
                  <span className="flex flex-1 justify-end gap-2">
                        <Button
                              variant="secondary"
                              onClick={() => {
                                    if (timer.running) {
                                          timer.pause();
                                          onEvent({ type: "timerPaused" });
                                          return;
                                    }
                                    setEnded(false);
                                    // The first start is not a resume.
                                    if (started.current) onEvent({ type: "timerResumed" });
                                    started.current = true;
                                    timer.start();
                              }}
                        >
                              {timer.running ? "Pausar" : "Iniciar"}
                        </Button>
                        <Button
                              variant="secondary"
                              onClick={() => {
                                    timer.extend(60);
                                    onEvent({ type: "timerExtended", addedSeconds: 60 });
                              }}
                        >
                              +1 min
                        </Button>
                  </span>
                  {ended && !timer.running && (
                        <p role="alert" className="w-full text-sm font-extrabold text-mustard-ink">
                              ¡Tiempo!
                        </p>
                  )}
            </div>
      );
}
