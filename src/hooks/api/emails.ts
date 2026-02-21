import { queryKeys } from "./query-keys";
import { api } from "@/lib/api-client";
import type { SentEmail } from "@/lib/api-types";
import { useQuery } from "@tanstack/react-query";

export function useSentEmailsQuery() {
  return useQuery({
    queryKey: queryKeys.emails.sent,
    queryFn: () => api.get<SentEmail[]>("/emails/sent"),
  });
}
