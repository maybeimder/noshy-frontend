import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { MarkerText } from "@/shared/components/ui/ScribbleText";

const tabs = [
      { to: "/despensa", label: "Despensa" },
      { to: "/compras", label: "Lista de compras" },
];

type KitchenHeaderProps = {
      title: string;
      /** Under the title («32 ingredientes · hoy»). */
      meta?: string;
      actions?: ReactNode;
};

// «Mi cocina» tab: the pantry and the shopping list share this header and switch between them.
export default function KitchenHeader({ title, meta, actions }: KitchenHeaderProps) {
      const { pathname } = useLocation();
      return (
            <header className="mx-auto flex max-w-xl flex-col gap-4 px-5 pt-6 pb-2">
                  <nav aria-label="Mi cocina" className="grid grid-cols-2 gap-1 self-start rounded-full bg-card p-1 shadow-soft">
                        {tabs.map((tab) => {
                              const active = pathname.startsWith(tab.to);
                              return (
                                    <Link
                                          key={tab.to}
                                          to={tab.to}
                                          aria-current={active ? "page" : undefined}
                                          className={`min-h-9 content-center rounded-full px-4 text-center text-xs focus-visible:outline-2 focus-visible:outline-primary-strong ${
                                                active ? "bg-brand font-extrabold text-card" : "font-bold text-ink-muted hover:text-ink"
                                          }`}
                                    >
                                          {tab.label}
                                    </Link>
                              );
                        })}
                  </nav>
                  <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                              <h1 className="text-[1.75rem] leading-tight font-extrabold text-ink">
                                    <MarkerText>{title}</MarkerText>
                              </h1>
                              {meta && <p className="mt-1 text-sm font-semibold text-ink-muted">{meta}</p>}
                        </div>
                        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
                  </div>
            </header>
      );
}
