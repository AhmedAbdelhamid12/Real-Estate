import { useI18n } from "@/contexts/i18nContext";
import { useLocation } from "wouter";
import { Clock, LogOut } from "lucide-react";
import { apiFetch } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { AuthShell } from "@/components/layout/AuthShell";
import { useAuthPalette } from "@/hooks/useAuthPalette";

const ease = [0.22, 1, 0.36, 1] as const;

export function PendingApprovalPage() {
  const p = useAuthPalette();
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const { refetch } = useAuth();

  async function handleLogout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    refetch();
    setLocation("/login");
  }

  const steps = [
    { label: "Account created", done: true },
    { label: "Email verified", done: true },
    { label: "Awaiting admin approval", done: false },
  ];

  return (
    <AuthShell maxWidth={420}>
      <div style={{ textAlign: "center" }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease }}
          style={{ width: 60, height: 60, background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}
        >
          <Clock style={{ width: 26, height: 26, color: "#FBBF24" }} />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1, ease }}
          style={{ fontSize: "24px", fontWeight: 800, color: p.heading, letterSpacing: "-0.03em", marginBottom: "10px", transition: "color 0.3s" }}
        >
          {t("auth.pending_title")}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.15, ease }}
          style={{ fontSize: "14px", color: p.body, lineHeight: 1.7, marginBottom: "32px", transition: "color 0.3s" }}
        >
          {t("auth.pending_body")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease }}
          style={{ background: p.stepBg, border: `1px solid ${p.dark ? "rgba(200,168,75,0.1)" : "rgba(200,168,75,0.2)"}`, borderRadius: "8px", padding: "16px 20px", marginBottom: "28px", textAlign: "left", transition: "background 0.3s, border-color 0.3s" }}
        >
          {steps.map((step, i) => (
            <div
              key={i}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                paddingBottom: i < steps.length - 1 ? "12px" : 0,
                marginBottom: i < steps.length - 1 ? "12px" : 0,
                borderBottom: i < steps.length - 1 ? `1px solid ${p.stepBorder}` : "none",
                transition: "border-color 0.3s",
              }}
            >
              <span style={{ fontSize: "14px" }}>{step.done ? "✅" : "⏳"}</span>
              <span style={{ fontSize: "13px", color: step.done ? p.stepDone : "#FBBF24", transition: "color 0.3s" }}>
                {step.label}
              </span>
            </div>
          ))}
        </motion.div>

        <motion.button
          onClick={handleLogout}
          whileHover={{ backgroundColor: "rgba(200,168,75,0.06)" }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.15 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "transparent",
            border: "1px solid rgba(200,168,75,0.3)", borderRadius: "4px",
            padding: "11px 20px", color: "#c8a84b",
            fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          <LogOut style={{ width: 14, height: 14 }} />
          {t("auth.logout")}
        </motion.button>
      </div>
    </AuthShell>
  );
}
