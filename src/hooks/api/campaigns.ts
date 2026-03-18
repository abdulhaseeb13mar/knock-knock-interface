import { queryKeys } from "./query-keys";
import { api } from "@/services/api-client";
import type { CampaignActionInput, CampaignDetailsResponse, EmailCampaign, StartCampaignInput, StartCampaignResponse } from "@/types/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useStartCampaignMutation() {
  return useMutation({
    mutationFn: (input: StartCampaignInput) => api.post<StartCampaignResponse>("/campaigns/start", input),
  });
}

export function useCampaignActionMutation() {
  return useMutation({
    mutationFn: ({ campaignId, action }: CampaignActionInput) => api.post<EmailCampaign>(`/campaigns/${campaignId}/${action}`),
  });
}

export function useCampaignsQuery() {
  return useQuery({
    queryKey: queryKeys.campaigns.list,
    queryFn: () => api.get<EmailCampaign[]>("/campaigns"),
  });
}

export function useCampaignStatusQuery(campaignId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.campaigns.status(campaignId),
    queryFn: () => api.get<EmailCampaign | null>(`/campaigns/${campaignId}/status`),
    enabled,
  });
}

export function useCampaignDetailsQuery(campaignId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.campaigns.details(campaignId),
    queryFn: () => api.get<CampaignDetailsResponse>(`/campaigns/${campaignId}`),
    enabled,
  });
}
