import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { newKey } from "@/shared/lib/axios";
import { chefApi } from "../api/chef.api";
import type { ChefBlock, ChefInput, ChefMessage } from "../types";

/** Thread of a recipe, or "main" for the general conversation. */
export function useThreadId(recipeId: string | null) {
      const thread = useQuery({
            queryKey: ["chefRecipeThread", recipeId],
            queryFn: () => chefApi.openRecipeThread(recipeId!),
            enabled: recipeId !== null,
            staleTime: Infinity,
      });
      return { threadId: recipeId ? (thread.data?.id ?? null) : "main", error: thread.error };
}

const upsertBlock = (message: ChefMessage, block: ChefBlock): ChefMessage => ({
      ...message,
      blocks: message.blocks.some((b) => b.id === block.id) ? message.blocks.map((b) => (b.id === block.id ? block : b)) : [...message.blocks, block],
});

export function useChefThread(threadId: string | null) {
      const queryClient = useQueryClient();
      const queryKey = useMemo(() => ["chefThread", threadId] as const, [threadId]);
      // Messages of the exchange in flight, on top of the saved history.
      const [live, setLive] = useState<ChefMessage[]>([]);
      // A retry reuses the id, so the backend answers the same message instead of a new one.
      const pending = useRef<{ signature: string; id: string } | null>(null);

      const history = useInfiniteQuery({
            queryKey,
            queryFn: ({ pageParam }) => chefApi.messages(threadId!, pageParam),
            initialPageParam: undefined as string | undefined,
            getNextPageParam: (page) => page.meta.nextCursor ?? undefined,
            enabled: threadId !== null,
      });

      const send = useMutation({
            mutationFn: async (input: ChefInput) => {
                  const signature = JSON.stringify([threadId, input]);
                  if (pending.current?.signature !== signature) pending.current = { signature, id: newKey() };
                  if (input.type === "text") {
                        // Same clientMessageId as the saved message, so the bubble is not mounted again when it arrives.
                        setLive([{ id: "sending", clientMessageId: pending.current.id, threadId: threadId!, role: "user", createdAt: new Date().toISOString(), blocks: [{ id: "b1", type: "text", text: input.text }] }]);
                  }
                  const change = (id: string, fn: (m: ChefMessage) => ChefMessage) => setLive((list) => list.map((m) => (m.id === id ? fn(m) : m)));
                  await chefApi.send(threadId!, input, pending.current.id, (e) => {
                        if (e.event === "message.created") setLive((list) => [...list.filter((m) => m.id !== "sending" && m.id !== e.data.message.id), e.data.message]);
                        else if (e.event === "block.delta")
                              change(e.data.messageId, (m) => {
                                    const current = m.blocks.find((b) => b.id === e.data.blockId);
                                    return upsertBlock(m, { id: e.data.blockId, type: "text", text: (current?.type === "text" ? current.text : "") + e.data.delta });
                              });
                        else if (e.event === "block.completed") change(e.data.messageId, (m) => upsertBlock(m, e.data.block));
                  });
                  pending.current = null;
            },
            onSettled: async () => {
                  // The server keeps the truth, also when the reply failed halfway.
                  await queryClient.invalidateQueries({ queryKey });
                  setLive([]);
            },
      });

      const messages = useMemo(() => {
            const saved = (history.data?.pages ?? []).flatMap((p) => p.data).reverse();
            const liveIds = new Set(live.map((m) => m.id));
            return [...saved.filter((m) => !liveIds.has(m.id)), ...live];
      }, [history.data, live]);

      const lastSavedId = history.data?.pages[0]?.data[0]?.id;
      useEffect(() => {
            if (!threadId || !lastSavedId) return;
            chefApi.markRead(threadId, lastSavedId).then(
                  () => queryClient.invalidateQueries({ queryKey: ["home"] }),
                  () => undefined, // the badge just stays until next time
            );
      }, [threadId, lastSavedId, queryClient]);

      const feedback = useMutation({ mutationFn: chefApi.feedback });
      const sendText = useCallback((text: string) => send.mutate({ type: "text", text, via: "keyboard" }), [send]);
      return { history, messages, send, sendText, feedback };
}
