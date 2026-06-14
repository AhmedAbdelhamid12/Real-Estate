import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  useRegister,
  useVerifyEmail,
  useListTeamLeaders,
  apiFetch,
} from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CheckCircle2, ArrowRight, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { AuthShell } from "@/components/layout/AuthShell";
import { useAuthPalette } from "@/hooks/useAuthPalette";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
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
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  return { seconds, start, canResend: seconds === 0 };
}

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Invalid email address" }),
    phone: z.string().min(5, { message: "Phone number is required" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
    role: z.enum(["admin", "director", "team_leader", "sales"]),
    teamLeaderId: z.string().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const verifySchema = z.object({
  code: z.string().length(6, { message: "Code must be 6 digits" }).regex(/^\d+$/, { message: "Code must be numeric" }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;
type VerifyFormValues = z.infer<typeof verifySchema>;

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  director: "Director",
  team_leader: "Team Leader",
  sales: "Sales Agent",
};

function ErrorMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p style={{ fontSize: "11px", color: "#F87171", marginTop: "5px" }}>{msg}</p>;
}

/* ── Verify stage ── */
function VerifyStage({ registeredEmail, onBack }: { registeredEmail: string; onBack: () => void }) {
  const p = useAuthPalette();
  const verifyEmail = useVerifyEmail();
  const [error, setError] = useState<string | null>(null);
  const [resendMsg, setResendMsg] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [focused, setFocused] = useState(false);
  const { seconds, start: startCountdown, canResend } = useResendCountdown();

  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: "" },
  });

  const onVerify = (data: VerifyFormValues) => {
    setError(null);
    verifyEmail.mutate(
      { data: { email: registeredEmail, code: data.code } },
      {
        onSuccess: () => {},
        onError: (err) => setError((err as any)?.message || "Invalid or expired code."),
      }
    );
  };

  async function handleResend() {
    setResendMsg(null); setError(null); setIsResending(true);
    try {
      const res = await apiFetch("/api/auth/resend-verification", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: registeredEmail }),
      });
      if (!res.ok) throw new Error(((await res.json()) as any).error ?? "Failed to resend");
      setResendMsg("A new code has been sent to your email.");
      startCountdown();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code");
    } finally { setIsResending(false); }
  }

  return (
    <AuthShell maxWidth={420}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}
        style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}
      >
        <div style={{ width: 24, height: "1px", background: "#c8a84b" }} />
        <span style={{ fontSize: "10px", fontWeight: 600, color: "#c8a84b", letterSpacing: "0.16em", textTransform: "uppercase" }}>
          Email verification
        </span>
      </motion.div>
      <h2 style={{ fontSize: "26px", fontWeight: 800, color: p.heading, letterSpacing: "-0.03em", marginBottom: "8px", transition: "color 0.3s" }}>
        Check your inbox
      </h2>
      <p style={{ fontSize: "14px", color: p.body, lineHeight: 1.7, marginBottom: "32px", transition: "color 0.3s" }}>
        We sent a 6-digit code to{" "}
        <span style={{ color: p.emailHighlight, fontWeight: 500 }}>{registeredEmail}</span>.
        It expires in 15 minutes.
      </p>

      <form onSubmit={form.handleSubmit(onVerify)}>
        {error && (
          <div style={{ marginBottom: "16px", padding: "10px 14px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "8px", fontSize: "13px", color: "#F87171" }}>
            {error}
          </div>
        )}
        {resendMsg && (
          <div style={{ marginBottom: "16px", padding: "10px 14px", background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: "8px", fontSize: "13px", color: "#4ADE80" }}>
            {resendMsg}
          </div>
        )}

        <div style={{ marginBottom: "32px" }}>
          <label style={{ display: "block", fontSize: "10px", fontWeight: 600, color: focused ? "#c8a84b" : p.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px", transition: "color 0.2s" }}>
            Verification code
          </label>
          <input
            inputMode="numeric" maxLength={6} placeholder="0 0 0 0 0 0"
            {...form.register("code")}
            onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
            style={{
              width: "100%", boxSizing: "border-box",
              background: p.inputBg,
              border: `1px solid ${focused ? "#c8a84b" : p.inputBorder}`,
              borderRadius: "8px", padding: "16px",
              color: p.inputText, fontSize: "28px", fontWeight: 700,
              letterSpacing: "0.4em", textAlign: "center",
              outline: "none", transition: "border-color 0.2s, color 0.3s",
              fontFamily: "ui-monospace, monospace",
            }}
          />
          <ErrorMsg msg={form.formState.errors.code?.message} />
        </div>

        <motion.button
          type="submit" disabled={verifyEmail.isPending}
          whileHover={{ scale: verifyEmail.isPending ? 1 : 1.015, backgroundColor: "rgba(200,168,75,0.08)" }}
          whileTap={{ scale: verifyEmail.isPending ? 1 : 0.98 }}
          transition={{ duration: 0.15 }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", background: "transparent",
            border: "1px solid #c8a84b", borderRadius: "4px", padding: "13px 20px",
            color: verifyEmail.isPending ? "rgba(200,168,75,0.5)" : "#c8a84b",
            fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
            cursor: verifyEmail.isPending ? "not-allowed" : "pointer", marginBottom: "20px",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {verifyEmail.isPending && <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />}
            Verify email
          </span>
          <ArrowRight style={{ width: 15, height: 15 }} />
        </motion.button>
      </form>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button type="button" onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12.5px", color: p.backLink, padding: 0, transition: "color 0.3s" }}>
          Back to registration
        </button>
        {canResend ? (
          <button type="button" onClick={handleResend} disabled={isResending} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12.5px", color: "#c8a84b", display: "flex", alignItems: "center", gap: "5px", padding: 0 }}>
            {isResending && <Loader2 style={{ width: 12, height: 12, animation: "spin 1s linear infinite" }} />}
            Resend code
          </button>
        ) : (
          <span style={{ fontSize: "12px", color: p.muted, transition: "color 0.3s" }}>
            Resend in <span style={{ color: p.emailHighlight, fontVariantNumeric: "tabular-nums" }}>{seconds}s</span>
          </span>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AuthShell>
  );
}

/* ── Pending stage ── */
function PendingStage() {
  const p = useAuthPalette();
  return (
    <AuthShell maxWidth={400}>
      <div style={{ textAlign: "center" }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}
          style={{ width: 56, height: 56, background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}
        >
          <CheckCircle2 style={{ width: 24, height: 24, color: "#4ADE80" }} />
        </motion.div>
        <h2 style={{ fontSize: "22px", fontWeight: 700, color: p.heading, marginBottom: "12px", transition: "color 0.3s" }}>Email verified!</h2>
        <p style={{ fontSize: "14px", color: p.body, lineHeight: 1.7, marginBottom: "32px", transition: "color 0.3s" }}>
          Your account is now pending administrator approval. You'll receive an email once approved.
        </p>
        <Link
          href="/login"
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            border: "1px solid rgba(200,168,75,0.3)", borderRadius: "4px",
            padding: "11px 20px", color: "#c8a84b", textDecoration: "none",
            fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
          }}
        >
          Return to sign in <ArrowRight style={{ width: 14, height: 14 }} />
        </Link>
      </div>
    </AuthShell>
  );
}

/* ── Main register page ── */
export function RegisterPage() {
  const p = useAuthPalette();
  const register = useRegister();
  const { data: teamLeaders = [] } = useListTeamLeaders();

  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<"register" | "verify" | "pending">("register");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", phone: "", password: "", confirmPassword: "", role: "sales", teamLeaderId: undefined },
  });

  const watchRole = form.watch("role");

  const onSubmit = (data: RegisterFormValues) => {
    setError(null);
    register.mutate(
      { data: { name: data.name, email: data.email, phone: data.phone, password: data.password, role: data.role, teamLeaderId: data.role === "sales" ? (data.teamLeaderId ?? null) : null } },
      {
        onSuccess: () => { setRegisteredEmail(data.email); setStage("verify"); },
        onError: (err) => setError((err as any)?.message || "Registration failed. Please try again."),
      }
    );
  };

  if (stage === "verify") return <VerifyStage registeredEmail={registeredEmail} onBack={() => { setStage("register"); setError(null); }} />;
  if (stage === "pending") return <PendingStage />;

  const f = (name: string) => focused === name;
  const err = (name: keyof RegisterFormValues) => !!form.formState.errors[name];

  function fieldInput(isFocused: boolean, hasError: boolean): React.CSSProperties {
    return {
      width: "100%", boxSizing: "border-box" as const,
      background: "transparent", border: "none",
      borderBottom: `1px solid ${isFocused ? "#c8a84b" : hasError ? "#F87171" : p.inputBorder}`,
      padding: "10px 0", color: p.inputText, fontSize: "15px",
      outline: "none", transition: "border-color 0.2s, color 0.3s",
    };
  }

  function fieldLabel(isFocused: boolean): React.CSSProperties {
    return {
      display: "block", fontSize: "10px", fontWeight: 600 as const,
      color: isFocused ? "#c8a84b" : p.muted,
      textTransform: "uppercase" as const, letterSpacing: "0.1em",
      marginBottom: "10px", transition: "color 0.2s",
    };
  }

  return (
    <AuthShell maxWidth={480}>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease }}
        style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}
      >
        <div style={{ width: 24, height: "1px", background: "#c8a84b" }} />
        <span style={{ fontSize: "10px", fontWeight: 600, color: "#c8a84b", letterSpacing: "0.16em", textTransform: "uppercase" }}>
          Request access
        </span>
      </motion.div>

      <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08, ease }}
        style={{ fontSize: "28px", fontWeight: 800, color: p.heading, letterSpacing: "-0.03em", marginBottom: "6px", transition: "color 0.3s" }}
      >
        Create account
      </motion.h2>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.12, ease }}
        style={{ fontSize: "14px", color: p.body, lineHeight: 1.7, marginBottom: "32px", transition: "color 0.3s" }}
      >
        Enter your details below to request platform access.
      </motion.p>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        {error && (
          <div style={{ marginBottom: "20px", padding: "10px 14px", background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", borderRadius: "8px", fontSize: "13px", color: "#F87171" }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
          <div style={{ marginBottom: "24px" }}>
            <label style={fieldLabel(f("name"))}>Full name</label>
            <input placeholder="John Doe" {...form.register("name")} onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} style={fieldInput(f("name"), err("name"))} />
            <ErrorMsg msg={form.formState.errors.name?.message} />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={fieldLabel(f("phone"))}>Phone</label>
            <input placeholder="+20 10 1234 5678" {...form.register("phone")} onFocus={() => setFocused("phone")} onBlur={() => setFocused(null)} style={fieldInput(f("phone"), err("phone"))} />
            <ErrorMsg msg={form.formState.errors.phone?.message} />
          </div>
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={fieldLabel(f("email"))}>Email address</label>
          <input type="email" placeholder="name@example.com" {...form.register("email")} onFocus={() => setFocused("email")} onBlur={() => setFocused(null)} style={fieldInput(f("email"), err("email"))} />
          <ErrorMsg msg={form.formState.errors.email?.message} />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={fieldLabel(false)}>Role</label>
          <Select value={form.watch("role")} onValueChange={(val) => form.setValue("role", val as RegisterFormValues["role"], { shouldValidate: true })}>
            <SelectTrigger style={{ background: "transparent", border: "none", borderBottom: `1px solid ${p.selectBorder}`, borderRadius: 0, padding: "10px 0", color: p.selectText, fontSize: "15px", outline: "none", boxShadow: "none", transition: "color 0.3s, border-color 0.3s" }}>
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ROLE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {watchRole === "sales" && teamLeaders.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <label style={fieldLabel(false)}>Team Leader (optional)</label>
            <Select value={form.watch("teamLeaderId") ?? ""} onValueChange={(val) => form.setValue("teamLeaderId", val || undefined, { shouldValidate: true })}>
              <SelectTrigger style={{ background: "transparent", border: "none", borderBottom: `1px solid ${p.selectBorder}`, borderRadius: 0, padding: "10px 0", color: p.selectText, fontSize: "15px", outline: "none", boxShadow: "none", transition: "color 0.3s, border-color 0.3s" }}>
                <SelectValue placeholder="Select your team leader" />
              </SelectTrigger>
              <SelectContent>
                {teamLeaders.map((tl) => (
                  <SelectItem key={tl.id} value={tl.id}>{tl.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 24px" }}>
          <div style={{ marginBottom: "32px" }}>
            <label style={fieldLabel(f("password"))}>Password</label>
            <div style={{ position: "relative" }}>
              <input type={showPwd ? "text" : "password"} {...form.register("password")} onFocus={() => setFocused("password")} onBlur={() => setFocused(null)} style={{ ...fieldInput(f("password"), err("password")), paddingRight: "32px" }} />
              <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: p.eyeIcon, padding: 0, transition: "color 0.3s" }}>
                {showPwd ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
              </button>
            </div>
            <ErrorMsg msg={form.formState.errors.password?.message} />
          </div>
          <div style={{ marginBottom: "32px" }}>
            <label style={fieldLabel(f("confirm"))}>Confirm</label>
            <div style={{ position: "relative" }}>
              <input type={showConfirm ? "text" : "password"} {...form.register("confirmPassword")} onFocus={() => setFocused("confirm")} onBlur={() => setFocused(null)} style={{ ...fieldInput(f("confirm"), err("confirmPassword")), paddingRight: "32px" }} />
              <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: p.eyeIcon, padding: 0, transition: "color 0.3s" }}>
                {showConfirm ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
              </button>
            </div>
            <ErrorMsg msg={form.formState.errors.confirmPassword?.message} />
          </div>
        </div>

        <motion.button
          type="submit" disabled={register.isPending}
          whileHover={{ scale: register.isPending ? 1 : 1.015, backgroundColor: "rgba(200,168,75,0.08)" }}
          whileTap={{ scale: register.isPending ? 1 : 0.98 }}
          transition={{ duration: 0.15 }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%", background: "transparent",
            border: "1px solid #c8a84b", borderRadius: "4px", padding: "13px 20px",
            color: register.isPending ? "rgba(200,168,75,0.5)" : "#c8a84b",
            fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
            cursor: register.isPending ? "not-allowed" : "pointer", marginBottom: "20px",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {register.isPending && <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />}
            Request account
          </span>
          <ArrowRight style={{ width: 15, height: 15 }} />
        </motion.button>
      </form>

      {/* OAuth */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px" }}>
        <a href={`${BASE_URL}/api/auth/google`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", background: "transparent", border: `1px solid ${p.oauthBorder}`, borderRadius: "4px", padding: "10px", fontSize: "13px", color: p.oauthText, textDecoration: "none", transition: "border-color 0.3s, color 0.3s" }}>
          <svg width="14" height="14" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Google
        </a>
        <a href={`${BASE_URL}/api/auth/facebook`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", background: "transparent", border: `1px solid ${p.oauthBorder}`, borderRadius: "4px", padding: "10px", fontSize: "13px", color: p.oauthText, textDecoration: "none", transition: "border-color 0.3s, color 0.3s" }}>
          <svg width="14" height="14" fill="#1877F2" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
          Facebook
        </a>
      </div>

      <p style={{ fontSize: "12.5px", color: p.backLink, transition: "color 0.3s" }}>
        Already have an account?{" "}
        <Link href="/login" style={{ color: "#c8a84b", textDecoration: "none", fontWeight: 500 }}>
          Sign in
        </Link>
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AuthShell>
  );
}
