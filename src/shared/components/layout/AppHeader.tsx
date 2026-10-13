type AppHeaderProps = {
      hasUnreadNotifications?: boolean;
};

const iconButton =
      "grid size-11 place-items-center rounded-control transition-colors hover:bg-primary-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong";

export default function AppHeader({
      hasUnreadNotifications = false,
}: AppHeaderProps) {
      return (
            <header className="sticky top-0 z-10 bg-canvas shadow-[0_8px_24px_-16px_rgb(29_9_44/0.25)]">
                  <div className="mx-auto grid max-w-xl grid-cols-[auto_1fr_auto] items-center px-6 pt-12 pb-6">
                        <button
                              type="button"
                              aria-label="Menú"
                              className={`${iconButton} text-ink-muted`}
                        >
                              <svg
                                    viewBox="0 0 24 24"
                                    className="size-6"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth={1.75}
                                    strokeLinecap="round"
                                    aria-hidden
                              >
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                              </svg>
                        </button>

                        <h1 className="text-center font-logo text-page font-extrabold lowercase">
                              noshy
                        </h1>

                        <button
                              type="button"
                              aria-label={
                                    hasUnreadNotifications
                                          ? "Notificaciones, hay nuevas sin leer"
                                          : "Notificaciones"
                              }
                              className={`${iconButton} relative text-primary`}
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
                              {hasUnreadNotifications && (
                                    <span
                                          aria-hidden
                                          className="absolute top-2 right-2 size-3 rounded-full border-2 border-canvas bg-primary-strong"
                                    />
                              )}
                        </button>
                  </div>
            </header>
      );
}
