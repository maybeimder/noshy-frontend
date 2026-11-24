import type { Macros } from "@/shared/types/api";

// Same order and colours everywhere a recipe shows its macros (detalle, chat, nueva receta).
const tiles = [
      { key: "kcal", label: "kcal", unit: "", tone: "bg-peach-soft text-peach-ink" },
      { key: "proteinG", label: "prot", unit: "g", tone: "bg-mint-soft text-mint-ink" },
      { key: "carbsG", label: "carb", unit: "g", tone: "bg-rose-soft text-rose-ink" },
      { key: "fatG", label: "grasa", unit: "g", tone: "bg-mustard-soft text-mustard-ink" },
] as const;

const names = { kcal: "kilocalorías", proteinG: "proteína", carbsG: "carbohidratos", fatG: "grasa" };

/** Four macro tiles per serving: number on top, short uppercase label under it. */
export default function MacroTiles({ macros, size = "md", className = "" }: { macros: Macros; size?: "sm" | "md"; className?: string }) {
      return (
            <dl aria-label="Por porción" className={`grid grid-cols-4 gap-2 ${className}`}>
                  {tiles.map(({ key, label, unit, tone }) => (
                        <div key={key} className={`flex flex-col-reverse items-center rounded-control text-center ${size === "sm" ? "py-2" : "py-3"} ${tone}`}>
                              <dt className="text-xs font-extrabold uppercase">
                                    <span aria-hidden>{label}</span>
                                    <span className="sr-only">{names[key]}</span>
                              </dt>
                              <dd className={`font-display font-extrabold text-ink tabular-nums ${size === "sm" ? "text-base" : "text-title"}`}>
                                    {Math.round(macros[key])}
                                    {unit}
                              </dd>
                        </div>
                  ))}
            </dl>
      );
}
