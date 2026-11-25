import Icon from "@/shared/components/ui/Icon";
import { fieldClass } from "@/shared/components/ui/TextField";

/** Search box over a list of recipes; what it finds comes from the API. */
export default function RecipeSearch({ label, placeholder, value, onChange }: { label: string; placeholder: string; value: string; onChange: (value: string) => void }) {
      return (
            <label className="relative block">
                  <span className="sr-only">{label}</span>
                  <Icon name="search" className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted" />
                  <input type="search" autoComplete="off" maxLength={60} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className={`${fieldClass("card")} min-h-12 rounded-full pr-4 pl-12 shadow-soft`} />
            </label>
      );
}
