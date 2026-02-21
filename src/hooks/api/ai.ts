import { queryKeys } from "./query-keys";
import { api } from "@/lib/api-client";
import type { AiKeyRecord, AiProviderName, SaveKeyResponse } from "@/lib/api-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

interface SaveAiKeyInput {
  provider: AiProviderName;
  apiKey: string;
}

export function useAiProvidersQuery() {
  return useQuery({
    queryKey: queryKeys.ai.providers,
    queryFn: () => api.get<AiProviderName[]>("/ai/providers"),
  });
}

export function useAiKeysQuery() {
  return useQuery({
    queryKey: queryKeys.ai.keys,
    queryFn: () => api.get<AiKeyRecord[]>("/ai/keys"),
  });
}

export function useDeleteAiKeyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (provider: AiProviderName) => api.delete<SaveKeyResponse>(`/ai/keys/${provider}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.ai.keys }),
  });
}

export function useSaveAiKeyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SaveAiKeyInput) => api.post<SaveKeyResponse>("/ai/key", input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.ai.keys }),
  });
}
