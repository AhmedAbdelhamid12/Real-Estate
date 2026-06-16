import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useI18n } from "@/contexts/i18nContext";
import { apiFetch } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Shield, Lock, Unlock, Search, RotateCcw, LayoutGrid, List,
  ChevronDown, ChevronUp, CheckCheck, XCircle, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ROLES = ["admin", "director", "team_leader", "sales"] as const;
type Role = typeof ROLES[number];

const ROLE_CONFIG: Record<Role, { label: string; labelAr: string; color: string; activeClass: string; dotColor: string; textColor: string }> = {
  admin:       { label: "Admin",       labelAr: "مدير",        color: "text-red-600 dark:text-red-400",     activeClass: "bg-red-500 border-red-600",     dotColor: "bg-red-500",     textColor: "text-red-600" },
  director:    { label: "Director",    labelAr: "مدير تنفيذي", color: "text-violet-600 dark:text-violet-400", activeClass: "bg-violet-500 border-violet-600", dotColor: "bg-violet-500", textColor: "text-violet-600" },
  team_leader: { label: "Team Leader", labelAr: "قائد فريق",  color: "text-blue-600 dark:text-blue-400",   activeClass: "bg-blue-500 border-blue-600",   dotColor: "bg-blue-500",   textColor: "text-blue-600" },
  sales:       { label: "Sales",       labelAr: "مبيعات",      color: "text-emerald-600 dark:text-emerald-400", activeClass: "bg-emerald-500 border-emerald-600", dotColor: "bg-emerald-500", textColor: "text-emerald-600" },
};

const MODULE_ICONS: Record<string, string> = {
  leads: "👥", clients: "🤝", resale: "🏠", projects: "🏗️",
  employees: "👤", permissions: "🔐", reports: "📊",
  dashboard: "📈", notifications: "🔔", planner: "📅", profile: "⚙️",
};

const MODULE_LABELS_AR: Record<string, string> = {
  leads: "العملاء المحتملون", clients: "العملاء", resale: "إعادة البيع",
  projects: "المشاريع", employees: "الموظفون", permissions: "الصلاحيات",
  reports: "التقارير", dashboard: "لوحة التحكم", notifications: "الإشعارات",
  planner: "المخطط", profile: "الملف الشخصي",
};

const PERM_LABELS_AR: Record<string, string> = {
  "leads.view": "عرض العملاء المحتملين",
  "leads.create": "إضافة عملاء محتملين",
  "leads.edit": "تعديل بيانات العميل",
  "leads.delete": "حذف العملاء",
  "leads.see_phone": "رؤية أرقام الهاتف",
  "leads.see_email": "رؤية البريد الإلكتروني",
  "leads.see_notes": "رؤية الملاحظات",
  "leads.assign": "تعيين عميل لمندوب",
  "leads.reassign": "إعادة تعيين العميل",
  "leads.delay": "تأجيل المتابعة",
  "leads.import": "استيراد عملاء (Excel)",
  "leads.see_all_sales_leads": "رؤية عملاء كل المندوبين",
  "clients.view": "عرض قائمة العملاء",
  "clients.edit": "تعديل بيانات العميل",
  "clients.delete": "حذف العملاء",
  "resale.view": "عرض وحدات إعادة البيع",
  "resale.create": "إضافة وحدات جديدة",
  "resale.edit": "تعديل الوحدات",
  "resale.delete": "حذف الوحدات",
  "resale.see_owner_info": "رؤية بيانات المالك",
  "resale.assign": "تعيين الوحدات للمندوبين",
  "projects.view": "عرض المشاريع",
  "projects.manage": "إدارة المشاريع",
  "employees.view": "عرض الموظفين",
  "employees.edit": "تعديل بيانات الموظفين",
  "employees.delete": "حذف الموظفين",
  "employees.approve": "الموافقة على موظفين جدد",
  "permissions.manage": "إدارة الصلاحيات",
  "reports.view": "عرض التقارير",
  "reports.export": "تصدير التقارير",
  "dashboard.live": "لوحة التحكم المباشرة",
  "dashboard.tracking": "تتبع النشاط",
  "notifications.view": "عرض الإشعارات",
  "planner.view": "عرض المخطط",
  "planner.edit": "تعديل المخطط",
  "profile.edit": "تعديل الملف الشخصي",
};

