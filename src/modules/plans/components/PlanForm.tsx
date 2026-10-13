import { useState, type FormEvent, type ReactNode } from "react";
import Button from "@/shared/components/ui/Button";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import Stepper from "@/shared/components/ui/Stepper";
import TextField from "@/shared/components/ui/TextField";
import type { NutritionPlan, PlanInput, PlanObjective, PlanTargets } from "../types";
import { objectives, restrictionSuggestions, targetFields } from "../utils/labels";

type PlanFormProps = {
      initial?: NutritionPlan | null;
      submitLabel: string;
      submitting: boolean;
      error?: string | null;
      onSubmit: (input: PlanInput) => void;
      secondaryAction?: ReactNode;
};

type TargetDraft = Record<keyof PlanTargets, string>;

const chipClass = (selected: boolean) =>
      `inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
            selected
                  ? "border-ink bg-secondary-soft text-ink"
                  : "border-ink-muted bg-card text-ink hover:bg-canvas"
      }`;

export default function PlanForm({
      initial,
      submitLabel,
      submitting,
      error,
      onSubmit,
      secondaryAction,
}: PlanFormProps) {
      const [objective, setObjective] = useState<PlanObjective>(initial?.objective ?? "maintain");
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

      const toggleRestriction = (value: string) =>
            setRestrictions((current) =>
                  current.includes(value) ? current.filter((r) => r !== value) : [...current, value],
            );

      const addCustomRestriction = () => {
            const value = customRestriction.trim();
            if (value && !restrictions.some((r) => r.toLowerCase() === value.toLowerCase())) {
                  setRestrictions((current) => [...current, value]);
            }
            setCustomRestriction("");
      };

      const handleSubmit = (event: FormEvent) => {
            event.preventDefault();
            const parsed: PlanTargets = {};
            for (const { key, label } of targetFields) {
                  const raw = targets[key].trim().replace(",", ".");
                  if (!raw) continue;
                  const value = Number(raw);
                  if (!Number.isFinite(value) || value <= 0) {
                        setTargetError(`${label} debe ser un número mayor que cero.`);
                        return;
                  }
                  parsed[key] = value;
            }
            if (Object.keys(parsed).length === 0) {
                  setTargetError("Indica al menos una meta, por ejemplo tus calorías diarias.");
                  return;
            }
            setTargetError(null);
            onSubmit({ objective, targets: parsed, restrictions, mealsPerDay });
      };

      return (
            <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-8">
                  {error && <FormAlert>{error}</FormAlert>}

                  <fieldset className="flex flex-col gap-3">
                        <legend className="mb-3 text-title font-bold text-ink">¿Cuál es tu objetivo?</legend>
                        <div className="grid grid-cols-2 gap-3">
                              {objectives.map((option) => (
                                    <label
                                          key={option.value}
                                          className="relative flex cursor-pointer flex-col gap-1 rounded-control border border-ink-muted bg-card p-4 has-checked:border-2 has-checked:border-ink has-checked:bg-secondary-soft has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-strong"
                                    >
                                          <input
                                                type="radio"
                                                name="objective"
                                                value={option.value}
                                                checked={objective === option.value}
                                                onChange={() => setObjective(option.value)}
                                                className="peer sr-only"
                                          />
                                          <span className="pr-6 text-sm font-bold text-ink">{option.label}</span>
                                          <span className="text-xs text-ink-muted">{option.description}</span>
                                          <span className="absolute top-3 right-3 hidden text-ink peer-checked:block">
                                                <Icon name="check" className="size-5" strokeWidth={2.5} />
                                          </span>
                                    </label>
                              ))}
                        </div>
                  </fieldset>

                  <fieldset className="flex flex-col gap-3">
                        <legend className="mb-1 text-title font-bold text-ink">Metas diarias</legend>
                        <p className="text-sm text-ink-muted">Completa las que conozcas; al menos una.</p>
                        <div className="grid grid-cols-2 gap-4">
                              {targetFields.map(({ key, label, unit }) => (
                                    <TextField
                                          key={key}
                                          label={`${label} (${unit})`}
                                          name={key}
                                          inputMode="decimal"
                                          value={targets[key]}
                                          onChange={(e) => {
                                                setTargets((t) => ({ ...t, [key]: e.target.value }));
                                                setTargetError(null);
                                          }}
                                    />
                              ))}
                        </div>
                        {targetError && (
                              <p role="alert" className="flex items-center gap-1 text-sm text-error">
                                    <Icon name="alert" className="size-4" />
                                    {targetError}
                              </p>
                        )}
                  </fieldset>

                  <fieldset className="flex flex-col gap-3">
                        <legend className="mb-1 text-title font-bold text-ink">Restricciones</legend>
                        <p className="text-sm text-ink-muted">Tu chef las tendrá en cuenta al proponerte recetas.</p>
                        <div className="flex flex-wrap gap-2">
                              {[...new Set([...restrictionSuggestions, ...restrictions])].map((value) => {
                                    const selected = restrictions.includes(value);
                                    return (
                                          <button
                                                key={value}
                                                type="button"
                                                aria-pressed={selected}
                                                onClick={() => toggleRestriction(value)}
                                                className={chipClass(selected)}
                                          >
                                                {selected && <Icon name="check" className="size-4" strokeWidth={2.5} />}
                                                {value}
                                          </button>
                                    );
                              })}
                        </div>
                        <div className="flex items-end gap-2">
                              <TextField
                                    label="Otra restricción"
                                    name="customRestriction"
                                    placeholder="Ej. sin mariscos"
                                    value={customRestriction}
                                    onChange={(e) => setCustomRestriction(e.target.value)}
                                    onKeyDown={(e) => {
                                          if (e.key === "Enter") {
                                                e.preventDefault();
                                                addCustomRestriction();
                                          }
                                    }}
                                    className="flex-1"
                              />
                              <Button variant="secondary" onClick={addCustomRestriction} disabled={!customRestriction.trim()}>
                                    Añadir
                              </Button>
                        </div>
                  </fieldset>

                  <fieldset className="flex flex-col gap-3">
                        <legend className="mb-3 text-title font-bold text-ink">Comidas al día</legend>
                        <Stepper
                              label="Comidas al día"
                              value={mealsPerDay}
                              onChange={setMealsPerDay}
                              min={1}
                              max={12}
                              suffix="comidas"
                        />
                  </fieldset>

                  <div className="flex flex-col gap-2">
                        <Button type="submit" fullWidth loading={submitting}>
                              {submitLabel}
                        </Button>
                        {secondaryAction}
                  </div>
            </form>
      );
}
