// In dev, "/api" goes through the Vite proxy (see vite.config.ts), which strips the prefix.
export const env = {
      apiUrl: import.meta.env.VITE_API_URL ?? "/api",
      /** Same ids the backend accepts in GOOGLE_CLIENT_IDS and APPLE_CLIENT_IDS. Without one, its button does not show. */
      googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined,
      appleClientId: import.meta.env.VITE_APPLE_CLIENT_ID || undefined,
};
