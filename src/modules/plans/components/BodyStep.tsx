import { useState } from "react";
import Button from "@/shared/components/ui/Button";
import Icon from "@/shared/components/ui/Icon";
import TextField from "@/shared/components/ui/TextField";
import { bodyUnit, emptyBody, isBodyEmpty, type BodyDraft, type BodyErrors, type BodyField, type Sex } from "../utils/body";
import { Chip, GroupLabel, StepTitle } from "./OnboardingUI";

const sexes: { id: Sex | null; label: string }[] = [
      { id: "female", label: "Mujer" },
      { id: "male", label: "Hombre" },
      { id: null, label: "Prefiero no decir" },
];

type BodyStepProps = { value: BodyDraft; errors: BodyErrors; onChange: (value: BodyDraft) => void };

/** «Sobre ti»: age, weight and height, plus optional measurements, to compute the starting point. */
export default function BodyStep({ value, errors, onChange }: BodyStepProps) {
      const [measuresOpen, setMeasuresOpen] = useState(Boolean(value.waist || value.neck || value.hip));
      const set = (patch: Partial<BodyDraft>) => onChange({ ...value, ...patch });
      // "field" tone inside the white card, "card" tone on the page.
      const field = (name: BodyField, label: string, tone: "card" | "field" = "field") => (
            <TextField
                  label={label}
                  tone={tone}
                  inputMode="decimal"
                  autoComplete="off"
                  maxLength={5}
                  suffix={bodyUnit(name)}
                  value={value[name]}
                  onChange={(e) => set({ [name]: e.target.value })}
                  error={errors[name]}
            />
      );

      return (
            <>
                  <StepTitle title="Cuéntame de ti">Opcional. Con esto calculo tus calorías y macros; sin esto uso un promedio.</StepTitle>

                  <div className="grid grid-cols-2 items-start gap-3">
                        <div className="col-span-2">{field("age", "Edad", "card")}</div>
                        {field("weight", "Peso", "card")}
                        {field("height", "Estatura", "card")}
                  </div>

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

                  <section aria-labelledby="measures" className="rounded-card bg-card p-4 shadow-soft">
                        <button
                              type="button"
                              aria-expanded={measuresOpen}
                              aria-controls="measures-fields"
                              onClick={() => setMeasuresOpen((v) => !v)}
                              className="flex min-h-11 w-full items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                        >
                              <span className="min-w-0 flex-1">
                                    <span id="measures" className="block font-display text-title font-extrabold text-ink">
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
