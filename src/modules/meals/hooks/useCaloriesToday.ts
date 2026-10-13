import { useQuery } from "@tanstack/react-query";
import { api, ApiError } from "@/shared/lib/axios";

type MealsToday = { calories: number };

/**
 * Calories eaten today, for the home "1.050 / 2.200 kcal" pill. Contract proposed in
 * backend/recommendation.md §5 (GET /meals/today); until it exists the API answers 404 and we show 0.
 */
export function useCaloriesToday() {
      return useQuery({
            queryKey: ["meals", "today"],
            queryFn: async () => {
                  try {
                        return (await api.get<MealsToday>("/meals/today")).data.calories;
                  } catch (error) {
                        if (error instanceof ApiError && error.status === 404) return 0;
                        throw error;
                  }
            },
            staleTime: 60_000,
      });
}
