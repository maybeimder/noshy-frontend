import { Link } from "react-router-dom";
import type { InventoryItem } from "@/modules/inventory/types";
import Icon from "@/shared/components/ui/Icon";
import { MascotAvatar } from "@/shared/components/ui/MascotBubble";

/** "Tengo ideas con tu pasta y tu pecorino", from what is actually in the pantry. */
export function chefPrompt(inventory: InventoryItem[] | undefined) {
      const [first, second] = (inventory ?? []).map((item) => item.name.trim().toLowerCase());
      if (first && second) return `Tengo ideas con tu ${first} y tu ${second}`;
      if (first) return `Tengo ideas con tu ${first}`;
      return "¿Qué cocinamos con lo que tienes?";
}

// Plum nudge from the chef, one tap from the conversation.
export default function ChefPromptCard({ inventory }: { inventory: InventoryItem[] | undefined }) {
      return (
            <Link
                  to="/chef"
                  className="group mx-5 flex items-center gap-3 rounded-full bg-plum-glow p-2 pr-2 text-card shadow-[0_16px_32px_-20px_rgb(43_20_51/0.8)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
            >
                  <MascotAvatar tone="white" className="size-12" />
                  <span className="min-w-0 flex-1">
                        <span className="block truncate font-display text-base font-extrabold">{chefPrompt(inventory)}</span>
                        <span className="block text-sm text-card/80">Habla con tu chef</span>
                  </span>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-strong transition-transform group-hover:translate-x-0.5">
                        <Icon name="arrowRight" className="size-5 -rotate-45" strokeWidth={2.25} />
                  </span>
            </Link>
      );
}
