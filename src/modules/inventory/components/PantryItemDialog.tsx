import { useState, type CSSProperties } from "react";
import Button from "@/shared/components/ui/Button";
import Chips from "@/shared/components/ui/Chips";
import Dialog from "@/shared/components/ui/Dialog";
import Icon from "@/shared/components/ui/Icon";
import { fieldClass } from "@/shared/components/ui/TextField";
import { usePantryMutations } from "../hooks/useInventory";
import type { PantryItem, PantryPatch } from "../types";
import { placeOptions } from "../utils/places";

const shortcuts = [
      { id: "100", label: "Lleno" },
      { id: "50", label: "La mitad" },
      { id: "10", label: "Casi nada" },
];

/** How much is left, where it is and when it expires. */
export default function PantryItemDialog({ item, onClose }: { item: PantryItem; onClose: () => void }) {
      const { update, remove } = usePantryMutations();
      const [left, setLeft] = useState(item.remainingPct);
      const [place, setPlace] = useState(item.storage);
      const [expires, setExpires] = useState(item.expiresOn ?? "");
      const [finished, setFinished] = useState(false);
      const error = update.error ?? remove.error;

      const save = () => {
            const patch: PantryPatch = {
                  ...(left !== null && left !== item.remainingPct ? { remainingPct: left } : {}),
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
                              {(item.product || item.quantity) && (
                                    <p className="text-sm font-semibold text-ink-muted">
                                          {[item.product?.brand, item.product?.packLabel ?? item.quantity?.display].filter(Boolean).join(" · ")}
                                    </p>
                              )}
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
                                    <p className="text-sm font-bold text-ink">Dónde está</p>
                                    <Chips<string> label="Dónde está" options={placeOptions} value={place ?? ""} onChange={(v) => setPlace(v as PantryItem["storage"])} />
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
