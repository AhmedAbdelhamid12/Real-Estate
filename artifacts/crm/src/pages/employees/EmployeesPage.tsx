import { useListUsers } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleBadge } from "@/components/shared/RoleBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Mail, Phone, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/contexts/i18nContext";

export function EmployeesPage() {
  const { t } = useI18n();
  const { data: users = [], isLoading } = useListUsers({ status: "active" });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("employees.title")}</h2>
        <p className="text-muted-foreground">{t("employees.subtitle")}</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-0 pt-6 px-6 text-center flex flex-col items-center">
                <Skeleton className="h-20 w-20 rounded-full mb-4" />
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="p-6 mt-4 border-t space-y-3 bg-muted/20">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border shadow-sm">
          <p className="text-muted-foreground">{t("employees.no_employees")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {users.map(user => (
            <Card key={user.id} className="overflow-hidden group hover:border-primary/50 transition-colors">
              <CardHeader className="pb-0 pt-6 px-6 relative flex flex-col items-center">
                <div className="relative">
                  <UserAvatar name={user.name} avatarUrl={user.avatarUrl} className="h-20 w-20 mb-4" />
                  <div className={cn(
                    "absolute bottom-4 right-0 h-4 w-4 rounded-full border-2 border-background",
                    user.isOnline ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                  )} title={user.isOnline ? "Online" : "Offline"} />
                </div>
                <h3 className="font-semibold text-lg text-center leading-none tracking-tight">{user.name}</h3>
                <p className="text-sm text-muted-foreground mt-1.5 text-center h-5">
                  {user.title || "No Title Set"}
                </p>
                <div className="mt-3">
                  <RoleBadge role={user.role} />
                </div>
              </CardHeader>
              <CardContent className="p-5 mt-6 border-t bg-muted/10 space-y-3">
                <div className="flex items-center text-sm gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0 text-foreground/40" />
                  <span className="truncate" title={user.email}>{user.email}</span>
                </div>
                <div className="flex items-center text-sm gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4 shrink-0 text-foreground/40" />
                  <span>{user.phone || "No phone provided"}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
