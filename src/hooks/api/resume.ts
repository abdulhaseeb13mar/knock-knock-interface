import { queryKeys } from "./query-keys";
import { api } from "@/lib/api-client";
import type { DeleteResumeLinkResponse, ResumeLink, SaveResumeLinkInput } from "@/lib/api-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function useResumeLinksQuery() {
  return useQuery({
    queryKey: queryKeys.resumes.all,
    queryFn: () => api.get<ResumeLink[]>("/users/resumes"),
  });
}

export function useSaveResumeLinkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SaveResumeLinkInput) => api.post<ResumeLink>("/users/resumes/drive-link", input),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all });
    },
  });
}

export function useDeleteResumeLinkMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resumeId: string) => api.delete<DeleteResumeLinkResponse>(`/users/resumes/${resumeId}`),
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: queryKeys.resumes.all });
    },
  });
}
