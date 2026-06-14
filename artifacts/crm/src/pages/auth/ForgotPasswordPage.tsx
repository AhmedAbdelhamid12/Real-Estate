import { useState } from "react";
import { Link } from "wouter";
import { useForgotPassword } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle2, ArrowLeft, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { AuthShell } from "@/components/layout/AuthShell";
import { useAuthPalette } from "@/hooks/useAuthPalette";

const schema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

type FormValues = z.infer<typeof schema>;

const ease = [0.22, 1, 0.36, 1] as const;

export function ForgotPasswordPage() {
  const p = useAuthPalette();
  const forgotPassword = useForgotPassword();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: FormValues) => {
    setError(null);
    forgotPassword.mutate({ data }, {
      onSuccess: () => setSent(true),
      onError: () => setError("Something went wrong. Please try again."),
    });
  };

  if (sent) {
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
            Check your inbox
          </h2>
          <p style={{ fontSize: "14px", color: p.body, lineHeight: 1.7, marginBottom: "32px", transition: "color 0.3s" }}>
            If that email is registered, you'll receive a password reset link shortly.
          </p>
          <Link
            href="/login"
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", color: "#c8a84b", textDecoration: "none", fontSize: "13px", fontWeight: 600, letterSpacing: "0.06em" }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            Back to sign in
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
          Password recovery
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1, ease }}
        style={{ fontSize: "28px", fontWeight: 800, color: p.heading, letterSpacing: "-0.03em", marginBottom: "8px", transition: "color 0.3s" }}
      >
        Forgot password?
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.15, ease }}
        style={{ fontSize: "14px", color: p.body, lineHeight: 1.7, marginBottom: "36px", transition: "color 0.3s" }}
      >
        Enter your email and we'll send you a reset link.
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

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2, ease }}
          style={{ marginBottom: "32px" }}
        >
          <label style={{
            display: "block", fontSize: "10px", fontWeight: 600,
            color: focusedField === "email" ? "#c8a84b" : p.muted,
            textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px",
            transition: "color 0.2s",
          }}>
            Email address
          </label>
          <input
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            {...form.register("email")}
            onFocus={() => setFocusedField("email")}
            onBlur={() => setFocusedField(null)}
            style={{
              width: "100%", boxSizing: "border-box",
              background: "transparent", border: "none",
              borderBottom: `1px solid ${focusedField === "email" ? "#c8a84b" : form.formState.errors.email ? "#F87171" : p.inputBorder}`,
              padding: "10px 0", color: p.inputText, fontSize: "15px", outline: "none",
              transition: "border-color 0.2s, color 0.3s",
            }}
          />
          {form.formState.errors.email && (
            <p style={{ fontSize: "11px", color: "#F87171", marginTop: "5px" }}>
              {form.formState.errors.email.message}
            </p>
          )}
        </motion.div>

        <motion.button
          type="submit"
          disabled={forgotPassword.isPending}
          whileHover={{ scale: forgotPassword.isPending ? 1 : 1.015, backgroundColor: "rgba(200,168,75,0.08)" }}
          whileTap={{ scale: forgotPassword.isPending ? 1 : 0.98 }}
          transition={{ duration: 0.15 }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", background: "transparent",
            border: "1px solid #c8a84b", borderRadius: "4px", padding: "13px 20px",
            color: forgotPassword.isPending ? "rgba(200,168,75,0.5)" : "#c8a84b",
            fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
            cursor: forgotPassword.isPending ? "not-allowed" : "pointer", marginBottom: "24px",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {forgotPassword.isPending && <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />}
            Send reset link
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
