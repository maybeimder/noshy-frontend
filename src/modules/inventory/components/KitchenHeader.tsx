import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import Icon, { type IconName } from "@/shared/components/ui/Icon";
import { MarkerText } from "@/shared/components/ui/ScribbleText";
import { SkText } from "@/shared/components/ui/Skeleton";

// The «⌄ Mi cocina» selector (contract: navigation only, no endpoint).
export const kitchenSections: { to: string; label: string; icon: IconName }[] = [
      { to: "/cocinadas", label: "Mi cocina", icon: "kitchen" },
      { to: "/despensa", label: "Mi despensa", icon: "pantry" },
      { to: "/compras", label: "Lista de compras", icon: "cart" },
      { to: "/semana", label: "Mi semana", icon: "clock" },
];

type KitchenHeaderProps = {
      title: string;
      /** Under the title («32 ingredientes · hoy»); null while it loads, so it keeps its line. */
      meta?: string | null;
      actions?: ReactNode;
};

// Mi cocina, Mi despensa, Lista de compras and Mi semana share this header; the title switches between them.
export default function KitchenHeader({ title, meta, actions }: KitchenHeaderProps) {
      const { pathname } = useLocation();
      const [open, setOpen] = useState(false);
      const menuId = useId();
      const root = useRef<HTMLDivElement>(null);

      useEffect(() => {
            if (!open) return;
            const close = (event: Event) => {
                  if (event instanceof KeyboardEvent ? event.key === "Escape" : !root.current?.contains(event.target as Node)) setOpen(false);
            };
            document.addEventListener("pointerdown", close);
            document.addEventListener("keydown", close);
            return () => {
                  document.removeEventListener("pointerdown", close);
                  document.removeEventListener("keydown", close);
            };
      }, [open]);

      return (
            <header className="mx-auto flex max-w-xl items-end gap-3 px-5 pt-6 pb-3">
                  <div ref={root} className="relative min-w-0 flex-1">
                        {/* As in the design: the count sits over the title. */}
                        {meta === null ? <SkText size="sm" w="w-32" className="mb-1" /> : meta && <p className="mb-1 truncate text-sm font-semibold text-ink-muted">{meta}</p>}
                        <h1 className="text-[clamp(1.35rem,5.9vw,1.85rem)] leading-[1.15] font-extrabold text-ink">
                              <button
                                    type="button"
                                    aria-expanded={open}
                                    aria-controls={menuId}
                                    aria-label={`${title}: cambiar de sección`}
                                    onClick={() => setOpen((v) => !v)}
                                    className="group -ml-1 flex max-w-full items-center gap-1.5 rounded-control px-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                              >
                                    <span className="min-w-0 pb-0.5 text-balance">
                                          <MarkerText>{title}</MarkerText>
                                    </span>
                                    <Icon name="chevronDown" className={`size-5 shrink-0 text-ink-muted transition-transform group-hover:text-ink ${open ? "rotate-180" : ""}`} strokeWidth={2.5} />
                              </button>
                        </h1>
                        {open && (
                              <ul id={menuId} className="absolute top-full left-0 z-30 mt-2 w-60 rounded-card bg-card p-2 shadow-[0_18px_40px_-16px_rgb(43_20_51/0.45)]">
                                    {kitchenSections.map((section) => {
                                          const current = pathname.startsWith(section.to);
                                          return (
                                                <li key={section.to}>
                                                      <Link
                                                            to={section.to}
                                                            aria-current={current ? "page" : undefined}
                                                            onClick={() => setOpen(false)}
                                                            className={`flex min-h-12 items-center gap-3 rounded-control px-3 font-bold focus-visible:outline-2 focus-visible:outline-primary-strong ${
                                                                  current ? "bg-primary-soft text-rose-ink" : "text-ink hover:bg-field"
                                                            }`}
                                                      >
                                                            <Icon name={section.icon} className="size-5" />
                                                            <span className="flex-1">{section.label}</span>
                                                            {current && <Icon name="check" className="size-4" strokeWidth={3} />}
                                                      </Link>
                                                </li>
                                          );
                                    })}
                              </ul>
                        )}
                  </div>
                  {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
            </header>
      );
}
