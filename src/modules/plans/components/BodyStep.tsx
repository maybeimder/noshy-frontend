import { useId, useState, type CSSProperties } from "react";
import Button from "@/shared/components/ui/Button";
import Icon from "@/shared/components/ui/Icon";
import TextField from "@/shared/components/ui/TextField";
import { parseAmount } from "@/shared/lib/units";
import { bodyUnit, emptyBody, isBodyEmpty, type BodyDraft, type BodyErrors, type BodyField, type Sex } from "../utils/body";
import { Figure, VerticalSlider } from "./BodyFigure";
import { Chip, GroupLabel, StepTitle } from "./OnboardingUI";

const sexes: { id: Sex | null; label: string }[] = [
      { id: "female", label: "Mujer" },
      { id: "male", label: "Hombre" },
      { id: null, label: "Prefiero no decir" },
];

/** Where the sliders reach and wait; the boxes accept anything the form does. */
const sliders = {
      age: { min: 13, max: 90, start: 30 },
      height: { min: 120, max: 210, start: 165, mark: 15 },
      weight: { min: 35, max: 155, start: 65, mark: 20 },
} as const;

type BodyStepProps = { value: BodyDraft; errors: BodyErrors; onChange: (value: BodyDraft) => void };

/** «Sobre ti»: sex, height and weight on a little person, age, plus optional measurements, to compute the starting point. */
export default function BodyStep({ value, errors, onChange }: BodyStepProps) {
      const [measuresOpen, setMeasuresOpen] = useState(Boolean(value.waist || value.neck || value.hip));
      const set = (patch: Partial<BodyDraft>) => onChange({ ...value, ...patch });
      const field = (name: BodyField, label: string) => (
            <TextField label={label} inputMode="decimal" autoComplete="off" maxLength={5} suffix={bodyUnit(name)} value={value[name]} onChange={(e) => set({ [name]: e.target.value })} error={errors[name]} />
      );
      const number = (name: keyof typeof sliders) => parseAmount(value[name]) ?? sliders[name].start;
      const age = number("age");
      const ageShown = Math.min(sliders.age.max, Math.max(sliders.age.min, age));

      return (
            <>
                  <StepTitle title="Cuéntame de ti" icon="user">
                        Con esto calculo tus calorías y macros. Es opcional: puedes saltarlo y completarlo después.
                  </StepTitle>

                  <section aria-labelledby="sex">
                        <GroupLabel id="sex">Sexo</GroupLabel>
                        <div role="radiogroup" aria-labelledby="sex" className="flex flex-wrap gap-2">
                              {sexes.map((s) => (
                                    <Chip key={s.label} role="radio" selected={value.sex === s.id} onClick={() => set({ sex: s.id })}>
                                          {s.label}
                                    </Chip>
                              ))}
                        </div>
                  </section>

                  <section aria-label="Estatura y peso" className="rounded-[2rem] bg-card p-5 shadow-soft">
                        <div className="grid grid-cols-[auto_1fr_auto] gap-x-2">
                              <p className="flex items-center gap-1.5 font-display font-semibold text-ink">Estatura</p>
                              <span />
                              <p className="text-right font-display font-semibold text-ink">Peso</p>

                              <div className="h-64 py-5">
                                    <VerticalSlider label="Estatura" unit="cm" marks="left" {...sliders.height} value={number("height")} touched={Boolean(value.height.trim())} onChange={(n) => set({ height: String(n) })} />
                              </div>
                              <div className="flex h-64 items-end justify-center rounded-card bg-[radial-gradient(60%_50%_at_50%_60%,var(--color-primary-soft),transparent)] py-3">
                                    <Figure heightCm={Math.max(100, number("height"))} weightKg={number("weight")} sex={value.sex} />
                              </div>
                              <div className="h-64 py-5">
                                    <VerticalSlider label="Peso" unit="kg" marks="right" {...sliders.weight} value={number("weight")} touched={Boolean(value.weight.trim())} onChange={(n) => set({ weight: String(n) })} />
                              </div>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-3">
                              <NumberBox label="Estatura" unit="cm" placeholder={String(sliders.height.start)} value={value.height} onChange={(height) => set({ height })} error={errors.height} />
                              <NumberBox label="Peso" unit="kg" placeholder={String(sliders.weight.start)} value={value.weight} onChange={(weight) => set({ weight })} error={errors.weight} />
                        </div>
                  </section>

                  <section aria-label="Edad" className="flex flex-col gap-1 rounded-[2rem] bg-card p-5 shadow-soft">
                        <div className="flex items-center justify-between gap-3">
                              <p className="font-display font-semibold text-ink">Edad</p>
                              <div className="w-36">
                                    <NumberBox label="Edad" unit="años" placeholder={String(sliders.age.start)} value={value.age} onChange={(next) => set({ age: next })} />
                              </div>
                        </div>
                        <input
                              type="range"
                              aria-label="Edad"
                              aria-valuetext={value.age.trim() ? `${age} años` : "Sin responder"}
                              min={sliders.age.min}
                              max={sliders.age.max}
                              value={ageShown}
                              onChange={(e) => set({ age: e.target.value })}
                              className={`brand-range w-full ${value.age.trim() ? "" : "opacity-50"}`}
                              style={{ "--fill": `${((ageShown - sliders.age.min) / (sliders.age.max - sliders.age.min)) * 100}%` } as CSSProperties}
                        />
                        {errors.age && <p className="text-sm font-semibold text-error">{errors.age}</p>}
                  </section>

                  <section aria-labelledby="measures" className="rounded-[2rem] bg-card p-5 shadow-soft">
                        <button
                              type="button"
                              aria-expanded={measuresOpen}
                              aria-controls="measures-fields"
                              onClick={() => setMeasuresOpen((v) => !v)}
                              className="flex min-h-11 w-full items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                        >
                              <span className="min-w-0 flex-1">
                                    <span id="measures" className="block font-display font-semibold text-ink">
                                          Tus medidas
                                    </span>
                                    <span className="block text-sm text-ink-muted">Opcional: afinan el cálculo con tu composición corporal</span>
                              </span>
                              <Icon name="chevronDown" className={`size-6 shrink-0 text-ink-muted transition-transform ${measuresOpen ? "rotate-180" : ""}`} />
                        </button>
                        {measuresOpen && (
                              <div id="measures-fields" className="mt-4 flex flex-col gap-3">
                                    {value.sex === null && <p className="text-sm font-semibold text-ink-muted">Elige mujer u hombre para usarlas: la fórmula cambia.</p>}
                                    <div className="grid grid-cols-2 items-start gap-3">
                                          {field("waist", "Cintura")}
                                          {field("neck", "Cuello")}
                                          {value.sex !== "male" && field("hip", "Cadera")}
                                    </div>
                                    <p className="text-xs text-ink-muted">Mide sin apretar: cintura a la altura del ombligo, cuello bajo la nuez y cadera en la parte más ancha.</p>
                              </div>
                        )}
                  </section>

                  <div className="flex flex-col gap-2">
                        <label className="flex min-h-11 items-start gap-3 text-sm font-semibold text-ink">
                              <input type="checkbox" checked={value.consent} onChange={(e) => set({ consent: e.target.checked })} className="mt-0.5 size-6 shrink-0 accent-primary-strong" />
                              Autorizo a Noshy a guardar estos datos de salud para calcular mis metas. Puedo borrarlos cuando quiera.
                        </label>
                        {errors.consent && (
                              <p role="alert" className="text-sm font-semibold text-error">
                                    {errors.consent}
                              </p>
                        )}
                        {!isBodyEmpty(value) && (
                              <Button variant="tertiary" onClick={() => onChange(emptyBody)} className="self-start">
                                    Borrar estos datos
                              </Button>
                        )}
                  </div>
            </>
      );
}

