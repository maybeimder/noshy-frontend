import type { Macros } from "@/shared/types/api";

// Same order and colours everywhere a recipe shows its macros (detalle, chat, nueva receta).
const tiles = [
      { key: "kcal", label: "kcal", unit: "", tone: "bg-kcal-tile text-kcal-ink" },
      { key: "proteinG", label: "prot", unit: "g", tone: "bg-protein-tile text-protein-ink" },
      { key: "carbsG", label: "carb", unit: "g", tone: "bg-carbs-tile text-carbs-ink" },
      { key: "fatG", label: "grasa", unit: "g", tone: "bg-fat-tile text-fat-ink" },
] as const;

const names = { kcal: "kilocalorías", proteinG: "proteína", carbsG: "carbohidratos", fatG: "grasa" };

/** Four macro tiles per serving: number on top, short uppercase label under it. */
export default function MacroTiles({ macros, size = "md", estimated = false, className = "" }: { macros: Macros; size?: "sm" | "md"; /** Adds «≈» to every number. */ estimated?: boolean; className?: string }) {
      return (
            <dl aria-label={estimated ? "Por porción, aproximado" : "Por porción"} className={`grid grid-cols-4 gap-2 ${className}`}>
                  {tiles.map(({ key, label, unit, tone }) => (
                        <div key={key} className={`flex flex-col-reverse items-center text-center ${size === "sm" ? "rounded-[1.125rem] py-2" : "rounded-card py-3"} ${tone}`}>
                              <dt className="text-xs font-bold tracking-wide uppercase">
                                    <span aria-hidden>{label}</span>
                                    <span className="sr-only">{names[key]}</span>
                              </dt>
                              <dd className={`font-display font-semibold text-ink tabular-nums ${size === "sm" ? "text-base" : "text-title"}`}>
                                    {estimated && <span aria-hidden>≈ </span>}
                                    {Math.round(macros[key])}
                                    {unit}
                              </dd>
                        </div>
                  ))}
            </dl>
      );
}
