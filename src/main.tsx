import { StrictMode } from "react";

import "./index.css";
import { router } from "./router.tsx";
import QueryClientProvider from "@/providers/query.provider";
import { RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
