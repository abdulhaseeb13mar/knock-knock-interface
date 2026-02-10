import { RootLayout } from "./layouts/RootLayout";
import HomePage from "./pages/home";
import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router";

// Create Root Route
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Create Routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

// Create Route Tree
const routeTree = rootRoute.addChildren([indexRoute]);

// Create Router
export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  defaultNotFoundComponent: () => (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-zinc-500 mb-6">The page you are looking for does not exist.</p>
      <a href="/" className="px-4 py-2 bg-black text-white rounded-md">
        Go Home
      </a>
    </div>
  ),
});

// Type Register
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
