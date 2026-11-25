import { useLayoutEffect, useRef, useState, type FocusEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useNotifications } from "@/modules/notifications/hooks/useNotifications";
import Avatar from "../ui/Avatar";
import Dialog from "../ui/Dialog";
import Icon, { type IconName } from "../ui/Icon";

const today = new Intl.DateTimeFormat("es", { day: "numeric", month: "short" });
const rowClass = "flex min-h-11 items-center gap-3 rounded-control bg-field p-3 text-sm font-semibold text-ink hover:bg-line focus-visible:outline-2 focus-visible:outline-primary-strong";

type AppHeaderProps = {
      /** Stays visible when the header folds. */
      stats?: ReactNode;
      /** Below the stats; folds away with the greeting. */
      details?: ReactNode;
};

/**
 * White panel glued to the top of Inicio. Scrolling folds the greeting (upwards) and the details
 * (towards the stats) exactly as fast as the page moves, so only the stats stay pinned.
 *
 * The outer box keeps its full height while the panel shrinks (the padding makes up for it), so
 * folding never moves the content below.
 */
export default function AppHeader({ stats, details }: AppHeaderProps) {
      const { user } = useAuth();
      const [open, setOpen] = useState(false);
      const shown = useNotifications();
      const root = useRef<HTMLDivElement>(null);
      const greeting = useRef<HTMLDivElement>(null);
      const extra = useRef<HTMLDivElement>(null);
      const firstName = user?.name.split(" ")[0] ?? "";
      const folds = stats !== undefined;

      useLayoutEffect(() => {
            const el = root.current;
            if (!el || !folds) return;
            let distance = 0;
            const fold = () => el.style.setProperty("--fold", String(distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0));
            const measure = () => {
                  const top = greeting.current?.offsetHeight ?? 0;
                  const bottom = extra.current?.offsetHeight ?? 0;
                  distance = top + bottom;
                  el.style.setProperty("--greeting", `${top}px`);
                  el.style.setProperty("--details", `${bottom}px`);
                  fold();
            };
            measure();
            const observer = new ResizeObserver(measure);
            if (greeting.current) observer.observe(greeting.current);
            if (extra.current) observer.observe(extra.current);
            window.addEventListener("scroll", fold, { passive: true });
            return () => {
                  observer.disconnect();
                  window.removeEventListener("scroll", fold);
            };
      }, [folds, details === undefined]);

      // Reaching a folded control with the keyboard brings it back into view.
      const unfold = (event: FocusEvent) => {
            if (event.target.matches(":focus-visible")) window.scrollTo({ top: 0 });
      };

      return (
            <>
                  <div ref={root} className="pointer-events-none sticky top-0 z-20 pb-[calc((var(--greeting,0px)+var(--details,0px))*var(--fold,0))]">
                        <header className="pointer-events-auto mx-auto max-w-xl rounded-b-[2.5rem] bg-card pt-5 shadow-[0_18px_40px_-18px_rgb(122_60_90/0.28)]">
                              {/* Bottom-aligned in a shrinking box: the greeting leaves through the top edge. */}
                              <div className="flex h-[calc(var(--greeting)*(1-var(--fold,0)))] flex-col justify-end" style={{ opacity: "calc(1 - var(--fold, 0) * 1.5)" }} onFocus={unfold}>
                                    <div ref={greeting} className={`flex shrink-0 items-center gap-3 px-5 ${folds ? "pb-4" : "pb-5"}`}>
                                          <div className="min-w-0 flex-1">
                                                <h1 className="flex items-center gap-2 text-[1.3125rem] leading-7 font-semibold text-ink">
                                                      <span className="truncate">Hola, {firstName}</span>
                                                      <span aria-hidden className="shrink-0 -rotate-[20deg]">
                                                            <Icon name="hand" className="size-5" strokeWidth={1.75} />
                                                      </span>
                                                </h1>
                                                <p className="text-sm text-ink-muted">Así va tu día</p>
                                          </div>
                                          <span className="shrink-0 text-sm text-ink-muted">{today.format(new Date())}</span>
                                          <button
                                                type="button"
                                                aria-label={shown.length > 0 ? `Notificaciones y perfil, ${shown.length} pendientes` : "Notificaciones y perfil"}
                                                onClick={() => setOpen(true)}
                                                className="relative shrink-0 rounded-full shadow-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                          >
                                                <Avatar name={user?.name ?? ""} url={user?.avatarUrl} size="sm" />
                                                {/* Outlined dot, so "unread" reads apart from the avatar. */}
                                                {shown.length > 0 && <span aria-hidden className="absolute -top-0.5 -right-0.5 size-3.5 rounded-full border-2 border-card bg-kcal" />}
                                          </button>
                                    </div>
                              </div>
                              {stats && <div className="px-5 pb-4">{stats}</div>}
                              {details && (
                                    <div className="h-[calc(var(--details)*(1-var(--fold,0)))] overflow-hidden" style={{ opacity: "calc(1 - var(--fold, 0) * 1.3)" }} onFocus={unfold}>
                                          <div ref={extra}>{details}</div>
                                    </div>
                              )}
                        </header>
                  </div>

                  <Dialog open={open} onClose={() => setOpen(false)} title="Notificaciones">
                        <div className="flex flex-col gap-2">
                              {shown.length === 0 ? (
                                    <p className="flex items-center gap-3 pb-2 text-ink-muted">
                                          <Icon name="info" className="size-5 shrink-0" />
                                          Estás al día. No hay nada nuevo.
                                    </p>
                              ) : (
                                    <ul className="flex flex-col gap-2">
                                          {shown.map((item) => (
                                                <li key={item.id}>
                                                      <MenuLink to={item.to} icon={item.id === "chef" ? "chef" : "flame"} onClick={() => setOpen(false)}>
                                                            {item.text}
                                                      </MenuLink>
                                                </li>
                                          ))}
                                    </ul>
                              )}
                              <MenuLink to="/perfil" icon="user" onClick={() => setOpen(false)}>
                                    Ver tu perfil
                              </MenuLink>
                        </div>
                  </Dialog>
            </>
      );
}

function MenuLink({ to, icon, onClick, children }: { to: string; icon: IconName; onClick: () => void; children: ReactNode }) {
      return (
            <Link to={to} onClick={onClick} className={rowClass}>
                  <Icon name={icon} className="size-5 shrink-0 text-primary-strong" />
                  <span className="flex-1">{children}</span>
                  <Icon name="arrowRight" className="size-4 shrink-0" />
            </Link>
      );
}
