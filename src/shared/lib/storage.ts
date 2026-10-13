// JSON values scoped per user, so two accounts on one browser never share drafts.
// Storage can throw (private mode, blocked site data); callers just get the fallback.
const key = (userId: string, name: string) => `noshy.${userId}.${name}`;

export const userStorage = {
      get<T>(userId: string, name: string): T | null {
            try {
                  const raw = localStorage.getItem(key(userId, name));
                  return raw === null ? null : (JSON.parse(raw) as T);
            } catch {
                  return null;
            }
      },
      set(userId: string, name: string, value: unknown) {
            try {
                  localStorage.setItem(key(userId, name), JSON.stringify(value));
            } catch {
                  // Lives only in memory for this visit.
            }
      },
      remove(userId: string, name: string) {
            try {
                  localStorage.removeItem(key(userId, name));
            } catch {
                  // Nothing to remove.
            }
      },
};
