import { useCallback, useMemo } from "react";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useCommunityRecipes } from "@/modules/recipes/hooks/useRecipes";
import { useSavedShoppingList } from "@/modules/shopping-list/hooks/useShoppingList";
import { useUserValue } from "@/shared/lib/user-store";

export type AppNotification = { id: string; text: string; to: string; createdAt: string };

const FIRST_VISIT_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

/**
 * Derived from real data until the backend has notifications (backend/recommendation.md §5):
 * community recipes published by others since the bell was last opened, and pending shopping.
 */
export function useNotifications() {
      const { user } = useAuth();
      const userId = user?.id ?? "anonymous";
      const community = useCommunityRecipes();
      const { saved } = useSavedShoppingList();
      const [seenAt, setSeenAt] = useUserValue<string>(userId, "notificationsSeenAt");

      const items = useMemo<AppNotification[]>(() => {
            const since = seenAt ?? new Date(Date.now() - FIRST_VISIT_WINDOW_MS).toISOString();
            const fresh = (community.data ?? [])
                  .filter((r) => r.publishedAt && r.publishedAt > since && r.authorName && r.authorName !== user?.name)
                  .map((r) => ({
                        id: `recipe-${r.id}`,
                        text: `${r.authorName!.split(" ")[0]} publicó «${r.title}»`,
                        to: `/comunidad/${r.id}`,
                        createdAt: r.publishedAt!,
                  }));
            const pending = saved ? saved.list.missingItems.length - saved.checked.length : 0;
            const shopping =
                  pending > 0
                        ? [{ id: "shopping", text: `Tu lista tiene ${pending} ${pending === 1 ? "cosa" : "cosas"} por comprar`, to: "/compras", createdAt: saved!.createdAt }]
                        : [];
            return [...shopping, ...fresh].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }, [community.data, saved, seenAt, user?.name]);

      const markSeen = useCallback(() => setSeenAt(new Date().toISOString()), [setSeenAt]);

      return { items, unread: items.length > 0, markSeen };
}
