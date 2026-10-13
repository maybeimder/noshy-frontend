import { useState, type ReactNode } from "react";
import Button from "@/shared/components/ui/Button";
import { Sparkle, Star, Steam } from "@/shared/components/ui/Doodles";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import MascotBubble from "@/shared/components/ui/MascotBubble";
import { roundButtonClass } from "@/shared/components/ui/RoundButton";
import { fieldClass } from "@/shared/components/ui/TextField";
import { tones } from "@/shared/lib/tones";
import type { NutritionPlan, PlanInput, PlanObjective, PlanTargets } from "../types";
import { objectiveLabel, objectives, restrictionSuggestions, suggestedTargets, targetFields } from "../utils/labels";

type PlanFormProps = {
      initial?: NutritionPlan | null;
      /** Last-step button text ("Guardar y empezar" / "Guardar cambios"). */
      submitLabel: string;
      submitting: boolean;
      error?: string | null;
      onSubmit: (input: PlanInput) => void;
      /** Leaves the flow from step 1 (back arrow). */
      onExit: () => void;
      /** Onboarding only: "Lo haré más tarde". */
      onSkip?: () => void;
};

type TargetDraft = Record<keyof PlanTargets, string>;

const steps = ["Objetivo", "Metas", "Restricciones"];

export default function PlanForm({ initial, submitLabel, submitting, error, onSubmit, onExit, onSkip }: PlanFormProps) {
      const [step, setStep] = useState(0);
      const [objective, setObjective] = useState<PlanObjective>(initial?.objective ?? "lose_weight");
      const [targets, setTargets] = useState<TargetDraft>(() => ({
            calories: initial?.targets.calories?.toString() ?? "",
            proteinGrams: initial?.targets.proteinGrams?.toString() ?? "",
            carbohydratesGrams: initial?.targets.carbohydratesGrams?.toString() ?? "",
            fatGrams: initial?.targets.fatGrams?.toString() ?? "",
      }));
      const [restrictions, setRestrictions] = useState<string[]>(initial?.restrictions ?? []);
      const [customRestriction, setCustomRestriction] = useState("");
      const [mealsPerDay, setMealsPerDay] = useState(initial?.mealsPerDay ?? 3);
      const [targetError, setTargetError] = useState<string | null>(null);

      const parseTargets = (): PlanTargets | null => {
            const parsed: PlanTargets = {};
            for (const { key, label } of targetFields) {
                  const raw = targets[key].trim().replace(",", ".");
                  if (!raw) continue;
                  const value = Number(raw);
                  if (!Number.isFinite(value) || value <= 0) {
                        setTargetError(`${label} debe ser un número mayor que cero.`);
                        return null;
                  }
                  parsed[key] = value;
            }
            if (Object.keys(parsed).length === 0) {
                  setTargetError("Indica al menos una meta, por ejemplo tus calorías diarias.");
                  return null;
            }
            setTargetError(null);
            return parsed;
      };

      const next = () => {
            if (step === 1 && !parseTargets()) return;
            if (step < 2) return setStep(step + 1);
            const parsed = parseTargets();
            if (!parsed) return setStep(1);
            onSubmit({ objective, targets: parsed, restrictions, mealsPerDay });
      };

      const toggleRestriction = (value: string) =>
            setRestrictions((current) => (current.includes(value) ? current.filter((r) => r !== value) : [...current, value]));

      const addCustomRestriction = () => {
            const value = customRestriction.trim();
            if (value && !restrictions.some((r) => r.toLowerCase() === value.toLowerCase())) setRestrictions((c) => [...c, value]);
            setCustomRestriction("");
      };

      const suggest = () => {
            const s = suggestedTargets[objective];
            setTargets({
                  calories: String(s.calories),
                  proteinGrams: String(s.proteinGrams),
                  carbohydratesGrams: String(s.carbohydratesGrams),
                  fatGrams: String(s.fatGrams),
            });
            setTargetError(null);
      };

      return (
            <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 pt-6">
                  <header className="flex items-center gap-3">
                        <button
                              type="button"
                              aria-label={step === 0 ? "Salir" : "Paso anterior"}
                              onClick={() => (step === 0 ? onExit() : setStep(step - 1))}
                              className={`${roundButtonClass("card")} size-14`}
                        >
                              <Icon name="back" />
                        </button>
                        <div>
                              <h1 className="text-page font-extrabold text-ink">Tu plan nutricional</h1>
                              <p className="text-sm text-ink-muted">Lo puedes cambiar cuando quieras</p>
                        </div>
                  </header>

                  <ol aria-label="Pasos" className="mt-6 grid grid-cols-3 gap-3">
                        {steps.map((label, index) => (
                              <li key={label} aria-current={index === step ? "step" : undefined} className="flex flex-col gap-2">
                                    <span className={`h-1.5 rounded-full ${index <= step ? "bg-primary-strong" : "bg-line"}`} />
                                    <span className={`text-xs font-bold ${index <= step ? "text-ink" : "text-ink-muted"}`}>
                                          {index + 1} · {label}
                                    </span>
                              </li>
                        ))}
                  </ol>

                  <div className="mt-6 flex-1 pb-6">
                        {error && <FormAlert>{error}</FormAlert>}

                        {step === 0 && (
                              <Step bubble={["¿Qué quieres lograr?", "Así ajusto cada receta para ti."]} decoration={<Sparkle className="size-5 text-secondary" />}>
                                    <fieldset>
                                          <legend className="sr-only">Objetivo</legend>
                                          <div className="grid grid-cols-2 gap-3">
                                                {objectives.map((option) => {
                                                      const selected = objective === option.value;
                                                      return (
                                                            <label
                                                                  key={option.value}
                                                                  className={`relative flex cursor-pointer flex-col gap-2 rounded-card border-2 p-4 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-strong ${
                                                                        selected ? "border-primary-strong bg-rose-soft" : "border-transparent bg-card"
                                                                  }`}
                                                            >
                                                                  <input
                                                                        type="radio"
                                                                        name="objective"
                                                                        value={option.value}
                                                                        checked={selected}
                                                                        onChange={() => setObjective(option.value)}
                                                                        className="sr-only"
                                                                  />
                                                                  <span
                                                                        className={`grid size-11 place-items-center rounded-control ${tones[option.tone].ink} ${
                                                                              selected ? "bg-peach-soft" : tones[option.tone].soft
                                                                        }`}
                                                                  >
                                                                        <Icon name={option.icon} className="size-5" strokeWidth={2} />
                                                                  </span>
                                                                  <span className="font-display text-title font-extrabold text-ink">{option.label}</span>
                                                                  <span className="-mt-2 text-xs font-semibold text-ink-muted">{option.description}</span>
                                                                  {selected && (
                                                                        <span className="absolute top-3 right-3 grid size-7 place-items-center rounded-full bg-primary-strong text-card">
                                                                              <Icon name="check" className="size-4" strokeWidth={3} />
                                                                        </span>
                                                                  )}
                                                            </label>
                                                      );
                                                })}
                                          </div>
                                    </fieldset>
                              </Step>
                        )}

                        {step === 1 && (
                              <Step bubble={["Tus metas diarias", "Llena las que conozcas, con una basta."]} decoration={<Star className="size-7 text-primary" />}>
                                    <div className="grid grid-cols-2 gap-3">
                                          {targetFields.map(({ key, label, unit, tone, placeholder }) => (
                                                <label key={key} className={`flex flex-col gap-3 rounded-card p-4 ${tones[tone].soft}`}>
                                                      <span className={`text-sm font-extrabold ${tones[tone].ink}`}>{label}</span>
                                                      <span className="relative">
                                                            <input
                                                                  name={key}
                                                                  inputMode="decimal"
                                                                  placeholder={placeholder}
                                                                  value={targets[key]}
                                                                  onChange={(e) => {
                                                                        setTargets((t) => ({ ...t, [key]: e.target.value }));
                                                                        setTargetError(null);
                                                                  }}
                                                                  className={`${fieldClass("card")} min-h-14 py-2 pr-12 pl-4 font-display text-section font-bold tabular-nums`}
                                                            />
                                                            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-sm font-bold text-ink-muted">
                                                                  {unit}
                                                            </span>
                                                      </span>
                                                </label>
                                          ))}
                                    </div>
                                    {targetError && (
                                          <p role="alert" className="mt-3 flex items-center gap-1 text-sm font-semibold text-error">
                                                <Icon name="alert" className="size-4" />
                                                {targetError}
                                          </p>
                                    )}
                                    <button
                                          type="button"
                                          onClick={suggest}
                                          className="mt-4 flex w-full items-center gap-4 rounded-card border-2 border-dashed border-primary/40 p-4 text-left hover:bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                    >
                                          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-rose-soft text-primary-strong">
                                                <Icon name="star4" className="size-5" />
                                          </span>
                                          <span>
                                                <span className="block font-display text-title font-bold text-ink">¿No las sabes? Te sugiero unas</span>
                                                <span className="block text-sm font-semibold text-ink-muted">
                                                      Según tu objetivo: {objectiveLabel(objective).toLowerCase()}
                                                </span>
                                          </span>
                                    </button>
                              </Step>
                        )}

                        {step === 2 && (
                              <Step bubble={["¿Algo que no comas?", "Nunca te lo voy a proponer."]}>
                                    <h3 className="text-section font-extrabold text-ink">Restricciones</h3>
                                    <div className="mt-3 flex flex-wrap gap-2">
                                          {[...new Set([...restrictionSuggestions, ...restrictions])].map((value) => {
                                                const selected = restrictions.includes(value);
                                                return (
                                                      <button
                                                            key={value}
                                                            type="button"
                                                            aria-pressed={selected}
                                                            onClick={() => toggleRestriction(value)}
                                                            className={`inline-flex min-h-11 items-center gap-2 rounded-full border-2 px-4 text-[0.95rem] font-bold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
                                                                  selected ? "border-ink bg-ink text-card" : "border-line bg-card text-ink hover:bg-field"
                                                            }`}
                                                      >
                                                            {selected && <Icon name="check" className="size-4" strokeWidth={3} />}
                                                            {value}
                                                      </button>
                                                );
                                          })}
                                    </div>
                                    <div className="mt-4 flex gap-3">
                                          <label className="flex-1">
                                                <span className="sr-only">Otra restricción</span>
                                                <input
                                                      name="customRestriction"
                                                      placeholder="Otra, ej. sin mariscos"
                                                      value={customRestriction}
                                                      onChange={(e) => setCustomRestriction(e.target.value)}
                                                      onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                  e.preventDefault();
                                                                  addCustomRestriction();
                                                            }
                                                      }}
                                                      className={`${fieldClass("card")} min-h-12 px-4`}
                                                />
                                          </label>
                                          <Button variant="dark" onClick={addCustomRestriction} disabled={!customRestriction.trim()} className="min-h-12">
                                                Añadir
                                          </Button>
                                    </div>

                                    <div className="relative mt-8 flex items-center gap-3 rounded-card bg-secondary-soft p-5">
                                          <Steam className="absolute -top-7 left-1/3 size-6 text-wine" />
                                          <div className="min-w-0 flex-1">
                                                <h3 className="text-title font-extrabold text-ink">Comidas al día</h3>
                                                <p className="text-sm text-ink">Reparto tus metas entre ellas</p>
                                          </div>
                                          <div role="group" aria-label="Comidas al día" className="flex items-center gap-3">
                                                <button
                                                      type="button"
                                                      aria-label="Una comida menos"
                                                      disabled={mealsPerDay <= 1}
                                                      onClick={() => setMealsPerDay((n) => Math.max(1, n - 1))}
                                                      className="grid size-12 place-items-center rounded-control bg-card text-ink focus-visible:outline-2 focus-visible:outline-primary-strong disabled:opacity-50"
                                                >
                                                      <Icon name="minus" />
                                                </button>
                                                <output aria-live="polite" className="w-6 text-center font-display text-section font-extrabold">
                                                      {mealsPerDay}
                                                </output>
                                                <button
                                                      type="button"
                                                      aria-label="Una comida más"
                                                      disabled={mealsPerDay >= 12}
                                                      onClick={() => setMealsPerDay((n) => Math.min(12, n + 1))}
                                                      className="grid size-12 place-items-center rounded-control bg-primary-strong text-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:opacity-50"
                                                >
                                                      <Icon name="plus" />
                                                </button>
                                          </div>
                                    </div>
                              </Step>
                        )}
                  </div>

                  <div className="sticky bottom-0 flex flex-col gap-2 bg-canvas/95 pt-3 pb-6 backdrop-blur">
                        <div className="flex gap-3">
                              {step > 0 && (
                                    <Button variant="secondary" size="lg" onClick={() => setStep(step - 1)} className="w-2/5">
                                          Atrás
                                    </Button>
                              )}
                              <Button size="lg" fullWidth loading={submitting} onClick={next}>
                                    {step < 2 ? "Siguiente" : submitLabel}
                                    <Icon name={step < 2 ? "arrowRight" : "check"} className="size-5" strokeWidth={2.25} />
                              </Button>
                        </div>
                        {onSkip && step === 0 && (
                              <Button variant="tertiary" fullWidth onClick={onSkip} className="text-ink-muted">
                                    Lo haré más tarde
                              </Button>
                        )}
                  </div>
            </div>
      );
}

function Step({ bubble: [title, text], decoration, children }: { bubble: [string, string]; decoration?: ReactNode; children: ReactNode }) {
      return (
            <section aria-label={title} className="flex flex-col gap-6">
                  <MascotBubble title={title} decoration={decoration}>
                        {text}
                  </MascotBubble>
                  <div>{children}</div>
            </section>
      );
}
