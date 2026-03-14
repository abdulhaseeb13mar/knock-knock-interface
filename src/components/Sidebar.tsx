import { useState } from "react";

import { Button } from "@/components/ui/button";
import { isAdmin, removeToken } from "@/utils/auth";
import { cn } from "@/utils/cn";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Coins, FileText, Key, LogOut, Mail, Menu, MessageSquare, Rocket, Send, Shield, Users, X } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Get Started", href: "/dashboard", icon: <Rocket className="size-4" /> },
  { label: "Email Provider", href: "/email-provider", icon: <Mail className="size-4" /> },
  { label: "AI Keys", href: "/ai-keys", icon: <Key className="size-4" /> },
  { label: "Get Knocks", href: "/get-knocks", icon: <Coins className="size-4" /> },
  { label: "Add Resume", href: "/add-resume", icon: <FileText className="size-4" /> },
  { label: "Campaigns", href: "/campaigns", icon: <Send className="size-4" /> },
  { label: "Prompts", href: "/prompts", icon: <MessageSquare className="size-4" /> },
  { label: "Recipients", href: "/recipients", icon: <Users className="size-4" /> },
  { label: "Admin", href: "/admin", icon: <Shield className="size-4" />, adminOnly: true },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const showAdmin = isAdmin();

  const filteredItems = navItems.filter((item) => !item.adminOnly || showAdmin);

  function handleLogout() {
    removeToken();
    navigate({ to: "/login" });
  }

  function isActive(href: string) {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b">
        <Link to="/dashboard" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
            <Rocket className="size-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">Knock Knock</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              isActive(item.href) ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive" onClick={handleLogout}>
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center h-14 px-4 border-b bg-background">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 -ml-2">
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <span className="ml-2 font-bold">Knock Knock</span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar - mobile */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-background border-r transform transition-transform duration-200",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r bg-background">{sidebarContent}</aside>
    </>
  );
}
