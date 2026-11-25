import type { ReactNode } from "react";
import Icon, { type IconName } from "@/shared/components/ui/Icon";
import { MarkerText, TitleIcon } from "@/shared/components/ui/ScribbleText";
import { tones, type Tone } from "@/shared/lib/tones";

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";

/** Round blush back button used across the onboarding and sign-up headers. */
export function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
      return (
            <button
                  type="button"
                  aria-label={label}
                  onClick={onClick}
                  className={`grid size-12 shrink-0 place-items-center rounded-full bg-primary-soft text-ink transition-colors hover:bg-rose-soft ${focusRing}`}
            >
                  <Icon name="back" strokeWidth={2.25} />
            </button>
      );
}

type StepHeaderProps = {
      step: number;
      total: number;
      label: string;
      onBack: () => void;
      backLabel: string;
      onSkip?: () => void;
};

// «Paso 1 de 6 · Objetivo» with a gradient progress bar and «Saltar».
export function StepHeader({ step, total, label, onBack, backLabel, onSkip }: StepHeaderProps) {
      return (
            <header className="flex items-center gap-4">
                  <BackButton label={backLabel} onClick={onBack} />
                  <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-ink-muted">
                              Paso {step} de {total} · {label}
                        </p>
                        <div
                              role="progressbar"
                              aria-label="Progreso"
                              aria-valuemin={0}
                              aria-valuemax={total}
                              aria-valuenow={step}
                              className="mt-2 h-2 overflow-hidden rounded-full bg-line"
                        >
                              <div className="h-full rounded-full bg-brand transition-[width] duration-500 ease-out" style={{ width: `${(step / total) * 100}%` }} />
                        </div>
                  </div>
                  {onSkip && (
                        <button type="button" onClick={onSkip} className={`min-h-11 shrink-0 rounded-control px-1 text-sm font-extrabold text-primary-strong ${focusRing}`}>
                              Saltar
                        </button>
                  )}
            </header>
      );
}

/** Big title with the felt-tip highlight plus a short line under it. */
export function StepTitle({ title, icon, children }: { title: string; icon: IconName; children: ReactNode }) {
      return (
            <div>
                  <h1 className="flex items-center gap-2.5 text-[1.75rem] leading-tight text-ink">
                        <TitleIcon name={icon} />
                        <span className="min-w-0 text-balance">
                              <MarkerText>{title}</MarkerText>
                        </span>
                  </h1>
                  <p className="mt-2 text-base text-ink-muted">{children}</p>
            </div>
      );
}

/** Uppercase label over a group of options («NIVEL DE ACTIVIDAD»). */
export function GroupLabel({ children, id }: { children: ReactNode; id?: string }) {
      return (
            <h2 id={id} className="mb-3 font-sans text-xs font-extrabold tracking-wider text-ink-muted uppercase">
                  {children}
            </h2>
      );
}

/** Tick in a pink disc when chosen, an empty ring when not: the state never relies on colour alone. */
export function CheckMark({ checked, shape = "square" }: { checked: boolean; shape?: "square" | "radio" }) {
      if (shape === "radio") {
            return (
                  <span aria-hidden className={`grid size-7 shrink-0 place-items-center rounded-full border-2 ${checked ? "border-primary-strong" : "border-line"}`}>
                        {checked && <span className="pop-in size-3.5 rounded-full bg-primary-strong" />}
                  </span>
            );
      }
      return (
            <span
                  aria-hidden
                  className={`grid size-7 shrink-0 place-items-center rounded-full ${checked ? "bg-primary-strong text-card" : "border-2 border-line bg-card"}`}
            >
                  {checked && <Icon name="check" className="pop-in size-4" strokeWidth={3} />}
            </span>
      );
}

type OptionCardProps = {
      type: "checkbox" | "radio";
      name: string;
      checked: boolean;
      onChange: () => void;
      disabled?: boolean;
      children: ReactNode;
      className?: string;
};

/** Native input behind a card: picked = pink border over the rose-peach blush. */
export function OptionCard({ type, name, checked, onChange, disabled, children, className = "" }: OptionCardProps) {
      return (
            <label
                  className={`relative flex cursor-pointer rounded-card border-2 transition-[border-color,background-color,scale] active:scale-[0.98] has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-strong has-disabled:cursor-not-allowed has-disabled:opacity-60 ${
                        checked ? "border-primary bg-picked shadow-soft" : "border-transparent bg-card shadow-soft hover:border-line"
                  } ${className}`}
            >
                  <input type={type} name={name} checked={checked} disabled={disabled} onChange={onChange} className="sr-only" />
                  {children}
            </label>
      );
}

/** Icon in a soft tone disc (white when `plain`, e.g. on a picked card) (option cards, summary rows). */
export function ToneIcon({ icon, tone, plain = false, className = "size-11" }: { icon: IconName; tone: Tone; plain?: boolean; className?: string }) {
      return (
            <span aria-hidden className={`grid shrink-0 place-items-center rounded-full ${plain ? "bg-card" : tones[tone].soft} ${tones[tone].ink} ${className}`}>
                  <Icon name={icon} className="size-5" strokeWidth={2} />
            </span>
      );
}

type ChipProps = {
      selected: boolean;
      onClick: () => void;
      children: ReactNode;
      role?: "radio";
};

/** Toggle pill: pink gradient with a tick when on, white with a hairline when off. */
export function Chip({ selected, onClick, children, role }: ChipProps) {
      return (
            <button
                  type="button"
                  role={role}
                  aria-pressed={role ? undefined : selected}
                  aria-checked={role ? selected : undefined}
                  onClick={onClick}
                  className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-extrabold transition-[background-color,scale] active:scale-95 ${focusRing} ${
                        selected ? "bg-brand text-card shadow-brand" : "border-2 border-line bg-card text-ink hover:border-primary/40"
                  }`}
            >
                  {selected && <Icon name="check" className="pop-in size-4" strokeWidth={3} />}
                  {children}
            </button>
      );
}

type StepperProps = {
      label: string;
      value: number;
      onChange: (value: number) => void;
      min: number;
      max: number;
      step?: number;
      /** "light": white minus on warm banners · "dark": translucent minus on plum. */
      surface?: "light" | "dark";
      display?: (value: number) => ReactNode;
};

/** − value + with a round ghost minus and the pink plus. */
export function RoundStepper({ label, value, onChange, min, max, step = 1, surface = "light", display }: StepperProps) {
      return (
            <div role="group" aria-label={label} className="flex shrink-0 items-center gap-3">
                  <button
                        type="button"
                        aria-label={`Menos ${label.toLowerCase()}`}
                        disabled={value <= min}
                        onClick={() => onChange(Math.max(min, value - step))}
                        className={`grid size-11 place-items-center rounded-full disabled:opacity-40 ${focusRing} ${
                              surface === "light" ? "bg-card/70 text-ink hover:bg-card" : "bg-card/15 text-card hover:bg-card/25"
                        }`}
                  >
                        <Icon name="minus" strokeWidth={2.25} />
                  </button>
                  {display && (
                        <output aria-live="polite" className="min-w-6 text-center font-display text-section font-extrabold tabular-nums">
                              {display(value)}
                        </output>
                  )}
                  <button
                        type="button"
                        aria-label={`Más ${label.toLowerCase()}`}
                        disabled={value >= max}
                        onClick={() => onChange(Math.min(max, value + step))}
                        className={`grid size-11 place-items-center rounded-full bg-primary-strong text-card shadow-brand hover:brightness-110 disabled:opacity-40 ${focusRing}`}
                  >
                        <Icon name="plus" strokeWidth={2.25} />
                  </button>
            </div>
      );
}
