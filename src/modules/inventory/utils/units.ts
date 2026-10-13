// Unit choices for the pantry and recipe editor. The backend accepts any unit and matches recipes by name + unit.
export const commonUnits = ["g", "kg", "ml", "l", "u", "taza", "cda", "cdta", "lata", "paquete"];

/** Parses "1,5" or "2" into a positive number, or null. */
export function parseQuantity(raw: string): number | null {
      const value = Number(raw.trim().replace(",", "."));
      return Number.isFinite(value) && value > 0 ? value : null;
}
