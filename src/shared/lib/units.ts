import type { Unit } from "../types/api";

const labels: Record<Unit, string> = {
      g: "g",
      kg: "kg",
      ml: "ml",
      l: "l",
      unit: "und",
      clove: "dientes",
      tbsp: "cda",
      tsp: "cdta",
      cup: "tazas",
      pinch: "pizca",
      toTaste: "al gusto",
      all: "todo",
};
export const unitLabel = (unit: Unit) => labels[unit];

/** Accepts "1,5" and "1.5"; null when it is not a positive number. */
export function parseAmount(text: string): number | null {
      const value = Number(text.trim().replace(",", "."));
      return Number.isFinite(value) && value > 0 ? value : null;
}
