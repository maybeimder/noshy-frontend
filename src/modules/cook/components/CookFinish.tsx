import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useHome } from "@/modules/cooking/hooks/useHome";
import { slots } from "@/modules/menus/utils/week";
import Button, { buttonBase, buttonVariants } from "@/shared/components/ui/Button";
import Chips from "@/shared/components/ui/Chips";
import FormAlert from "@/shared/components/ui/FormAlert";
import Icon from "@/shared/components/ui/Icon";
import ImagePicker from "@/shared/components/ui/ImagePicker";
import Stepper from "@/shared/components/ui/Stepper";
import { newKey } from "@/shared/lib/axios";
import { plural } from "@/shared/lib/format";
import type { UploadedMedia } from "@/shared/lib/upload";
import type { MealSlotId } from "@/shared/types/api";
import { cookApi, type CookingSession } from "../api/cook.api";

/** «¡Buen provecho!»: rating, meal log and what left the pantry. */
export default function CookFinish({ session, onBack }: { session: CookingSession; onBack: () => void }) {
      const queryClient = useQueryClient();
      const home = useHome();
      const current = home.data?.day?.meals.find((m) => m.status === "current")?.slot ?? "lunch";
      const [slot, setSlot] = useState<MealSlotId | "none" | null>(null);
      const [servings, setServings] = useState(1);
      const [rating, setRating] = useState(0);
      const [photo, setPhoto] = useState<UploadedMedia | null>(null);
      const [finishedAt] = useState(() => new Date().toISOString());
      const submission = useRef({ body: "", key: "" });
      const finish = useMutation({
            mutationFn: cookApi.finish,
            // Cooking moves the day, the pantry, the recipe matches, the counts and the rating.
            onSuccess: () =>
                  Promise.all(
                        ["home", "pantry", "pantryOverview", "cookedRecipes", "profile", "recipe", "recommendations", "insights"].map((key) => queryClient.invalidateQueries({ queryKey: [key] })),
                  ),
      });
      const chosen = slot ?? current;

      const submit = () => {
            const input = {
                  finishedAt,
                  logMeal: chosen === "none" ? null : { slot: chosen, servingsEaten: servings },
                  ...(rating ? { rating } : {}),
                  ...(photo ? { photoMediaId: photo.id } : {}),
            };
            const body = JSON.stringify(input);
            if (submission.current.body !== body) submission.current = { body, key: newKey() };
            finish.mutate({ id: session.id, input, key: submission.current.key });
      };

      if (finish.data) {
            const result = finish.data;
            return (
                  <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-5 px-5 pt-12 pb-8">
                        <h1 className="text-page font-extrabold text-ink">¡Buen provecho!</h1>
                        <p className="text-ink-muted">
                              {session.recipe.title} · la cocinaste {plural(result.timesCooked, "vez", "veces")}
                              {result.stats.streakWeeks > 0 && ` · racha de ${plural(result.stats.streakWeeks, "semana", "semanas")}`}
                        </p>
                        {result.pantryUpdates.length > 0 && (
                              <section aria-labelledby="pantry-updates" className="rounded-card bg-card p-5 shadow-soft">
                                    <h2 id="pantry-updates" className="text-title font-extrabold text-ink">
                                          Actualicé tu despensa
                                    </h2>
                                    <ul className="mt-2 divide-y divide-line">
                                          {result.pantryUpdates.map((u) => (
                                                <li key={u.itemId} className="flex justify-between gap-3 py-2 text-ink">
                                                      <span className="font-bold">{u.label}</span>
                                                      <span className="text-ink-muted">{u.removed ? "Se acabó" : `Queda ${u.remainingPct}%`}</span>
                                                </li>
                                          ))}
                                    </ul>
                              </section>
                        )}
                        <Link to="/" replace className={`${buttonBase} ${buttonVariants.primary} min-h-14 text-base`}>
                              Listo
                        </Link>
                        <Link to="/despensa" className={`${buttonBase} ${buttonVariants.tertiary} min-h-11`}>
                              Corregir mi despensa
                        </Link>
                  </main>
            );
      }

      return (
            <main className="mx-auto flex min-h-dvh max-w-xl flex-col gap-6 px-5 pt-8 pb-8">
                  <h1 className="text-page font-extrabold text-ink">¿Cómo te quedó?</h1>
                  <div role="radiogroup" aria-label="Calificación" className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                    key={n}
                                    type="button"
                                    role="radio"
                                    aria-checked={rating === n}
                                    aria-label={plural(n, "estrella", "estrellas")}
                                    onClick={() => setRating(rating === n ? 0 : n)}
                                    className={`grid size-12 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-primary-strong ${n <= rating ? "bg-mustard text-ink" : "bg-card text-ink-muted"}`}
                              >
                                    <Icon name="star4" className={n <= rating ? "size-6 fill-current" : "size-6"} />
                              </button>
                        ))}
                  </div>
                  <ImagePicker label="Foto de tu plato" purpose="cookedPhoto" value={photo?.url ?? null} onChange={setPhoto} hint="Opcional" />
                  <section aria-labelledby="log" className="flex flex-col gap-3 rounded-card bg-card p-5 shadow-soft">
                        <h2 id="log" className="text-title font-extrabold text-ink">
                              Lo anoto en tu día
                        </h2>
                        <Chips<MealSlotId | "none"> label="Comida" options={[...slots, { id: "none", label: "No anotarlo" }]} value={chosen} onChange={setSlot} />
                        {chosen !== "none" && <Stepper label="Porciones que comiste" value={servings} min={1} max={10} onChange={setServings} suffix="porciones" />}
                  </section>
                  {finish.error && <FormAlert>{finish.error.message}</FormAlert>}
                  <div className="mt-auto grid grid-cols-2 gap-3">
                        <Button variant="soft" size="lg" disabled={finish.isPending} onClick={onBack}>
                              Volver
                        </Button>
                        <Button size="lg" loading={finish.isPending} onClick={submit}>
                              Guardar
                        </Button>
                  </div>
            </main>
      );
}
