import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useEnsureChefSession } from "@/modules/chef/hooks/useChefSession";
import { feedbackApi } from "@/modules/feedback/api/feedback.api";
import { useInvalidateFeedback } from "@/modules/feedback/hooks/useFeedback";
import type { FeedbackEventType } from "@/modules/feedback/types";
import Button from "@/shared/components/ui/Button";
import Icon from "@/shared/components/ui/Icon";
import type { Recipe } from "../types";

const responses: Record<"prepared" | "discarded", string> = {
      prepared: "¡Anotado! Te recomendaremos más recetas como esta.",
      discarded: "Entendido, te propondremos otras opciones.",
};

// Feedback needs a chef session id in the backend, so one is opened if none is active.
export default function RecipeFeedback({ recipe }: { recipe: Recipe }) {
      const ensureSession = useEnsureChefSession();
      const invalidate = useInvalidateFeedback();
      const [sent, setSent] = useState<"prepared" | "discarded" | null>(null);

      const record = useMutation({
            mutationFn: async (eventType: Extract<FeedbackEventType, "prepared" | "discarded">) => {
                  const sessionId = await ensureSession();
                  await feedbackApi.create({
                        sessionId,
                        targetType: "recipe",
                        targetId: recipe.id,
                        targetName: recipe.title,
                        eventType,
                  });
                  return eventType;
            },
            onSuccess: (eventType) => {
                  setSent(eventType);
                  invalidate();
            },
      });

      return (
            <section aria-labelledby="feedback" className="rounded-card bg-card p-6">
                  <h2 id="feedback" className="text-title font-bold text-ink">
                        ¿La cocinaste?
                  </h2>
                  {sent ? (
                        <p role="status" className="mt-2 flex items-center gap-2 text-base text-ink">
                              <Icon name="check" className="size-5 text-success" strokeWidth={2.5} />
                              {responses[sent]}
                        </p>
                  ) : (
                        <>
                              <p className="mt-1 text-sm text-ink-muted">Así tu chef aprende qué te gusta.</p>
                              <div className="mt-4 flex flex-wrap gap-2">
                                    <Button
                                          variant="secondary"
                                          loading={record.isPending && record.variables === "prepared"}
                                          disabled={record.isPending}
                                          onClick={() => record.mutate("prepared")}
                                    >
                                          <Icon name="check" className="size-5" />
                                          La preparé
                                    </Button>
                                    <Button
                                          variant="tertiary"
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
