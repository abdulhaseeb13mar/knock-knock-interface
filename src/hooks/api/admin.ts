import { api } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export interface KnockConfig {
  emailsPerKnock: number;
}

export interface GrantTestingKnockResponse {
  userId: string;
  granted: number;
  knockBalance: number;
}

export const ADMIN_CONFIG_KEY = "admin-config";

export function useKnockConfig() {
  return useQuery({
    queryKey: [ADMIN_CONFIG_KEY],
    queryFn: () => api.get<KnockConfig>("/jobs/admin/knock-config"),
  });
}

export function useUpdateKnockConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: KnockConfig) => api.patch<KnockConfig>("/jobs/admin/knock-config", data),
    onSuccess: (data) => {
      queryClient.setQueryData([ADMIN_CONFIG_KEY], data);
      toast.success("Config updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update config");
    },
  });
}

export function useGrantTestingKnock() {
  return useMutation({
    mutationFn: (data: { userId: string }) => api.post<GrantTestingKnockResponse>("/jobs/admin/grant-testing-knock", data),
    onSuccess: (data) => {
      toast.success(`Granted ${data.granted} knock to user`);
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to grant knock");
    },
  });
}
