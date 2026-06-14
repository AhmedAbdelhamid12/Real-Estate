import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { useI18n } from "@/contexts/i18nContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import { apiFetch } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import { AuthShell } from "@/components/layout/AuthShell";

const RESEND_COOLDOWN = 60;
const ease = [0.22, 1, 0.36, 1] as const;

function useResendCountdown() {
  const [seconds, setSeconds] = useState(RESEND_COOLDOWN);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    setSeconds(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) { clearInterval(timerRef.current!); return 0; }
        return s - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    start();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [start]);

  return { seconds, start, canResend: seconds === 0 };
}

export function VerifyEmailPage() {
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState(false);
  const { seconds, start: startCountdown, canResend } = useResendCountdown();

  const email = new URLSearchParams(window.location.search).get("email") ?? "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) { toast.error("Please enter the 6-digit code"); return; }
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
    setResendMsg(null);
    setIsResending(true);
    try {
      const res = await apiFetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Failed to resend code");
      }
      setResendMsg("A new code has been sent to your email.");
      startCountdown();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <AuthShell maxWidth={400}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease }}
        style={{
          width: 52, height: 52,
          background: "rgba(200,168,75,0.1)",
          border: "1px solid rgba(200,168,75,0.2)",
          borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <ShieldCheck style={{ width: 22, height: 22, color: "#c8a84b" }} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08, ease }}
        style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}
      >
        <div style={{ width: 24, height: "1px", background: "#c8a84b" }} />
        <span style={{ fontSize: "10px", fontWeight: 600, color: "#c8a84b", letterSpacing: "0.16em", textTransform: "uppercase" }}>
          Email verification
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease }}
        style={{ fontSize: "26px", fontWeight: 800, color: "#E4EBF5", letterSpacing: "-0.03em", marginBottom: "8px" }}
      >
        {t("auth.verify_email")}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.18, ease }}
        style={{ fontSize: "14px", color: "#3D5878", lineHeight: 1.7, marginBottom: "32px" }}
      >
        {t("auth.verify_code")}
        {email && (
          <span style={{ display: "block", color: "#8BAFC7", fontWeight: 500, marginTop: "4px" }}>
            {email}
          </span>
        )}
      </motion.p>

      <form onSubmit={handleSubmit}>
        {resendMsg && (
          <Alert className="py-3 border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950/30 dark:text-green-400 mb-4">
            <AlertDescription>{resendMsg}</AlertDescription>
          </Alert>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.22, ease }}
          style={{ marginBottom: "32px" }}
        >
          <label style={{
            display: "block", fontSize: "10px", fontWeight: 600,
            color: focusedField ? "#c8a84b" : "#3D5878",
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px",
            transition: "color 0.2s",
          }}>
            Verification code
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="0 0 0 0 0 0"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            onFocus={() => setFocusedField(true)}
            onBlur={() => setFocusedField(false)}
            autoFocus
            style={{
              width: "100%", boxSizing: "border-box",
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${focusedField ? "#c8a84b" : "rgba(255,255,255,0.1)"}`,
              borderRadius: "8px",
              padding: "16px",
              color: "#C8D8E8", fontSize: "28px", fontWeight: 700,
              letterSpacing: "0.4em", textAlign: "center",
              outline: "none", transition: "border-color 0.2s",
              fontFamily: "ui-monospace, monospace",
            }}
          />
        </motion.div>

        <motion.button
          type="submit"
          disabled={isLoading || code.length !== 6}
          whileHover={{ scale: (isLoading || code.length !== 6) ? 1 : 1.015, backgroundColor: "rgba(200,168,75,0.08)" }}
          whileTap={{ scale: (isLoading || code.length !== 6) ? 1 : 0.98 }}
          transition={{ duration: 0.15 }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            width: "100%", background: "transparent",
            border: `1px solid ${code.length === 6 ? "#c8a84b" : "rgba(255,255,255,0.1)"}`,
            borderRadius: "4px", padding: "13px 20px",
            color: code.length === 6 ? "#c8a84b" : "#3D5878",
            fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
            cursor: (isLoading || code.length !== 6) ? "not-allowed" : "pointer",
            marginBottom: "20px", transition: "border-color 0.2s, color 0.2s",
          }}
        >
          {isLoading && <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />}
          {isLoading ? t("common.loading") : "Verify email"}
        </motion.button>
      </form>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          type="button"
          onClick={() => setLocation("/login")}
          style={{
            display: "flex", alignItems: "center", gap: "5px",
            background: "none", border: "none", cursor: "pointer",
            fontSize: "12.5px", color: "#2d4459", padding: 0,
          }}
        >
          <ArrowLeft style={{ width: 13, height: 13 }} />
          {t("auth.login")}
        </button>

        {canResend ? (
          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: "12.5px", color: "#c8a84b", display: "flex",
              alignItems: "center", gap: "5px", padding: 0,
            }}
          >
            {isResending && <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} />}
            Resend code
          </button>
        ) : (
          <span style={{ fontSize: "12px", color: "#2d4459" }}>
            Resend in <span style={{ color: "#8BAFC7", fontVariantNumeric: "tabular-nums" }}>{seconds}s</span>
          </span>
        )}
      </div>
    </AuthShell>
  );
}
