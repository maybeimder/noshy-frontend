import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useEnsureChefSession } from "@/modules/chef/hooks/useChefSession";
import { feedbackApi } from "@/modules/feedback/api/feedback.api";
import { useInvalidateFeedback } from "@/modules/feedback/hooks/useFeedback";
import type { FeedbackEventType } from "@/modules/feedback/types";
import Button from "@/shared/components/ui/Button";
import Icon from "@/shared/components/ui/Icon";
import Mascot from "@/shared/components/ui/Mascot";
import type { Recipe } from "../types";

const responses: Record<"prepared" | "discarded", string> = {
      prepared: "¡Anotado! Te recomendaré más recetas como esta.",
      discarded: "Entendido, te propondré otras opciones.",
};

// Feedback needs a chef session id in the backend, so one is opened if none is active.
export default function RecipeFeedback({ recipe }: { recipe: Recipe }) {
      const ensureSession = useEnsureChefSession();
      const invalidate = useInvalidateFeedback();
      const [sent, setSent] = useState<"prepared" | "discarded" | null>(null);

      const record = useMutation({
            mutationFn: async (eventType: Extract<FeedbackEventType, "prepared" | "discarded">) => {
                  const sessionId = await ensureSession();
                  await feedbackApi.create({ sessionId, targetType: "recipe", targetId: recipe.id, targetName: recipe.title, eventType });
                  return eventType;
            },
            onSuccess: (eventType) => {
                  setSent(eventType);
                  invalidate();
            },
      });

      return (
            <section aria-labelledby="feedback" className="relative mt-6 rounded-[1.75rem] bg-secondary-soft p-5">
                  <Mascot className="pointer-events-none absolute -top-14 right-2 w-28" />
                  <h2 id="feedback" className="max-w-[65%] text-section font-extrabold text-ink">
                        ¿La cocinaste?
                  </h2>
                  {sent ? (
                        <p role="status" className="mt-3 flex items-center gap-2 font-bold text-ink">
                              <Icon name="check" className="size-5 text-mint-ink" strokeWidth={2.5} />
                              {responses[sent]}
                        </p>
                  ) : (
                        <>
                              <p className="mt-1 max-w-[65%] text-sm font-semibold text-ink">Cuéntame y aprendo qué te gusta.</p>
                              <div className="mt-4 grid grid-cols-2 gap-3">
                                    <Button
                                          variant="dark"
                                          size="lg"
                                          loading={record.isPending && record.variables === "prepared"}
                                          disabled={record.isPending}
                                          onClick={() => record.mutate("prepared")}
                                    >
                                          <Icon name="check" className="size-5" strokeWidth={2.25} />
                                          La preparé
                                    </Button>
                                    <Button
                                          variant="secondary"
                                          size="lg"
                                          loading={record.isPending && record.variables === "discarded"}
                                          disabled={record.isPending}
                                          onClick={() => record.mutate("discarded")}
                                    >
                                          No me convence
                                    </Button>
                              </div>
                              {record.error && <p className="mt-2 text-sm text-error">{record.error.message}</p>}
                        </>
                  )}
            </section>
      );
}
