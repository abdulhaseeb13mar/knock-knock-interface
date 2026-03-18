import { queryKeys } from "./query-keys";
import { api } from "@/services/api-client";
import type { EmailJob, JobActionInput, JobDetailsResponse, StartJobInput, StartJobResponse } from "@/types/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useStartJobMutation() {
  return useMutation({
    mutationFn: (input: StartJobInput) => api.post<StartJobResponse>("/campaigns/start", input),
  });
}

export function useJobActionMutation() {
  return useMutation({
    mutationFn: ({ jobId, action }: JobActionInput) => api.post<EmailJob>(`/campaigns/${jobId}/${action}`),
  });
}

export function useJobsQuery() {
  return useQuery({
    queryKey: queryKeys.jobs.list,
    queryFn: () => api.get<EmailJob[]>("/campaigns"),
  });
}

export function useJobStatusQuery(jobId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.jobs.status(jobId),
    queryFn: () => api.get<EmailJob | null>(`/campaigns/${jobId}/status`),
    enabled,
  });
}

export function useJobDetailsQuery(jobId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.jobs.details(jobId),
    queryFn: () => api.get<JobDetailsResponse>(`/campaigns/${jobId}`),
    enabled,
  });
}
