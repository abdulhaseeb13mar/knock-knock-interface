import { queryKeys } from "./query-keys";
import { api } from "@/services/api-client";
import type { EmailJob, JobActionInput, StartJobInput, StartJobResponse } from "@/types/api";
import { useMutation, useQuery } from "@tanstack/react-query";

export function useStartJobMutation() {
  return useMutation({
    mutationFn: (input: StartJobInput) => api.post<StartJobResponse>("/jobs/start", input),
  });
}

export function useJobActionMutation() {
  return useMutation({
    mutationFn: ({ jobId, action }: JobActionInput) => api.post<EmailJob>(`/jobs/${jobId}/${action}`),
  });
}

export function useJobStatusQuery(jobId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.jobs.status(jobId),
    queryFn: () => api.get<EmailJob | null>(`/jobs/${jobId}/status`),
    enabled,
  });
}
