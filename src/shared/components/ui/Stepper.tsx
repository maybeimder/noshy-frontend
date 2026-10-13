import Icon from "./Icon";

type StepperProps = {
      label: string;
      value: number;
      onChange: (value: number) => void;
      min?: number;
      max?: number;
      /** Visible text next to the number, e.g. "porciones". */
      suffix?: string;
};

export default function Stepper({ label, value, onChange, min = 1, max = 99, suffix }: StepperProps) {
      const button =
            "grid size-11 place-items-center rounded-control bg-secondary-soft text-ink hover:bg-secondary/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong disabled:cursor-not-allowed disabled:opacity-50";

      return (
            <div role="group" aria-label={label} className="flex items-center gap-3">
                  <button
                        type="button"
                        className={button}
                        onClick={() => onChange(Math.max(min, value - 1))}
                        disabled={value <= min}
                        aria-label={`Quitar uno (${label})`}
                  >
                        <Icon name="minus" className="size-5" />
                  </button>
                  <output aria-live="polite" className="min-w-12 text-center text-title font-bold tabular-nums">
                        {value}
                        {suffix && <span className="sr-only"> {suffix}</span>}
                  </output>
                  <button
                        type="button"
                        className={button}
                        onClick={() => onChange(Math.min(max, value + 1))}
                        disabled={value >= max}
                        aria-label={`Añadir uno (${label})`}
                  >
                        <Icon name="plus" className="size-5" />
                  </button>
                  {suffix && <span aria-hidden className="text-sm text-ink-muted">{suffix}</span>}
            </div>
      );
}
