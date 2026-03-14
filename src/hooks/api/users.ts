import { queryKeys } from "./query-keys";
import { api } from "@/lib/api-client";
import type { CurrentUser } from "@/lib/api-types";
import { useQuery } from "@tanstack/react-query";

export function useMeQuery() {
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: () => api.get<CurrentUser>("/users/me"),
  });
}
