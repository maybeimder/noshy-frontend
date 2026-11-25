import { useEffect, useId, useRef, useState } from "react";
import { amountStep, formatAmount, parseAmount, unitLabel, unitName, type UnitChoices } from "@/shared/lib/units";
import type { Unit } from "@/shared/types/api";
import Icon from "./Icon";

type QuantityFieldProps = {
      /** What is being measured, for screen readers («Arroz»). */
      label: string;
      choices: UnitChoices;
      unit: Unit;
      onUnit: (unit: Unit) => void;
      /** As typed («1,5»). */
      amount: string;
      onAmount: (amount: string) => void;
      error?: string;
      placeholder?: string;
      tone?: "field" | "card";
};

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";

/** Unit on the left, amount with − and + on the right, in one pill. */
export default function QuantityField({ label, choices, unit, onUnit, amount, onAmount, error, placeholder = "0", tone = "field" }: QuantityFieldProps) {
      const id = useId();
      const step = amountStep(unit);
      const value = parseAmount(amount) ?? 0;
      const move = (direction: 1 | -1) => {
            // To the next multiple of the step: 130 g + 50 is 150, not 180.
            const next = direction > 0 ? (Math.floor(value / step + 1e-9) + 1) * step : (Math.ceil(value / step - 1e-9) - 1) * step;
            onAmount(next > 0 ? formatAmount(next) : "");
      };
      const round = `grid size-9 shrink-0 place-items-center rounded-full disabled:opacity-35 ${focus}`;

      return (
            <div className="flex flex-col gap-1.5">
                  <div role="group" aria-label={`Cantidad de ${label}`} className={`flex items-center gap-1 rounded-full p-1.5 ${tone === "card" ? "bg-card" : "bg-field"} ${error ? "ring-2 ring-error" : ""}`}>
                        <UnitPicker label={label} choices={choices} unit={unit} onUnit={onUnit} />
                        <button type="button" aria-label={`Menos ${label}`} disabled={value <= 0} onClick={() => move(-1)} className={`${round} ml-auto bg-blush text-ink`}>
                              <Icon name="minus" className="size-4" strokeWidth={2.5} />
                        </button>
                        <input
                              id={id}
                              inputMode="decimal"
                              autoComplete="off"
                              maxLength={7}
                              aria-label={`Cantidad de ${label} en ${unitName(unit).toLowerCase()}`}
                              aria-invalid={error ? true : undefined}
                              aria-describedby={error ? `${id}-error` : undefined}
                              placeholder={placeholder}
                              value={amount}
                              onChange={(e) => onAmount(e.target.value)}
                              className="h-11 w-16 min-w-0 rounded-control bg-transparent text-center font-display text-[1.375rem] font-semibold text-ink tabular-nums placeholder:text-ink-muted/50 focus-visible:outline-2 focus-visible:outline-primary-strong"
                        />
                        <button type="button" aria-label={`Más ${label}`} onClick={() => move(1)} className={`${round} bg-brand text-card`}>
                              <Icon name="plus" className="size-4" strokeWidth={2.5} />
                        </button>
                  </div>
                  {error && (
                        <p id={`${id}-error`} className="flex items-center gap-1 px-2 text-sm font-semibold text-error">
                              <Icon name="alert" className="size-4 shrink-0" />
                              {error}
                        </p>
                  )}
            </div>
      );
}

/** Opens in the top layer, so no card or sheet cuts it off. */
function UnitPicker({ label, choices, unit, onUnit }: Pick<QuantityFieldProps, "label" | "choices" | "unit" | "onUnit">) {
      const id = useId();
      const button = useRef<HTMLButtonElement>(null);
      const panel = useRef<HTMLDivElement>(null);
      const [open, setOpen] = useState(false);

      useEffect(() => {
            const el = panel.current;
            if (!el) return;
            const onToggle = (event: Event) => setOpen((event as ToggleEvent).newState === "open");
            el.addEventListener("toggle", onToggle);
            return () => el.removeEventListener("toggle", onToggle);
      }, []);

      // Beside its button while it is open: under it, or over it near the bottom of the screen.
      useEffect(() => {
            if (!open) return;
            const place = () => {
                  const anchor = button.current?.getBoundingClientRect();
                  const el = panel.current;
                  if (!anchor || !el) return;
                  const below = window.innerHeight - anchor.bottom > el.offsetHeight + 16;
                  el.style.left = `${Math.max(12, Math.min(anchor.left, window.innerWidth - el.offsetWidth - 12))}px`;
                  el.style.top = `${below ? anchor.bottom + 8 : Math.max(12, anchor.top - el.offsetHeight - 8)}px`;
            };
            place();
            panel.current?.querySelector<HTMLElement>('[aria-pressed="true"]')?.focus({ preventScroll: true });
            window.addEventListener("scroll", place, { passive: true, capture: true });
            window.addEventListener("resize", place);
            return () => {
                  window.removeEventListener("scroll", place, { capture: true });
                  window.removeEventListener("resize", place);
            };
      }, [open]);

      const pick = (next: Unit) => {
            onUnit(next);
            panel.current?.hidePopover();
            button.current?.focus();
      };
      const group = (title: string, units: Unit[]) =>
            units.length > 0 && (
                  <div role="group" aria-label={title} className="flex flex-col">
                        <p className="px-3 pt-2 pb-1 text-xs font-bold text-ink-muted">{title}</p>
                        {units.map((u) => (
                              <button
                                    key={u}
                                    type="button"
                                    aria-pressed={u === unit}
                                    onClick={() => pick(u)}
                                    className={`flex min-h-11 items-center gap-3 rounded-control px-3 text-left text-sm font-bold text-ink focus-visible:outline-2 focus-visible:outline-primary-strong ${u === unit ? "bg-picked" : "hover:bg-field"}`}
                              >
                                    <span className="flex-1">{unitName(u)}</span>
                                    {unitName(u).toLowerCase() !== unitLabel(u) && <span className="text-xs font-semibold text-ink-muted">{unitLabel(u)}</span>}
                                    {u === unit && <Icon name="check" className="size-4 text-primary-strong" strokeWidth={3} />}
                              </button>
                        ))}
                  </div>
            );

      return (
            <>
                  <button
                        ref={button}
                        type="button"
                        popoverTarget={id}
                        aria-expanded={open}
                        aria-label={`Unidad de ${label}: ${unitName(unit)}. Cambiar`}
                        className={`flex min-h-11 min-w-[5.5rem] shrink-0 items-center justify-between gap-1 rounded-full bg-blush pr-2.5 pl-4 font-display text-base font-semibold text-ink ${focus}`}
                  >
                        {unitLabel(unit)}
                        <Icon name="chevronDown" className={`size-4 text-primary-strong transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2.5} />
                  </button>
                  <div ref={panel} id={id} popover="auto" className="fixed inset-auto m-0 max-h-[60dvh] w-56 overflow-y-auto rounded-card border-0 bg-card p-2 text-ink shadow-[0_18px_40px_-16px_rgb(46_19_45/0.5)]">
                        {group("Lo usual", choices.suggested)}
                        {group("Otras medidas", choices.other)}
                  </div>
            </>
      );
}
