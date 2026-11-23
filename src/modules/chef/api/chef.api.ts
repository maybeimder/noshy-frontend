import { api, ApiError, apiFetch, body, unwrap, type Page } from "@/shared/lib/axios";
import type { ChefInput, ChefMessage, ChefStreamEvent, ChefThread } from "../types";

/** One SSE frame: "event: x\ndata: {…}". */
function parseFrame(frame: string): ChefStreamEvent | null {
      let event = "";
      let data = "";
      for (const line of frame.split("\n")) {
            if (line.startsWith("event:")) event = line.slice(6).trim();
            else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      return event && data ? ({ event, data: JSON.parse(data) } as ChefStreamEvent) : null;
}

export const chefApi = {
      /** The general conversation is the thread "main"; each recipe has its own. */
      openRecipeThread: (recipeId: string) => api.post<{ data: ChefThread }>("/me/chef/threads", { context: { type: "recipe", recipeId } }).then(unwrap),
      /** Newest first. */
      messages: (threadId: string, cursor?: string) =>
            api.get<Page<ChefMessage>>(`/me/chef/threads/${threadId}/messages`, { params: { cursor, limit: 20 } }).then(body),
      markRead: (threadId: string, lastReadMessageId: string) => api.post(`/me/chef/threads/${threadId}/read`, { lastReadMessageId }).then(() => undefined),
      feedback: ({ messageId, blockId, rating }: { messageId: string; blockId: string; rating: "up" | "down" }) =>
            api.post(`/me/chef/messages/${messageId}/feedback`, { blockId, rating }).then(() => undefined),
      /** Streams the reply; resolves when it is complete. */
      send: async (threadId: string, input: ChefInput, clientMessageId: string, onEvent: (event: ChefStreamEvent) => void) => {
            const response = await apiFetch(`/me/chef/threads/${threadId}/messages`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
                  body: JSON.stringify({ clientMessageId, input }),
            });
            const reader = response.body!.pipeThrough(new TextDecoderStream()).getReader();
            let buffer = "";
            let finished = false;
            for (;;) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  buffer += value;
                  const frames = buffer.split("\n\n");
                  buffer = frames.pop() ?? "";
                  for (const frame of frames) {
                        const event = parseFrame(frame);
                        if (!event) continue;
                        if (event.event === "error") throw new ApiError(503, event.data.code, event.data.message);
                        if (event.event === "message.completed") finished = true;
                        onEvent(event);
                  }
            }
            if (!finished) throw new ApiError(0, "STREAM_CUT", "Se cortó la respuesta de tu chef. Inténtalo de nuevo.");
      },
};
