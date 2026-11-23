import { useMemo, useState, type CSSProperties } from "react";
import ReceiptScanner from "@/modules/receipts/components/ReceiptScanner";
import Button from "@/shared/components/ui/Button";
import { DishPlate } from "@/shared/components/ui/DishArt";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import { fieldClass } from "@/shared/components/ui/TextField";
import { tones } from "@/shared/lib/tones";
import { useDebounced } from "@/shared/hooks/useDebounced";
import { toFormAnswers } from "../api/plans.api";
import { useNutritionPreview } from "../hooks/usePlan";
import type { PlanData, PlanInput } from "../types";
import { emptyBody, isBodyEmpty, parseBody, type BodyErrors } from "../utils/body";
import {
      activities,
      allergies,
      appliances,
      cares,
      cookTimes,
      defaultPrefs,
      dietStyles,
      dishOptions,
      formatCop,
      goals,
      levels,
      stores,
      useOnboardingPrefs,
      type Goal,
      type OnboardingPrefs,
} from "../utils/onboarding";
import BodyStep from "./BodyStep";
import { CheckMark, Chip, GroupLabel, OptionCard, RoundStepper, StepHeader, StepTitle, ToneIcon } from "./OnboardingUI";
import StartingPoint from "./StartingPoint";

type PlanFormProps = {
      initial?: PlanData | null;
      /** Last-step button text ("Crear mi chef" / "Guardar cambios"). */
      submitLabel: string;
      submitting: boolean;
      error?: string | null;
      /** `before` is what the form started with, to send only the changes. */
      onSubmit: (input: PlanInput, before: PlanInput) => void;
      /** Leaves the flow from step 1 (back arrow). */
      onExit: () => void;
      /** Onboarding only: "Saltar" on each step and "Lo haré más tarde" on the first. */
      onSkip?: () => void;
      /** Opens on this step (editing one answer from the «¡Listo!» summary). */
      initialStep?: number;
};

export const planSteps = ["Objetivo", "Ritmo", "Sobre ti", "Restricciones", "Gustos", "Tu cocina", "Compras"];
const last = planSteps.length - 1;
const BODY_STEP = 2;
const MAX_GOALS = 2;

const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

