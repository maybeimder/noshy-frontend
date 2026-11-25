import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { plansApi } from "../api/plans.api";
import type { Biometrics } from "../types";
import type { OnboardingPrefs } from "../utils/onboarding";

export const profileKey = ["profile"] as const;

export function useProfile() {
      return useQuery({ queryKey: profileKey, queryFn: plansApi.profile });
}

/** kcal and macro split for the chosen goals, activity and body; saves nothing. */
export function useNutritionPreview(input: Pick<OnboardingPrefs, "goals" | "activity"> & { biometrics: Biometrics | null }, enabled: boolean) {
      return useQuery({
            queryKey: ["nutritionPreview", input.goals, input.activity, input.biometrics],
            queryFn: () => plansApi.preview(input),
            enabled,
            staleTime: Infinity,
            placeholderData: keepPreviousData,
      });
}

/** Changing preferences moves the targets and what gets recommended. */
function useRefreshAfterPlan() {
      const queryClient = useQueryClient();
      return () =>
            Promise.all(
                  [profileKey, ["home"], ["day"], ["recommendations"], ["recipe"], ["feed"], ["insights"]].map((queryKey) =>
                        queryClient.invalidateQueries({ queryKey }),
                  ),
            );
}

export function useCompleteOnboarding() {
      const refresh = useRefreshAfterPlan();
      const { patchUser } = useAuth();
      return useMutation({
            mutationFn: plansApi.complete,
            onSuccess: () => {
                  patchUser({ onboardingStatus: "completed" });
                  void refresh();
            },
      });
}

export function useUpdatePreferences() {
      const refresh = useRefreshAfterPlan();
      return useMutation({ mutationFn: plansApi.update, onSuccess: () => void refresh() });
}

export function useInsights() {
      const queryClient = useQueryClient();
      const list = useQuery({ queryKey: ["insights"], queryFn: plansApi.insights });
      const vote = useMutation({
            mutationFn: plansApi.voteInsight,
            onSuccess: () =>
                  Promise.all([
                        queryClient.invalidateQueries({ queryKey: ["insights"] }),
                        queryClient.invalidateQueries({ queryKey: profileKey }),
                        queryClient.invalidateQueries({ queryKey: ["recommendations"] }),
                  ]),
      });
      return { list, vote };
}
