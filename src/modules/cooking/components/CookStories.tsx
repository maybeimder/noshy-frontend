import type { Cook } from "../types";

// Ciruela label passes AA on every one of these surfaces.
const avatarSurfaces = [
      "bg-primary",
      "bg-secondary",
      "bg-secondary-soft",
      "bg-primary-soft",
];

type CookStoriesProps = {
      cooks: Cook[];
};

export default function CookStories({ cooks }: CookStoriesProps) {
      return (
            <nav aria-label="Cocineros">
                  <ul className="scrollbar-none flex gap-4 overflow-x-auto px-6 py-4">
                        {cooks.map((cook, index) => (
                              <li key={cook.id} className="shrink-0">
                                    <button
                                          type="button"
                                          className="flex w-16 flex-col items-center gap-2 rounded-control focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-strong"
                                    >
                                          <span
                                                className={`rounded-full p-0.5 ${
                                                      cook.hasNewStory
                                                            ? "bg-linear-to-br from-primary to-secondary"
                                                            : "bg-card"
                                                }`}
                                          >
                                                <span
                                                      className={`grid size-14 place-items-center rounded-full border-2 border-card text-section font-extrabold text-ink ${
                                                            cook.isMe
                                                                  ? "bg-line text-ink-muted"
                                                                  : avatarSurfaces[
                                                                          index %
                                                                                avatarSurfaces.length
                                                                    ]
                                                      }`}
                                                      aria-hidden
                                                >
                                                      {cook.isMe ? (
                                                            <svg
                                                                  viewBox="0 0 24 24"
                                                                  className="size-7"
                                                                  fill="currentColor"
                                                            >
                                                                  <circle cx="12" cy="8" r="4" />
                                                                  <path d="M4 20c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5Z" />
                                                            </svg>
                                                      ) : (
                                                            cook.name.charAt(0)
                                                      )}
                                                </span>
                                          </span>
                                          <span className="w-full truncate text-center text-xs text-ink-muted">
                                                {cook.name}
                                          </span>
                                          {cook.hasNewStory && (
                                                <span className="sr-only">
                                                      , historia nueva
                                                </span>
                                          )}
                                    </button>
                              </li>
                        ))}
                  </ul>
            </nav>
      );
}
