import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { feedbackApi } from "../api/feedback.api";

export const feedbackKey = ["feedback"] as const;
export const recommendationsKey = ["recommendations"] as const;

export function useFeedbackHistory() {
      return useQuery({ queryKey: feedbackKey, queryFn: feedbackApi.list });
}

export function useRecommendations() {
      return useQuery({ queryKey: recommendationsKey, queryFn: feedbackApi.recommendations });
}

/** Call after anything that records feedback (manual or detected by the chef). */
export function useInvalidateFeedback() {
      const queryClient = useQueryClient();
      return () =>
            Promise.all([
                  queryClient.invalidateQueries({ queryKey: feedbackKey }),
                  queryClient.invalidateQueries({ queryKey: recommendationsKey }),
            ]);
}

export function useCreateFeedback() {
      const invalidate = useInvalidateFeedback();
      return useMutation({ mutationFn: feedbackApi.create, onSuccess: invalidate });
}
