import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSettings } from "@/modules/settings/hooks/useSettings";
import Button from "@/shared/components/ui/Button";
import Dialog from "@/shared/components/ui/Dialog";
import Icon from "@/shared/components/ui/Icon";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";
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

const numberWords = ["uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve", "veinte"];
const spell = (n: number) => numberWords[n - 1] ?? String(n);
const clock = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
const minutes = (s: number) => (s % 60 === 0 ? `${s / 60} min` : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} min`);
const MAX_HEAT = 9;
const heatName = (level: number) => (level === 0 ? "Sin fuego" : level <= 3 ? "Bajo" : level <= 6 ? "Medio" : "Alto");

type SpeechRecognitionLike = {
      lang: string;
      continuous: boolean;
      interimResults: boolean;
      start: () => void;
      stop: () => void;
      onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
      onend: (() => void) | null;
      onerror: ((e: { error: string }) => void) | null;
};
const Recognition = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition ??
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;

/** «Di "siguiente"»: listens on the device (no audio leaves it) for siguiente / atrás. */
function useVoiceCommands(on: boolean, commands: { next: () => void; back: () => void; fail: (message: string) => void }) {
      const latest = useRef(commands);
      latest.current = commands;
      useEffect(() => {
            if (!on || !Recognition) return;
            const rec = new Recognition();
            rec.lang = "es-CO";
            rec.continuous = true;
            rec.interimResults = false;
            let stopped = false;
            rec.onresult = (event) => {
                  const said = event.results[event.results.length - 1]?.[0]?.transcript.toLowerCase() ?? "";
                  if (said.includes("siguiente")) latest.current.next();
                  else if (said.includes("atrás") || said.includes("atras")) latest.current.back();
            };
            // Silence ends a recognition round: start the next one. A refused microphone ends it for good.
            rec.onerror = (event) => {
                  if (event.error === "not-allowed" || event.error === "service-not-allowed" || event.error === "audio-capture") {
                        stopped = true;
                        latest.current.fail(event.error === "audio-capture" ? "No encontramos un micrófono." : "Permite el micrófono para usar la voz.");
                  }
            };
            rec.onend = () => {
                  if (!stopped) rec.start();
            };
            try {
                  rec.start();
            } catch {
                  latest.current.fail("No pudimos encender el micrófono.");
            }
            return () => {
                  stopped = true;
                  rec.stop();
            };
      }, [on]);
}

function Cooking({ session }: { session: CookingSession }) {
      const navigate = useNavigate();
      const queryClient = useQueryClient();
      const settings = useSettings();
      const [stepIndex, setStepIndex] = useState(Math.min(session.currentStepIndex, session.steps.length - 1));
      const [activeSub, setActiveSub] = useState(0);
      const [heatSeen, setHeatSeen] = useState<string | null>(null);
      const [finishing, setFinishing] = useState(false);
      const [leaving, setLeaving] = useState(false);
      const [speechOn, setSpeechOn] = useState<boolean | null>(null);
      const [listening, setListening] = useState(false);
      const [voiceError, setVoiceError] = useState<string | null>(null);
      const { push, flush } = useEventQueue(session.id);
      useWakeLock();

      const step = session.steps[stepIndex]!;
      const sub = step.subSteps[Math.min(activeSub, step.subSteps.length - 1)];
      const speak = speechOn ?? settings.data?.chef.readStepsAloud ?? false;
      useRememberShape<CookShape>("cook", { ingredients: step.ingredients.length });
      const isLast = stepIndex === session.steps.length - 1;
      const heatLevel = sub?.heatLevel || step.heat.level;
      const heatKey = sub?.heatChange ? `${step.index}-${sub.index}` : null;

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
            setActiveSub(0);
            push({ type: "stepEntered", stepIndex: next, at: new Date().toISOString() });
            window.scrollTo({ top: 0 });
      };
      const forward = () => {
            if (!isLast) return go(stepIndex + 1);
            void flush();
            setFinishing(true);
      };
      const back = () => {
            if (stepIndex > 0) go(stepIndex - 1);
      };
      useVoiceCommands(listening && !finishing && !leaving, {
            next: forward,
            back,
            fail: (message) => {
                  setListening(false);
                  setVoiceError(message);
            },
      });

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

      const glassButton =
            "grid size-12 shrink-0 place-items-center rounded-full bg-card/15 text-card transition-colors hover:bg-card/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card";

      return (
            <main className="mx-auto flex min-h-dvh max-w-xl flex-col pb-32">
                  {/* Plum panel: the active timer and the heat, readable from the stove. */}
                  <section aria-label="Temporizador y calor" className="rounded-b-[2rem] bg-plum-glow px-5 pt-5 pb-6 text-card shadow-[0_18px_36px_-24px_rgb(43_20_51/0.8)]">
                        <header className="flex items-center gap-3">
                              <button type="button" aria-label="Salir" onClick={() => setLeaving(true)} className={glassButton}>
                                    <Icon name="close" />
                              </button>
                              <div className="min-w-0 flex-1 text-center">
                                    <p className="text-xs font-extrabold tracking-wider text-secondary-soft uppercase">Modo cocina</p>
                                    <p className="truncate font-display text-base font-extrabold">{session.recipe.title}</p>
                              </div>
                              {"speechSynthesis" in window ? (
                                    <button
                                          type="button"
                                          aria-label="Leer los pasos en voz alta"
                                          aria-pressed={speak}
                                          onClick={() => setSpeechOn(!speak)}
                                          className={`${glassButton} ${speak ? "bg-primary-strong hover:bg-primary-strong" : ""}`}
                                    >
                                          <Icon name={speak ? "speaker" : "speakerOff"} />
                                    </button>
                              ) : (
                                    <span className="size-12" />
                              )}
                        </header>

                        {sub?.timerSeconds ? (
                              <Timer
                                    key={`${step.index}-${sub.index}`}
                                    seconds={sub.timerSeconds}
                                    label={sub.shortLabel}
                                    onEnd={() => setActiveSub((i) => Math.min(i + 1, step.subSteps.length - 1))}
                                    onEvent={(e) => push({ ...e, stepIndex: step.index, subStepIndex: sub.index, at: new Date().toISOString() })}
                              />
                        ) : (
                              <p className="mt-6 font-display text-section leading-tight font-extrabold">{sub?.shortLabel ?? step.title}</p>
                        )}

                        <div className="mt-6">
                              <div className="flex items-baseline justify-between gap-3">
                                    <p className="flex items-center gap-1.5 text-xs font-extrabold tracking-wider text-secondary-soft uppercase">
                                          <Icon name="flame" className="size-4" />
                                          Calor requerido
                                    </p>
                                    <p className="text-sm font-extrabold text-secondary">
                                          {heatLevel === 0 ? "Sin fuego" : `${heatName(heatLevel)} · ${heatLevel}/${MAX_HEAT}`}
                                    </p>
                              </div>
                              <div
                                    role="meter"
                                    aria-label="Calor requerido"
                                    aria-valuemin={0}
                                    aria-valuemax={MAX_HEAT}
                                    aria-valuenow={heatLevel}
                                    aria-valuetext={heatName(heatLevel)}
                                    className="relative mt-3 h-2.5 rounded-full bg-[linear-gradient(90deg,var(--color-mustard),var(--color-secondary),var(--color-tomato))]"
                              >
                                    <span aria-hidden className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card/70" />
                                    <span
                                          aria-hidden
                                          className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-card bg-primary-strong shadow-soft transition-[left] duration-500 ease-out"
                                          style={{ left: `${(heatLevel / MAX_HEAT) * 100}%` }}
                                    />
                              </div>
                              <div aria-hidden className="mt-2 flex justify-between text-xs font-semibold text-card/70">
                                    <span>Bajo</span>
                                    <span>Medio</span>
                                    <span>Alto</span>
                              </div>
                        </div>
                  </section>

                  <div className="flex flex-col gap-6 px-5 pt-5">
                        {sub?.heatChange && heatSeen !== heatKey && (
                              <div
                                    role="alert"
                                    className="flex items-center gap-3 rounded-card bg-[linear-gradient(100deg,var(--color-salmon)_0%,var(--color-tomato)_45%,var(--color-primary-strong)_100%)] p-4 text-card shadow-[0_16px_32px_-18px_rgb(228_69_47/0.8)]"
                              >
                                    <span className="grid size-12 shrink-0 place-items-center rounded-full bg-card/25 ring-4 ring-card/15">
                                          <Icon name="flame" />
                                    </span>
                                    <div className="min-w-0 flex-1">
                                          <p className="text-xs font-extrabold tracking-wide text-card/90 uppercase">
                                                Cambio de calor · {heatName(sub.heatChange.from)} → {heatName(sub.heatChange.to)}
                                          </p>
                                          <p className="font-display text-title font-extrabold">{sub.heatChange.message}</p>
                                    </div>
                                    <button
                                          type="button"
                                          onClick={() => setHeatSeen(heatKey)}
                                          className="min-h-11 shrink-0 rounded-full bg-card px-4 text-sm font-extrabold text-primary-strong shadow-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card"
                                    >
                                          Listo
                                    </button>
                              </div>
                        )}

                        <div role="progressbar" aria-label="Avance" aria-valuemin={1} aria-valuemax={session.steps.length} aria-valuenow={stepIndex + 1} className="flex gap-1.5">
                              {session.steps.map((s) => (
                                    <span key={s.index} className={`h-1.5 flex-1 rounded-full ${s.index < stepIndex ? "bg-ink" : s.index === stepIndex ? "bg-brand" : "bg-line"}`} />
                              ))}
                        </div>

                        <section aria-live="polite" className="border-b border-line pb-5">
                              <p className="font-serif text-base font-semibold text-primary-strong italic">
                                    Paso {spell(stepIndex + 1)} de {spell(session.steps.length)}
                              </p>
                              <h1 className="mt-1 font-serif text-[1.85rem] leading-tight font-bold tracking-normal text-ink">{step.title}</h1>
                              <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold text-ink-muted">
                                    <li className="flex items-center gap-1.5">
                                          <Icon name="clock" className="size-4 text-primary-strong" />
                                          {minutes(step.durationSeconds)}
                                    </li>
                                    {step.heat.level > 0 && (
                                          <li className="flex items-center gap-1.5">
                                                <Icon name="flame" className="size-4 text-primary-strong" />
                                                Fuego {step.heat.label.toLowerCase()}
                                          </li>
                                    )}
                                    {step.equipment && (
                                          <li className="flex items-center gap-1.5">
                                                <Icon name="pot" className="size-4 text-primary-strong" />
                                                {step.equipment}
                                          </li>
                                    )}
                              </ul>
                        </section>

                        {step.ingredients.length > 0 && (
                              <section aria-labelledby="for-step" className="border-b border-line pb-5">
                                    <h2 id="for-step" className="mb-2 font-sans text-xs font-extrabold tracking-wider text-ink-muted uppercase">
                                          Para este paso
                                    </h2>
                                    <ul className="flex flex-col">
                                          {step.ingredients.map((i, index) => (
                                                <li key={index} className="flex items-baseline gap-3 py-1.5 font-serif text-[1.05rem] text-ink">
                                                      <span className="min-w-0">
                                                            {i.label}
                                                            {i.prep && <span className="text-ink-muted">, {i.prep}</span>}
                                                      </span>
                                                      <span aria-hidden className="min-w-6 flex-1 translate-y-[-0.3em] border-b border-line" />
                                                      <span className="shrink-0 font-bold">{i.quantity.display}</span>
                                                </li>
                                          ))}
                                    </ul>
                              </section>
                        )}

                        <section aria-labelledby="prep">
                              <h2 id="prep" className="mb-2 font-sans text-xs font-extrabold tracking-wider text-ink-muted uppercase">
                                    Preparación
                              </h2>
                              <ol className="flex flex-col gap-1">
                                    {step.subSteps.map((s, index) => {
                                          const current = index === activeSub;
                                          const done = index < activeSub;
                                          return (
                                                <li key={`${step.index}-${s.index}`}>
                                                      <button
                                                            type="button"
                                                            aria-current={current ? "step" : undefined}
                                                            onClick={() => setActiveSub(index)}
                                                            className="group flex w-full items-start gap-3 rounded-control py-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                                      >
                                                            <span className={`w-6 shrink-0 font-serif text-[1.75rem] leading-none font-bold ${done ? "text-primary/40" : "text-primary-strong"}`}>
                                                                  {index + 1}
                                                            </span>
                                                            <span className={`min-w-0 flex-1 font-serif text-[1.05rem] leading-relaxed ${done ? "text-ink-muted/70" : "text-ink"} group-hover:text-ink`}>{s.text}</span>
                                                            {s.timerSeconds ? (
                                                                  <span className={`mt-0.5 shrink-0 rounded-full px-2.5 py-0.5 text-xs font-extrabold tabular-nums ${current ? "bg-primary-soft text-primary-strong" : done ? "bg-field/60 text-ink-muted/60" : "bg-field text-ink-muted"}`}>
                                                                        {clock(s.timerSeconds).replace(/^0/, "")}
                                                                  </span>
                                                            ) : null}
                                                      </button>
                                                </li>
                                          );
                                    })}
                              </ol>
                        </section>

                        {step.doneWhen && (
                              <div className="flex items-center gap-3 rounded-card border border-line bg-card p-4">
                                    <MascotAvatar tone="blush" className="size-12" />
                                    <p className="min-w-0 flex-1 font-serif text-[1.05rem] leading-snug text-ink">
                                          <span className="block font-serif text-base font-semibold text-primary-strong italic">Sabrás que está listo cuando…</span>
                                          {step.doneWhen}
                                    </p>
                              </div>
                        )}
                  </div>

                  <div className="fixed inset-x-0 bottom-0 z-10 mx-auto flex max-w-xl flex-col gap-2 bg-canvas/95 px-5 pt-3 pb-[calc(1.5rem+env(safe-area-inset-bottom))] backdrop-blur">
                        {voiceError && (
                              <p role="alert" className="flex items-center gap-2 text-sm font-semibold text-error">
                                    <Icon name="mic" className="size-4" />
                                    {voiceError}
                              </p>
                        )}
                        <div className="flex items-center gap-3">
                        <RoundButton tone="field" label="Paso anterior" disabled={stepIndex === 0} onClick={back}>
                              <Icon name="arrowRight" className="size-6 rotate-180" strokeWidth={2} />
                        </RoundButton>
                        {Recognition ? (
                              <button
                                    type="button"
                                    aria-pressed={listening}
                                    onClick={() => {
                                          setVoiceError(null);
                                          setListening((v) => !v);
                                    }}
                                    className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full px-4 text-sm font-extrabold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
                                          listening ? "bg-primary-strong text-card" : "bg-[linear-gradient(90deg,var(--color-primary-soft),var(--color-peach-soft))] text-ink"
                                    }`}
                              >
                                    <Icon name="mic" className={`size-5 ${listening ? "animate-pulse" : "text-primary-strong"}`} />
                                    {listening ? "Te escucho: di “siguiente”" : "Di “siguiente”"}
                              </button>
                        ) : (
                              <span className="flex-1" />
                        )}
                        <button
                              type="button"
                              aria-label={isLast ? "Terminar receta" : "Paso siguiente"}
                              onClick={forward}
                              className="grid size-14 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--color-primary-strong),var(--color-salmon))] text-card shadow-brand transition-transform active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                        >
                              <Icon name={isLast ? "check" : "arrowRight"} strokeWidth={2.25} />
                        </button>
                        </div>
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

