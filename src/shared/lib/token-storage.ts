const KEY = "noshy.token";
const USER_KEY = "noshy.user";

// Storage can throw (private mode, blocked site data); treat that as "no session".
export const tokenStorage = {
      get(): string | null {
            try {
                  return localStorage.getItem(KEY);
            } catch {
                  return null;
            }
      },
      set(token: string) {
            try {
                  localStorage.setItem(KEY, token);
            } catch {
                  // Session lasts only while the tab is open.
            }
      },
      clear() {
            try {
                  localStorage.removeItem(KEY);
                  localStorage.removeItem(USER_KEY);
            } catch {
                  // Nothing to clear.
            }
      },
};

/** Last user the API returned with the session (JSON), read back on reload. */
export const userCache = {
      get<T>(): T | null {
            try {
                  const raw = localStorage.getItem(USER_KEY);
                  return raw ? (JSON.parse(raw) as T) : null;
            } catch {
                  return null;
            }
      },
      set(user: unknown) {
            try {
                  localStorage.setItem(USER_KEY, JSON.stringify(user));
            } catch {
                  // Kept in memory only.
            }
      },
};
