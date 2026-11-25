import { useHome } from "@/modules/cooking/hooks/useHome";
import { plural } from "@/shared/lib/format";

export type AppNotification = { id: string; text: string; to: string };

/** What needs attention, from the same call that paints Inicio. */
export function useNotifications(): AppNotification[] {
      const { data: home } = useHome();
      const items: AppNotification[] = [];
      if (home?.activeCookingSession) items.push({ id: "cooking", text: `Dejaste ${home.activeCookingSession.recipe.title} a medias`, to: `/cocinar/${home.activeCookingSession.id}` });
      if (home && home.chef.unreadCount > 0) items.push({ id: "chef", text: `Tu chef te dejó ${plural(home.chef.unreadCount, "mensaje", "mensajes")}`, to: "/chef" });
      return items;
}