const RING = 2 * Math.PI * 52;

// The active sub-step's countdown as a ring, with its name and the two controls beside it.
function Timer({ seconds, label, onEvent, onEnd }: { seconds: number; label: string; onEvent: (event: TimerEvent) => void; onEnd: () => void }) {
      const [ended, setEnded] = useState(false);
      const [total, setTotal] = useState(seconds);
      const started = useRef(false);
      const timer = useTimer(seconds, () => {
            setEnded(true);
            navigator.vibrate?.([300, 150, 300]);
            onEnd();
      });
      const share = total ? timer.left / total : 0;

      return (
            <div className="mt-6 flex items-center gap-5">
                  <div className="relative grid size-36 shrink-0 place-items-center">
                        <svg aria-hidden viewBox="0 0 120 120" className="absolute inset-0 size-full -rotate-90">
                              <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="9" className="text-card/15" />
                              <circle
                                    cx="60"
                                    cy="60"
                                    r="52"
                                    fill="none"
                                    stroke="url(#ring)"
                                    strokeWidth="9"
                                    strokeLinecap="round"
                                    strokeDasharray={RING}
                                    strokeDashoffset={RING * (1 - share)}
                                    className="transition-[stroke-dashoffset] duration-300 ease-linear"
                              />
                              <defs>
                                    <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
                                          <stop offset="0%" stopColor="var(--color-primary)" />
                                          <stop offset="100%" stopColor="var(--color-secondary)" />
                                    </linearGradient>
                              </defs>
                        </svg>
                        <span className="relative text-center">
                              <span role="timer" aria-label={`Temporizador: ${label}`} className="block font-display text-metric leading-none font-extrabold tabular-nums">
                                    {clock(timer.left)}
                              </span>
                              <span className="mt-1 block text-xs font-semibold text-card/70">de {minutes(total)}</span>
                        </span>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <p className="font-display text-section leading-tight font-extrabold">{label}</p>
                        {ended && !timer.running && (
                              <p role="alert" className="text-sm font-extrabold text-secondary">
                                    ¡Tiempo!
                              </p>
                        )}
                        <button
                              type="button"
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
                              className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-[linear-gradient(90deg,var(--color-primary-strong),var(--color-primary)_60%,var(--color-salmon))] px-4 text-base font-extrabold text-card shadow-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card"
                        >
                              <Icon name={timer.running ? "pause" : "play"} className="size-4" strokeWidth={2.5} />
                              {timer.running ? "Pausar" : started.current ? "Seguir" : "Iniciar"}
                        </button>
                        <button
                              type="button"
                              onClick={() => {
                                    timer.extend(60);
                                    setTotal((t) => t + 60);
                                    onEvent({ type: "timerExtended", addedSeconds: 60 });
                              }}
                              className="flex min-h-12 items-center justify-center gap-2 rounded-full bg-card/15 px-4 text-base font-extrabold text-card hover:bg-card/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card"
                        >
                              <Icon name="plus" className="size-4" strokeWidth={2.5} />1 min
                        </button>
                  </div>
            </div>
      );
}
