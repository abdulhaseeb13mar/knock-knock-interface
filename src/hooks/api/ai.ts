import { queryKeys } from "./query-keys";
import { api } from "@/lib/api-client";
import type { AiProviderName, SaveKeyResponse } from "@/lib/api-types";
import { useMutation, useQuery } from "@tanstack/react-query";

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

export function useSaveAiKeyMutation() {
  return useMutation({
    mutationFn: (input: SaveAiKeyInput) => api.post<SaveKeyResponse>("/ai/key", input),
  });
}
