import { Link, useLocation } from "react-router-dom";
import Icon, { type IconName } from "../ui/Icon";
import { MascotAvatar } from "../ui/MascotBubble";

type Item = { to: string; label: string; icon?: IconName; end?: boolean; match?: (path: string, search: string) => boolean };

// "Mi cocina" covers pantry, shopping list, week, cooked recipes and receipts; "Comunidad" is the community tab of recipes.
const items: Item[] = [
      { to: "/", label: "Inicio", icon: "home", end: true },
      { to: "/cocinadas", label: "Mi cocina", icon: "kitchen", match: (path) => ["/despensa", "/compras", "/semana", "/cocinadas", "/facturas"].some((p) => path.startsWith(p)) },
      { to: "/chef", label: "Tu chef" },
      {
            to: "/recetas?ver=comunidad",
            label: "Comunidad",
            icon: "community",
            match: (path, search) => path.startsWith("/recetas") && search.includes("ver=comunidad"),
      },
      { to: "/perfil", label: "Perfil", icon: "user" },
];

const linkFocus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";

// Fixed bars on tab screens sit at bottom-24 or higher to clear this nav (h-16 + 1rem gap).
// White pill; the chef (the Noshy logo) rises from the centre in a pink ring.
export default function BottomNav() {
      const { pathname, search } = useLocation();

      return (
            <nav
                  aria-label="Principal"
                  className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-20 mx-auto max-w-xl rounded-full bg-card shadow-[0_12px_32px_-12px_rgb(29_9_44/0.35)]"
            >
                  <ul className="flex h-16 items-center justify-around px-2">
                        {items.map(({ to, label, icon, end, match }) => {
                              if (!icon) {
                                    return (
                                          <li key={to} className="flex flex-1 justify-center">
                                                <Link
                                                      to={to}
                                                      aria-label={label}
                                                      className={`-mt-9 grid size-[4.5rem] place-items-center rounded-full bg-brand p-1 shadow-brand ring-4 ring-canvas transition-transform hover:scale-105 ${linkFocus}`}
                                                >
                                                      <MascotAvatar tone="white" className="size-full" />
                                                </Link>
                                          </li>
                                    );
                              }
                              const active = match ? match(pathname, search) : end ? pathname === to : pathname.startsWith(to);
                              return (
                                    <li key={to} className="flex flex-1 justify-center">
                                          <Link
                                                to={to}
                                                aria-current={active ? "page" : undefined}
                                                className={`flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-control text-xs ${linkFocus} ${
                                                      active ? "font-extrabold text-primary-strong" : "font-semibold text-ink-muted"
                                                }`}
                                          >
                                                {/* Active: pink icon + heavier stroke + bold label, never color alone. */}
                                                <Icon name={icon} className={`size-6 transition-[translate,stroke-width] duration-300 ease-out ${active ? "-translate-y-0.5" : ""}`} strokeWidth={active ? 2.25 : 1.75} />
                                                {label}
                                          </Link>
                                    </li>
                              );
                        })}
                  </ul>
            </nav>
      );
}
