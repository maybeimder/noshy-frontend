import { NavLink } from "react-router-dom";
import Icon, { type IconName } from "../ui/Icon";

const items: { to: string; label: string; icon: IconName; end?: boolean }[] = [
      { to: "/", label: "Inicio", icon: "home", end: true },
      { to: "/despensa", label: "Despensa", icon: "pantry" },
      { to: "/chef", label: "Chef", icon: "chef" },
      { to: "/recetas", label: "Recetas", icon: "book" },
      { to: "/perfil", label: "Perfil", icon: "user" },
];

export default function BottomNav() {
      return (
            <nav
                  aria-label="Principal"
                  className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card pb-[env(safe-area-inset-bottom)]"
            >
                  <ul className="mx-auto flex max-w-xl items-stretch justify-around px-2">
                        {items.map(({ to, label, icon, end }) => (
                              <li key={to} className="flex-1">
                                    <NavLink
                                          to={to}
                                          end={end}
                                          className={({ isActive }) =>
                                                `relative flex min-h-16 flex-col items-center justify-center gap-1 text-xs focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-strong ${
                                                      isActive ? "font-bold text-ink" : "text-ink-muted"
                                                }`
                                          }
                                    >
                                          {({ isActive }) => (
                                                <>
                                                      {/* Shape cue besides color for the active tab. */}
                                                      {isActive && (
                                                            <span
                                                                  aria-hidden
                                                                  className="absolute top-0 h-1 w-8 rounded-full bg-primary"
                                                            />
                                                      )}
                                                      <span
                                                            className={`grid place-items-center rounded-full ${
                                                                  icon === "chef"
                                                                        ? "size-11 -mt-4 bg-primary text-ink shadow-[0_8px_16px_-8px_rgb(233_75_151/0.6)]"
                                                                        : isActive
                                                                          ? "size-8 bg-primary-soft text-primary-strong"
                                                                          : "size-8"
                                                            }`}
                                                      >
                                                            <Icon
                                                                  name={icon}
                                                                  className="size-6"
                                                                  strokeWidth={isActive ? 2 : 1.75}
                                                            />
                                                      </span>
                                                      {label}
                                                </>
                                          )}
                                    </NavLink>
                              </li>
                        ))}
                  </ul>
            </nav>
      );
}
