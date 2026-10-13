import type { ChangeEvent } from "react";
import TextField from "@/shared/components/ui/TextField";
import type { InventoryItemInput } from "../types";
import { parseQuantity, UNITS_LIST_ID } from "../utils/units";

export type IngredientDraft = { name: string; quantity: string; unit: string };
export type IngredientErrors = Partial<Record<keyof IngredientDraft, string>>;

export const emptyIngredient = (): IngredientDraft => ({ name: "", quantity: "", unit: "g" });

export const toDraft = (input: InventoryItemInput): IngredientDraft => ({
      name: input.name,
      quantity: String(input.quantity),
      unit: input.unit,
});

/** Same rules as the backend DTO: non-empty name and unit, quantity > 0. */
export function validateIngredient(draft: IngredientDraft) {
      const errors: IngredientErrors = {};
      const quantity = parseQuantity(draft.quantity);
      if (!draft.name.trim()) errors.name = "Escribe el nombre.";
      if (quantity === null) errors.quantity = "Mayor que 0.";
      if (!draft.unit.trim()) errors.unit = "Falta la unidad.";

      const input: InventoryItemInput | null =
            Object.keys(errors).length === 0 && quantity !== null
                  ? { name: draft.name.trim(), quantity, unit: draft.unit.trim() }
                  : null;
      return { errors, input };
}

type IngredientFieldsProps = {
      value: IngredientDraft;
      onChange: (value: IngredientDraft) => void;
      errors?: IngredientErrors;
      /** Distinguishes labels when several rows are on screen ("Ingrediente 2"). */
      labelSuffix?: string;
      autoFocus?: boolean;
};

// Name + quantity + unit, shared by the pantry and the recipe editor.
export default function IngredientFields({
      value,
      onChange,
      errors = {},
      labelSuffix = "",
      autoFocus,
}: IngredientFieldsProps) {
      const set = (field: keyof IngredientDraft) => (e: ChangeEvent<HTMLInputElement>) =>
            onChange({ ...value, [field]: e.target.value });

      return (
            <div className="grid grid-cols-[1fr_5.5rem_5.5rem] items-start gap-2">
                  <TextField
                        label={`Ingrediente${labelSuffix}`}
                        name="name"
                        placeholder="Ej. tomate"
                        autoComplete="off"
                        value={value.name}
                        onChange={set("name")}
                        error={errors.name}
                        autoFocus={autoFocus}
                  />
                  <TextField
                        label="Cantidad"
                        name="quantity"
                        inputMode="decimal"
                        placeholder="0"
                        value={value.quantity}
                        onChange={set("quantity")}
                        error={errors.quantity}
                  />
                  <TextField
                        label="Unidad"
                        name="unit"
                        list={UNITS_LIST_ID}
                        autoComplete="off"
                        value={value.unit}
                        onChange={set("unit")}
                        error={errors.unit}
                  />
            </div>
      );
}
