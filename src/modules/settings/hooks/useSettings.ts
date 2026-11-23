import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/modules/auth/hooks/useAuth";
import { settingsApi, type Settings } from "../api/settings.api";

const settingsKey = ["settings"] as const;

export function useSettings() {
      return useQuery({ queryKey: settingsKey, queryFn: settingsApi.get });
}

export function usePatchSettings() {
      const queryClient = useQueryClient();
      const { patchUser } = useAuth();
      return useMutation({
            mutationFn: settingsApi.patch,
            onSuccess: (settings: Settings) => {
                  queryClient.setQueryData(settingsKey, settings);
                  const { name, lastName, email, emailVerified, avatarUrl } = settings.account;
                  patchUser({ name, lastName, email, emailVerified, avatarUrl });
                  void queryClient.invalidateQueries({ queryKey: ["profile"] });
                  void queryClient.invalidateQueries({ queryKey: ["home"] });
            },
      });
}