export default function PlanForm({ initial, submitLabel, submitting, error, onSubmit, onExit, onSkip, initialStep = 0 }: PlanFormProps) {
      const [savedPrefs, savePrefs] = useOnboardingPrefs();
      const [step, setStep] = useState(initialStep);
      // What the API has now (editing) or the defaults (new account); changes are measured against it.
      const [before] = useState<PlanInput>(() => ({
            ...(initial ? toFormAnswers(initial, savedPrefs) : { prefs: { ...defaultPrefs, ...savedPrefs }, body: emptyBody, restrictions: [], mealsPerDay: 3 }),
            kcalTarget: null,
            kcalAdjusted: false,
      }));
      const [prefs, setPrefs] = useState<OnboardingPrefs>(before.prefs);
      const [restrictions, setRestrictions] = useState<string[]>(before.restrictions);
      const [customRestriction, setCustomRestriction] = useState("");
      const [mealsPerDay, setMealsPerDay] = useState(before.mealsPerDay);
      // null: the saved target, or the suggestion for the chosen goals and activity, until the user nudges it.
      const [caloriesDraft, setCaloriesDraft] = useState<number | null>(null);

      const update = (patch: Partial<OnboardingPrefs>) => setPrefs((p) => ({ ...p, ...patch }));
      const [body, setBody] = useState(before.body);
      const [bodyErrors, setBodyErrors] = useState<BodyErrors>({});
      // Health data leaves the device only once the user agreed to it.
      const parsedBody = parseBody(body);
      const bodyKey = JSON.stringify(body.consent ? parsedBody.biometrics : null);
      const debouncedKey = useDebounced(bodyKey, 400);
      const biometrics = useMemo(() => JSON.parse(debouncedKey) as typeof parsedBody.biometrics, [debouncedKey]);
      const previewQuery = useNutritionPreview({ goals: prefs.goals, activity: prefs.activity, biometrics });
      const preview = previewQuery.data;
      // Same rule as the backend: new goals, activity or body recalculate the target.
      const bodyChanged = JSON.stringify(before.body.consent ? parseBody(before.body).biometrics : null) !== bodyKey;
      const recalculated = bodyChanged || prefs.activity !== before.prefs.activity || prefs.goals.join() !== before.prefs.goals.join();
      const savedKcal = initial && !recalculated ? initial.nutritionTargets.kcal : null;
      const calories = caloriesDraft ?? savedKcal ?? preview?.kcal ?? null;
      const range = preview?.range ?? { min: 1400, max: 4000, step: 50 };
      const grams = (pct: number | undefined, kcalPerGram: number) =>
            calories === null || pct === undefined ? null : Math.round((calories * pct) / 100 / kcalPerGram);
      const targets = {
            protein: grams(preview?.macroSplit.proteinPct, 4),
            carbs: grams(preview?.macroSplit.carbsPct, 4),
            fat: grams(preview?.macroSplit.fatPct, 9),
            fibre: calories === null || !preview ? null : Math.round((calories / 1000) * preview.fiberGPer1000Kcal),
      };

      const style = dietStyles.find((s) => s !== "Omnívoro" && restrictions.includes(s)) ?? "Omnívoro";
      const known = new Set([...dietStyles, ...allergies, ...cares]);
      const custom = restrictions.filter((r) => !known.has(r));
      const chosenRestrictions = restrictions.filter((r) => !dietStyles.includes(r)).length + 1;

      const setStyle = (value: string) => setRestrictions((current) => [...current.filter((r) => !dietStyles.includes(r)), ...(value === "Omnívoro" ? [] : [value])]);
      const addCustomRestriction = () => {
            const value = customRestriction.trim();
            if (value && !restrictions.some((r) => r.toLowerCase() === value.toLowerCase())) setRestrictions((c) => [...c, value]);
            setCustomRestriction("");
      };

      const submit = () => {
            const answers = { ...prefs, flexitarian: restrictions.includes("Flexitariano") };
            savePrefs(answers);
            // The recommended number the user saw is the one saved, as long as it belongs to these answers.
            const suggested = biometrics && debouncedKey === bodyKey && !previewQuery.isPlaceholderData && (!initial || recalculated) ? (preview?.kcal ?? null) : null;
            onSubmit({ prefs: answers, body, restrictions, mealsPerDay, kcalTarget: caloriesDraft ?? suggested, kcalAdjusted: caloriesDraft !== null }, before);
      };
      const next = () => {
            if (step === BODY_STEP && !isBodyEmpty(body)) {
                  const errors: BodyErrors = { ...parsedBody.errors };
                  if (!body.consent) errors.consent = "Marca la casilla para usar estos datos, o bórralos para seguir sin ellos.";
                  setBodyErrors(errors);
                  if (Object.keys(errors).length) return;
            }
            if (step < last) setStep(step + 1);
            else submit();
      };
      const skipStep = () => {
            if (step === BODY_STEP) {
                  setBody(before.body);
                  setBodyErrors({});
            }
            setStep(step + 1);
      };
      const startingNote =
            preview?.basis !== "biometrics"
                  ? "Es un promedio: con tu edad, peso y estatura lo calculo para ti."
                  : preview.bodyFatPct != null
                    ? `Calculado con tus datos y tus medidas (≈ ${Math.round(preview.bodyFatPct)}% de grasa corporal).`
                    : "Calculado con tu edad, peso y estatura. No reemplaza a un profesional de salud.";
      const startingPoint = <StartingPoint calories={calories} range={range} targets={targets} note={startingNote} onChange={setCaloriesDraft} />;
      const back = () => (step === 0 ? onExit() : setStep(step - 1));

      const count = step === 0 ? prefs.goals.length : step === 3 ? chosenRestrictions : step === 4 ? prefs.dishes.length : 0;
      const nextLabel = step === last ? submitLabel : count > 0 ? `Siguiente · ${count} ${count === 1 ? "elegido" : "elegidos"}` : "Siguiente";

      return (
            <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 pt-6">
                  <StepHeader
                        step={step + 1}
                        total={planSteps.length}
                        label={planSteps[step]!}
                        backLabel={step === 0 ? "Salir" : "Paso anterior"}
                        onBack={back}
                        onSkip={onSkip && step < last ? skipStep : undefined}
                  />

                  <div className="mt-8 flex flex-1 flex-col gap-6 pb-8">
                        {error && <FormAlert>{error}</FormAlert>}

                        {step === 0 && (
                              <>
                                    <StepTitle title="¿Qué quieres lograr?">Elige hasta 2. Tu chef ajusta cada plato a esto, sin contar calorías por ti.</StepTitle>
                                    <fieldset>
                                          <legend className="sr-only">Objetivos, hasta {MAX_GOALS}</legend>
                                          <div className="grid grid-cols-2 gap-3">
                                                {goals.map((goal) => {
                                                      const checked = prefs.goals.includes(goal.value);
                                                      const full = !checked && prefs.goals.length >= MAX_GOALS;
                                                      return (
                                                            <OptionCard
                                                                  key={goal.value}
                                                                  type="checkbox"
                                                                  name="goals"
                                                                  checked={checked}
                                                                  disabled={full}
                                                                  onChange={() => update({ goals: toggle<Goal>(prefs.goals, goal.value) })}
                                                                  className="min-h-36 flex-col gap-2 p-4"
                                                            >
                                                                  <span className="flex items-start justify-between">
                                                                        <ToneIcon icon={goal.icon} tone={goal.tone} plain={checked} />
                                                                        <CheckMark checked={checked} />
                                                                  </span>
                                                                  <span className="mt-1 font-display text-title leading-tight font-extrabold text-ink">{goal.label}</span>
                                                                  <span className="text-xs font-semibold text-ink-muted">{goal.description}</span>
                                                            </OptionCard>
                                                      );
                                                })}
                                          </div>
                                    </fieldset>
                              </>
                        )}

                        {step === 1 && (
                              <>
                                    <StepTitle title="¿Cómo es tu día?">Así tu chef calcula porciones realistas, no perfectas.</StepTitle>
                                    <fieldset>
                                          <legend>
                                                <GroupLabel>Nivel de actividad</GroupLabel>
                                          </legend>
                                          <div className="flex flex-col gap-3">
                                                {activities.map((activity) => {
                                                      const checked = prefs.activity === activity.value;
                                                      return (
                                                            <OptionCard
                                                                  key={activity.value}
                                                                  type="radio"
                                                                  name="activity"
                                                                  checked={checked}
                                                                  onChange={() => {
                                                                        update({ activity: activity.value });
                                                                        setCaloriesDraft(null);
                                                                  }}
                                                                  className="items-center gap-3 p-3"
                                                            >
                                                                  <ToneIcon icon={activity.icon} tone="peach" plain={checked} className="size-12 rounded-control" />
                                                                  <span className="min-w-0 flex-1">
                                                                        <span className="block font-display text-title font-extrabold text-ink">{activity.label}</span>
                                                                        <span className="block text-xs font-semibold text-ink-muted">{activity.description}</span>
                                                                  </span>
                                                                  <CheckMark checked={checked} shape="radio" />
                                                            </OptionCard>
                                                      );
                                                })}
                                          </div>
                                    </fieldset>

                                    {startingPoint}
                              </>
                        )}

                        {step === BODY_STEP && (
                              <>
                                    <BodyStep
                                          value={body}
                                          errors={bodyErrors}
                                          onChange={(value) => {
                                                setBody(value);
                                                setBodyErrors({});
                                                setCaloriesDraft(null);
                                          }}
                                    />
                                    {startingPoint}
                              </>
                        )}

                        {step === 3 && (
                              <>
                                    <StepTitle title="¿Algo que no comas?">Nunca te lo voy a proponer, ni siquiera en recetas de la comunidad.</StepTitle>
                                    <section aria-labelledby="diet-style">
                                          <GroupLabel id="diet-style">Estilo de alimentación</GroupLabel>
                                          <div role="radiogroup" aria-labelledby="diet-style" className="flex flex-wrap gap-2">
                                                {dietStyles.map((value) => (
                                                      <Chip key={value} role="radio" selected={style === value} onClick={() => setStyle(value)}>
                                                            {value}
                                                      </Chip>
                                                ))}
                                          </div>
                                    </section>
                                    {(
                                          [
                                                ["allergies", "Alergias e intolerancias", allergies],
                                                ["cares", "Cuidados", cares],
                                          ] as const
                                    ).map(([id, label, options]) => (
                                          <section key={id} aria-labelledby={id}>
                                                <GroupLabel id={id}>{label}</GroupLabel>
                                                <div className="flex flex-wrap gap-2">
                                                      {options.map((value) => (
                                                            <Chip key={value} selected={restrictions.includes(value)} onClick={() => setRestrictions((c) => toggle(c, value))}>
                                                                  {value}
                                                            </Chip>
                                                      ))}
                                                </div>
                                          </section>
                                    ))}
                                    {custom.length > 0 && (
                                          <section aria-labelledby="custom-restrictions">
                                                <GroupLabel id="custom-restrictions">También evitas</GroupLabel>
                                                <div className="flex flex-wrap gap-2">
                                                      {custom.map((value) => (
                                                            <Chip key={value} selected onClick={() => setRestrictions((c) => c.filter((r) => r !== value))}>
                                                                  {value}
                                                            </Chip>
                                                      ))}
                                                </div>
                                          </section>
                                    )}
                                    <div className="flex gap-3">
                                          <label className="relative flex-1">
                                                <span className="sr-only">Otra restricción</span>
                                                <Icon name="plus" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted" />
                                                <input
                                                      name="customRestriction"
                                                      placeholder="Otra, ej. sin cilantro"
                                                      value={customRestriction}
                                                      onChange={(e) => setCustomRestriction(e.target.value)}
                                                      onKeyDown={(e) => {
                                                            if (e.key === "Enter") {
                                                                  e.preventDefault();
                                                                  addCustomRestriction();
                                                            }
                                                      }}
                                                      className={`${fieldClass("card")} min-h-13 rounded-full pr-4 pl-11 shadow-soft`}
                                                />
                                          </label>
                                          <Button onClick={addCustomRestriction} disabled={!customRestriction.trim()} className="min-h-13">
                                                Añadir
                                          </Button>
                                    </div>
                              </>
                        )}

                        {step === 4 && (
                              <>
                                    <StepTitle title="¿Qué se te antoja?">Toca los platos que te encantan. Así empiezo a conocer tu sazón.</StepTitle>
                                    {initial && !savedPrefs && (
                                          <p className="flex items-start gap-2 rounded-control bg-field p-3 text-sm font-semibold text-ink-muted">
                                                <Icon name="info" className="mt-0.5 size-4 shrink-0" />
                                                Ya tienes favoritos guardados. Si marcas platos aquí, los reemplazan.
                                          </p>
                                    )}
                                    <fieldset>
                                          <legend className="sr-only">Platos que te encantan</legend>
                                          <div className="grid grid-cols-3 gap-x-3 gap-y-5">
                                                {dishOptions.map((dish) => {
                                                      const checked = prefs.dishes.includes(dish.value);
                                                      return (
                                                            <label
                                                                  key={dish.value}
                                                                  className="group flex cursor-pointer flex-col items-center gap-2 rounded-card has-focus-visible:outline-2 has-focus-visible:outline-offset-4 has-focus-visible:outline-primary-strong"
                                                            >
                                                                  <input
                                                                        type="checkbox"
                                                                        checked={checked}
                                                                        onChange={() => update({ dishes: toggle(prefs.dishes, dish.value) })}
                                                                        className="sr-only"
                                                                  />
                                                                  <span
                                                                        className={`relative grid aspect-square w-full max-w-28 place-items-center rounded-full p-1 transition-transform group-active:scale-95 ${
                                                                              checked ? "bg-brand shadow-brand" : "bg-card shadow-soft"
                                                                        }`}
                                                                  >
                                                                        <span className="block size-full overflow-hidden rounded-full border-4 border-card">
                                                                              <DishPlate seed={dish.value} dish={dish.value} className="size-full" />
                                                                        </span>
                                                                        {checked && (
                                                                              <span aria-hidden className="absolute top-1 right-1 grid size-8 place-items-center rounded-full bg-card text-primary-strong shadow-soft">
                                                                                    <Icon name="heart" className="size-4 fill-current" strokeWidth={2} />
                                                                              </span>
                                                                        )}
                                                                  </span>
                                                                  <span className={`text-sm ${checked ? "font-extrabold text-ink" : "font-semibold text-ink-muted"}`}>{dish.label}</span>
                                                            </label>
                                                      );
                                                })}
                                          </div>
                                    </fieldset>
                              </>
                        )}

                        {step === 5 && (
                              <>
                                    <StepTitle title="¿Cómo es tu cocina?">Para proponerte recetas que de verdad vas a hacer.</StepTitle>
                                    <section aria-labelledby="meals" className="flex items-center gap-3 rounded-card bg-peach-glow p-4 shadow-soft">
                                          <div className="min-w-0 flex-1">
                                                <h2 id="meals" className="text-title font-extrabold text-ink">
                                                      Comidas al día
                                                </h2>
                                                <p className="text-xs font-semibold text-ink">Repartiré tus metas entre ellas</p>
                                          </div>
                                          <RoundStepper label="Comidas al día" value={mealsPerDay} min={1} max={6} onChange={setMealsPerDay} display={(n) => n} />
                                    </section>

                                    <section aria-labelledby="cook-time">
                                          <GroupLabel id="cook-time">Tiempo para cocinar entre semana</GroupLabel>
                                          <div role="radiogroup" aria-labelledby="cook-time" className="grid grid-cols-4 gap-1 rounded-full bg-field p-1">
                                                {cookTimes.map((time) => {
                                                      const checked = prefs.cookTime === time.value;
                                                      return (
                                                            <button
                                                                  key={time.value}
                                                                  type="button"
                                                                  role="radio"
                                                                  aria-checked={checked}
                                                                  onClick={() => update({ cookTime: time.value })}
                                                                  className={`min-h-11 rounded-full text-sm focus-visible:outline-2 focus-visible:outline-primary-strong ${
                                                                        checked ? "bg-card font-extrabold text-ink shadow-soft" : "font-semibold text-ink-muted hover:text-ink"
                                                                  }`}
                                                            >
                                                                  {time.label}
                                                            </button>
                                                      );
                                                })}
                                          </div>
                                    </section>

                                    <fieldset>
                                          <legend>
                                                <GroupLabel>Tu nivel en la cocina</GroupLabel>
                                          </legend>
                                          <div className="grid grid-cols-3 gap-3">
                                                {levels.map((level) => {
                                                      const checked = prefs.level === level.value;
                                                      return (
                                                            <OptionCard
                                                                  key={level.value}
                                                                  type="radio"
                                                                  name="level"
                                                                  checked={checked}
                                                                  onChange={() => update({ level: level.value })}
                                                                  className="flex-col items-center gap-2 px-2 py-4 text-center"
                                                            >
                                                                  <Icon name={level.icon} className="size-7 text-ink" strokeWidth={2} />
                                                                  <span className={`text-sm ${checked ? "font-extrabold" : "font-bold"} text-ink`}>{level.label}</span>
                                                            </OptionCard>
                                                      );
                                                })}
                                          </div>
                                    </fieldset>

                                    <section aria-labelledby="appliances">
                                          <GroupLabel id="appliances">¿Qué tienes en casa?</GroupLabel>
                                          <div className="flex flex-wrap gap-2">
                                                {appliances.map((value) => (
                                                      <Chip key={value} selected={prefs.appliances.includes(value)} onClick={() => update({ appliances: toggle(prefs.appliances, value) })}>
                                                            {value}
                                                      </Chip>
                                                ))}
                                          </div>
                                    </section>
                              </>
                        )}

                        {step === 6 && (
                              <>
                                    <StepTitle title="¿Dónde compras?">Así relaciono marcas y productos reales con tus recetas.</StepTitle>
                                    <fieldset>
                                          <legend className="sr-only">Tiendas donde compras</legend>
                                          <div className="grid grid-cols-3 gap-2">
                                                {stores.map((store) => {
                                                      const checked = prefs.stores.includes(store.name);
                                                      return (
                                                            <OptionCard
                                                                  key={store.name}
                                                                  type="checkbox"
                                                                  name="stores"
                                                                  checked={checked}
                                                                  onChange={() => update({ stores: toggle(prefs.stores, store.name) })}
                                                                  className="min-h-14 items-center gap-1.5 px-2 py-2"
                                                            >
                                                                  <span
                                                                        aria-hidden
                                                                        className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-extrabold ${tones[store.tone].soft} ${tones[store.tone].ink}`}
                                                                  >
                                                                        {store.mark}
                                                                  </span>
                                                                  <span className="min-w-0 text-sm font-extrabold break-words text-ink">{store.name}</span>
                                                            </OptionCard>
                                                      );
                                                })}
                                          </div>
                                    </fieldset>

                                    <section aria-labelledby="priority" className="rounded-card bg-card p-5 shadow-soft">
                                          <h2 id="priority" className="text-title font-extrabold text-ink">
                                                Al elegir marcas priorizo…
                                          </h2>
                                          <input
                                                type="range"
                                                min={0}
                                                max={100}
                                                step={10}
                                                value={prefs.priceQuality}
                                                onChange={(e) => update({ priceQuality: Number(e.target.value) })}
                                                aria-label="Entre precio y calidad"
                                                aria-valuetext={prefs.priceQuality < 40 ? "Más precio" : prefs.priceQuality > 60 ? "Más calidad" : "Equilibrio"}
                                                className="brand-range mt-4 w-full"
                                                style={{ "--fill": `${prefs.priceQuality}%` } as CSSProperties}
                                          />
                                          <div className="mt-1 flex justify-between text-sm font-extrabold">
                                                <span className="text-ink-muted">Precio</span>
                                                <span className="text-primary-strong">Calidad</span>
                                          </div>
                                          <label className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-4">
                                                <span className="text-sm font-semibold text-ink-muted">Presupuesto semanal</span>
                                                <span className="relative">
                                                      <input
                                                            inputMode="numeric"
                                                            value={formatCop(prefs.budget)}
                                                            onChange={(e) => update({ budget: Number(e.target.value.replace(/\D/g, "")) || 0 })}
                                                            className={`${fieldClass("field")} min-h-11 w-36 px-3 text-right font-display text-title font-extrabold tabular-nums`}
                                                      />
                                                </span>
                                          </label>
                                    </section>

                                    <ReceiptScanner variant="feature" />
                              </>
                        )}
                  </div>

                  <div className="sticky bottom-0 -mx-5 flex flex-col gap-2 bg-canvas/95 px-5 pt-3 pb-6 backdrop-blur">
                        <div className="flex gap-3">
                              {step > 0 && (
                                    <Button variant="blush" size="lg" onClick={() => setStep(step - 1)} className="shrink-0 px-6">
                                          Atrás
                                    </Button>
                              )}
                              <Button size="lg" fullWidth arrow loading={submitting} onClick={next}>
                                    {nextLabel}
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
