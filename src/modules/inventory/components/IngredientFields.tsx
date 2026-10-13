import { useId, type ChangeEvent, type ReactNode } from "react";
import Icon from "@/shared/components/ui/Icon";
import { fieldClass } from "@/shared/components/ui/TextField";
import type { InventoryItemInput } from "../types";
import { commonUnits, parseQuantity } from "../utils/units";

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
      if (!draft.name.trim()) errors.name = "Escribe el ingrediente.";
      if (quantity === null) errors.quantity = "La cantidad debe ser mayor que 0.";
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
      /** Distinguishes accessible names when several rows are on screen ("Ingrediente 2"). */
      labelSuffix?: string;
      autoFocus?: boolean;
      /** Control at the end of the row: the pantry "+" or the editor's trash button. */
      trailing?: ReactNode;
};

const label = "text-xs font-bold text-ink";
const control = `${fieldClass("field")} min-h-12 px-3 text-base`;

// Name + quantity + unit in one row (ref/Mi despensa.png, ref/Nueva receta.png).
export default function IngredientFields({
      value,
      onChange,
      errors = {},
      labelSuffix = "",
      autoFocus,
      trailing,
}: IngredientFieldsProps) {
      const id = useId();
      const set = (field: keyof IngredientDraft) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            onChange({ ...value, [field]: e.target.value });
      const units = commonUnits.includes(value.unit) || !value.unit ? commonUnits : [value.unit, ...commonUnits];
      const firstError = errors.name ?? errors.quantity ?? errors.unit;

      return (
            <div className="flex flex-col gap-2">
                  <div className={`grid items-end gap-2 ${trailing ? "grid-cols-[1fr_3.75rem_4.75rem_auto]" : "grid-cols-[1fr_3.75rem_4.75rem]"}`}>
                        <label className="flex min-w-0 flex-col gap-1.5">
                              <span className={label}>Ingrediente</span>
                              <input
                                    id={`${id}-name`}
                                    name="name"
                                    aria-label={`Ingrediente${labelSuffix}`}
                                    placeholder="Ej. tomate"
                                    autoComplete="off"
                                    value={value.name}
                                    onChange={set("name")}
                                    aria-invalid={errors.name ? true : undefined}
                                    autoFocus={autoFocus}
                                    className={`${control} ${errors.name ? "ring-2 ring-error" : ""}`}
                              />
                        </label>
                        <label className="flex flex-col gap-1.5">
                              <span className={label}>Cant.</span>
                              <input
                                    name="quantity"
                                    aria-label={`Cantidad${labelSuffix}`}
                                    inputMode="decimal"
                                    placeholder="0"
                                    value={value.quantity}
                                    onChange={set("quantity")}
                                    aria-invalid={errors.quantity ? true : undefined}
                                    className={`${control} text-center ${errors.quantity ? "ring-2 ring-error" : ""}`}
                              />
                        </label>
                        <label className="flex flex-col gap-1.5">
                              <span className={label}>Unidad</span>
                              <span className="relative">
                                    <select
                                          name="unit"
                                          aria-label={`Unidad${labelSuffix}`}
                                          value={value.unit}
                                          onChange={set("unit")}
                                          className={`${control} appearance-none pr-7 font-bold ${errors.unit ? "ring-2 ring-error" : ""}`}
                                    >
                                          {units.map((unit) => (
                                                <option key={unit} value={unit}>
                                                      {unit}
                                                </option>
                                          ))}
                                    </select>
                                    <Icon name="chevronDown" className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-ink" />
                              </span>
                        </label>
                        {trailing}
                  </div>
                  {firstError && (
                        <p role="alert" className="flex items-center gap-1 text-xs font-semibold text-error">
                              <Icon name="alert" className="size-3.5" />
                              {[errors.name, errors.quantity, errors.unit].filter(Boolean).join(" ")}
                        </p>
                  )}
            </div>
      );
}
