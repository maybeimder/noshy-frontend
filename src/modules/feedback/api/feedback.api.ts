import { api } from "@/shared/lib/axios";
import type { FeedbackEntry, FeedbackInput, Recommendation } from "../types";

export const feedbackApi = {
      create: (input: FeedbackInput) => api.post<FeedbackEntry>("/feedback", input).then((r) => r.data),
      list: () => api.get<FeedbackEntry[]>("/feedback").then((r) => r.data),
      recommendations: () => api.get<Recommendation[]>("/recommendations").then((r) => r.data),
};
