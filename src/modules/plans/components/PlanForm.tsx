import { useState, type CSSProperties } from "react";
import Button from "@/shared/components/ui/Button";
import { DishPlate } from "@/shared/components/ui/DishArt";
import Dialog from "@/shared/components/ui/Dialog";
import { Sparkle } from "@/shared/components/ui/Doodles";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import { fieldClass } from "@/shared/components/ui/TextField";
import { tones } from "@/shared/lib/tones";
import type { NutritionPlan, PlanInput } from "../types";
import { suggestedTargets } from "../utils/labels";
import {
      activities,
      allergies,
      appliances,
      cares,
      cookTimes,
      defaultPrefs,
      dietStyles,
      dishOptions,
      fibreFor,
      formatCop,
      goalFor,
      goals,
      levels,
      objectiveFor,
      scaleTargets,
      startingCalories,
      stores,
      useOnboardingPrefs,
      type Goal,
      type OnboardingPrefs,
} from "../utils/onboarding";
import { CheckMark, Chip, GroupLabel, OptionCard, RoundStepper, StepHeader, StepTitle, ToneIcon } from "./OnboardingUI";

type PlanFormProps = {
      initial?: NutritionPlan | null;
      /** Last-step button text ("Crear mi chef" / "Guardar cambios"). */
      submitLabel: string;
      submitting: boolean;
      error?: string | null;
      onSubmit: (input: PlanInput) => void;
      /** Leaves the flow from step 1 (back arrow). */
      onExit: () => void;
      /** Onboarding only: "Saltar" on each step and "Lo haré más tarde" on the first. */
      onSkip?: () => void;
      /** Opens on this step (editing one answer from the «¡Listo!» summary). */
      initialStep?: number;
};

export const planSteps = ["Objetivo", "Ritmo", "Restricciones", "Gustos", "Tu cocina", "Compras"];
const last = planSteps.length - 1;
const MAX_GOALS = 2;

const kcal = new Intl.NumberFormat("es", { useGrouping: "always" });
const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

