import { api } from "@/lib/api-client";
import type { GmailConnectResponse } from "@/lib/api-types";
import { useMutation } from "@tanstack/react-query";

export function useGmailConnectMutation() {
  return useMutation({
    mutationFn: () => api.get<GmailConnectResponse>("/integrations/gmail/connect"),
  });
}
