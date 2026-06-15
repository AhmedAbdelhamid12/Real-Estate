import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/contexts/i18nContext";
import { apiFetch } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Shield, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";

const ROLES = ["admin", "director", "team_leader", "sales"] as const;
type Role = typeof ROLES[number];

const ROLE_CONFIG: Record<Role, { label: string; labelAr: string; color: string; activeClass: string; dotColor: string }> = {
  admin: {
    label: "Admin", labelAr: "مدير",
    color: "text-red-600 dark:text-red-400",
    activeClass: "bg-red-500 border-red-600 shadow-red-200 dark:shadow-red-900",
    dotColor: "bg-red-500",
  },
  director: {
    label: "Director", labelAr: "مدير تنفيذي",
    color: "text-violet-600 dark:text-violet-400",
    activeClass: "bg-violet-500 border-violet-600 shadow-violet-200 dark:shadow-violet-900",
    dotColor: "bg-violet-500",
  },
  team_leader: {
    label: "Team Leader", labelAr: "قائد فريق",
    color: "text-blue-600 dark:text-blue-400",
    activeClass: "bg-blue-500 border-blue-600 shadow-blue-200 dark:shadow-blue-900",
    dotColor: "bg-blue-500",
  },
  sales: {
    label: "Sales", labelAr: "مبيعات",
    color: "text-emerald-600 dark:text-emerald-400",
    activeClass: "bg-emerald-500 border-emerald-600 shadow-emerald-200 dark:shadow-emerald-900",
    dotColor: "bg-emerald-500",
  },
};

const MODULE_ICONS: Record<string, string> = {
  leads: "👥", clients: "🤝", resale: "🏠", projects: "🏗️",
  employees: "👤", permissions: "🔐", reports: "📊",
  dashboard: "📈", notifications: "🔔", planner: "📅", profile: "⚙️",
};

export function PermissionsPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [activeRole, setActiveRole] = useState<Role>("sales");

  const { data, isLoading } = useQuery({
    queryKey: ["permissions", "matrix"],
    queryFn: async () => {
      const res = await apiFetch("/api/permissions/matrix");
      if (!res.ok) throw new Error("Failed to load permissions");
      return res.json() as Promise<{ matrix: Record<string, Record<string, boolean>> }>;
    },
  });

  const mutation = useMutation({
    mutationFn: async ({ role, permissionKey, isEnabled }: { role: string; permissionKey: string; isEnabled: boolean }) => {
      const res = await apiFetch(`/api/permissions/role/${role}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionKey, isEnabled }),
      });
      if (!res.ok) throw new Error("Failed to update permission");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("تم تحديث الصلاحية");
    },
    onError: () => toast.error("فشل تحديث الصلاحية"),
  });

  const matrix = data?.matrix ?? {};
  const rolePerms = matrix[activeRole] ?? {};

  const permsByModule: Record<string, Array<{ key: string; label: string }>> = {};
  for (const [key] of Object.entries(rolePerms)) {
    const module = key.split(".")[0];
    if (!permsByModule[module]) permsByModule[module] = [];
    const label = key.split(".").slice(1).join(" ").replace(/_/g, " ");
    permsByModule[module].push({ key, label });
  }

  const config = ROLE_CONFIG[activeRole];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("permissions.title")}</h2>
          <p className="text-muted-foreground text-sm">{t("permissions.desc")}</p>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="flex gap-3 flex-wrap p-1">
        {ROLES.map((role) => {
          const cfg = ROLE_CONFIG[role];
          const isActive = activeRole === role;
          return (
            <button
              key={role}
              onClick={() => setActiveRole(role)}
              className={cn(
                "flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200 select-none",
                isActive
                  ? `${cfg.activeClass} text-white border-transparent shadow-lg`
                  : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground hover:bg-muted/40"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full transition-colors",
                isActive ? "bg-white" : cfg.dotColor
              )} />
              {cfg.labelAr}
            </button>
          );
        })}
      </div>

      {/* Active Role Summary */}
      <div className={cn("rounded-xl p-4 border-2 flex items-center gap-3", `border-${activeRole === "admin" ? "red" : activeRole === "director" ? "violet" : activeRole === "team_leader" ? "blue" : "emerald"}-200 dark:border-${activeRole === "admin" ? "red" : activeRole === "director" ? "violet" : activeRole === "team_leader" ? "blue" : "emerald"}-800 bg-muted/30`)}>
        <Shield className={cn("w-5 h-5", config.color)} />
        <div>
          <p className="font-semibold text-sm">صلاحيات دور: <span className={config.color}>{config.labelAr}</span></p>
          <p className="text-xs text-muted-foreground">
            {Object.values(rolePerms).filter(Boolean).length} صلاحية مفعّلة من أصل {Object.keys(rolePerms).length}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(permsByModule).map(([module, perms]) => (
            <Card key={module} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-3 pt-4 px-5 bg-muted/30 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <span className="text-base">{MODULE_ICONS[module] ?? "⚙️"}</span>
                  <span className="uppercase tracking-wider text-foreground/80">{module}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-4 space-y-2.5">
                {perms.map(({ key, label }) => {
                  const enabled = rolePerms[key] ?? false;
                  return (
                    <div key={key} className="flex items-center justify-between gap-3 py-1">
                      <div className="flex items-center gap-2 min-w-0">
                        {enabled
                          ? <Unlock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          : <Lock className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                        }
                        <span className={cn("text-sm capitalize truncate", enabled ? "text-foreground" : "text-muted-foreground")}>
                          {label}
                        </span>
                      </div>
                      <button
                        role="switch"
                        aria-checked={enabled}
                        disabled={mutation.isPending}
                        onClick={() => mutation.mutate({ role: activeRole, permissionKey: key, isEnabled: !enabled })}
                        className={cn(
                          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed",
                          enabled
                            ? "bg-emerald-500 border-emerald-600"
                            : "bg-muted border-border"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                            enabled ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0.5 rtl:-translate-x-0.5"
                          )}
                        />
                      </button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
