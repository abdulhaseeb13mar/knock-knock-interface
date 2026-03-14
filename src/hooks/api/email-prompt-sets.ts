import { queryKeys } from "./query-keys";
import { api } from "@/services/api-client";
import type { CreateEmailPromptSetInput, DeleteEmailPromptSetResponse, EmailPromptSet, UpdateEmailPromptSetInput } from "@/types/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useEmailPromptSetsQuery() {
  return useQuery({
    queryKey: queryKeys.emailPromptSets.all,
    queryFn: () => api.get<EmailPromptSet[]>("/email-prompt-sets"),
  });
}

export function useEmailPromptSetQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.emailPromptSets.detail(id),
    queryFn: () => api.get<EmailPromptSet>(`/email-prompt-sets/${id}`),
    enabled: enabled && Boolean(id),
  });
}

export function useCreateEmailPromptSetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEmailPromptSetInput) => api.post<EmailPromptSet>("/email-prompt-sets", input),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailPromptSets.all });
    },
  });
}

export function useUpdateEmailPromptSetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEmailPromptSetInput }) => api.patch<EmailPromptSet>(`/email-prompt-sets/${id}`, input),
    onSuccess(_, variables) {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailPromptSets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.emailPromptSets.detail(variables.id) });
    },
  });
}

export function useDeleteEmailPromptSetMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete<DeleteEmailPromptSetResponse>(`/email-prompt-sets/${id}`),
    onSuccess(_, id) {
      queryClient.invalidateQueries({ queryKey: queryKeys.emailPromptSets.all });
      queryClient.removeQueries({ queryKey: queryKeys.emailPromptSets.detail(id) });
    },
  });
}
