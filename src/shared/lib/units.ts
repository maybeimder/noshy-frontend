import type { Unit } from "../types/api";
import { foodGlyphFor, type FoodGlyph } from "./food-glyphs";

const labels: Record<Unit, string> = {
      g: "g",
      kg: "kg",
      ml: "ml",
      l: "L",
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

const names: Record<Unit, string> = {
      g: "Gramos",
      kg: "Kilos",
      ml: "Mililitros",
      l: "Litros",
      unit: "Unidades",
      clove: "Dientes",
      tbsp: "Cucharadas",
      tsp: "Cucharaditas",
      cup: "Tazas",
      pinch: "Pizcas",
      toTaste: "Al gusto",
      all: "Todo",
};
export const unitName = (unit: Unit) => names[unit];

/** What − and + move by. */
const steps: Partial<Record<Unit, number>> = { g: 50, kg: 0.5, ml: 50, l: 0.5, cup: 0.5, tbsp: 1, tsp: 1 };
export const amountStep = (unit: Unit) => steps[unit] ?? 1;

/** Accepts "1,5" and "1.5"; null when it is not a positive number. */
export function parseAmount(text: string): number | null {
      const value = Number(text.trim().replace(",", "."));
      return Number.isFinite(value) && value > 0 ? value : null;
}

/** 1.5 → "1,5", as it is typed here. */
export const formatAmount = (value: number) => String(Math.round(value * 100) / 100).replace(".", ",");

// ---------- Units that make sense for each food ----------
/** `suggested` first in the picker (its first one is the default); `other` is still one tap away. */
export type UnitChoices = { suggested: Unit[]; other: Unit[] };

const usual: [Unit[], FoodGlyph[]][] = [
      [["g", "kg"], ["steak", "ham", "bacon", "sausage", "drumstick", "fish", "shrimp", "tofu", "cheese", "pasta", "potato"]],
      [["ml", "l", "cup"], ["milk", "glass", "water", "soda", "coffee", "wine", "beer", "soup", "coconut"]],
      [["cup", "g", "kg"], ["rice", "wheat", "cereal", "flour", "beans", "sugar", "nut"]],
      [["tbsp", "tsp", "ml"], ["oil", "sauce", "honey", "jar", "can", "butter"]],
      [["pinch", "tsp", "tbsp"], ["salt", "spice"]],
      [["clove", "unit", "g"], ["garlic"]],
      [["unit", "g"], ["egg", "apple", "banana", "citrus", "mango", "pineapple", "avocado", "pear", "tomato", "carrot", "onion", "cucumber", "bellPepper", "chili", "corn", "eggplant", "pumpkin", "broccoli", "arepa", "taco", "bread", "cookie"]],
      [["g", "unit", "cup"], ["leafy", "herb", "mushroom", "strawberry", "grape", "cherry"]],
      [["g", "cup", "unit"], ["yogurt"]],
];
const usualByGlyph = new Map(usual.flatMap(([units, glyphs]) => glyphs.map((g) => [g, units] as const)));
const any: Unit[] = ["g", "kg", "cup", "tbsp", "tsp"];
const liquid: Unit[] = ["ml", "l"];

type Food = { label: string; icon?: string | null; defaultUnit: Unit; allowedUnits: Unit[]; /** Accepted too. Missing on older servers: then only `allowedUnits` count. */ otherUnits?: Unit[] };

export function unitChoices(food: Food): UnitChoices {
      const accepted = [...new Set([...food.allowedUnits, ...(food.otherUnits ?? [])])];
      const glyph = foodGlyphFor(food.label, food.icon);
      const fitting = ((glyph && usualByGlyph.get(glyph)) ?? []).filter((u) => accepted.includes(u));
      // A free text ingredient or one with no better idea: what the catalog says.
      const suggested = fitting.length ? fitting : [food.defaultUnit, ...food.allowedUnits.filter((u) => u !== food.defaultUnit)].slice(0, 3);
      return { suggested, other: accepted.filter((u) => !suggested.includes(u)) };
}

/** Same, for an ingredient already in a recipe, of which only the unit in use is known. */
export function unitChoicesFor(label: string, icon: string | null | undefined, unit: Unit): UnitChoices {
      const glyph = foodGlyphFor(label, icon);
      const isLiquid = liquid.includes(unit) || ((glyph && usualByGlyph.get(glyph)) ?? []).includes("ml");
      const choices = unitChoices({ label, icon, defaultUnit: unit, allowedUnits: [unit], otherUnits: [...any, ...(isLiquid ? liquid : [])] });
      return choices.suggested.includes(unit) ? choices : { suggested: [unit, ...choices.suggested], other: choices.other.filter((u) => u !== unit) };
}
