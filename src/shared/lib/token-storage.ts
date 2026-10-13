const KEY = "noshy.token";

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
            } catch {
                  // Nothing to clear.
            }
      },
};
