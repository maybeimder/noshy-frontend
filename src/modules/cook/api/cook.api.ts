import { api, idempotent, unwrap } from "@/shared/lib/axios";
import type { DaySummary, MealSlotId, Quantity } from "@/shared/types/api";

export type SubStep = {
      index: number;
      shortLabel: string;
      text: string;
      timerSeconds: number | null;
      heatLevel: number;
      heatChange?: { from: number; to: number; message: string };
};
export type CookingStep = {
      index: number;
      title: string;
      durationSeconds: number;
      heat: { level: number; label: string };
      equipment: string | null;
      ingredients: { ingredientId: string | null; label: string; prep: string | null; quantity: Quantity }[];
      subSteps: SubStep[];
      doneWhen: string | null;
};
export type CookingSession = {
      id: string;
      recipe: { id: string; title: string };
      servings: number;
      status: "active" | "completed" | "abandoned";
      currentStepIndex: number;
      steps: CookingStep[];
      startedAt: string;
};
export type CookingEvent =
      | { type: "stepEntered"; stepIndex: number; at: string }
      | { type: "timerPaused" | "timerResumed"; stepIndex: number; subStepIndex: number; at: string }
      | { type: "timerExtended"; stepIndex: number; subStepIndex: number; addedSeconds: number; at: string };
export type FinishInput = { finishedAt: string; logMeal: { slot: MealSlotId; servingsEaten: number } | null; rating?: number; photoMediaId?: string | null };
export type FinishResult = {
      day: DaySummary;
      pantryUpdates: { itemId: string; label: string; remainingPct: number; removed: boolean }[];
      timesCooked: number;
      stats: { cookedCount: number; streakWeeks: number };
};

export const cookApi = {
      start: ({ key, ...input }: { recipeId: string; servings: number; adaptationId?: string | null; key: string }) =>
            api.post<{ data: CookingSession }>("/me/cooking-sessions", input, idempotent(key)).then(unwrap),
      session: (id: string) => api.get<{ data: CookingSession }>(`/me/cooking-sessions/${id}`).then(unwrap),
      events: ({ id, events }: { id: string; events: CookingEvent[] }) => api.post(`/me/cooking-sessions/${id}/events`, { events }).then(() => undefined),
      finish: ({ id, input, key }: { id: string; input: FinishInput; key: string }) =>
            api.post<{ data: FinishResult }>(`/me/cooking-sessions/${id}/complete`, input, idempotent(key)).then(unwrap),
      abandon: ({ id, atStepIndex }: { id: string; atStepIndex: number }) =>
            api.post(`/me/cooking-sessions/${id}/abandon`, { atStepIndex, reason: "later" }).then(() => undefined),
};
