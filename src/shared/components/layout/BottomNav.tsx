import { NavLink } from "react-router-dom";
import Icon, { type IconName } from "../ui/Icon";

const items: { to: string; label: string; icon: IconName; end?: boolean }[] = [
      { to: "/", label: "Inicio", icon: "home", end: true },
      { to: "/despensa", label: "Despensa", icon: "pantry" },
      { to: "/chef", label: "Chef", icon: "chef" },
      { to: "/recetas", label: "Recetas", icon: "book" },
      { to: "/perfil", label: "Perfil", icon: "user" },
];

// Fixed bars on tab screens sit at bottom-24 or higher to clear this nav (h-16 + 1rem gap).
// Floating pill with the chef as the raised centre action.
export default function BottomNav() {
      return (
            <nav
                  aria-label="Principal"
                  className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-20 mx-auto max-w-xl rounded-full bg-card shadow-[0_12px_32px_-12px_rgb(29_9_44/0.35)]"
            >
                  <ul className="flex h-16 items-center justify-around px-2">
                        {items.map(({ to, label, icon, end }) => {
                              const center = icon === "chef";
                              return (
                                    <li key={to} className="flex flex-1 justify-center">
                                          <NavLink
                                                to={to}
                                                end={end}
                                                aria-label={center ? label : undefined}
                                                className={({ isActive }) =>
                                                      center
                                                            ? "-mt-10 grid size-16 place-items-center rounded-full bg-primary-strong text-card shadow-[0_8px_24px_-4px_rgb(201_48_124/0.7)] ring-4 ring-canvas transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-strong"
                                                            : `flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-control text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong ${
                                                                    isActive ? "font-bold text-ink" : "text-ink-muted"
                                                              }`
                                                }
                                          >
                                                {({ isActive }) =>
                                                      center ? (
                                                            <Icon name="chef" className="size-8" strokeWidth={isActive ? 2.25 : 1.75} />
                                                      ) : (
                                                            <>
                                                                  {/* Active: pink icon + heavier stroke + bold label, never color alone. */}
                                                                  <Icon
                                                                        name={icon}
                                                                        className={`size-6 ${isActive ? "text-primary-strong" : ""}`}
                                                                        strokeWidth={isActive ? 2.25 : 1.75}
                                                                  />
                                                                  {label}
                                                            </>
                                                      )
                                                }
                                          </NavLink>
                                    </li>
                              );
                        })}
                  </ul>
            </nav>
      );
}
