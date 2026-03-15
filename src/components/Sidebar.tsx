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
    <div className="flex flex-col h-full bg-card">
      <div className="p-6 border-b border-border/50 flex flex-col gap-1">
        <Link to="/dashboard" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <div className="size-8 rounded-lg bg-primary shadow-lg shadow-primary/20 flex items-center justify-center">
            <Rocket className="size-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg tracking-tight">Knock Knock</span>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {filteredItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive(item.href) ? "bg-primary/15 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-white/5",
            )}
          >
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-border/50">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-white hover:bg-destructive/90 transition-colors"
          onClick={handleLogout}
        >
          <LogOut className="size-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center h-14 px-4 border-b border-border/50 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 -ml-2 text-foreground/80 hover:text-foreground transition-colors">
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <span className="ml-2 font-bold tracking-tight">Knock Knock</span>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && <div className="lg:hidden fixed inset-0 z-30 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar - mobile */}
      <aside
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-40 w-64 bg-card shadow-2xl shadow-black/50 border-r border-border/50 transform transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r border-border/50 bg-card shadow-sm">{sidebarContent}</aside>
    </>
  );
}
