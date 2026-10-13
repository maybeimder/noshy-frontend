import type { Tone } from "@/shared/lib/tones";
import type { NutrientKey, Nutrients } from "../types";

const number = new Intl.NumberFormat("es", { maximumFractionDigits: 1, useGrouping: "always" });
const whole = new Intl.NumberFormat("es", { maximumFractionDigits: 0, useGrouping: "always" });

/** The four macros shown as coloured tiles (same colours as the plan). */
export const macroTiles: { key: NutrientKey; label: string; unit: string; tone: Tone }[] = [
      { key: "kcal", label: "Calorías", unit: "kcal", tone: "peach" },
      { key: "protein_g", label: "Proteína", unit: "g", tone: "rose" },
      { key: "carbs_g", label: "Carbos", unit: "g", tone: "mustard" },
      { key: "fat_g", label: "Grasa", unit: "g", tone: "sky" },
];

/** Secondary nutrients listed under the tiles. */
export const nutrientRows: { key: NutrientKey; label: string; unit: string }[] = [
      { key: "sugars_g", label: "Azúcares", unit: "g" },
      { key: "sat_fat_g", label: "Grasas saturadas", unit: "g" },
      { key: "fiber_g", label: "Fibra", unit: "g" },
      { key: "salt_g", label: "Sal", unit: "g" },
];

/** "12,5" or "—" when the catalog has no value for it. */
export const formatNutrient = (nutrients: Nutrients, key: NutrientKey) => {
      const value = nutrients[key];
      if (typeof value !== "number") return "—";
      return key === "kcal" ? whole.format(value) : number.format(value);
};

export const scale = (nutrients: Nutrients, factor: number): Nutrients =>
      Object.fromEntries(Object.entries(nutrients).map(([k, v]) => [k, typeof v === "number" ? v * factor : v]));
