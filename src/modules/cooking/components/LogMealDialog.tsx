import { useRef, useState } from "react";
import { useCookedRecipes } from "@/modules/recipes/hooks/useRecipes";
import Button from "@/shared/components/ui/Button";
import Chips from "@/shared/components/ui/Chips";
import Dialog from "@/shared/components/ui/Dialog";
import { SkGroup, SkText, times } from "@/shared/components/ui/Skeleton";
import Stepper from "@/shared/components/ui/Stepper";
import TextField from "@/shared/components/ui/TextField";
import { newKey } from "@/shared/lib/axios";
import type { Macros, MealEntry, MealSlot } from "@/shared/types/api";
import { useMealMutations } from "../hooks/useHome";
import type { LoggedMeal, LogMeal } from "../types";
import MealEntries from "./MealEntries";

type Mode = "cooked" | "text";

/** Logs a meal of one slot: something cooked, or free text with estimated macros. */
export default function LogMealDialog({ slot, date, entries = [], onClose }: { slot: MealSlot; date: string; /** Already logged in this slot. */ entries?: MealEntry[]; onClose: () => void }) {
      const cooked = useCookedRecipes("all");
      const { log, remove, estimate } = useMealMutations();
      const [mode, setMode] = useState<Mode>("text");
      const [recipeId, setRecipeId] = useState<string | null>(null);
      const [servings, setServings] = useState(1);
      const [text, setText] = useState("");
      const [kcal, setKcal] = useState("");
      const [logged, setLogged] = useState<LoggedMeal | null>(null);
      // One key per distinct meal, so a retry after a network cut does not log it twice.
      const submission = useRef({ body: "", key: "" });

      const recipes = (cooked.data?.pages ?? []).flatMap((p) => p.data).slice(0, 8);
      const send = (meal: LogMeal) => {
            const body = JSON.stringify(meal);
            if (submission.current.body !== body) submission.current = { body, key: newKey() };
            log.mutate(
                  { date, meal, key: submission.current.key },
                  {
                        onSuccess: (result) => {
                              submission.current = { body: "", key: "" };
                              setLogged(result);
                        },
                  },
            );
      };
      const estimated = estimate.data && estimate.variables === text.trim() ? estimate.data : null;
      const sendText = (macros: Macros) => {
            // Editing the calories scales the macros with them.
            const value = Number(kcal) > 0 ? Math.round(Number(kcal)) : macros.kcal;
            const k = macros.kcal > 0 ? value / macros.kcal : 1;
            const scale = (n: number) => Math.round(n * k * 10) / 10;
            send({ slot: slot.slot, freeText: text.trim(), nutrition: { kcal: value, proteinG: scale(macros.proteinG), carbsG: scale(macros.carbsG), fatG: scale(macros.fatG) } });
      };
      const error = log.error ?? estimate.error ?? remove.error;

      return (
            <Dialog open variant="sheet" onClose={onClose} title={`Registrar ${slot.label.toLowerCase()}`}>
                  {logged ? (
                        <div className="flex flex-col gap-4">
                              <p role="status" className="font-bold text-mint-ink">
                                    Registrado: {logged.meal.label}
                              </p>
                              <div className="grid grid-cols-2 gap-3">
                                    <Button variant="soft" loading={remove.isPending} onClick={() => remove.mutate({ date, mealId: logged.meal.id }, { onSuccess: onClose })}>
                                          Deshacer
                                    </Button>
                                    <Button onClick={onClose}>Listo</Button>
                              </div>
                        </div>
                  ) : (
                        <div className="flex flex-col gap-4">
                              {entries.length > 0 && <MealEntries date={date} entries={entries} withSlot={false} />}
                              <Chips<Mode>
                                    label="Cómo comiste"
                                    options={[
                                          { id: "text", label: "Comí otra cosa" },
                                          { id: "cooked", label: "Lo cociné" },
                                    ]}
                                    value={mode}
                                    onChange={setMode}
                              />
                              {mode === "cooked" ? (
                                    cooked.isPending ? (
                                          <SkGroup>
                                                {times(4).map((i) => (
                                                      <SkText key={i} w="w-48" className="h-11!" />
                                                ))}
                                          </SkGroup>
                                    ) : recipes.length === 0 ? (
                                          <p className="text-ink-muted">Aún no has cocinado recetas con Noshy.</p>
                                    ) : (
                                          <>
                                                <ul className="flex flex-col gap-1">
                                                      {recipes.map(({ recipe }) => (
                                                            <li key={recipe.id}>
                                                                  <label className="flex min-h-11 cursor-pointer items-center gap-3 font-bold text-ink">
                                                                        <input type="radio" name="recipe" checked={recipeId === recipe.id} onChange={() => setRecipeId(recipe.id)} className="size-5 accent-primary-strong" />
                                                                        {recipe.title}
                                                                  </label>
                                                            </li>
                                                      ))}
                                                </ul>
                                                <Stepper label="Porciones" value={servings} min={1} max={10} onChange={setServings} suffix="porciones" />
                                                <Button size="lg" disabled={!recipeId} loading={log.isPending} onClick={() => recipeId && send({ slot: slot.slot, recipeId, servings })}>
                                                      Registrar
                                                </Button>
                                          </>
                                    )
                              ) : (
                                    <form
                                          className="flex flex-col gap-3"
                                          onSubmit={(e) => {
                                                e.preventDefault();
                                                if (!text.trim()) return;
                                                if (estimated) sendText(estimated);
                                                else estimate.mutate(text.trim(), { onSuccess: (macros) => setKcal(String(macros.kcal)) });
                                          }}
                                    >
                                          <TextField label="¿Qué comiste?" placeholder="Ej. Bandeja paisa" maxLength={120} value={text} onChange={(e) => setText(e.target.value)} />
                                          {estimated && <TextField label="Calorías estimadas" inputMode="numeric" suffix="kcal" value={kcal} onChange={(e) => setKcal(e.target.value.replace(/\D/g, ""))} />}
                                          <Button type="submit" size="lg" disabled={!text.trim()} loading={estimate.isPending || log.isPending}>
                                                {estimated ? "Registrar" : "Estimar calorías"}
                                          </Button>
                                    </form>
                              )}
                              {error && <p className="text-sm font-semibold text-error">{error.message}</p>}
                              {slot.status !== "skipped" && (
                                    <Button variant="tertiary" disabled={log.isPending} onClick={() => send({ slot: slot.slot, skipped: true })} className="text-ink-muted">
                                          Marcar como saltada
                                    </Button>
                              )}
                        </div>
                  )}
            </Dialog>
      );
}
