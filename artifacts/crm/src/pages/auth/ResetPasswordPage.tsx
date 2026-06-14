import { useState } from "react";
import { Link, useSearch } from "wouter";
import { useResetPassword } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle2, ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { AuthShell } from "@/components/layout/AuthShell";
import { useAuthPalette } from "@/hooks/useAuthPalette";

const schema = z
  .object({
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

const ease = [0.22, 1, 0.36, 1] as const;

export function ResetPasswordPage() {
  const p = useAuthPalette();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") ?? "";

  const resetPassword = useResetPassword();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onSubmit = (data: FormValues) => {
    if (!token) { setError("Invalid or missing reset token."); return; }
    setError(null);
    resetPassword.mutate({ data: { token, password: data.password } }, {
      onSuccess: () => setDone(true),
      onError: (err) => setError((err as any)?.message || "Invalid or expired reset link."),
    });
  };

  if (!token) {
    return (
      <AuthShell maxWidth={400}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: p.heading, marginBottom: "12px", transition: "color 0.3s" }}>
            Invalid link
          </h2>
          <p style={{ fontSize: "14px", color: p.body, lineHeight: 1.7, marginBottom: "32px", transition: "color 0.3s" }}>
            This password reset link is missing or invalid.
          </p>
          <Link
            href="/forgot-password"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid #c8a84b", borderRadius: "4px", padding: "11px 20px", color: "#c8a84b", textDecoration: "none", fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            Request a new link
            <ArrowRight style={{ width: 14, height: 14 }} />
          </Link>
        </div>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell maxWidth={400}>
        <div style={{ textAlign: "center" }}>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease }}
            style={{ width: 56, height: 56, background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}
          >
            <CheckCircle2 style={{ width: 24, height: 24, color: "#4ADE80" }} />
          </motion.div>
          <h2 style={{ fontSize: "22px", fontWeight: 700, color: p.heading, marginBottom: "12px", transition: "color 0.3s" }}>
            Password updated
          </h2>
          <p style={{ fontSize: "14px", color: p.body, lineHeight: 1.7, marginBottom: "32px", transition: "color 0.3s" }}>
            Your password has been changed successfully.
          </p>
          <Link
            href="/login"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", border: "1px solid #c8a84b", borderRadius: "4px", padding: "11px 20px", color: "#c8a84b", textDecoration: "none", fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}
          >
            Sign in <ArrowRight style={{ width: 14, height: 14 }} />
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell maxWidth={400}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease }}
        style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px" }}
      >
        <div style={{ width: 24, height: "1px", background: "#c8a84b" }} />
        <span style={{ fontSize: "10px", fontWeight: 600, color: "#c8a84b", letterSpacing: "0.16em", textTransform: "uppercase" }}>
          Reset password
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease }}
        style={{ fontSize: "28px", fontWeight: 800, color: p.heading, letterSpacing: "-0.03em", marginBottom: "8px", transition: "color 0.3s" }}
      >
        New password
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15, ease }}
        style={{ fontSize: "14px", color: p.body, lineHeight: 1.7, marginBottom: "36px", transition: "color 0.3s" }}
      >
        Enter and confirm your new password below.
      </motion.p>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ marginBottom: "20px", padding: "10px 14px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "8px", fontSize: "13px", color: "#F87171" }}
          >
            {error}
          </motion.div>
        )}

        {/* New password */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease }}
          style={{ marginBottom: "28px" }}
        >
          <label style={{
            display: "block", fontSize: "10px", fontWeight: 600,
            color: focusedField === "password" ? "#c8a84b" : p.muted,
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px",
            transition: "color 0.2s",
          }}>
            New password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              {...form.register("password")}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "transparent", border: "none",
                borderBottom: `1px solid ${focusedField === "password" ? "#c8a84b" : form.formState.errors.password ? "#F87171" : p.inputBorder}`,
                padding: "10px 32px 10px 0", color: p.inputText, fontSize: "15px",
                outline: "none", transition: "border-color 0.2s, color 0.3s",
              }}
            />
            <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: p.eyeIcon, display: "flex", alignItems: "center", padding: 0, transition: "color 0.3s" }}>
              {showPwd ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
            </button>
          </div>
          {form.formState.errors.password && (
            <p style={{ fontSize: "11px", color: "#F87171", marginTop: "5px" }}>
              {form.formState.errors.password.message}
            </p>
          )}
        </motion.div>

        {/* Confirm password */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.28, ease }}
          style={{ marginBottom: "36px" }}
        >
          <label style={{
            display: "block", fontSize: "10px", fontWeight: 600,
            color: focusedField === "confirm" ? "#c8a84b" : p.muted,
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px",
            transition: "color 0.2s",
          }}>
            Confirm password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              {...form.register("confirmPassword")}
              onFocus={() => setFocusedField("confirm")}
              onBlur={() => setFocusedField(null)}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "transparent", border: "none",
                borderBottom: `1px solid ${focusedField === "confirm" ? "#c8a84b" : form.formState.errors.confirmPassword ? "#F87171" : p.inputBorder}`,
                padding: "10px 32px 10px 0", color: p.inputText, fontSize: "15px",
                outline: "none", transition: "border-color 0.2s, color 0.3s",
              }}
            />
            <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: p.eyeIcon, display: "flex", alignItems: "center", padding: 0, transition: "color 0.3s" }}>
              {showConfirm ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
            </button>
          </div>
          {form.formState.errors.confirmPassword && (
            <p style={{ fontSize: "11px", color: "#F87171", marginTop: "5px" }}>
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </motion.div>

        <motion.button
          type="submit"
          disabled={resetPassword.isPending}
          whileHover={{ scale: resetPassword.isPending ? 1 : 1.015, backgroundColor: "rgba(200,168,75,0.08)" }}
          whileTap={{ scale: resetPassword.isPending ? 1 : 0.98 }}
          transition={{ duration: 0.15 }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", background: "transparent",
            border: "1px solid #c8a84b", borderRadius: "4px", padding: "13px 20px",
            color: resetPassword.isPending ? "rgba(200,168,75,0.5)" : "#c8a84b",
            fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
            cursor: resetPassword.isPending ? "not-allowed" : "pointer", marginBottom: "24px",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {resetPassword.isPending && <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />}
            Set new password
          </span>
          <ArrowRight style={{ width: 15, height: 15 }} />
        </motion.button>
      </form>

      <Link href="/login" style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12.5px", color: p.backLink, textDecoration: "none", transition: "color 0.3s" }}>
        <ArrowLeft style={{ width: 13, height: 13 }} />
        Back to sign in
      </Link>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AuthShell>
  );
}
