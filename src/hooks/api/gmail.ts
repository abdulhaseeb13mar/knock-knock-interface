import { queryKeys } from "./query-keys";
import { api } from "@/services/api-client";
import type { GmailConnectResponse, GmailStatusResponse } from "@/types/api";
import { useMutation, useQuery } from "@tanstack/react-query";

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
