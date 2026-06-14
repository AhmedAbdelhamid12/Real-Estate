import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@workspace/api-client-react";
import { useGetUser, useListLeads } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Link } from "wouter";
import { toast } from "sonner";
import { ArrowLeft, Shield, TrendingUp, Instagram, Facebook, MessageCircle, Mail, Phone } from "lucide-react";
import { useI18n } from "@/contexts/i18nContext";
import type { User } from "@workspace/api-client-react";

export function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useGetUser(id!);
  const { data: allLeads = [] } = useListLeads();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userLeads = allLeads.filter((l: any) => l.primarySalesId === id);

  const { data: permData, isLoading: permLoading } = useQuery({
    queryKey: ["permissions", "user", id],
    queryFn: async () => {
      const res = await apiFetch(`/api/permissions/user/${id}`);
      if (!res.ok) throw new Error("Failed to load permissions");
      return res.json() as Promise<{
        permissions: Record<string, boolean>;
        overrides: Array<{ permissionKey: string; override: "allow" | "deny"; reason?: string }>;
        role: string;
      }>;
    },
    enabled: !!id,
  });

  const overrideMutation = useMutation({
    mutationFn: async ({ permissionKey, override, reason }: { permissionKey: string; override: "allow" | "deny" | null; reason?: string }) => {
      const res = await apiFetch(`/api/permissions/user/${id}/override`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionKey, override, reason }),
      });
      if (!res.ok) throw new Error("Failed to update override");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["permissions", "user", id] });
      toast.success("Permission override updated");
    },
    onError: () => toast.error("Failed to update permission override"),
  });

  if (isLoading) return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );

  if (!user) return <div className="text-center py-16 text-muted-foreground">Employee not found</div>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const won = userLeads.filter((l: any) => l.status === "won").length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lost = userLeads.filter((l: any) => l.status === "lost").length;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const active = userLeads.filter((l: any) => !["won", "lost"].includes(l.status)).length;
  const winRate = userLeads.length > 0 ? Math.round((won / userLeads.length) * 100) : 0;

  const overrides = permData?.overrides ?? [];
  const effectivePerms = permData?.permissions ?? {};

  const overrideMap = Object.fromEntries(overrides.map((o) => [o.permissionKey, o.override]));

  const permsByModule: Record<string, string[]> = {};
  for (const key of Object.keys(effectivePerms)) {
    const module = key.split(".")[0];
    if (!permsByModule[module]) permsByModule[module] = [];
    permsByModule[module].push(key);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/employees">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="w-4 h-4" />
            {t("employees.title")}
          </Button>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6 text-center space-y-4">
            <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="mx-auto h-24 w-24" />
            <div>
              <h2 className="text-xl font-bold">{user.name}</h2>
              <p className="text-muted-foreground text-sm">{user.title ?? user.role}</p>
              <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>
            <div className="flex justify-center gap-2">
              <RoleBadge role={user.role} />
              <StatusBadge status={user.status} />
            </div>
            {/* Contact & social links */}
            <div className="flex flex-col gap-2 text-sm">
              {user.phone && (
                <a href={`tel:${user.phone}`} className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                  <Phone className="h-3.5 w-3.5" /> {user.phone}
                </a>
              )}
              <a href={`mailto:${user.email}`} className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-3.5 w-3.5" /> {user.email}
              </a>
            </div>
            {/* Social media */}
            {((user as any).instagramUrl || (user as any).facebookUrl || (user as any).whatsappNumber) && (
              <div className="flex justify-center gap-2 pt-1">
                {(user as any).instagramUrl && (
                  <a href={(user as any).instagramUrl} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:opacity-90 transition-opacity">
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {(user as any).facebookUrl && (
                  <a href={(user as any).facebookUrl} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-blue-600 text-white hover:opacity-90 transition-opacity">
                    <Facebook className="h-4 w-4" />
                  </a>
                )}
                {(user as any).whatsappNumber && (
                  <a href={`https://wa.me/${(user as any).whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-green-500 text-white hover:opacity-90 transition-opacity">
                    <MessageCircle className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}
            {user.bio && (
              <p className="text-sm text-muted-foreground text-center px-2 italic">"{user.bio}"</p>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4" /> Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Active Leads", value: active, color: "text-blue-500" },
                { label: "Won", value: won, color: "text-emerald-500" },
                { label: "Lost", value: lost, color: "text-red-500" },
                { label: "Win Rate", value: `${winRate}%`, color: "text-violet-500" },
              ].map((s) => (
                <div key={s.label} className="text-center p-3 rounded-lg bg-muted/40">
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permission Overrides */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="w-4 h-4" /> Permission Overrides
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Role: <strong className="capitalize">{permData?.role?.replace("_", " ")}</strong> — overrides take priority over role defaults
          </p>
        </CardHeader>
        <CardContent>
          {permLoading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(permsByModule).slice(0, 6).map(([module, keys]) => (
                <div key={module}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{module}</p>
                  <div className="space-y-2">
                    {keys.map((key) => {
                      const currentOverride = overrideMap[key];
                      const baseValue = effectivePerms[key] ?? false;
                      return (
                        <div key={key} className="flex items-center justify-between py-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs capitalize truncate">{key.split(".").slice(1).join(" ").replace(/_/g, " ")}</span>
                            {currentOverride && (
                              <Badge variant="outline" className={`text-xs ${currentOverride === "allow" ? "text-emerald-600" : "text-red-600"}`}>
                                {currentOverride}
                              </Badge>
                            )}
                          </div>
                          <Switch
                            checked={baseValue}
                            onCheckedChange={(enabled) => {
                              const roleDefault = enabled;
                              if (currentOverride) {
                                overrideMutation.mutate({ permissionKey: key, override: null });
                              } else {
                                overrideMutation.mutate({ permissionKey: key, override: enabled ? "allow" : "deny" });
                              }
                            }}
                            disabled={overrideMutation.isPending}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
