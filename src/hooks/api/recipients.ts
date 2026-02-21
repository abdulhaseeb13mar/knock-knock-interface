import { queryKeys } from "./query-keys";
import { api } from "@/lib/api-client";
import type { ImportResponse, Recipient } from "@/lib/api-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useRecipientsQuery() {
  return useQuery({
    queryKey: queryKeys.recipients.all,
    queryFn: () => api.get<Recipient[]>("/recipients"),
  });
}

export function useImportRecipientsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => api.upload<ImportResponse>("/recipients/import", formData),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: queryKeys.recipients.all });
    },
  });
}
