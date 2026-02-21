import { queryKeys } from "./query-keys";
import { api } from "@/lib/api-client";
import type { GmailConnectResponse } from "@/lib/api-types";
import { useMutation, useQuery } from "@tanstack/react-query";

interface GmailStatusResponse {
  integrated: boolean;
}

export function useGmailConnectMutation() {
  return useMutation({
    mutationFn: () => api.get<GmailConnectResponse>("/integrations/gmail/connect"),
  });
}

export function useGmailStatusQuery() {
  return useQuery({
    queryKey: queryKeys.gmail.status,
    queryFn: () => api.get<GmailStatusResponse>("/integrations/gmail/status"),
  });
}

export function useGmailRevokeMutation() {
  return useMutation({
    mutationFn: () => api.post("/integrations/gmail/revoke"),
  });
}
