import { useState } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "@/modules/notifications/hooks/useNotifications";
import Dialog from "../ui/Dialog";
import Icon from "../ui/Icon";
import Mascot from "../ui/Mascot";

// Home header from ref/Inicio.png: mascot + "Noshy" on the left, bell on a white circle on the right.
export default function AppHeader() {
      const [open, setOpen] = useState(false);
      const { items, unread, markSeen } = useNotifications();
      // Snapshot what was unread when the dialog opened, so marking it seen does not empty the list.
      const [shown, setShown] = useState(items);

      return (
            <header className="mx-auto flex max-w-xl items-center justify-between px-5 pt-6 pb-2">
                  <Link
                        to="/"
                        aria-label="Noshy, inicio"
                        className="flex items-center gap-2 rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                  >
                        <Mascot className="size-11" />
                        <span className="font-display text-section font-extrabold tracking-tight text-wine">Noshy</span>
                  </Link>

                  <button
                        type="button"
                        aria-label={unread ? `Notificaciones, ${items.length} sin leer` : "Notificaciones"}
                        onClick={() => {
                              setShown(items);
                              setOpen(true);
                              markSeen();
                        }}
                        className="relative grid size-12 place-items-center rounded-full bg-card text-ink shadow-[0_6px_16px_-10px_rgb(43_20_51/0.45)] transition-colors hover:bg-field focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                  >
                        <svg
                              viewBox="0 0 24 24"
                              className="size-6"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={1.9}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden
                        >
                              <path d="M6 9a6 6 0 1 1 12 0c0 4.5 1.5 6.5 2 7H4c.5-.5 2-2.5 2-7Z" />
                              <path d="M10 19.5a2 2 0 0 0 4 0" />
                        </svg>
                        {/* Outlined dot, so "unread" reads apart from the icon (DESIGN.md › Campana). */}
                        {unread && <span aria-hidden className="absolute top-2.5 right-2.5 size-3 rounded-full border-2 border-card bg-primary-strong" />}
                  </button>

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
