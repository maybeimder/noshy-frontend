import { api, idempotent, unwrap } from "@/shared/lib/axios";
import type { DaySummary, Macros } from "@/shared/types/api";
import type { Home, LoggedMeal, LogMeal, Nudge, NudgePlacement } from "../types";

export const homeApi = {
      home: () => api.get<{ data: Home }>("/me/home").then(unwrap),
      logMeal: ({ date, meal, key }: { date: string; meal: LogMeal; key: string }) =>
            api.post<{ data: LoggedMeal }>(`/me/days/${date}/meals`, meal, idempotent(key)).then(unwrap),
      deleteMeal: ({ date, mealId }: { date: string; mealId: string }) =>
            api.delete<{ data: { day: DaySummary } }>(`/me/days/${date}/meals/${mealId}`).then(unwrap),
      estimate: (text: string) => api.post<{ data: Macros }>("/nutrition/estimate", { text }).then(unwrap),
      nudges: (placement: NudgePlacement) => api.get<{ data: Nudge[] }>("/me/nudges", { params: { placement } }).then(unwrap),
      dismissNudge: ({ id, reason }: { id: string; reason: "dismissed" | "acted" }) => api.post(`/me/nudges/${id}/dismiss`, { reason }).then(() => undefined),
};
