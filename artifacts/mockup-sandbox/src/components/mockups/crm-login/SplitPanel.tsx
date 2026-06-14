import { Building2, ArrowRight, Eye, EyeOff, TrendingUp, Users, BarChart2 } from "lucide-react";
import { useState } from "react";

function StatBadge({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "10px",
      background: "rgba(255,255,255,0.08)", backdropFilter: "blur(8px)",
      border: "1px solid rgba(200,168,75,0.2)",
      borderRadius: "12px", padding: "10px 14px",
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: "8px",
        background: "rgba(200,168,75,0.18)",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "15px", fontWeight: 700, color: "#F0E6C8", lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: "11px", color: "#8BAFC7", marginTop: "3px" }}>{label}</div>
      </div>
    </div>
  );
}

export function SplitPanel() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

      {/* LEFT — Brand panel */}
      <div style={{
        width: "45%", flexShrink: 0, position: "relative", overflow: "hidden",
        background: "linear-gradient(165deg, #0f1f38 0%, #091526 50%, #060e1b 100%)",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "48px 44px",
      }}>
        {/* Background geometry */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.04,
          backgroundImage: "linear-gradient(#c8a84b 1px, transparent 1px), linear-gradient(90deg, #c8a84b 1px, transparent 1px)",
          backgroundSize: "40px 40px", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, right: -80, width: 400, height: 400,
          borderRadius: "50%", border: "1px solid rgba(200,168,75,0.12)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -40, right: -40, width: 260, height: 260,
          borderRadius: "50%", border: "1px solid rgba(200,168,75,0.08)",
          pointerEvents: "none",
        }} />

        {/* Top: Logo */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              background: "linear-gradient(135deg, #c8a84b, #e8c96e)",
              padding: "9px", borderRadius: "11px",
              boxShadow: "0 4px 16px rgba(200,168,75,0.35)",
            }}>
              <Building2 style={{ width: 20, height: 20, color: "#0B1628", strokeWidth: 2.5 }} />
            </div>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#E8EDF5", letterSpacing: "-0.3px" }}>
              TIL Real Estate Group
            </span>
          </div>
        </div>

        {/* Mid: Hero content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Gold accent */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(200,168,75,0.12)", border: "1px solid rgba(200,168,75,0.25)",
            borderRadius: "20px", padding: "4px 12px", marginBottom: "22px",
          }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c8a84b" }} />
            <span style={{ fontSize: "11.5px", color: "#c8a84b", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Premium CRM Platform
            </span>
          </div>

          <h2 style={{
            fontSize: "36px", fontWeight: 800, lineHeight: 1.15,
            color: "#E8EDF5", letterSpacing: "-1px", marginBottom: "16px",
          }}>
            Egypt's Premier<br />
            <span style={{ color: "#c8a84b" }}>Real Estate</span><br />
            Management Suite
          </h2>
          <p style={{ fontSize: "14.5px", color: "#5a7a96", lineHeight: 1.7, maxWidth: "340px" }}>
            Streamline your pipeline, track leads, and close deals faster with AI-powered insights built for the Egyptian market.
          </p>

          {/* Stats */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "32px" }}>
            <StatBadge
              icon={<TrendingUp style={{ width: 15, height: 15, color: "#c8a84b" }} />}
              value="EGP 2.4B+"
              label="Sales processed"
            />
            <StatBadge
              icon={<Users style={{ width: 15, height: 15, color: "#c8a84b" }} />}
              value="1,200+"
              label="Active agents"
            />
            <StatBadge
              icon={<BarChart2 style={{ width: 15, height: 15, color: "#c8a84b" }} />}
              value="38%"
              label="Avg. conversion lift"
            />
          </div>
        </div>

        {/* Bottom */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ fontSize: "12px", color: "#2d4459" }}>
            © 2026 TIL Real Estate Group — Cairo, Egypt
          </p>
        </div>
      </div>

      {/* RIGHT — Form panel */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        background: "#F7F8FA", padding: "48px 40px",
      }}>
        <div style={{ width: "100%", maxWidth: "380px" }}>
          <div style={{ marginBottom: "36px" }}>
            <h2 style={{ fontSize: "26px", fontWeight: 700, color: "#0D1626", letterSpacing: "-0.5px", marginBottom: "8px" }}>
              Welcome back
            </h2>
            <p style={{ fontSize: "14px", color: "#7A8FA8" }}>
              Sign in to your TIL CRM account
            </p>
          </div>

          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#3D5468", marginBottom: "7px" }}>
              Email address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "#fff", border: "1.5px solid #DDE4EC",
                borderRadius: "10px", padding: "11px 14px",
                color: "#0D1626", fontSize: "14px", outline: "none",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            />
          </div>

          <div style={{ marginBottom: "26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
              <label style={{ fontSize: "13px", fontWeight: 500, color: "#3D5468" }}>Password</label>
              <a href="#" style={{ fontSize: "12.5px", color: "#c8a84b", textDecoration: "none", fontWeight: 500 }}>
                Forgot password?
              </a>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "#fff", border: "1.5px solid #DDE4EC",
                  borderRadius: "10px", padding: "11px 42px 11px 14px",
                  color: "#0D1626", fontSize: "14px", outline: "none",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                style={{
                  position: "absolute", right: "13px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#94A8BE",
                  display: "flex", alignItems: "center", padding: 0,
                }}
              >
                {showPassword
                  ? <EyeOff style={{ width: 16, height: 16 }} />
                  : <Eye style={{ width: 16, height: 16 }} />
                }
              </button>
            </div>
          </div>

          <button
            type="button"
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #c8a84b 0%, #dbbe5a 50%, #b8922e 100%)",
              border: "none", borderRadius: "10px",
              padding: "12px",
              fontSize: "14.5px", fontWeight: 600, color: "#0B1628",
              cursor: "pointer", letterSpacing: "0.02em",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
              boxShadow: "0 4px 18px rgba(200,168,75,0.35)",
            }}
          >
            Sign in <ArrowRight style={{ width: 15, height: 15, strokeWidth: 2.5 }} />
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", margin: "22px 0", gap: "10px" }}>
            <div style={{ flex: 1, height: "1px", background: "#DDE4EC" }} />
            <span style={{ fontSize: "11.5px", color: "#A8BAC8", textTransform: "uppercase", letterSpacing: "0.07em" }}>
              Or continue with
            </span>
            <div style={{ flex: 1, height: "1px", background: "#DDE4EC" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {[
              {
                label: "Google",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                ),
              },
              {
                label: "Facebook",
                icon: (
                  <svg width="16" height="16" fill="#1877F2" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                ),
              },
            ].map(({ label, icon }) => (
              <button
                key={label}
                type="button"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  background: "#fff", border: "1.5px solid #DDE4EC",
                  borderRadius: "10px", padding: "10px",
                  fontSize: "13.5px", fontWeight: 500, color: "#3D5468",
                  cursor: "pointer",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                }}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          <p style={{ textAlign: "center", fontSize: "13px", color: "#94A8BE", marginTop: "28px" }}>
            Don't have an account?{" "}
            <a href="#" style={{ color: "#c8a84b", textDecoration: "none", fontWeight: 600 }}>
              Request access
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
