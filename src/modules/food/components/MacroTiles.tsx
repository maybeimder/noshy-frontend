import { tones } from "@/shared/lib/tones";
import type { Nutrients } from "../types";
import { formatNutrient, macroTiles } from "../utils/nutrients";

// Calorías / Proteína / Carbos / Grasa tiles (ref/Tu chef.png macros row).
export default function MacroTiles({ nutrients, compact = false }: { nutrients: Nutrients; compact?: boolean }) {
      return (
            <dl className={`grid gap-2 ${compact ? "grid-cols-4" : "grid-cols-2"}`}>
                  {macroTiles.map(({ key, label, unit, tone }) => (
                        <div key={key} className={`rounded-control text-center ${compact ? "p-2" : "p-3"} ${tones[tone].soft}`}>
                              <dd className={`font-display font-extrabold tabular-nums ${compact ? "text-base" : "text-section"} ${tones[tone].ink}`}>
                                    {formatNutrient(nutrients, key)}
                                    <span className="ml-0.5 text-xs">{unit}</span>
                              </dd>
                              <dt className={`text-xs font-bold ${tones[tone].ink}`}>{label}</dt>
                        </div>
                  ))}
            </dl>
      );
}
