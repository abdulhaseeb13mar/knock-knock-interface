import { RootLayout } from "./layouts/RootLayout";
import { isAuthenticated } from "./lib/auth";
import DashboardPage from "./pages/dashboard";
import GmailSuccessPage from "./pages/gmail-success";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import { createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";

// Create Root Route
const rootRoute = createRootRoute({
  component: RootLayout,
});

// ── Public routes ───────────────────────────────────────────────────

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
  beforeLoad: () => {
    if (isAuthenticated()) throw redirect({ to: "/" });
  },
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
  beforeLoad: () => {
    if (isAuthenticated()) throw redirect({ to: "/" });
  },
});

// ── Protected routes ────────────────────────────────────────────────

function requireAuth() {
  if (!isAuthenticated()) throw redirect({ to: "/login" });
}

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
  beforeLoad: requireAuth,
});

const gmailSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/integrations/gmail/success",
  component: GmailSuccessPage,
  beforeLoad: requireAuth,
});

// Create Route Tree
const routeTree = rootRoute.addChildren([loginRoute, registerRoute, dashboardRoute, gmailSuccessRoute]);

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
