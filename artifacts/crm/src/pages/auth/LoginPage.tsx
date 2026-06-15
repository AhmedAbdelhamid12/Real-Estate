import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});
type LoginFormValues = z.infer<typeof loginSchema>;

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
const ease = [0.22, 1, 0.36, 1] as const;

const STATS = [
  { num: "1,200+", label: "Active agents" },
  { num: "EGP 2.4B+", label: "Sales managed" },
  { num: "38%", label: "Conversion lift" },
];

export function LoginPage() {
  const [, setLocation] = useLocation();
  const { refetch } = useAuth();
  const login = useLogin();
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

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: "#040912",
      fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex",
      alignItems: "stretch",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Animated background grid */}
      <svg aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} preserveAspectRatio="none" viewBox="0 0 1920 1080">
        <defs>
          <radialGradient id="glow1" cx="30%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#c8a84b" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#c8a84b" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="glow2" cx="75%" cy="40%" r="45%">
            <stop offset="0%" stopColor="#1a3a5c" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#1a3a5c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1920" height="1080" fill="url(#glow1)" />
        <rect width="1920" height="1080" fill="url(#glow2)" />
        {Array.from({ length: 28 }, (_, i) => (
          <line key={`v${i}`} x1={i * 70} y1="0" x2={i * 70} y2="1080" stroke="#c8a84b" strokeWidth="0.4" opacity="0.06" />
        ))}
        {Array.from({ length: 16 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 70} x2="1920" y2={i * 70} stroke="#c8a84b" strokeWidth="0.4" opacity="0.06" />
        ))}
        <circle cx="320" cy="540" r="380" fill="none" stroke="#c8a84b" strokeWidth="0.5" opacity="0.06" />
        <circle cx="320" cy="540" r="260" fill="none" stroke="#c8a84b" strokeWidth="0.5" opacity="0.08" />
        <circle cx="320" cy="540" r="140" fill="none" stroke="#c8a84b" strokeWidth="0.5" opacity="0.1" />
      </svg>

      {/* LEFT PANEL — Branding */}
      <div style={{
        width: "48%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px 72px",
        position: "relative",
        zIndex: 2,
      }}>

        {/* Logo mark */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease }}
          style={{ marginBottom: "52px" }}
        >
          <div style={{ position: "relative", width: 96, height: 96 }}>
            {/* Outer ring */}
            <div style={{
              position: "absolute", inset: 0,
              borderRadius: "50%",
              border: "1px solid rgba(200,168,75,0.2)",
              animation: "pulse-ring 3s ease-in-out infinite",
            }} />
            {/* Mid ring */}
            <div style={{
              position: "absolute", inset: 12,
              borderRadius: "50%",
              border: "1px solid rgba(200,168,75,0.35)",
            }} />
            {/* Core */}
            <div style={{
              position: "absolute", inset: 22,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #c8a84b, #e8d070)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 40px rgba(200,168,75,0.35), 0 0 80px rgba(200,168,75,0.12)",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#040912" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                <polyline points="9,22 9,12 15,12 15,22"/>
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease }}
          style={{ marginBottom: "12px" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#c8a84b", letterSpacing: "0.2em", textTransform: "uppercase" }}>TIL Real Estate Group</span>
          </div>
          <h1 style={{
            fontSize: "clamp(44px, 4.5vw, 72px)",
            fontWeight: 800,
            lineHeight: 1.0,
            letterSpacing: "-0.035em",
            color: "#ffffff",
            margin: 0,
          }}>
            Egypt's Premier
            <br />
            <span style={{
              background: "linear-gradient(90deg, #c8a84b, #f0d878, #c8a84b)",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundSize: "200% auto",
              animation: "shimmer 4s linear infinite",
            }}>
              Intelligence
            </span>
            <br />
            Platform.
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease }}
          style={{ fontSize: "15px", lineHeight: 1.8, color: "rgba(180,200,220,0.55)", maxWidth: "360px", marginBottom: "56px" }}
        >
          Close deals faster. Manage every lead, client, and project from a single command center.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.45, ease }}
          style={{ display: "flex", gap: "0", borderTop: "1px solid rgba(200,168,75,0.12)", paddingTop: "36px" }}
        >
          {STATS.map(({ num, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.1, ease }}
              style={{
                flex: 1,
                paddingRight: i < 2 ? "32px" : 0,
                borderRight: i < 2 ? "1px solid rgba(200,168,75,0.1)" : "none",
                marginRight: i < 2 ? "32px" : 0,
              }}
            >
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#c8a84b", marginBottom: "4px" }}>{num}</div>
              <div style={{ fontSize: "11px", color: "rgba(180,200,220,0.4)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* RIGHT PANEL — Form */}
      <div style={{
        width: "52%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        zIndex: 2,
        padding: "60px 80px 60px 60px",
      }}>

        {/* Glass card */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease }}
          style={{
            width: "100%",
            maxWidth: "420px",
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(200,168,75,0.12)",
            borderRadius: "24px",
            padding: "48px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Card inner glow */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(200,168,75,0.5), transparent)",
          }} />

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35, ease }}
          >
            <div style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 20, height: "1px", background: "#c8a84b", opacity: 0.7 }} />
              <span style={{ fontSize: "10px", fontWeight: 600, color: "#c8a84b", letterSpacing: "0.18em", textTransform: "uppercase" }}>Secure Sign In</span>
            </div>
            <h2 style={{ fontSize: "28px", fontWeight: 700, color: "#ffffff", letterSpacing: "-0.02em", margin: "0 0 4px 0" }}>
              Welcome back
            </h2>
            <p style={{ fontSize: "14px", color: "rgba(180,200,220,0.45)", marginBottom: "36px" }}>
              Enter your credentials to access the platform
            </p>
          </motion.div>

          <form onSubmit={form.handleSubmit(onSubmit)}>
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ marginBottom: "20px", padding: "12px 14px", background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: "10px", fontSize: "13px", color: "#F87171" }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.42, ease }}
              style={{ marginBottom: "20px" }}
            >
              <label style={{
                display: "block",
                fontSize: "10px",
                fontWeight: 600,
                color: focusedField === "email" ? "#c8a84b" : "rgba(180,200,220,0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                marginBottom: "8px",
                transition: "color 0.2s",
              }}>
                Email address
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  {...form.register("email")}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    background: focusedField === "email" ? "rgba(200,168,75,0.05)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${focusedField === "email" ? "rgba(200,168,75,0.4)" : form.formState.errors.email ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: "12px",
                    padding: "13px 16px",
                    color: "#ffffff",
                    fontSize: "15px",
                    outline: "none",
                    transition: "all 0.2s",
                    boxShadow: focusedField === "email" ? "0 0 0 3px rgba(200,168,75,0.08)" : "none",
                  }}
                />
              </div>
              {form.formState.errors.email && (
                <p style={{ fontSize: "11px", color: "#F87171", marginTop: "5px" }}>{form.formState.errors.email.message}</p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.52, ease }}
              style={{ marginBottom: "28px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{
                  fontSize: "10px",
                  fontWeight: 600,
                  color: focusedField === "password" ? "#c8a84b" : "rgba(180,200,220,0.5)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  transition: "color 0.2s",
                }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: "12px", color: "#c8a84b", textDecoration: "none", opacity: 0.7 }}>
                  Forgot password?
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
                    width: "100%",
                    boxSizing: "border-box",
                    background: focusedField === "password" ? "rgba(200,168,75,0.05)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${focusedField === "password" ? "rgba(200,168,75,0.4)" : form.formState.errors.password ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: "12px",
                    padding: "13px 48px 13px 16px",
                    color: "#ffffff",
                    fontSize: "15px",
                    outline: "none",
                    transition: "all 0.2s",
                    boxShadow: focusedField === "password" ? "0 0 0 3px rgba(200,168,75,0.08)" : "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    color: "rgba(180,200,220,0.4)", display: "flex", alignItems: "center", padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
              {form.formState.errors.password && (
                <p style={{ fontSize: "11px", color: "#F87171", marginTop: "5px" }}>{form.formState.errors.password.message}</p>
              )}
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.6, ease }}
            >
              <motion.button
                type="submit"
                disabled={login.isPending}
                whileHover={{ scale: login.isPending ? 1 : 1.015 }}
                whileTap={{ scale: login.isPending ? 1 : 0.98 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "10px",
                  width: "100%",
                  background: login.isPending
                    ? "rgba(200,168,75,0.3)"
                    : "linear-gradient(135deg, #c8a84b 0%, #e8d070 50%, #c8a84b 100%)",
                  backgroundSize: "200% auto",
                  border: "none",
                  borderRadius: "12px",
                  padding: "14px 24px",
                  color: "#040912",
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: login.isPending ? "not-allowed" : "pointer",
                  boxShadow: login.isPending ? "none" : "0 8px 32px rgba(200,168,75,0.3)",
                  transition: "background-position 0.4s, box-shadow 0.2s",
                  marginBottom: "20px",
                  animation: login.isPending ? "none" : "shimmer-btn 3s linear infinite",
                }}
              >
                {login.isPending
                  ? <Loader2 style={{ width: 18, height: 18, animation: "spin 1s linear infinite" }} />
                  : <>Access Platform <ArrowRight style={{ width: 16, height: 16 }} /></>
                }
              </motion.button>
            </motion.div>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
            <span style={{ fontSize: "11px", color: "rgba(180,200,220,0.3)", letterSpacing: "0.08em" }}>OR</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
          </div>

          {/* OAuth */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "28px" }}>
            <a
              href={`${BASE_URL}/api/auth/google`}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "11px",
                fontSize: "13px",
                color: "rgba(180,200,220,0.6)",
                textDecoration: "none",
                transition: "background 0.2s, border-color 0.2s",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google
            </a>
            <a
              href={`${BASE_URL}/api/auth/facebook`}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "10px",
                padding: "11px",
                fontSize: "13px",
                color: "rgba(180,200,220,0.6)",
                textDecoration: "none",
                transition: "background 0.2s, border-color 0.2s",
              }}
            >
              <svg width="15" height="15" fill="#1877F2" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </a>
          </div>

          <p style={{ fontSize: "13px", color: "rgba(180,200,220,0.35)", textAlign: "center" }}>
            No account?{" "}
            <Link href="/register" style={{ color: "#c8a84b", textDecoration: "none", fontWeight: 600 }}>Request access</Link>
          </p>
        </motion.div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes shimmer-btn {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.04); }
        }
        input::placeholder { color: rgba(180,200,220,0.3) !important; }
        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(4,9,18,0.9) inset !important;
          -webkit-text-fill-color: #ffffff !important;
        }
      `}</style>
    </div>
  );
}
