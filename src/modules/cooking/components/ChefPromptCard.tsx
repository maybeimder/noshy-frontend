import { Link } from "react-router-dom";
import type { InventoryItem } from "@/modules/inventory/types";
import Icon from "@/shared/components/ui/Icon";
import Mascot from "@/shared/components/ui/Mascot";

/** "Tengo ideas con tu pasta y tu pecorino", from what is actually in the pantry. */
export function chefPrompt(inventory: InventoryItem[] | undefined) {
      const [first, second] = (inventory ?? []).map((item) => item.name.trim().toLowerCase());
      if (first && second) return `Tengo ideas con tu ${first} y tu ${second}`;
      if (first) return `Tengo ideas con tu ${first}`;
      return "¿Qué cocinamos con lo que tienes?";
}

export default function ChefPromptCard({ inventory }: { inventory: InventoryItem[] | undefined }) {
      return (
            <Link
                  to="/chef"
                  className="group mx-5 flex items-center gap-4 rounded-card bg-card p-4 shadow-[0_8px_24px_-16px_rgb(29_9_44/0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
            >
                  <span className="grid size-14 shrink-0 place-items-center rounded-control bg-rose-soft">
                        <Mascot className="size-11" />
                  </span>
                  <span className="min-w-0 flex-1">
                        <span className="block font-display text-base font-bold text-ink">{chefPrompt(inventory)}</span>
                        <span className="block text-sm font-bold text-primary-strong">Habla con Noshy</span>
                  </span>
                  <Icon name="arrowRight" className="size-6 shrink-0 text-ink transition-transform group-hover:translate-x-1" />
            </Link>
      );
}
