import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/modules/auth/hooks/useAuth";
import { ApiError } from "@/shared/lib/axios";

// Client errors (4xx) won't succeed on retry; network and 5xx get one more try.
const shouldRetry = (failureCount: number, error: Error) =>
      failureCount < 1 && !(error instanceof ApiError && error.status >= 400 && error.status < 500);

export default function Providers({ children }: { children: ReactNode }) {
      const [queryClient] = useState(
            () =>
                  new QueryClient({
                        defaultOptions: {
                              queries: { retry: shouldRetry, refetchOnWindowFocus: false },
                        },
                  }),
      );

      return (
            <QueryClientProvider client={queryClient}>
                  <AuthProvider>{children}</AuthProvider>
            </QueryClientProvider>
      );
}
