import { useState, type FormEvent } from "react";
import Button from "@/shared/components/ui/Button";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import IngredientIcon from "@/shared/components/ui/IngredientIcon";
import QuantityField from "@/shared/components/ui/QuantityField";
import { TitleIcon } from "@/shared/components/ui/ScribbleText";
import { formatMoney } from "@/shared/lib/format";
import { parseAmount, unitChoices } from "@/shared/lib/units";
import type { StoragePlace, Unit } from "@/shared/types/api";
import { useIngredientProducts, usePantryMutations } from "../hooks/useInventory";
import type { IngredientOption } from "../types";
import { placeOptions } from "../utils/places";
import IngredientSearch from "./IngredientSearch";
import PlacePicker from "./PlacePicker";

const places = [{ id: "auto" as const, label: "Donde va siempre", icon: "sparkle" as const }, ...placeOptions];

/** Something that is not in the catalog. These are the units the API takes for it. */
const fromText = (text: string): IngredientOption => ({ id: "", label: text.charAt(0).toUpperCase() + text.slice(1), icon: "", defaultUnit: "unit", allowedUnits: ["unit", "g", "kg", "ml", "l", "cup", "tbsp", "tsp"], conflicts: [] });

/** Pick from the catalog (or write it by hand), then brand, amount and place, all optional. */
export default function AddPantryItem({ initialQuery }: { initialQuery?: string }) {
      const { add } = usePantryMutations();
      const [picked, setPicked] = useState<IngredientOption | null>(null);
      const [productId, setProductId] = useState<string | null>(null);
      const products = useIngredientProducts(picked?.id ?? null);
      const [amount, setAmount] = useState("");
      const [unit, setUnit] = useState<Unit>("g");
      const [place, setPlace] = useState<StoragePlace | "auto">("auto");
      const [amountError, setAmountError] = useState<string>();
      const [added, setAdded] = useState<string | null>(null);

      const pick = (option: IngredientOption) => {
            add.reset();
            setPicked(option);
            setProductId(null);
            setUnit(unitChoices(option).suggested[0] ?? option.defaultUnit);
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
                  { ...(picked.id ? { ingredientId: picked.id, ...(productId ? { productId } : {}) } : { text: picked.label }), ...(value !== null ? { quantity: { value, unit } } : {}), ...(place !== "auto" ? { storage: place } : {}) },
                  {
                        onSuccess: (item) => {
                              setAdded(item.label);
                              setPicked(null);
                        },
                  },
            );
      };

      return (
            <section aria-labelledby="add-item" className="flex flex-col gap-4 rounded-[1.75rem] bg-card p-4 shadow-soft">
                  <h2 id="add-item" className="flex items-center gap-2 text-title font-semibold text-ink">
                        <TitleIcon name="plus" />
                        Añadir ingrediente
                  </h2>
                  {!picked ? (
                        <IngredientSearch label="Buscar en el catálogo para añadir" placeholder="Busca en el catálogo: arroz, pollo…" autoFocus={Boolean(initialQuery)} initialQuery={initialQuery} onPick={pick} onText={(text) => pick(fromText(text))} />
                  ) : (
                        <form noValidate onSubmit={submit} className="flex flex-col gap-4">
                              <div className="flex items-center gap-3">
                                    <IngredientIcon label={picked.label} icon={picked.icon} shape="circle" className="size-12" />
                                    <p className="min-w-0 flex-1 font-display text-title font-semibold text-ink">{picked.label}</p>
                                    <button type="button" onClick={() => setPicked(null)} aria-label="Cambiar ingrediente" className="grid size-11 shrink-0 place-items-center rounded-full text-ink-muted hover:bg-field focus-visible:outline-2 focus-visible:outline-primary-strong">
                                          <Icon name="refresh" className="size-5" />
                                    </button>
                              </div>
                              {add.error && <FormAlert>{add.error.message}</FormAlert>}
                              {products.data && products.data.length > 0 && (
                                    <div className="flex flex-col gap-2">
                                          <p className="text-sm font-bold text-ink">
                                                Marca <span className="font-normal text-ink-muted">(opcional)</span>
                                          </p>
                                          <div role="group" aria-label={`Marcas de ${picked.label}`} className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 py-1">
                                                {products.data.map((product) => {
                                                      const on = product.id === productId;
                                                      return (
                                                            <button
                                                                  key={product.id}
                                                                  type="button"
                                                                  aria-pressed={on}
                                                                  onClick={() => setProductId(on ? null : product.id)}
                                                                  className={`flex shrink-0 flex-col items-start rounded-control px-4 py-2 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${on ? "bg-picked ring-2 ring-primary/60 ring-inset" : "bg-field hover:bg-line"}`}
                                                            >
                                                                  <span className="text-sm font-bold text-ink">{product.brand}</span>
                                                                  <span className="text-xs text-ink-muted">{[product.packLabel, product.price && formatMoney(product.price)].filter(Boolean).join(" · ")}</span>
                                                            </button>
                                                      );
                                                })}
                                          </div>
                                    </div>
                              )}
                              <div className="flex flex-col gap-2">
                                    <p className="text-sm font-bold text-ink">
                                          Cantidad <span className="font-normal text-ink-muted">{productId ? "(si no la pones, un paquete)" : "(opcional)"}</span>
                                    </p>
                                    <QuantityField
                                          label={picked.label}
                                          choices={unitChoices(picked)}
                                          unit={unit}
                                          onUnit={setUnit}
                                          amount={amount}
                                          onAmount={(value) => {
                                                setAmount(value);
                                                setAmountError(undefined);
                                          }}
                                          error={amountError}
                                    />
                              </div>
                              <div className="flex flex-col gap-2">
                                    <p className="text-sm font-bold text-ink">
                                          ¿Dónde? <span className="font-normal text-ink-muted">{places.find((p) => p.id === place)?.label}</span>
                                    </p>
                                    <PlacePicker label="Dónde lo guardas" options={places} value={place} onChange={setPlace} className="rounded-full bg-field p-1" />
                              </div>
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
