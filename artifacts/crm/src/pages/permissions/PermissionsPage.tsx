import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/contexts/i18nContext";
import { apiFetch } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Shield } from "lucide-react";

const ROLES = ["admin", "director", "team_leader", "sales"] as const;
type Role = typeof ROLES[number];

const MODULES = ["leads", "clients", "resale", "projects", "employees", "permissions", "reports", "dashboard", "notifications", "planner", "profile"] as const;

const ROLE_COLORS: Record<Role, string> = {
  admin: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  director: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800",
  team_leader: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  sales: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
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
      toast.success("Permission updated");
    },
    onError: () => toast.error("Failed to update permission"),
  });

  const matrix = data?.matrix ?? {};
  const rolePerms = matrix[activeRole] ?? {};

  const permsByModule: Record<string, Array<{ key: string; label: string }>> = {};
  for (const [key, value] of Object.entries(rolePerms)) {
    const module = key.split(".")[0];
    if (!permsByModule[module]) permsByModule[module] = [];
    const label = key.split(".").slice(1).join(" ").replace(/_/g, " ");
    permsByModule[module].push({ key, label });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("permissions.title")}</h2>
          <p className="text-muted-foreground text-sm">{t("permissions.desc")}</p>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="flex gap-2 flex-wrap">
        {ROLES.map((role) => (
          <button
            key={role}
            onClick={() => setActiveRole(role)}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              activeRole === role
                ? ROLE_COLORS[role]
                : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted"
            }`}
          >
            {role.replace("_", " ")}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(permsByModule).map(([module, perms]) => (
            <Card key={module} className="overflow-hidden">
              <CardHeader className="pb-3 pt-4 px-4">
                <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {module}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                {perms.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <span className="text-sm capitalize">{label}</span>
                    <Switch
                      checked={rolePerms[key] ?? false}
                      onCheckedChange={(isEnabled) => {
                        mutation.mutate({ role: activeRole, permissionKey: key, isEnabled });
                      }}
                      disabled={mutation.isPending}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
