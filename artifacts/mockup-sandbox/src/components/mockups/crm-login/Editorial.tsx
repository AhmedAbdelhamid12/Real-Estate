import { Building2, ArrowRight } from "lucide-react";
import { useState } from "react";

export function Editorial() {
  const [focused, setFocused] = useState<string | null>(null);

  return (
    <div style={{
      minHeight: "100vh", width: "100%",
      background: "#080f1c",
      fontFamily: "'Inter', sans-serif",
      display: "flex", flexDirection: "column",
      position: "relative", overflow: "hidden",
    }}>
      {/* Background: architectural line pattern */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04 }} viewBox="0 0 1920 1080" preserveAspectRatio="none">
        {Array.from({ length: 24 }, (_, i) => (
          <line key={i} x1={i * 85} y1="0" x2={i * 85 + 200} y2="1080" stroke="#c8a84b" strokeWidth="1" />
        ))}
        {Array.from({ length: 8 }, (_, i) => (
          <line key={`h${i}`} x1="0" y1={i * 160} x2="1920" y2={i * 160 + 80} stroke="#c8a84b" strokeWidth="0.5" />
        ))}
      </svg>

      {/* Gold horizontal rule — top */}
      <div style={{
        height: "1px",
        background: "linear-gradient(90deg, transparent 0%, #c8a84b 20%, #e8d070 50%, #c8a84b 80%, transparent 100%)",
        opacity: 0.6,
      }} />

      {/* Top bar */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "28px 60px", position: "relative", zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            background: "linear-gradient(135deg, #c8a84b, #e8c96e)",
            padding: "8px", borderRadius: "9px",
          }}>
            <Building2 style={{ width: 18, height: 18, color: "#080f1c", strokeWidth: 2.5 }} />
          </div>
          <span style={{ fontSize: "15px", fontWeight: 600, color: "#8BAFC7", letterSpacing: "0.02em" }}>
            TIL Real Estate Group
          </span>
        </div>
        <span style={{ fontSize: "12.5px", color: "#2d4459", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          Premium CRM Platform
        </span>
      </div>

      {/* Main layout: left type, right form */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        padding: "0 60px 60px",
        gap: "0",
        position: "relative", zIndex: 10,
      }}>
        {/* Left: Display typography */}
        <div style={{ flex: "0 0 55%", paddingRight: "80px" }}>
          {/* Eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            marginBottom: "28px",
          }}>
            <div style={{ width: 32, height: "1px", background: "#c8a84b" }} />
            <span style={{
              fontSize: "11px", fontWeight: 600, color: "#c8a84b",
              letterSpacing: "0.18em", textTransform: "uppercase",
            }}>
              Welcome back
            </span>
          </div>

          {/* Giant headline */}
          <h1 style={{
            fontSize: "88px", fontWeight: 800, lineHeight: 0.95,
            letterSpacing: "-4px",
            color: "#E4EBF5",
            margin: "0 0 32px",
          }}>
            Sign<br />
            <span style={{
              WebkitTextStroke: "2px #c8a84b",
              color: "transparent",
            }}>
              In
            </span>
            <span style={{ color: "#c8a84b" }}>.</span>
          </h1>

          <p style={{
            fontSize: "16px", lineHeight: 1.75, color: "#3D5878",
            maxWidth: "420px", marginBottom: "0",
          }}>
            Egypt's most sophisticated real estate intelligence platform.
            Manage leads, close deals, and track performance across every asset class.
          </p>

          {/* Decorative counter */}
          <div style={{
            display: "flex", gap: "48px", marginTop: "56px",
            borderTop: "1px solid rgba(200,168,75,0.12)", paddingTop: "32px",
          }}>
            {[
              { num: "1,200+", label: "Active agents" },
              { num: "EGP 2.4B", label: "Sales processed" },
              { num: "38%", label: "Conversion lift" },
            ].map(({ num, label }) => (
              <div key={label}>
                <div style={{ fontSize: "22px", fontWeight: 700, color: "#c8a84b", marginBottom: "4px" }}>{num}</div>
                <div style={{ fontSize: "12px", color: "#2d4459", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Vertical divider */}
        <div style={{
          width: "1px", alignSelf: "stretch", margin: "0 60px",
          background: "linear-gradient(180deg, transparent, rgba(200,168,75,0.2) 30%, rgba(200,168,75,0.2) 70%, transparent)",
          flexShrink: 0,
        }} />

        {/* Right: Minimal form */}
        <div style={{ flex: 1, maxWidth: "400px" }}>
          <div style={{ marginBottom: "40px" }}>
            <div style={{
              fontSize: "13px", color: "#2d4459",
              textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "8px",
            }}>
              Sign in to your account
            </div>
          </div>

          {/* Email field — underline only */}
          <div style={{ marginBottom: "32px" }}>
            <label style={{
              display: "block", fontSize: "11px", fontWeight: 600,
              color: focused === "email" ? "#c8a84b" : "#3D5878",
              textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px",
              transition: "color 0.2s",
            }}>
              Email address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "transparent", border: "none",
                borderBottom: `1px solid ${focused === "email" ? "#c8a84b" : "rgba(255,255,255,0.1)"}`,
                padding: "10px 0",
                color: "#C8D8E8", fontSize: "15px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
          </div>

          {/* Password field — underline only */}
          <div style={{ marginBottom: "40px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <label style={{
                fontSize: "11px", fontWeight: 600,
                color: focused === "password" ? "#c8a84b" : "#3D5878",
                textTransform: "uppercase", letterSpacing: "0.1em",
                transition: "color 0.2s",
              }}>
                Password
              </label>
              <a href="#" style={{ fontSize: "12px", color: "#c8a84b", textDecoration: "none", opacity: 0.7 }}>
                Forgot?
              </a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "transparent", border: "none",
                borderBottom: `1px solid ${focused === "password" ? "#c8a84b" : "rgba(255,255,255,0.1)"}`,
                padding: "10px 0",
                color: "#C8D8E8", fontSize: "15px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
            />
          </div>

          {/* CTA button */}
          <button style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            width: "100%",
            background: "transparent",
            border: "1px solid #c8a84b",
            borderRadius: "4px",
            padding: "14px 20px",
            color: "#c8a84b", fontSize: "13px", fontWeight: 600,
            letterSpacing: "0.08em", textTransform: "uppercase",
            cursor: "pointer",
            marginBottom: "28px",
          }}>
            Sign in <ArrowRight style={{ width: 16, height: 16 }} />
          </button>

          {/* Secondary: OAuth */}
          <div style={{ display: "flex", gap: "12px", marginBottom: "32px" }}>
            {[
              {
                label: "Google",
                icon: <svg width="14" height="14" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              },
              {
                label: "Facebook",
                icon: <svg width="14" height="14" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              },
            ].map(({ label, icon }) => (
              <button key={label} style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                background: "transparent", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "4px", padding: "10px",
                fontSize: "13px", color: "#4e6b82", cursor: "pointer",
              }}>
                {icon} {label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: "12.5px", color: "#2d4459" }}>
            Need access?{" "}
            <a href="#" style={{ color: "#c8a84b", textDecoration: "none" }}>Request an account</a>
          </p>
        </div>
      </div>

      {/* Gold bottom rule */}
      <div style={{
        height: "1px",
        background: "linear-gradient(90deg, transparent, #c8a84b 40%, transparent)",
        opacity: 0.3,
      }} />
    </div>
  );
}
