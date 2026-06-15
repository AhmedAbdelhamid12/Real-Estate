import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useTheme } from "next-themes";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Building2, ArrowRight, Eye, EyeOff, Loader2, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

const STATS = [
  { num: "1,200+", label: "Active agents" },
  { num: "EGP 2.4B+", label: "Sales managed" },
  { num: "38%", label: "Conversion lift" },
];

const ease = [0.22, 1, 0.36, 1] as const;

function usePalette() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  return {
    dark,
    // Light: warm parchment + deep forest — Dark: ink-black + sage
    bg:            dark ? "#0C1009"                      : "#F3EFE4",
    fg:            dark ? "#E6EDDA"                      : "#1A2B18",
    fgBody:        dark ? "#88AA72"                      : "#3A5E3C",
    fgMuted:       dark ? "#527A40"                      : "#5A8050",
    inputBorder:   dark ? "rgba(230,237,218,0.13)"       : "rgba(26,43,24,0.18)",
    inputFocused:  "#c8a84b",
    inputText:     dark ? "#D4DFC6"                      : "#1A2B18",
    gridOpacity:   dark ? 0.04                           : 0.06,
    statDivider:   dark ? "rgba(200,168,75,0.14)"        : "rgba(200,168,75,0.22)",
    oauthBorder:   dark ? "rgba(230,237,218,0.1)"        : "rgba(26,43,24,0.14)",
    oauthText:     dark ? "#6A9858"                      : "#3A5E3C",
    divider:       dark ? "rgba(200,168,75,0.18)"        : "rgba(200,168,75,0.28)",
    brandText:     dark ? "#88AA72"                      : "#3A5E3C",
    premiumText:   dark ? "#527A40"                      : "#5A8050",
    registerText:  dark ? "#527A40"                      : "#3A5E3C",
    iconBg:        dark ? "#0C1009"                      : "#F3EFE4",
    toggleBg:      dark ? "rgba(200,168,75,0.08)"        : "rgba(200,168,75,0.1)",
    toggleBorder:  dark ? "rgba(200,168,75,0.2)"         : "rgba(200,168,75,0.28)",
  };
}

