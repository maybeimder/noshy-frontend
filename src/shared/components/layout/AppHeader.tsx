import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { useNotifications } from "@/modules/notifications/hooks/useNotifications";
import Avatar from "../ui/Avatar";
import Dialog from "../ui/Dialog";
import Icon from "../ui/Icon";

const today = new Intl.DateTimeFormat("es", { day: "numeric", month: "short" });
const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";

// Home header: greeting on the left; date, bell and the user's avatar on the right.
export default function AppHeader() {
      const { user } = useAuth();
      const [open, setOpen] = useState(false);
      const { items, unread, markSeen } = useNotifications();
      // Snapshot what was unread when the dialog opened, so marking it seen does not empty the list.
      const [shown, setShown] = useState(items);
      const firstName = user?.name.split(" ")[0] ?? "";

      return (
            <header className="mx-auto flex max-w-xl items-center gap-2 px-5 pt-6 pb-2">
                  <div className="min-w-0 flex-1">
                        <h1 className="truncate text-section font-extrabold text-ink">Hola, {firstName}</h1>
                        <p className="text-sm font-semibold text-ink-muted">Así va tu día</p>
                  </div>

                  <span className="rounded-full bg-card px-3 py-1.5 text-xs font-extrabold text-ink shadow-soft">{today.format(new Date())}</span>

                  <button
                        type="button"
                        aria-label={unread ? `Notificaciones, ${items.length} sin leer` : "Notificaciones"}
                        onClick={() => {
                              setShown(items);
                              setOpen(true);
                              markSeen();
                        }}
                        className={`relative grid size-11 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-strong transition-colors hover:bg-rose-soft ${focusRing}`}
                  >
                        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                              <path d="M6 9a6 6 0 1 1 12 0c0 4.5 1.5 6.5 2 7H4c.5-.5 2-2.5 2-7Z" />
                              <path d="M10 19.5a2 2 0 0 0 4 0" />
                        </svg>
                        {/* Outlined dot, so "unread" reads apart from the icon (DESIGN.md › Campana). */}
                        {unread && <span aria-hidden className="absolute top-2 right-2 size-3 rounded-full border-2 border-primary-soft bg-tomato" />}
                  </button>

                  <Link to="/perfil" aria-label="Tu perfil" className={`shrink-0 rounded-full ${focusRing}`}>
                        <Avatar name={user?.name ?? ""} url={user?.avatarUrl} size="sm" />
                  </Link>

                  <Dialog open={open} onClose={() => setOpen(false)} title="Notificaciones">
                        {shown.length === 0 ? (
                              <p className="flex items-center gap-3 text-ink-muted">
                                    <Icon name="info" className="size-5 shrink-0" />
                                    Estás al día. No hay nada nuevo.
                              </p>
                        ) : (
                              <ul className="flex flex-col gap-2">
                                    {shown.map((item) => (
                                          <li key={item.id}>
                                                <Link
                                                      to={item.to}
                                                      onClick={() => setOpen(false)}
                                                      className="flex items-center gap-3 rounded-control bg-field p-3 text-sm font-semibold text-ink hover:bg-line focus-visible:outline-2 focus-visible:outline-primary-strong"
                                                >
                                                      <Icon name={item.id === "shopping" ? "cart" : "book"} className="size-5 shrink-0 text-primary-strong" />
                                                      <span className="flex-1">{item.text}</span>
                                                      <Icon name="arrowRight" className="size-4 shrink-0" />
                                                </Link>
                                          </li>
                                    ))}
                              </ul>
                        )}
                  </Dialog>
            </header>
      );
}
