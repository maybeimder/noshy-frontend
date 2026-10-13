import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { plansApi } from "../api/plans.api";
import type { PlanInput } from "../types";

export const activePlanKey = ["plan", "active"] as const;

export function useActivePlan() {
      return useQuery({ queryKey: activePlanKey, queryFn: plansApi.active });
}

export function useSavePlan({ hasPlan }: { hasPlan: boolean }) {
      const queryClient = useQueryClient();
      return useMutation({
            mutationFn: (input: PlanInput) =>
                  hasPlan ? plansApi.replaceActive(input) : plansApi.create(input),
            onSuccess: (plan) => queryClient.setQueryData(activePlanKey, plan),
      });
}