type ViewMode = "single" | "matrix";

export function PermissionsPage() {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [activeRole, setActiveRole] = useState<Role>("sales");
  const [viewMode, setViewMode] = useState<ViewMode>("single");
  const [search, setSearch] = useState("");
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());
  const [resetRole, setResetRole] = useState<Role | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["permissions", "matrix"],
    queryFn: async () => {
      const res = await apiFetch("/api/permissions/matrix");
      if (!res.ok) throw new Error("Failed to load permissions");
      return res.json() as Promise<{ matrix: Record<string, Record<string, boolean>> }>;
    },
  });

  const toggleMutation = useMutation({
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

  const resetMutation = useMutation({
    mutationFn: async (role: string) => {
      const res = await apiFetch(`/api/permissions/role/${role}/reset`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to reset permissions");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
      toast.success("تم إعادة تعيين الصلاحيات للافتراضية");
      setResetRole(null);
    },
    onError: () => toast.error("فشل إعادة التعيين"),
  });

  const matrix = data?.matrix ?? {};

  // Build module→perms map from active role (or all keys)
  const allKeys = Object.keys(matrix[activeRole] ?? matrix["sales"] ?? {});
  const permsByModule = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const key of allKeys) {
      const module = key.split(".")[0];
      if (!map[module]) map[module] = [];
      map[module].push(key);
    }
    return map;
  }, [allKeys]);

  // Filter by search
  const filteredModules = useMemo(() => {
    if (!search) return permsByModule;
    const q = search.toLowerCase();
    const filtered: Record<string, string[]> = {};
    for (const [module, keys] of Object.entries(permsByModule)) {
      const matchModule = MODULE_LABELS_AR[module]?.toLowerCase().includes(q) || module.includes(q);
      const matchedKeys = keys.filter(k => {
        const ar = PERM_LABELS_AR[k]?.toLowerCase() ?? "";
        return ar.includes(q) || k.includes(q) || matchModule;
      });
      if (matchedKeys.length > 0) filtered[module] = matchedKeys;
    }
    return filtered;
  }, [permsByModule, search]);

  const rolePerms = matrix[activeRole] ?? {};
  const enabledCount = Object.values(rolePerms).filter(Boolean).length;
  const totalCount = Object.keys(rolePerms).length;

  function toggleModule(module: string, enable: boolean) {
    const keys = permsByModule[module] ?? [];
    for (const key of keys) {
      if ((rolePerms[key] ?? false) !== enable) {
        toggleMutation.mutate({ role: activeRole, permissionKey: key, isEnabled: enable });
      }
    }
  }

  function toggleModuleCollapse(module: string) {
    setCollapsedModules(prev => {
      const next = new Set(prev);
      if (next.has(module)) next.delete(module);
      else next.add(module);
      return next;
    });
  }

  const config = ROLE_CONFIG[activeRole];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 mt-0.5">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{t("permissions.title")}</h2>
            <p className="text-muted-foreground text-sm">{t("permissions.desc")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "single" ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => setViewMode("single")}
          >
            <List className="w-4 h-4" /> دور واحد
          </Button>
          <Button
            variant={viewMode === "matrix" ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => setViewMode("matrix")}
          >
            <LayoutGrid className="w-4 h-4" /> مقارنة الأدوار
          </Button>
        </div>
      </div>

      {viewMode === "single" ? (
        <>
          {/* Role Tabs */}
          <div className="flex gap-2.5 flex-wrap">
            {ROLES.map((role) => {
              const cfg = ROLE_CONFIG[role];
              const isActive = activeRole === role;
              const rPerms = matrix[role] ?? {};
              const cnt = Object.values(rPerms).filter(Boolean).length;
              const tot = Object.keys(rPerms).length;
              return (
                <button
                  key={role}
                  onClick={() => setActiveRole(role)}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all duration-200 select-none relative",
                    isActive
                      ? `${cfg.activeClass} text-white border-transparent shadow-lg`
                      : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full transition-colors", isActive ? "bg-white/70" : cfg.dotColor)} />
                  {cfg.labelAr}
                  {tot > 0 && (
                    <span className={cn("text-xs rounded-full px-1.5 py-0.5 font-normal", isActive ? "bg-white/20" : "bg-muted")}>
                      {cnt}/{tot}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Summary + Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className={cn("flex-1 rounded-xl p-4 border-2 flex items-center gap-3 bg-muted/20",
              activeRole === "admin" ? "border-red-200 dark:border-red-800/50" :
              activeRole === "director" ? "border-violet-200 dark:border-violet-800/50" :
              activeRole === "team_leader" ? "border-blue-200 dark:border-blue-800/50" :
              "border-emerald-200 dark:border-emerald-800/50"
            )}>
              <Shield className={cn("w-5 h-5 shrink-0", config.color)} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">
                  دور: <span className={config.color}>{config.labelAr}</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {enabledCount} صلاحية مفعّلة من أصل {totalCount}
                </p>
              </div>
              <div className="flex-1 max-w-40">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all",
                      activeRole === "admin" ? "bg-red-500" :
                      activeRole === "director" ? "bg-violet-500" :
                      activeRole === "team_leader" ? "bg-blue-500" :
                      "bg-emerald-500"
                    )}
                    style={{ width: totalCount > 0 ? `${(enabledCount / totalCount) * 100}%` : "0%" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-end">
                  {totalCount > 0 ? Math.round((enabledCount / totalCount) * 100) : 0}% مفعّل
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 self-start sm:self-center"
              onClick={() => setResetRole(activeRole)}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              إعادة تعيين للافتراضي
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث في الصلاحيات..."
              className="ps-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Permission Cards */}
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(filteredModules).map(([module, keys]) => {
                const enabledInModule = keys.filter(k => rolePerms[k] ?? false).length;
                const allEnabled = enabledInModule === keys.length;
                const someEnabled = enabledInModule > 0 && !allEnabled;
                const isCollapsed = collapsedModules.has(module);

                return (
                  <Card key={module} className="overflow-hidden hover:shadow-md transition-shadow border-border/60">
                    <CardHeader
                      className="pb-2.5 pt-3.5 px-4 bg-muted/30 border-b cursor-pointer select-none"
                      onClick={() => toggleModuleCollapse(module)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-sm font-bold flex items-center gap-2">
                          <span className="text-base">{MODULE_ICONS[module] ?? "⚙️"}</span>
                          <span className="text-foreground/80">{MODULE_LABELS_AR[module] ?? module}</span>
                        </CardTitle>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={allEnabled ? "default" : someEnabled ? "outline" : "secondary"} className="text-xs h-5 px-1.5">
                            {enabledInModule}/{keys.length}
                          </Badge>
                          {/* Module bulk toggles */}
                          <button
                            title="تفعيل الكل"
                            onClick={(e) => { e.stopPropagation(); toggleModule(module, true); }}
                            className="p-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 opacity-60 hover:opacity-100 transition-opacity"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                          </button>
                          <button
                            title="إيقاف الكل"
                            onClick={(e) => { e.stopPropagation(); toggleModule(module, false); }}
                            className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 opacity-60 hover:opacity-100 transition-opacity"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />}
                        </div>
                      </div>
                    </CardHeader>

                    {!isCollapsed && (
                      <CardContent className="px-4 pb-4 pt-3 space-y-2">
                        {keys.map((key) => {
                          const enabled = rolePerms[key] ?? false;
                          const labelAr = PERM_LABELS_AR[key] ?? key.split(".").slice(1).join(" ").replace(/_/g, " ");
                          return (
                            <div key={key} className="flex items-center justify-between gap-3 py-0.5">
                              <div className="flex items-center gap-2 min-w-0">
                                {enabled
                                  ? <Unlock className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                  : <Lock className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                                }
                                <span className={cn("text-sm truncate", enabled ? "text-foreground" : "text-muted-foreground")}>
                                  {labelAr}
                                </span>
                              </div>
                              <button
                                role="switch"
                                aria-checked={enabled}
                                disabled={toggleMutation.isPending}
                                onClick={() => toggleMutation.mutate({ role: activeRole, permissionKey: key, isEnabled: !enabled })}
                                className={cn(
                                  "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:cursor-not-allowed",
                                  enabled ? "bg-emerald-500 border-emerald-600" : "bg-muted border-border"
                                )}
                              >
                                <span className={cn(
                                  "pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200",
                                  enabled ? "translate-x-4 rtl:-translate-x-4" : "translate-x-0.5 rtl:-translate-x-0.5"
                                )} />
                              </button>
                            </div>
                          );
                        })}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
              {Object.keys(filteredModules).length === 0 && (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                  <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>لا توجد صلاحيات تطابق "{search}"</p>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* ── MATRIX VIEW ── */
        <div className="space-y-4">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute start-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث في الصلاحيات..."
              className="ps-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {isLoading ? (
            <Skeleton className="h-96 w-full rounded-xl" />
          ) : (
            <div className="rounded-xl border overflow-auto shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 border-b">
                    <th className="text-start px-4 py-3 font-semibold text-muted-foreground w-56 min-w-56">الصلاحية</th>
                    {ROLES.map(role => {
                      const cfg = ROLE_CONFIG[role];
                      const rPerms = matrix[role] ?? {};
                      const cnt = Object.values(rPerms).filter(Boolean).length;
                      const tot = Object.keys(rPerms).length;
                      return (
                        <th key={role} className="px-4 py-3 text-center font-semibold min-w-32">
                          <div className="flex flex-col items-center gap-1">
                            <div className={cn("flex items-center gap-1.5 font-bold text-xs", cfg.color)}>
                              <div className={cn("w-2 h-2 rounded-full", cfg.dotColor)} />
                              {cfg.labelAr}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-normal">{cnt}/{tot}</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(filteredModules).map(([module, keys]) => (
                    <>
                      <tr key={`header-${module}`} className="bg-muted/20 border-y border-dashed">
                        <td colSpan={ROLES.length + 1} className="px-4 py-2 font-bold text-xs text-foreground/60 uppercase tracking-wider">
                          {MODULE_ICONS[module] ?? "⚙️"} {MODULE_LABELS_AR[module] ?? module}
                        </td>
                      </tr>
                      {keys.map((key) => {
                        const labelAr = PERM_LABELS_AR[key] ?? key.split(".").slice(1).join(" ").replace(/_/g, " ");
                        const allRolesEnabled = ROLES.every(r => matrix[r]?.[key] ?? false);
                        const noRolesEnabled = ROLES.every(r => !(matrix[r]?.[key] ?? false));
                        return (
                          <tr key={key} className="border-b border-border/30 hover:bg-muted/10 transition-colors group">
                            <td className="px-4 py-2.5 font-medium">
                              <span className={cn("text-sm", noRolesEnabled ? "text-muted-foreground" : "text-foreground")}>
                                {labelAr}
                              </span>
                            </td>
                            {ROLES.map(role => {
                              const enabled = matrix[role]?.[key] ?? false;
                              const cfg = ROLE_CONFIG[role];
                              return (
                                <td key={role} className="px-4 py-2.5 text-center">
                                  <button
                                    onClick={() => toggleMutation.mutate({ role, permissionKey: key, isEnabled: !enabled })}
                                    disabled={toggleMutation.isPending}
                                    className={cn(
                                      "w-7 h-7 rounded-lg border-2 transition-all duration-150 flex items-center justify-center mx-auto hover:scale-110 active:scale-95 disabled:opacity-50",
                                      enabled
                                        ? `${cfg.activeClass} text-white shadow-sm`
                                        : "bg-muted/30 border-border/40 text-muted-foreground/30 hover:border-border"
                                    )}
                                    title={enabled ? "إيقاف" : "تفعيل"}
                                  >
                                    {enabled
                                      ? <Unlock className="w-3.5 h-3.5" />
                                      : <Lock className="w-3.5 h-3.5" />
                                    }
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={!!resetRole} onOpenChange={(v) => { if (!v) setResetRole(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              إعادة تعيين صلاحيات {resetRole ? ROLE_CONFIG[resetRole].labelAr : ""}
            </AlertDialogTitle>
            <AlertDialogDescription>
              سيتم إعادة جميع صلاحيات هذا الدور إلى القيم الافتراضية. لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              className="bg-amber-500 hover:bg-amber-600 text-white"
              onClick={() => resetRole && resetMutation.mutate(resetRole)}
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending ? "جارٍ الإعادة..." : "نعم، أعد التعيين"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
