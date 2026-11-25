import Icon, { type IconName } from "@/shared/components/ui/Icon";

type PlacePickerProps<T extends string> = {
      label: string;
      options: { id: T; label: string; icon: IconName }[];
      value: T | null;
      onChange: (id: T) => void;
      className?: string;
};

/** Where food is kept, as round icons: fridge, cupboard, freezer. The name shows on hover and to screen readers. */
export default function PlacePicker<T extends string>({ label, options, value, onChange, className = "" }: PlacePickerProps<T>) {
      return (
            <div role="radiogroup" aria-label={label} className={`flex gap-2 ${className}`}>
                  {options.map((option) => {
                        const selected = option.id === value;
                        return (
                              <button
                                    key={option.id}
                                    type="button"
                                    role="radio"
                                    aria-checked={selected}
                                    aria-label={option.label}
                                    title={option.label}
                                    onClick={() => onChange(option.id)}
                                    className={`grid h-12 min-w-12 flex-1 place-items-center rounded-full transition-[background-color,scale] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
                                          selected ? "bg-brand text-card shadow-brand" : "bg-card text-ink-muted hover:text-ink"
                                    }`}
                              >
                                    <Icon name={option.icon} className="size-6" strokeWidth={selected ? 2 : 1.75} />
                              </button>
                        );
                  })}
            </div>
      );
}
