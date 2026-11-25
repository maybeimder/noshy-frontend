import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import ScreenHeader from "@/shared/components/layout/ScreenHeader";
import Icon, { type IconName } from "@/shared/components/ui/Icon";

type Section = "cooked" | "recipes" | "pantry" | "week";
type PantryTab = "items" | "shopping";

const sections: { id: Section; to: string; tab: string; title: string; icon: IconName }[] = [
      { id: "cooked", to: "/cocinadas", tab: "Cocinadas", title: "Mi cocina", icon: "kitchen" },
      { id: "recipes", to: "/recetas?ver=explorar", tab: "Recetas", title: "Recetas", icon: "pot" },
      { id: "pantry", to: "/despensa", tab: "Despensa", title: "Mi despensa", icon: "pantry" },
      { id: "week", to: "/semana", tab: "Semana", title: "Mi semana", icon: "calendar" },
];

const pantryTabs: { id: PantryTab; to: string; label: string; icon: IconName }[] = [
      { id: "items", to: "/despensa", label: "Lo que tengo", icon: "jar" },
      { id: "shopping", to: "/compras", label: "Lista de compras", icon: "cart" },
];

type KitchenHeaderProps = {
      section: Section;
      /** The shopping list is a part of the pantry. */
      pantryTab?: PantryTab;
      /** Over the title («32 ingredientes · hoy»); null while it loads. */
      meta: string | null;
      actions?: ReactNode;
};

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";

// Mi cocina: what was cooked, recipes, the pantry (with the shopping list) and the week, one tab each.
export default function KitchenHeader({ section, pantryTab = "items", meta, actions }: KitchenHeaderProps) {
      const { title, icon } = sections.find((s) => s.id === section)!;

      return (
            <ScreenHeader title={title} icon={icon} eyebrow={meta} actions={actions}>
                  <nav aria-label="Secciones de tu cocina" className="grid grid-cols-4 gap-1 rounded-[1.75rem] bg-card p-1.5 shadow-soft">
                        {sections.map((s) => {
                              const current = s.id === section;
                              return (
                                    <Link
                                          key={s.id}
                                          to={s.to}
                                          aria-current={current ? "page" : undefined}
                                          className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[1.375rem] text-xs font-bold whitespace-nowrap transition-colors ${focus} ${current ? "bg-brand text-card shadow-brand" : "text-ink-muted hover:text-ink"}`}
                                    >
                                          <Icon name={s.icon} className="size-5 shrink-0" strokeWidth={2} />
                                          {s.tab}
                                    </Link>
                              );
                        })}
                  </nav>

                  {section === "pantry" && (
                        <nav aria-label="Secciones de tu despensa" className="grid grid-cols-2 gap-2">
                              {pantryTabs.map((t) => {
                                    const current = t.id === pantryTab;
                                    return (
                                          <Link
                                                key={t.id}
                                                to={t.to}
                                                aria-current={current ? "page" : undefined}
                                                className={`flex min-h-11 items-center justify-center gap-2 rounded-control border-2 px-2 text-sm font-bold whitespace-nowrap transition-colors ${focus} ${
                                                      current ? "border-primary/60 bg-picked text-ink" : "border-transparent bg-card/60 text-ink-muted hover:bg-card hover:text-ink"
                                                }`}
                                          >
                                                <Icon name={t.icon} className={`size-[1.125rem] shrink-0 ${current ? "text-primary-strong" : ""}`} strokeWidth={2} />
                                                {t.label}
                                          </Link>
                                    );
                              })}
                        </nav>
                  )}
            </ScreenHeader>
      );
}
