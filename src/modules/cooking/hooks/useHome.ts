import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import type { DaySummary } from "@/shared/types/api";
import { homeApi } from "../api/home.api";
import type { Home, NudgePlacement } from "../types";

export const homeKey = ["home"] as const;

export function useHome() {
      const { user } = useAuth();
      return useQuery({
            queryKey: homeKey,
            queryFn: homeApi.home,
            staleTime: 60_000,
            // Before onboarding the API answers 409.
            enabled: user?.onboardingStatus === "completed",
      });
}

export function useNudge(placement: Exclude<NudgePlacement, "home">) {
      return useQuery({ queryKey: ["nudges", placement], queryFn: () => homeApi.nudges(placement), staleTime: 60_000, select: (list) => list[0] ?? null });
}

export function useDismissNudge() {
      const queryClient = useQueryClient();
      return useMutation({
            mutationFn: homeApi.dismissNudge,
            onSettled: () => Promise.all([queryClient.invalidateQueries({ queryKey: homeKey }), queryClient.invalidateQueries({ queryKey: ["nudges"] })]),
      });
}

export function useMealMutations() {
      const queryClient = useQueryClient();
      // The response already carries the new day.
      const writeDay = ({ day }: { day: DaySummary }) => {
            queryClient.setQueryData(["day", day.date], day);
            // A meal of another day must not replace today's.
            queryClient.setQueryData<Home>(homeKey, (home) => (home?.day && home.day.date === day.date ? { ...home, day } : home));
            return queryClient.invalidateQueries({ queryKey: ["days"] });
      };
      return {
            log: useMutation({ mutationFn: homeApi.logMeal, onSuccess: writeDay }),
            remove: useMutation({ mutationFn: homeApi.deleteMeal, onSuccess: writeDay }),
            estimate: useMutation({ mutationFn: homeApi.estimate }),
      };
}