export function LoginPage() {
  const [, setLocation] = useLocation();
  const { refetch } = useAuth();
  const login = useLogin();
  const { setTheme, resolvedTheme } = useTheme();
  const p = usePalette();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = (data: LoginFormValues) => {
    setError(null);
    login.mutate({ data }, {
      onSuccess: async () => {
        await refetch();
        setLocation("/dashboard");
      },
      onError: (err) => {
        setError((err as any)?.message || "Invalid credentials. Please try again.");
      },
    });
  };

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <div dir="ltr" style={{
      minHeight: "100vh", width: "100%",
      background: p.bg,
      fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
      transition: "background 0.3s ease",
      direction: "ltr",
    }}>
      {/* Architectural line pattern */}
      <svg aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: p.gridOpacity, pointerEvents: "none" }} viewBox="0 0 1920 1080" preserveAspectRatio="none">
        {Array.from({ length: 22 }, (_, i) => (
          <line key={i} x1={i * 92} y1="0" x2={i * 92 + 240} y2="1080" stroke="#c8a84b" strokeWidth="1" />
        ))}
        {Array.from({ length: 7 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 170} x2="1920" y2={i * 170 + 60} stroke="#c8a84b" strokeWidth="0.5" />
        ))}
      </svg>

      {/* Gold top rule */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.2, ease }}
        style={{ height: "1px", background: "linear-gradient(90deg, transparent, #c8a84b 20%, #e8d070 50%, #c8a84b 80%, transparent)", opacity: 0.6, flexShrink: 0, transformOrigin: "left" }}
      />

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 48px", position: "relative", zIndex: 10, flexShrink: 0 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ background: "linear-gradient(135deg, #c8a84b, #e8d070)", padding: "8px", borderRadius: "10px", boxShadow: "0 4px 16px rgba(200,168,75,0.3)" }}>
            <Building2 style={{ width: 18, height: 18, color: p.iconBg, strokeWidth: 2.5 }} />
          </div>
          <span style={{ fontSize: "14px", fontWeight: 600, color: p.brandText, letterSpacing: "0.02em", transition: "color 0.3s" }}>TIL Real Estate Group</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 34, height: 34, borderRadius: "8px",
              background: p.toggleBg,
              border: `1px solid ${p.toggleBorder}`,
              cursor: "pointer", color: "#c8a84b",
              transition: "background 0.2s, border-color 0.2s",
            }}
          >
            {p.dark
              ? <Sun style={{ width: 15, height: 15 }} />
              : <Moon style={{ width: 15, height: 15 }} />
            }
          </button>
          <span style={{ fontSize: "11px", color: p.premiumText, letterSpacing: "0.12em", textTransform: "uppercase", transition: "color 0.3s" }}>Premium CRM</span>
        </div>
      </motion.div>

      {/* Main layout */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", padding: "0 48px 48px", position: "relative", zIndex: 10, gap: "0", minHeight: 0 }}>

        {/* LEFT: Display headline */}
        <div style={{ flex: "0 0 52%", paddingRight: "72px" }}>
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease }}
            style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "24px" }}
          >
            <div style={{ width: 28, height: "1px", background: "#c8a84b" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#c8a84b", letterSpacing: "0.16em", textTransform: "uppercase" }}>Welcome back</span>
          </motion.div>

          <div style={{ overflow: "hidden", marginBottom: "28px" }}>
            <motion.h1
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.75, delay: 0.25, ease }}
              style={{ fontSize: "clamp(56px, 6vw, 88px)", fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.04em", color: p.fg, margin: 0, transition: "color 0.3s" }}
            >
              Sign
            </motion.h1>
            <motion.div
              initial={{ y: 80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.75, delay: 0.38, ease }}
              style={{ fontSize: "clamp(56px, 6vw, 88px)", fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.04em" }}
            >
              <span style={{ WebkitTextStroke: "2px #c8a84b", color: "transparent" }}>In</span>
              <span style={{ color: "#c8a84b" }}>.</span>
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease }}
            style={{ fontSize: "15px", lineHeight: 1.75, color: p.fgBody, maxWidth: "400px", marginBottom: "0", transition: "color 0.3s" }}
          >
            Egypt's most sophisticated real estate intelligence platform. Manage leads, close deals, and track performance across every asset class.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.65, ease }}
            style={{ display: "flex", gap: "40px", marginTop: "48px", borderTop: `1px solid ${p.statDivider}`, paddingTop: "28px", transition: "border-color 0.3s" }}
          >
            {STATS.map(({ num, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.7 + i * 0.1, ease }}
              >
                <div style={{ fontSize: "20px", fontWeight: 700, color: "#c8a84b", marginBottom: "4px" }}>{num}</div>
                <div style={{ fontSize: "11px", color: p.fgMuted, textTransform: "uppercase", letterSpacing: "0.08em", transition: "color 0.3s" }}>{label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Vertical divider */}
        <motion.div
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease }}
          style={{ width: "1px", alignSelf: "stretch", margin: "0 52px", background: `linear-gradient(180deg, transparent, ${p.divider} 25%, ${p.divider} 75%, transparent)`, flexShrink: 0, transformOrigin: "center" }}
        />

        {/* RIGHT: Form */}
        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease }}
          style={{ flex: 1, maxWidth: "380px" }}
        >
          <div style={{ fontSize: "11px", color: p.fgMuted, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "36px", transition: "color 0.3s" }}>
            Sign in to your account
          </div>

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

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.42, ease }}
              style={{ marginBottom: "28px" }}
            >
              <label style={{ display: "block", fontSize: "10px", fontWeight: 600, color: focusedField === "email" ? "#c8a84b" : p.fgBody, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px", transition: "color 0.2s" }}>
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
                  padding: "10px 0", color: p.inputText, fontSize: "15px", outline: "none", transition: "border-color 0.2s, color 0.3s",
                }}
              />
              {form.formState.errors.email && (
                <p style={{ fontSize: "11px", color: "#F87171", marginTop: "5px" }}>{form.formState.errors.email.message}</p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.52, ease }}
              style={{ marginBottom: "36px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <label style={{ fontSize: "10px", fontWeight: 600, color: focusedField === "password" ? "#c8a84b" : p.fgBody, textTransform: "uppercase", letterSpacing: "0.1em", transition: "color 0.2s" }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: "12px", color: "#c8a84b", textDecoration: "none", opacity: 0.75 }}>
                  Forgot?
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  {...form.register("password")}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "transparent", border: "none",
                    borderBottom: `1px solid ${focusedField === "password" ? "#c8a84b" : form.formState.errors.password ? "#F87171" : p.inputBorder}`,
                    padding: "10px 32px 10px 0", color: p.inputText, fontSize: "15px", outline: "none", transition: "border-color 0.2s, color 0.3s",
                  }}
                />
                <button type="button" onClick={() => setShowPassword(v => !v)} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: p.fgBody, display: "flex", alignItems: "center", padding: 0 }}>
                  {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p style={{ fontSize: "11px", color: "#F87171", marginTop: "5px" }}>{form.formState.errors.password.message}</p>
              )}
            </motion.div>

            {/* Sign in CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.6, ease }}
            >
              <motion.button
                type="submit"
                disabled={login.isPending}
                whileHover={{ scale: login.isPending ? 1 : 1.015, backgroundColor: "rgba(200,168,75,0.08)" }}
                whileTap={{ scale: login.isPending ? 1 : 0.98 }}
                transition={{ duration: 0.15 }}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  width: "100%", background: "transparent",
                  border: "1px solid #c8a84b", borderRadius: "4px", padding: "13px 20px",
                  color: login.isPending ? "rgba(200,168,75,0.5)" : "#c8a84b",
                  fontSize: "12px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase",
                  cursor: login.isPending ? "not-allowed" : "pointer", marginBottom: "24px",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {login.isPending && <Loader2 style={{ width: 14, height: 14, animation: "spin 1s linear infinite" }} />}
                  Sign in
                </span>
                <ArrowRight style={{ width: 15, height: 15 }} />
              </motion.button>
            </motion.div>
          </form>

          {/* OAuth */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7, ease }}
            style={{ display: "flex", gap: "10px", marginBottom: "28px" }}
          >
            <a href={`${BASE_URL}/api/auth/google`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", background: "transparent", border: `1px solid ${p.oauthBorder}`, borderRadius: "4px", padding: "10px", fontSize: "13px", color: p.oauthText, textDecoration: "none", transition: "border-color 0.3s, color 0.3s" }}>
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </a>
            <a href={`${BASE_URL}/api/auth/facebook`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", background: "transparent", border: `1px solid ${p.oauthBorder}`, borderRadius: "4px", padding: "10px", fontSize: "13px", color: p.oauthText, textDecoration: "none", transition: "border-color 0.3s, color 0.3s" }}>
              <svg width="14" height="14" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </a>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.75, ease }}
            style={{ fontSize: "12.5px", color: p.registerText, transition: "color 0.3s" }}
          >
            No account?{" "}
            <Link href="/register" style={{ color: "#c8a84b", textDecoration: "none", fontWeight: 500 }}>Request access</Link>
          </motion.p>
        </motion.div>
      </div>

      {/* Gold bottom rule */}
      <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, #c8a84b 40%, transparent)", opacity: 0.3, flexShrink: 0 }} />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
