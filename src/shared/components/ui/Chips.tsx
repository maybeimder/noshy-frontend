import Icon, { type IconName } from "./Icon";

type ChipsProps<T extends string> = {
      label: string;
      options: { id: T; label: string; icon?: IconName; count?: number }[];
      value: T;
      onChange: (id: T) => void;
      /** "bleed": scrolls to the screen edges of a px-5 page. */
      bleed?: boolean;
};

/** Single-choice row of pills (filters, places, slots). Bleeding rows leave room below for the selected pill's glow. */
export default function Chips<T extends string>({ label, options, value, onChange, bleed = false }: ChipsProps<T>) {
      return (
            <div role="group" aria-label={label} className={`scrollbar-none flex gap-2 overflow-x-auto ${bleed ? "-mx-5 -mb-5 px-5 pt-1 pb-6" : "py-1"}`}>
                  {options.map((option) => {
                        const selected = option.id === value;
                        return (
                              <button
                                    key={option.id}
                                    type="button"
                                    aria-pressed={selected}
                                    onClick={() => onChange(option.id)}
                                    className={`inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-[1.125rem] text-sm font-bold transition-[background-color,scale] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
                                          selected ? "bg-brand text-card shadow-brand" : bleed ? "bg-card text-ink hover:bg-field" : "bg-field text-ink hover:bg-line"
                                    }`}
                              >
                                    {option.icon && <Icon name={option.icon} className={`size-4 ${selected && option.icon === "flame" ? "fill-current" : ""}`} strokeWidth={2.25} />}
                                    {option.label}
                                    {option.count !== undefined && <span className={`text-xs font-bold tabular-nums ${selected ? "text-card/80" : "text-ink-muted"}`}>{option.count}</span>}
                              </button>
                        );
                  })}
            </div>
      );
}