export default function PlanForm({ initial, submitLabel, submitting, error, onSubmit, onExit, onSkip, initialStep = 0 }: PlanFormProps) {
      const [savedPrefs, savePrefs] = useOnboardingPrefs();
      const [step, setStep] = useState(initialStep);
      const [prefs, setPrefs] = useState<OnboardingPrefs>(() => ({
            ...defaultPrefs,
            ...savedPrefs,
            goals: savedPrefs?.goals ?? (initial ? [goalFor(initial.objective)] : []),
            stores: savedPrefs?.stores ?? [],
      }));
      const [restrictions, setRestrictions] = useState<string[]>(initial?.restrictions ?? []);
      const [customRestriction, setCustomRestriction] = useState("");
      const [mealsPerDay, setMealsPerDay] = useState(initial?.mealsPerDay ?? 3);
      // null: follow the suggestion for the chosen goals and activity until the user nudges it.
      const [caloriesDraft, setCaloriesDraft] = useState<number | null>(initial?.targets.calories ?? null);
      const [scanOpen, setScanOpen] = useState(false);

      const update = (patch: Partial<OnboardingPrefs>) => setPrefs((p) => ({ ...p, ...patch }));
      const objective = objectiveFor(prefs.goals, initial?.objective);
      const t = initial?.targets;
      // Keep the user's own macro split when they had one; otherwise the goal's general reference.
      const reference =
            t?.calories && t.proteinGrams && t.carbohydratesGrams && t.fatGrams
                  ? { calories: t.calories, proteinGrams: t.proteinGrams, carbohydratesGrams: t.carbohydratesGrams, fatGrams: t.fatGrams }
                  : suggestedTargets[objective];
      const calories = caloriesDraft ?? startingCalories(suggestedTargets[objective].calories, prefs.activity);
      const targets = scaleTargets(reference, calories);

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
            savePrefs(prefs);
            onSubmit({ objective, targets, restrictions, mealsPerDay });
      };
      const next = () => (step < last ? setStep(step + 1) : submit());
      const back = () => (step === 0 ? onExit() : setStep(step - 1));

      const count = step === 0 ? prefs.goals.length : step === 2 ? chosenRestrictions : step === 3 ? prefs.dishes.length : 0;
      const nextLabel = step === last ? submitLabel : count > 0 ? `Siguiente · ${count} ${count === 1 ? "elegido" : "elegidos"}` : "Siguiente";

      return (
            <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 pt-6">
                  <StepHeader
                        step={step + 1}
                        total={planSteps.length}
                        label={planSteps[step]!}
                        backLabel={step === 0 ? "Salir" : "Paso anterior"}
                        onBack={back}
                        onSkip={onSkip && step < last ? () => setStep(step + 1) : undefined}
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
                                                                        setCaloriesDraft(startingCalories(suggestedTargets[objective].calories, activity.value));
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

                                    <section aria-labelledby="starting-point" className="rounded-card bg-plum-glow p-5 text-card shadow-[0_18px_36px_-20px_rgb(43_20_51/0.7)]">
                                          <div className="flex items-start justify-between gap-3">
                                                <div>
                                                      <h2 id="starting-point" className="font-sans text-xs font-extrabold tracking-wider text-secondary-soft uppercase">
                                                            Punto de partida
                                                      </h2>
                                                      <p className="mt-1 flex items-baseline gap-1.5">
                                                            <span className="font-display text-metric font-extrabold tabular-nums">{kcal.format(calories)}</span>
                                                            <span className="text-sm font-bold text-secondary-soft">kcal/día</span>
                                                      </p>
                                                </div>
                                                <RoundStepper label="Calorías" value={calories} min={1000} max={5000} step={50} surface="dark" onChange={setCaloriesDraft} />
                                          </div>
                                          <dl className="mt-4 grid grid-cols-4 gap-2">
                                                {(
                                                      [
                                                            ["Proteína", targets.proteinGrams, "mint"],
                                                            ["Carbos", targets.carbohydratesGrams, "rose"],
                                                            ["Grasas", targets.fatGrams, "mustard"],
                                                            ["Fibra", fibreFor(calories), "lilac"],
                                                      ] as const
                                                ).map(([label, grams, tone]) => (
                                                      <div key={label} className={`flex flex-col-reverse items-center rounded-control py-2.5 ${tones[tone].soft}`}>
                                                            <dt className={`text-xs font-extrabold uppercase ${tones[tone].ink}`}>{label}</dt>
                                                            <dd className="font-display text-title font-extrabold text-ink tabular-nums">{grams}g</dd>
                                                      </div>
                                                ))}
                                          </dl>
                                          <p className="mt-4 flex items-start gap-2 text-sm text-card/85">
                                                <Sparkle className="mt-0.5 size-4 shrink-0 text-secondary" />
                                                Solo es una referencia: tu chef la afina con lo que cocinas y cómo te sientes.
                                          </p>
                                    </section>
                              </>
                        )}

                        {step === 2 && (
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

                        {step === 3 && (
                              <>
                                    <StepTitle title="¿Qué se te antoja?">Toca los platos que te encantan. Así empiezo a conocer tu sazón.</StepTitle>
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

                        {step === 4 && (
                              <>
                                    <StepTitle title="¿Cómo es tu cocina?">Para proponerte recetas que de verdad vas a hacer.</StepTitle>
                                    <section aria-labelledby="meals" className="flex items-center gap-3 rounded-card bg-peach-glow p-4 shadow-soft">
                                          <div className="min-w-0 flex-1">
                                                <h2 id="meals" className="text-title font-extrabold text-ink">
                                                      Comidas al día
                                                </h2>
                                                <p className="text-xs font-semibold text-ink">Repartiré tus metas entre ellas</p>
                                          </div>
                                          <RoundStepper label="Comidas al día" value={mealsPerDay} min={1} max={12} onChange={setMealsPerDay} display={(n) => n} />
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

                        {step === 5 && (
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

                                    <button
                                          type="button"
                                          onClick={() => setScanOpen(true)}
                                          className="group flex items-center gap-3 rounded-card bg-plum-glow p-4 text-left text-card shadow-[0_18px_36px_-20px_rgb(43_20_51/0.7)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                    >
                                          <span className="grid size-12 shrink-0 place-items-center rounded-control bg-primary-strong">
                                                <Icon name="scan" />
                                          </span>
                                          <span className="min-w-0 flex-1">
                                                <span className="block font-display text-title font-extrabold">Escanea tu última factura</span>
                                                <span className="block text-sm text-card/80">Empiezo a aprender de ti desde hoy</span>
                                          </span>
                                          <Icon name="chevronRight" className="size-6 shrink-0 transition-transform group-hover:translate-x-1" />
                                    </button>
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

                  <Dialog open={scanOpen} onClose={() => setScanOpen(false)} title="Escanear facturas">
                        <p className="text-ink-muted">
                              Muy pronto podrás fotografiar tu factura para que tu chef aprenda qué compras. Por ahora, añade tus ingredientes en Mi despensa.
                        </p>
                  </Dialog>
            </div>
      );
}
