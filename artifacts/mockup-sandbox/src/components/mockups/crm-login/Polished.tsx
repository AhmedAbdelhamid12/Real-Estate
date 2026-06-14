import { Building2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function Polished() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{
        background: "radial-gradient(ellipse 80% 60% at 50% 0%, #1a2d4d 0%, #091624 55%, #060e19 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle grid overlay */}
      <div
        style={{
          position: "absolute", inset: 0, opacity: 0.035,
          backgroundImage: "linear-gradient(#c8a84b 1px, transparent 1px), linear-gradient(90deg, #c8a84b 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />

      {/* Glow orbs */}
      <div style={{
        position: "absolute", width: 480, height: 480,
        borderRadius: "50%", top: -140, left: "50%", transform: "translateX(-50%)",
        background: "radial-gradient(circle, rgba(200,168,75,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div className="w-full max-w-[420px] relative z-10">
        {/* Brand header */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div style={{
            background: "linear-gradient(135deg, #c8a84b 0%, #e8c96e 50%, #a87d28 100%)",
            padding: "14px",
            borderRadius: "16px",
            marginBottom: "18px",
            boxShadow: "0 0 0 1px rgba(200,168,75,0.25), 0 8px 32px rgba(200,168,75,0.20), 0 2px 8px rgba(0,0,0,0.4)",
          }}>
            <Building2 style={{ width: 30, height: 30, color: "#0B1628", strokeWidth: 2.2 }} />
          </div>
          <h1 style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "24px", fontWeight: 700, letterSpacing: "-0.5px",
            color: "#E8EDF5", marginBottom: "6px",
          }}>
            TIL Real Estate Group
          </h1>
          <p style={{ fontSize: "13px", color: "#6B8299", letterSpacing: "0.02em" }}>
            Premium Real Estate CRM Platform
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "linear-gradient(160deg, #111f35 0%, #0d1a2e 100%)",
          border: "1px solid rgba(200,168,75,0.18)",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 24px 64px rgba(0,0,0,0.55), 0 4px 16px rgba(0,0,0,0.3)",
        }}>
          {/* Gold top accent line */}
          <div style={{
            height: "2px",
            background: "linear-gradient(90deg, transparent, #c8a84b 30%, #e8c96e 50%, #c8a84b 70%, transparent)",
          }} />

          <div style={{ padding: "32px 32px 28px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#E8EDF5", marginBottom: "6px" }}>
              Welcome back
            </h2>
            <p style={{ fontSize: "13.5px", color: "#4e6b82", marginBottom: "28px" }}>
              Enter your credentials to access your account
            </p>

            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "12.5px", fontWeight: 500, color: "#8BAFC7", marginBottom: "7px" }}>
                Email address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                defaultValue=""
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.045)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: "10px", padding: "10px 14px",
                  color: "#C8D8E8", fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
                <label style={{ fontSize: "12.5px", fontWeight: 500, color: "#8BAFC7" }}>Password</label>
                <a href="#" style={{ fontSize: "12px", color: "#c8a84b", textDecoration: "none" }}>
                  Forgot password?
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.045)",
                    border: "1px solid rgba(255,255,255,0.09)",
                    borderRadius: "10px", padding: "10px 40px 10px 14px",
                    color: "#C8D8E8", fontSize: "14px",
                    outline: "none",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{
                    position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#4e6b82",
                    display: "flex", alignItems: "center", padding: 0,
                  }}
                >
                  {showPassword
                    ? <EyeOff style={{ width: 15, height: 15 }} />
                    : <Eye style={{ width: 15, height: 15 }} />
                  }
                </button>
              </div>
            </div>

            <button
              type="button"
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #c8a84b 0%, #e8d070 45%, #b8922e 100%)",
                border: "none", borderRadius: "10px",
                padding: "11px",
                fontSize: "14px", fontWeight: 600,
                color: "#0B1628",
                cursor: "pointer",
                letterSpacing: "0.02em",
                boxShadow: "0 4px 20px rgba(200,168,75,0.30), 0 1px 3px rgba(0,0,0,0.3)",
              }}
            >
              Sign in
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", margin: "22px 0 20px", gap: "12px" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
              <span style={{ fontSize: "11px", color: "#3d5568", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Or continue with
              </span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }} />
            </div>

            {/* OAuth buttons */}
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
                    background: "rgba(255,255,255,0.045)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "10px", padding: "9px 14px",
                    fontSize: "13.5px", fontWeight: 500, color: "#A8BDD1",
                    cursor: "pointer",
                  }}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "16px 32px",
            textAlign: "center",
            background: "rgba(0,0,0,0.15)",
          }}>
            <p style={{ fontSize: "13px", color: "#3d5568" }}>
              Don't have an account?{" "}
              <a href="#" style={{ color: "#c8a84b", textDecoration: "none", fontWeight: 500 }}>
                Request access
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
