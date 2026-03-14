import { queryKeys } from "./query-keys";
import { api } from "@/services/api-client";
import type { SentEmail } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

export function useSentEmailsQuery() {
  return useQuery({
    queryKey: queryKeys.emails.sent,
    queryFn: () => api.get<SentEmail[]>("/emails/sent"),
  });
}
