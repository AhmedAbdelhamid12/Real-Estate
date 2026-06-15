import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Users,
  Building2,
  Kanban,
  ListTodo,
  FileText,
  UserCircle,
  Menu,
  X,
  Briefcase,
  Users2,
  Calendar,
  Home,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useI18n } from "@/contexts/i18nContext";

export function Sidebar() {
  const { currentUser } = useAuth();
  const { t } = useI18n();
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  if (!currentUser) return null;

  const isAdminOrHigher = ["ceo", "admin", "director"].includes(currentUser.role);
  const isCeoOrAdmin = ["ceo", "admin"].includes(currentUser.role);

  const navItems = [
    {
      title: t("sidebar.overview"),
      items: [
        { href: "/home", label: t("nav.home"), icon: Home },
        { href: "/dashboard", label: t("nav.dashboard"), icon: LayoutDashboard },
      ],
    },
    {
      title: t("sidebar.pipeline"),
      items: [
        { href: "/leads", label: t("nav.leads.list"), icon: ListTodo },
        { href: "/leads/kanban", label: t("nav.leads.kanban"), icon: Kanban },
      ],
    },
    {
      title: t("sidebar.inventory"),
      items: [
        { href: "/projects", label: t("nav.projects"), icon: Building2 },
        { href: "/resale", label: t("nav.resale"), icon: Briefcase },
      ],
    },
    {
      title: t("sidebar.clients"),
      items: [
        { href: "/clients", label: t("nav.clients"), icon: Users },
      ],
    },
    {
      title: t("sidebar.people"),
      items: [
        { href: "/employees", label: t("nav.employees"), icon: Users2 },
        ...(isAdminOrHigher
          ? [{ href: "/employees/pending", label: t("nav.employees.pending"), icon: UserCircle }]
          : []),
      ],
    },
    {
      title: t("sidebar.tools"),
      items: [
        { href: "/planner", label: t("nav.planner"), icon: Calendar },
        ...(isAdminOrHigher ? [{ href: "/reports", label: t("nav.reports"), icon: FileText }] : []),
        ...(isCeoOrAdmin ? [{ href: "/permissions", label: t("nav.permissions"), icon: Shield }] : []),
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border" style={{ position: "relative" }}>
      {/* Gold top accent line */}
      <div style={{ height: "2px", background: "linear-gradient(90deg, transparent, #c8a84b 30%, #e8d070 50%, #c8a84b 70%, transparent)", flexShrink: 0 }} />

      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-between px-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center rounded-md p-1.5"
              style={{ backgroundColor: "hsl(42 52% 54%)" }}
            >
              <Building2 className="h-5 w-5" style={{ color: "hsl(213 75% 13%)" }} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-sm font-bold tracking-tight" style={{ color: "hsl(42 52% 54%)" }}>
                TIL Group
              </span>
              <span className="text-[10px] uppercase tracking-widest opacity-50">
                Real Estate
              </span>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div
            className="mx-auto flex items-center justify-center rounded-md p-1.5"
            style={{ backgroundColor: "hsl(42 52% 54%)" }}
          >
            <Building2 className="h-5 w-5" style={{ color: "hsl(213 75% 13%)" }} />
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex hover:bg-sidebar-accent"
          style={{ color: "hsl(0 0% 70%)" }}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-3 py-4">
        {navItems.map((section, i) => (
          <div key={i} className="mb-6">
            {!isCollapsed && (
              <h4 className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest opacity-40">
                {section.title}
              </h4>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-150",
                      isActive
                        ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      isCollapsed && "justify-center px-0"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <item.icon
                      className={cn("h-4 w-4 shrink-0")}
                      style={
                        isActive
                          ? { color: "hsl(213 75% 13%)" }
                          : { color: "hsl(0 0% 65%)" }
                      }
                    />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </ScrollArea>

      {/* User profile */}
      <div className="p-4 border-t border-sidebar-border">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 rounded-md transition-colors hover:bg-sidebar-accent p-2 -mx-2",
            isCollapsed && "justify-center"
          )}
        >
          <UserAvatar name={currentUser.name} avatarUrl={currentUser.avatarUrl} />
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium truncate text-sidebar-foreground">
                {currentUser.name}
              </span>
              <RoleBadge role={currentUser.role} className="w-fit scale-75 origin-left mt-0.5" />
            </div>
          )}
        </Link>
      </div>
    </div>
  );

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed top-3 right-4 z-50 md:hidden bg-background"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-4 w-4" />
      </Button>

      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-64 transform bg-sidebar transition-transform duration-200 ease-in-out md:static md:translate-x-0",
          isCollapsed ? "md:w-20" : "md:w-64",
          isMobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 left-3 z-50 md:hidden hover:bg-sidebar-accent"
          style={{ color: "hsl(0 0% 70%)" }}
          onClick={() => setIsMobileOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
        {sidebarContent}
      </div>
    </>
  );
}
