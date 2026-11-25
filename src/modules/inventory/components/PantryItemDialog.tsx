import { useState, type CSSProperties } from "react";
import Button from "@/shared/components/ui/Button";
import Chips from "@/shared/components/ui/Chips";
import Dialog from "@/shared/components/ui/Dialog";
import Icon from "@/shared/components/ui/Icon";
import QuantityField from "@/shared/components/ui/QuantityField";
import { fieldClass } from "@/shared/components/ui/TextField";
import { formatAmount, parseAmount, unitChoicesFor } from "@/shared/lib/units";
import { usePantryMutations } from "../hooks/useInventory";
import type { PantryItem, PantryPatch } from "../types";
import { placeOptions } from "../utils/places";
import PlacePicker from "./PlacePicker";

const shortcuts = [
      { id: "100", label: "Lleno" },
      { id: "50", label: "La mitad" },
      { id: "10", label: "Casi nada" },
];

/** How much there is, how much is left of it, where it is and when it expires. */
export default function PantryItemDialog({ item, onClose }: { item: PantryItem; onClose: () => void }) {
      const { update, remove } = usePantryMutations();
      const [left, setLeft] = useState(item.remainingPct);
      const [place, setPlace] = useState(item.storage);
      const [expires, setExpires] = useState(item.expiresOn ?? "");
      const [finished, setFinished] = useState(false);
      const error = update.error ?? remove.error;

      const measured = item.quantity && item.quantity.value !== null && item.quantity.unit !== "toTaste" && item.quantity.unit !== "all" ? { value: item.quantity.value, unit: item.quantity.unit } : null;
      const choices = unitChoicesFor(item.label, item.icon, measured?.unit ?? "g");
      const [unit, setUnit] = useState(measured?.unit ?? choices.suggested[0]!);
      const initialAmount = measured ? formatAmount(measured.value) : "";
      const [amount, setAmount] = useState(initialAmount);
      const [badAmount, setBadAmount] = useState(false);
      const quantityChanged = amount !== initialAmount || (amount !== "" && unit !== measured?.unit);

      const save = () => {
            const value = parseAmount(amount);
            // Emptying it is not an amount; «Se acabó» is how it leaves.
            setBadAmount(quantityChanged && value === null);
            if (quantityChanged && value === null) return;
            const patch: PantryPatch = {
                  ...(quantityChanged && value !== null ? { quantity: { value, unit } } : {}),
                  ...(left !== null && (left !== item.remainingPct || quantityChanged) ? { remainingPct: left } : {}),
                  ...(place && place !== item.storage ? { storage: place } : {}),
                  ...(expires && expires !== item.expiresOn ? { expiresOn: expires } : {}),
            };
            if (Object.keys(patch).length === 0) return onClose();
            update.mutate({ id: item.id, patch }, { onSuccess: onClose });
      };
      const end = (addToShoppingList: boolean) => remove.mutate({ id: item.id, addToShoppingList }, { onSuccess: onClose });

      return (
            <Dialog
                  open
                  variant="sheet"
                  onClose={onClose}
                  title={item.label}
                  actions={
                        finished ? (
                              <>
                                    <Button variant="soft" loading={remove.isPending} onClick={() => end(false)}>
                                          Solo quitarlo
                                    </Button>
                                    <Button loading={remove.isPending} onClick={() => end(true)}>
                                          Sí, a la lista
                                    </Button>
                              </>
                        ) : (
                              <>
                                    <Button variant="soft" onClick={() => setFinished(true)}>
                                          Se acabó
                                    </Button>
                                    <Button loading={update.isPending} onClick={save}>
                                          Guardar
                                    </Button>
                              </>
                        )
                  }
            >
                  {finished ? (
                        <p className="text-ink-muted">¿Lo agrego a tu lista de compras?</p>
                  ) : (
                        <div className="flex flex-col gap-5">
                              {item.product && <p className="text-sm font-semibold text-ink-muted">{[item.product.brand, item.product.packLabel].filter(Boolean).join(" · ")}</p>}
                              <div>
                                    <p className="mb-2 text-sm font-bold text-ink">¿Cuánto tienes?</p>
                                    <QuantityField
                                          label={item.label}
                                          choices={choices}
                                          unit={unit}
                                          onUnit={setUnit}
                                          amount={amount}
                                          onAmount={(next) => {
                                                setAmount(next);
                                                setBadAmount(false);
                                                // The new amount is all there is.
                                                if (next !== initialAmount) setLeft(100);
                                          }}
                                          error={badAmount ? "Escribe cuánto tienes." : undefined}
                                    />
                              </div>
                              <div>
                                    <label className="text-sm font-bold text-ink">
                                          ¿Cuánto te queda? {left !== null && <span className="tabular-nums">{left}%</span>}
                                          <input
                                                type="range"
                                                min={0}
                                                max={100}
                                                step={5}
                                                value={left ?? 100}
                                                onChange={(e) => setLeft(Number(e.target.value))}
                                                className="brand-range w-full"
                                                style={{ "--fill": `${left ?? 100}%` } as CSSProperties}
                                          />
                                    </label>
                                    <Chips label="Atajos de cantidad" options={shortcuts} value={String(left)} onChange={(v) => setLeft(Number(v))} />
                              </div>
                              <div>
                                    <p className="mb-2 text-sm font-bold text-ink">
                                          ¿Dónde está? <span className="font-normal text-ink-muted">{placeOptions.find((p) => p.id === place)?.label}</span>
                                    </p>
                                    <PlacePicker label="Dónde está" options={placeOptions} value={place} onChange={setPlace} className="rounded-full bg-field p-1" />
                              </div>
                              <label className="flex flex-col gap-2 text-sm font-bold text-ink">
                                    Vence {item.expiryEstimated && expires === item.expiresOn && <span className="font-semibold text-ink-muted">(estimado)</span>}
                                    <input type="date" value={expires} onChange={(e) => setExpires(e.target.value)} className={`${fieldClass("field")} min-h-12 px-4`} />
                              </label>
                        </div>
                  )}
                  {error && (
                        <p role="alert" className="mt-3 flex items-start gap-1 text-sm font-semibold text-error">
                              <Icon name="alert" className="mt-0.5 size-4 shrink-0" />
                              {error.message}
                        </p>
                  )}
            </Dialog>
      );
}
