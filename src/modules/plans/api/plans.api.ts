import { api } from "@/shared/lib/axios";
import type { NutritionPlan, PlanInput } from "../types";

export const plansApi = {
      /** null when the user has not created a plan yet. */
      active: () => api.get<NutritionPlan | null>("/plans/active").then((r) => r.data),
      create: (input: PlanInput) => api.post<NutritionPlan>("/plans", input).then((r) => r.data),
      /** Replaces the whole plan: omitted fields are cleared, so always send everything. */
      replaceActive: (input: PlanInput) =>
            api.put<NutritionPlan>("/plans/active", input).then((r) => r.data),
};
