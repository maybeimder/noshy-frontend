import { api } from "@/shared/lib/axios";
import type { ChefContext, ChefReply, ChefSession } from "../types";

export const chefApi = {
      open: () => api.post<ChefSession>("/chef/sessions", {}).then((r) => r.data),
      context: (sessionId: string) =>
            api.get<ChefContext>(`/chef/sessions/${sessionId}/context`).then((r) => r.data),
      /** Stores the user message and returns the chef's reply (503 if the AI is unavailable). */
      respond: (sessionId: string, body: { content: string; recipeId?: string }) =>
            api.post<ChefReply>(`/chef/sessions/${sessionId}/respond`, body).then((r) => r.data),
      close: (sessionId: string, preferencesMarkdown: string) =>
            api
                  .post<ChefSession>(`/chef/sessions/${sessionId}/close`, { reason: "manual", preferencesMarkdown })
                  .then((r) => r.data),
};