/** The quick way: type the number. */
function NumberBox({ label, unit, placeholder, value, onChange, error }: { label: string; unit: string; placeholder: string; value: string; onChange: (value: string) => void; error?: string }) {
      const id = useId();
      return (
            <div>
                  <label className={`flex min-h-13 items-center justify-center gap-1.5 rounded-full bg-blush px-4 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-strong ${error ? "ring-2 ring-error" : ""}`}>
                        <span className="sr-only">{label}</span>
                        <input
                              inputMode="decimal"
                              autoComplete="off"
                              maxLength={5}
                              placeholder={placeholder}
                              value={value}
                              onChange={(e) => onChange(e.target.value)}
                              aria-invalid={error ? true : undefined}
                              aria-describedby={error ? id : undefined}
                              className="w-14 min-w-0 bg-transparent text-right font-display supports-[field-sizing:content]:w-auto supports-[field-sizing:content]:[field-sizing:content] text-[1.5rem] font-semibold text-ink tabular-nums placeholder:text-ink-muted/45 focus-visible:outline-none"
                        />
                        <span className="text-sm font-semibold text-ink-muted">{unit}</span>
                  </label>
                  {error && (
                        <p id={id} className="mt-1 px-2 text-sm font-semibold text-error">
                              {error}
                        </p>
                  )}
            </div>
      );
}
