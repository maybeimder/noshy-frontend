import { Sparkle } from "@/shared/components/ui/Doodles";
import { formatNumber } from "@/shared/lib/format";
import { tones } from "@/shared/lib/tones";
import { RoundStepper } from "./OnboardingUI";

export type Targets = { protein: number | null; carbs: number | null; fat: number | null; fibre: number | null };

type StartingPointProps = {
      calories: number | null;
      range: { min: number; max: number; step: number };
      targets: Targets;
      /** What the number is based on. */
      note: string;
      onChange: (kcal: number) => void;
};

/** «Punto de partida»: the recommended calories with their macros, adjustable. */
export default function StartingPoint({ calories, range, targets, note, onChange }: StartingPointProps) {
      const macros = [
            ["Proteína", targets.protein, "mint"],
            ["Carbos", targets.carbs, "rose"],
            ["Grasas", targets.fat, "mustard"],
            ["Fibra", targets.fibre, "lilac"],
      ] as const;
      return (
            <section aria-labelledby="starting-point" className="rounded-card bg-plum-glow p-5 text-card shadow-[0_18px_36px_-20px_rgb(43_20_51/0.7)]">
                  <div className="flex items-start justify-between gap-3">
                        <div>
                              <h2 id="starting-point" className="font-sans text-xs font-extrabold tracking-wider text-secondary-soft uppercase">
                                    Punto de partida
                              </h2>
                              <p className="mt-1 flex items-baseline gap-1.5" aria-live="polite">
                                    <span className="font-display text-metric font-extrabold tabular-nums">{calories === null ? "—" : formatNumber(calories)}</span>
                                    <span className="text-sm font-bold text-secondary-soft">kcal/día</span>
                              </p>
                        </div>
                        <RoundStepper label="Calorías" value={calories ?? range.min} min={range.min} max={range.max} step={range.step} surface="dark" onChange={onChange} />
                  </div>
                  <dl className="mt-4 grid grid-cols-4 gap-2">
                        {macros.map(([label, grams, tone]) => (
                              <div key={label} className={`flex flex-col-reverse items-center rounded-control py-2.5 ${tones[tone].soft}`}>
                                    <dt className={`text-xs font-extrabold uppercase ${tones[tone].ink}`}>{label}</dt>
                                    <dd className="font-display text-title font-extrabold text-ink tabular-nums">{grams === null ? "—" : `${grams}g`}</dd>
                              </div>
                        ))}
                  </dl>
                  {/* Two lines reserved: the note changes as the user types. */}
                  <p className="mt-4 flex min-h-10 items-start gap-2 text-sm text-card/85">
                        <Sparkle className="mt-0.5 size-4 shrink-0 text-secondary" />
                        {note}
                  </p>
            </section>
      );
}
