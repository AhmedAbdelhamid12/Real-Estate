import { useI18n } from "@/contexts/i18nContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Clock, LogOut } from "lucide-react";
import { apiFetch } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";

export function PendingApprovalPage() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const { refetch } = useAuth();

  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    refetch();
    setLocation("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
          <Clock className="w-10 h-10 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">{t("auth.pending_title")}</h1>
          <p className="text-muted-foreground leading-relaxed">{t("auth.pending_body")}</p>
        </div>
        <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground space-y-1">
          <p>✅ Account created successfully</p>
          <p>✅ Email verified</p>
          <p>⏳ Waiting for admin approval</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut className="w-4 h-4" />
          {t("auth.logout")}
        </Button>
      </div>
    </div>
  );
}
