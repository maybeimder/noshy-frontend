import { useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useInvalidateFeedback } from "@/modules/feedback/hooks/useFeedback";
import { recipesKey } from "@/modules/recipes/hooks/useRecipes";
import { ApiError } from "@/shared/lib/axios";
import { readUserValue, useUserValue } from "@/shared/lib/user-store";
import { chefApi } from "../api/chef.api";
import type { ChefContext, ChefMessage } from "../types";

// The backend has no "list my sessions", so the active session id lives in this browser.
const NAME = "chefSession";
const contextKey = (sessionId: string | null) => ["chef", "context", sessionId] as const;

function useStoredSessionId() {
      const { user } = useAuth();
      const userId = user?.id ?? "anonymous";
      const [sessionId, setSessionId] = useUserValue<string>(userId, NAME);
      const latest = useCallback(() => readUserValue<string>(userId, NAME), [userId]);
      return { sessionId, setSessionId, latest };
}

/** Returns the active session id, opening a session first if there is none. */
export function useEnsureChefSession() {
      const { latest, setSessionId } = useStoredSessionId();
      return useCallback(async () => {
            const current = latest();
            if (current) return current;
            const session = await chefApi.open();
            setSessionId(session.id);
            return session.id;
      }, [latest, setSessionId]);
}

export function useChefSession() {
      const queryClient = useQueryClient();
      const invalidateFeedback = useInvalidateFeedback();
      const { sessionId, setSessionId } = useStoredSessionId();
      const ensureSession = useEnsureChefSession();

      const context = useQuery({
            queryKey: contextKey(sessionId),
            queryFn: () => chefApi.context(sessionId!),
            enabled: sessionId !== null,
      });

      // Closed or recovery-pending sessions answer 409/404: forget them and start fresh.
      useEffect(() => {
            const error = context.error;
            if (error instanceof ApiError && (error.status === 409 || error.status === 404)) setSessionId(null);
      }, [context.error, setSessionId]);

      const send = useMutation({
            mutationFn: async (body: { content: string; recipeId?: string }) => {
                  const id = await ensureSession();
                  // Optimistic: show the user's message right away.
                  const pending: ChefMessage = {
                        id: `pending-${Date.now()}`,
                        role: "user",
                        content: body.content,
                        createdAt: new Date().toISOString(),
                  };
                  // An in-flight context fetch would overwrite the optimistic message.
                  await queryClient.cancelQueries({ queryKey: contextKey(id) });
                  // A brand-new session has no cached context yet; seed a minimal one.
                  queryClient.setQueryData<ChefContext>(contextKey(id), (current) => ({
                        sessionId: id,
                        preferencesMarkdown: current?.preferencesMarkdown ?? "",
                        preferencesVersion: current?.preferencesVersion ?? 0,
                        nutritionPlan: current?.nutritionPlan,
                        inventory: current?.inventory ?? [],
                        messages: [...(current?.messages ?? []), pending],
                  }));
                  return { sessionId: id, reply: await chefApi.respond(id, body) };
            },
            onSuccess: ({ reply }) => {
                  if (reply.feedback.length) invalidateFeedback();
                  if (reply.savedRecipe) queryClient.invalidateQueries({ queryKey: recipesKey });
            },
            // The server keeps the user's message even when the chef fails, so re-read the truth.
            onSettled: () => queryClient.invalidateQueries({ queryKey: ["chef", "context"] }),
      });

      const close = useMutation({
            mutationFn: (preferencesMarkdown: string) => chefApi.close(sessionId!, preferencesMarkdown),
            onSettled: (_data, error) => {
                  // Success closes it; 409 (version conflict, already closed) or 404 means it is over too.
                  if (!error || (error instanceof ApiError && (error.status === 409 || error.status === 404))) {
                        queryClient.removeQueries({ queryKey: contextKey(sessionId) });
                        setSessionId(null);
                  }
            },
      });

      return { sessionId, context, send, close };
}
