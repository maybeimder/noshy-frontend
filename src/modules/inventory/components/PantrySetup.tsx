import { useRef, useState } from "react";
import Button from "@/shared/components/ui/Button";
import FormAlert from "@/shared/components/ui/FormAlert";
import MascotBubble from "@/shared/components/ui/MascotBubble";
import { ErrorState } from "@/shared/components/ui/QueryState";
import { newKey } from "@/shared/lib/axios";
import { plural } from "@/shared/lib/format";
import { usePantryMutations, usePantrySuggestions } from "../hooks/useInventory";
import { PantrySetupSkeleton } from "./PantrySkeleton";
import type { PantryAnswer } from "../types";

/** «¿Qué ya tienes en casa?»: have / missing for the ingredients of the favourite dishes. */
export default function PantrySetup({ onDone }: { onDone: () => void }) {
      const suggestions = usePantrySuggestions();
      const { saveAnswers } = usePantryMutations();
      const [answers, setAnswers] = useState<Record<string, PantryAnswer["status"]>>({});
      const submission = useRef({ body: "", key: "" });
      const answered = Object.keys(answers).length;

      const save = (list: PantryAnswer[]) => {
            const body = JSON.stringify(list);
            if (submission.current.body !== body || !submission.current.key) submission.current = { body, key: newKey() };
            saveAnswers.mutate({ answers: list, key: submission.current.key }, { onSuccess: onDone });
      };

      return (
            <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 bg-canvas px-5 pt-8">
                  <MascotBubble title="¿Qué ya tienes en casa?">
                        {suggestions.data ? `${plural(suggestions.data.totalItems, "ingrediente", "ingredientes")}. Lo que te falte va a tu lista de compras.` : "Lo que te falte va a tu lista de compras."}
                  </MascotBubble>
                  {suggestions.isPending ? (
                        <PantrySetupSkeleton />
                  ) : suggestions.isError ? (
                        <ErrorState message={suggestions.error.message} onRetry={() => suggestions.refetch()} />
                  ) : (
                        suggestions.data.groups.map((group) => (
                              <section key={group.id} aria-labelledby={`group-${group.id}`} className="rounded-card bg-card p-4 shadow-soft">
                                    <div className="flex items-center justify-between gap-3">
                                          <h2 id={`group-${group.id}`} className="text-title font-extrabold text-ink">
                                                {group.label}
                                          </h2>
                                          <Button variant="tertiary" onClick={() => setAnswers((a) => ({ ...a, ...Object.fromEntries(group.items.map((i) => [i.ingredientId, "have" as const])) }))}>
                                                Tengo todo
                                          </Button>
                                    </div>
                                    <ul className="divide-y divide-line">
                                          {group.items.map((item) => (
                                                <li key={item.ingredientId}>
                                                      <fieldset className="flex flex-wrap items-center gap-3 py-3">
                                                            <legend className="float-left min-w-0 flex-1">
                                                                  <span className="block font-bold text-ink">{item.label}</span>
                                                                  {item.usedIn.length > 0 && <span className="block text-xs font-semibold text-ink-muted">Para: {item.usedIn.map((u) => u.label).join(", ")}</span>}
                                                            </legend>
                                                            <div className="flex gap-1 rounded-full bg-field p-1">
                                                                  {(
                                                                        [
                                                                              ["have", "Lo tengo"],
                                                                              ["missing", "Me falta"],
                                                                        ] as const
                                                                  ).map(([status, label]) => (
                                                                        <label
                                                                              key={status}
                                                                              className={`min-h-10 cursor-pointer content-center rounded-full px-3 text-xs font-extrabold has-focus-visible:outline-2 has-focus-visible:outline-primary-strong ${
                                                                                    answers[item.ingredientId] === status ? (status === "have" ? "bg-mint-soft text-mint-ink" : "bg-peach-soft text-peach-ink") : "text-ink-muted"
                                                                              }`}
                                                                        >
                                                                              <input
                                                                                    type="radio"
                                                                                    name={item.ingredientId}
                                                                                    checked={answers[item.ingredientId] === status}
                                                                                    onChange={() => setAnswers((a) => ({ ...a, [item.ingredientId]: status }))}
                                                                                    className="sr-only"
                                                                              />
                                                                              {label}
                                                                        </label>
                                                                  ))}
                                                            </div>
                                                      </fieldset>
                                                </li>
                                          ))}
                                    </ul>
                              </section>
                        ))
                  )}
                  {suggestions.data && suggestions.data.hiddenByRestrictions > 0 && (
                        <p className="text-center text-sm text-ink-muted">Dejamos fuera {plural(suggestions.data.hiddenByRestrictions, "ingrediente", "ingredientes")} por tus restricciones.</p>
                  )}
                  <div className="sticky bottom-0 -mx-5 mt-auto flex flex-col gap-2 bg-canvas/95 px-5 pt-3 pb-6 backdrop-blur">
                        {saveAnswers.error && <FormAlert>{saveAnswers.error.message}</FormAlert>}
                        <Button
                              size="lg"
                              fullWidth
                              disabled={answered === 0}
                              loading={saveAnswers.isPending}
                              onClick={() => save(Object.entries(answers).map(([ingredientId, status]) => ({ ingredientId, status })))}
                        >
                              Guardar mi despensa{answered > 0 ? ` · ${answered}` : ""}
                        </Button>
                        <Button variant="tertiary" fullWidth disabled={saveAnswers.isPending} onClick={() => save([])} className="text-ink-muted">
                              Lo hago después
                        </Button>
                  </div>
            </main>
      );
}
