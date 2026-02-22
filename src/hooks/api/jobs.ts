import { queryKeys } from "./query-keys";
import { api } from "@/lib/api-client";
import type { EmailJob, StartJobResponse } from "@/lib/api-types";
import { useMutation, useQuery } from "@tanstack/react-query";

type JobAction = "pause" | "resume" | "retry";

interface JobActionInput {
  jobId: string;
  action: JobAction;
}

interface StartJobInput {
  resumeId: string;
}

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
