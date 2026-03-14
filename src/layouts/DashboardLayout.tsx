import { Sidebar } from "@/components/Sidebar";
import { Outlet } from "@tanstack/react-router";

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:pl-64">
        {/* Mobile top bar spacer */}
        <div className="h-14 lg:h-0" />
        <main className="p-6 lg:p-8 max-w-5xl mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
