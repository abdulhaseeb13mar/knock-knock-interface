import { api } from "@/lib/api-client";
import type { AuthResponse } from "@/lib/api-types";
import { useMutation } from "@tanstack/react-query";

interface AuthInput {
  email: string;
  password: string;
}

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
