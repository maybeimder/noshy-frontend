import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import Avatar from "../ui/Avatar";
import Dialog from "../ui/Dialog";
import Icon from "../ui/Icon";

const iconButton =
      "grid size-11 place-items-center rounded-control transition-colors hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";

// Home header: profile on the left, brand in the middle, notifications on the right.
export default function AppHeader() {
      const { user } = useAuth();
      const [notificationsOpen, setNotificationsOpen] = useState(false);

      return (
            <header className="sticky top-0 z-10 bg-canvas shadow-[0_8px_24px_-16px_rgb(29_9_44/0.25)]">
                  <div className="mx-auto grid max-w-xl grid-cols-[2.75rem_1fr_2.75rem] items-center px-6 pt-8 pb-4">
                        <Link
                              to="/perfil"
                              aria-label="Tu perfil"
                              className="rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                        >
                              <Avatar name={user?.name ?? ""} url={user?.avatarUrl} size="sm" />
                        </Link>
                        <p className="text-center font-logo text-page font-extrabold lowercase text-ink">noshy</p>
                        <button
                              type="button"
                              aria-label="Notificaciones"
                              onClick={() => setNotificationsOpen(true)}
                              className={`${iconButton} text-primary`}
                        >
                              <svg
                                    viewBox="0 0 24 24"
                                    className="size-6"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.75}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden
                              >
                                    <path d="M6 9a6 6 0 1 1 12 0c0 4.5 1.5 6.5 2 7H4c.5-.5 2-2.5 2-7Z" />
                                    <path d="M10 19.5a2 2 0 0 0 4 0" />
                              </svg>
                        </button>
                  </div>

                  <Dialog open={notificationsOpen} onClose={() => setNotificationsOpen(false)} title="Notificaciones">
                        <p className="flex items-center gap-3 text-ink-muted">
                              <Icon name="info" className="size-5 shrink-0" />
                              Aún no tienes notificaciones.
                        </p>
                  </Dialog>
            </header>
      );
}
