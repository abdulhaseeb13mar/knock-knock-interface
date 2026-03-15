import { Sidebar } from "@/components/Sidebar";
import { Outlet } from "@tanstack/react-router";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]">
      <Sidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Mobile top bar spacer */}
        <div className="h-14 lg:h-0 flex-shrink-0" />
        <main className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
