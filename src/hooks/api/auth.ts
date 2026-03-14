import { api } from "@/services/api-client";
import type { AuthInput, AuthResponse } from "@/types/api";
import { useMutation } from "@tanstack/react-query";

export function useLoginMutation() {
  return useMutation({
    mutationFn: (input: AuthInput) => api.post<AuthResponse>("/auth/login", input),
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: (input: AuthInput) => api.post<AuthResponse>("/auth/register", input),
  });
}
