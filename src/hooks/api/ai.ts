import { queryKeys } from "./query-keys";
import { api } from "@/services/api-client";
import type { AiKeyRecord, AiProviderName, SaveAiKeyInput, SaveKeyResponse } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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

export function useUpdateAiKeyPriorityMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (priorities: Record<AiProviderName, number>) => api.put<{ success: true }>("/ai/keys/priority", priorities),
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
