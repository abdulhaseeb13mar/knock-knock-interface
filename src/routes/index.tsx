import { DashboardLayout } from "@/layouts/DashboardLayout";
import AddResumePage from "@/pages/add-resume";
import AdminPage from "@/pages/admin";
import AiKeysPage from "@/pages/ai-keys";
import CampaignsPage from "@/pages/campaigns";
import CampaignDetailPage from "@/pages/campaigns/detail";
import CreateCampaignPage from "@/pages/create-campaign";
import DashboardPage from "@/pages/dashboard";
import EmailProviderPage from "@/pages/email-provider";
import GetKnocksPage from "@/pages/get-knocks";
import GmailSuccessPage from "@/pages/gmail-success";
import HomePage from "@/pages/home";
import LoginPage from "@/pages/login";
import PromptsPage from "@/pages/prompts";
import RecipientsPage from "@/pages/recipients";
import RegisterPage from "@/pages/register";
import { isAdmin, isAuthenticated } from "@/utils/auth";
import { Outlet, createRootRoute, createRoute, createRouter, redirect } from "@tanstack/react-router";

// ── Root route ──────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// ── Auth guards ─────────────────────────────────────────────────────
function requireAuth() {
  if (!isAuthenticated()) throw redirect({ to: "/login" });
}

function requireAdmin() {
  if (!isAuthenticated()) throw redirect({ to: "/login" });
  if (!isAdmin()) throw redirect({ to: "/dashboard" });
}

function redirectIfAuthed() {
  if (isAuthenticated()) throw redirect({ to: "/dashboard" });
}

// ── Public routes ───────────────────────────────────────────────────
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
  beforeLoad: redirectIfAuthed,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterPage,
  beforeLoad: redirectIfAuthed,
});

// ── Gmail OAuth callback (protected, no sidebar) ────────────────────
const gmailSuccessRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/integrations/gmail/success",
  component: GmailSuccessPage,
  beforeLoad: requireAuth,
});

// ── Dashboard layout parent (protected) ─────────────────────────────
const dashboardLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "dashboard-layout",
  component: DashboardLayout,
  beforeLoad: requireAuth,
});

// ── Dashboard child routes ──────────────────────────────────────────
const dashboardRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/dashboard",
  component: DashboardPage,
});

const emailProviderRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/email-provider",
  component: EmailProviderPage,
});

const aiKeysRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/ai-keys",
  component: AiKeysPage,
});

const getKnocksRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/get-knocks",
  component: GetKnocksPage,
});

const addResumeRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/add-resume",
  component: AddResumePage,
});

const campaignsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/campaigns",
  component: CampaignsPage,
});

const campaignDetailRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/campaigns/$campaignId",
  component: CampaignDetailPage,
});

const createCampaignRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/create-campaign",
  component: CreateCampaignPage,
});

const promptsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/prompts",
  component: PromptsPage,
});

const recipientsRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/recipients",
  component: RecipientsPage,
});

const adminRoute = createRoute({
  getParentRoute: () => dashboardLayoutRoute,
  path: "/admin",
  component: AdminPage,
  beforeLoad: requireAdmin,
});

// ── Route tree ──────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  homeRoute,
  loginRoute,
  registerRoute,
  gmailSuccessRoute,
  dashboardLayoutRoute.addChildren([
    dashboardRoute,
    emailProviderRoute,
    aiKeysRoute,
    getKnocksRoute,
    addResumeRoute,
    campaignsRoute,
    campaignDetailRoute,
    createCampaignRoute,
    promptsRoute,
    recipientsRoute,
    adminRoute,
  ]),
]);

// ── Router instance ─────────────────────────────────────────────────
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

// ── Type register ───────────────────────────────────────────────────
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
