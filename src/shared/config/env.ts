// In dev, "/api" goes through the Vite proxy (see vite.config.ts), which strips the prefix.
export const env = {
      apiUrl: import.meta.env.VITE_API_URL ?? "/api",
};
