import { api } from "@/lib/api-client";
import type { ResumeUploadResponse } from "@/lib/api-types";
import { useMutation } from "@tanstack/react-query";

export function useResumeUploadMutation() {
  return useMutation({
    mutationFn: (formData: FormData) => api.upload<ResumeUploadResponse>("/users/resume", formData),
  });
}
