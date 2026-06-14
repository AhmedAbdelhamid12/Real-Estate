import { useState } from "react";
import { useLocation } from "wouter";
import { useI18n } from "@/contexts/i18nContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { apiFetch } from "@workspace/api-client-react";

export function VerifyEmailPage() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const email = new URLSearchParams(window.location.search).get("email") ?? "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error("Please enter the 6-digit code");
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiFetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Verification failed");
      }
      toast.success("Email verified! Waiting for admin approval.");
      setLocation("/pending-approval");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    try {
      await apiFetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      toast.success("Verification code resent!");
    } catch {
      toast.error("Failed to resend code");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">{t("auth.verify_email")}</CardTitle>
          <CardDescription>
            {t("auth.verify_code")}
            {email && <><br /><span className="font-medium text-foreground">{email}</span></>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Verification Code</Label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                className="text-center text-2xl tracking-widest font-mono h-14"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
              {isLoading ? t("common.loading") : "Verify Email"}
            </Button>
            <div className="flex items-center justify-between text-sm">
              <Button variant="ghost" size="sm" type="button" onClick={() => setLocation("/login")}>
                <ArrowLeft className="w-4 h-4 me-1" />
                {t("auth.login")}
              </Button>
              <Button variant="ghost" size="sm" type="button" onClick={handleResend}>
                Resend code
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
