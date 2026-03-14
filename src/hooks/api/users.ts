import { queryKeys } from "./query-keys";
import { api } from "@/services/api-client";
import type { CurrentUser } from "@/types/api";
import { useQuery } from "@tanstack/react-query";

export function useMeQuery() {
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: () => api.get<CurrentUser>("/users/me"),
  });
}
