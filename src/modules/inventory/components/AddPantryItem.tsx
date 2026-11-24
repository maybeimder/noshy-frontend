import { useState, type FormEvent } from "react";
import Button from "@/shared/components/ui/Button";
import Chips from "@/shared/components/ui/Chips";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import TextField, { fieldClass } from "@/shared/components/ui/TextField";
import { parseAmount, unitLabel } from "@/shared/lib/units";
import type { StoragePlace, Unit } from "@/shared/types/api";
import { usePantryMutations } from "../hooks/useInventory";
import type { IngredientOption } from "../types";
import { placeOptions } from "../utils/places";
import IngredientSearch from "./IngredientSearch";

/** Pick from the catalog, then amount and place (both optional). */
export default function AddPantryItem({ initialQuery }: { initialQuery?: string }) {
      const { add } = usePantryMutations();
      const [picked, setPicked] = useState<IngredientOption | null>(null);
      const [amount, setAmount] = useState("");
      const [unit, setUnit] = useState<Unit>("g");
      const [place, setPlace] = useState<StoragePlace | "auto">("auto");
      const [amountError, setAmountError] = useState<string>();
      const [added, setAdded] = useState<string | null>(null);

      const pick = (option: IngredientOption) => {
            add.reset();
            setPicked(option);
            setUnit(option.defaultUnit);
            setAmount("");
            setPlace("auto");
            setAmountError(undefined);
            setAdded(null);
      };

      const submit = (event: FormEvent) => {
            event.preventDefault();
            if (!picked) return;
            const value = amount.trim() ? parseAmount(amount) : null;
            if (amount.trim() && value === null) return setAmountError("Escribe una cantidad mayor que cero.");
            add.mutate(
                  { ingredientId: picked.id, ...(value !== null ? { quantity: { value, unit } } : {}), ...(place !== "auto" ? { storage: place } : {}) },
                  {
                        onSuccess: (item) => {
                              setAdded(item.label);
                              setPicked(null);
                        },
                  },
            );
      };

      return (
            <section aria-labelledby="add-item" className="flex flex-col gap-3 rounded-card bg-card p-4 shadow-soft">
                  <h2 id="add-item" className="text-title font-extrabold text-ink">
                        Añadir ingrediente
                  </h2>
                  {!picked ? (
                        <IngredientSearch label="Buscar en el catálogo para añadir" placeholder="Busca en el catálogo: arroz, pollo…" autoFocus={Boolean(initialQuery)} initialQuery={initialQuery} onPick={pick} />
                  ) : (
                        <form noValidate onSubmit={submit} className="flex flex-col gap-3">
                              <p className="flex items-center justify-between gap-3 font-bold text-ink">
                                    {picked.label}
                                    <Button variant="tertiary" onClick={() => setPicked(null)}>
                                          Cambiar
                                    </Button>
                              </p>
                              {add.error && <FormAlert>{add.error.message}</FormAlert>}
                              <div className="flex items-end gap-3">
                                    <TextField
                                          label="Cantidad (opcional)"
                                          inputMode="decimal"
                                          value={amount}
                                          onChange={(e) => {
                                                setAmount(e.target.value);
                                                setAmountError(undefined);
                                          }}
                                          error={amountError}
                                          className="flex-1"
                                    />
                                    <label className="flex flex-col gap-2 text-sm font-bold text-ink">
                                          Unidad
                                          <select value={unit} onChange={(e) => setUnit(e.target.value as Unit)} className={`${fieldClass("field")} min-h-12 px-4`}>
                                                {picked.allowedUnits.map((u) => (
                                                      <option key={u} value={u}>
                                                            {unitLabel(u)}
                                                      </option>
                                                ))}
                                          </select>
                                    </label>
                              </div>
                              <Chips label="Dónde lo guardas" options={[{ id: "auto" as const, label: "Donde va siempre" }, ...placeOptions]} value={place} onChange={setPlace} />
                              <Button type="submit" size="lg" loading={add.isPending}>
                                    <Icon name="plus" className="size-5" strokeWidth={2.25} />
                                    Añadir a la despensa
                              </Button>
                        </form>
                  )}
                  {added && (
                        <p role="status" className="flex items-center gap-2 rounded-control bg-mint-soft p-3 text-sm font-bold text-mint-ink">
                              <Icon name="check" className="size-4" strokeWidth={2.5} />
                              Añadido: {added}
                        </p>
                  )}
            </section>
      );
}
