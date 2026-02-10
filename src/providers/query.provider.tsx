import { type ReactNode, useState } from "react";

import { QueryClient, QueryClientProvider as TanStackQueryClientProvider } from "@tanstack/react-query";

export default function QueryClientProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return <TanStackQueryClientProvider client={queryClient}>{children}</TanStackQueryClientProvider>;
}
