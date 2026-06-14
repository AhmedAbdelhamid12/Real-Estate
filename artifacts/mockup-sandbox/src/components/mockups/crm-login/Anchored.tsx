import { Building2, MapPin, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

function CairoSkyline() {
  return (
    <svg viewBox="0 0 900 380" style={{ width: "100%", height: "100%", opacity: 0.18 }} preserveAspectRatio="xMidYMax meet">
      {/* Abstract Cairo skyline — simplified geometric buildings */}
      {/* Background mountains/desert */}
      <path d="M0 380 L0 260 Q120 200 240 240 Q300 260 360 220 Q420 180 480 230 Q540 260 600 200 Q660 150 720 200 Q780 240 840 180 Q870 160 900 200 L900 380 Z" fill="#0d2040" opacity="0.6"/>
      
      {/* Buildings layer */}
      {/* Pyramid hint */}
      <polygon points="80,380 160,200 240,380" fill="#1a3a5c" opacity="0.7"/>
      <polygon points="100,380 160,210 220,380" fill="#1f4570" opacity="0.5"/>
      
      {/* Modern towers */}
      <rect x="300" y="200" width="40" height="180" rx="2" fill="#1a3a5c"/>
      <rect x="310" y="160" width="20" height="40" rx="1" fill="#1f4570"/>
      {/* windows */}
      {[220,240,260,280,300,320,340,360].map(y => (
        <rect key={y} x="305" y={y} width="6" height="6" rx="1" fill="#c8a84b" opacity="0.4"/>
      ))}
      {[220,240,260,280,300,320,340,360].map(y => (
        <rect key={`r${y}`} x="318" y={y} width="6" height="6" rx="1" fill="#c8a84b" opacity="0.25"/>
      ))}

      <rect x="360" y="240" width="30" height="140" rx="2" fill="#162d4a"/>
      {[250,265,280,295,310,325,340,355].map(y => (
        <rect key={y} x="365" y={y} width="5" height="5" rx="1" fill="#c8a84b" opacity="0.3"/>
      ))}

      <rect x="420" y="180" width="50" height="200" rx="2" fill="#1a3a5c"/>
      <rect x="430" y="150" width="30" height="30" rx="2" fill="#162d4a"/>
      <rect x="440" y="130" width="10" height="20" fill="#c8a84b" opacity="0.6"/>
      {[190,210,230,250,270,290,310,330,350].map(y => (
        [425,437,449,461].map(x => (
          <rect key={`${x}-${y}`} x={x} y={y} width="6" height="7" rx="1" fill="#c8a84b" opacity="0.3"/>
        ))
      ))}

      <rect x="500" y="260" width="25" height="120" rx="2" fill="#162d4a"/>
      <rect x="545" y="220" width="35" height="160" rx="2" fill="#1a3a5c"/>
      
      <rect x="610" y="190" width="45" height="190" rx="2" fill="#1d3d63"/>
      <rect x="620" y="165" width="25" height="25" rx="2" fill="#1a3a5c"/>
      {[200,220,240,260,280,300,320,340,360].map(y => (
        [615,628,641].map(x => (
          <rect key={`${x}-${y}`} x={x} y={y} width="6" height="7" rx="1" fill="#c8a84b" opacity="0.25"/>
        ))
      ))}

      <rect x="680" y="240" width="28" height="140" rx="2" fill="#162d4a"/>
      <rect x="728" y="210" width="38" height="170" rx="2" fill="#1a3a5c"/>
      <rect x="790" y="250" width="22" height="130" rx="2" fill="#162d4a"/>
      <rect x="830" y="220" width="30" height="160" rx="2" fill="#1a3a5c"/>

      {/* Foreground ground */}
      <rect x="0" y="375" width="900" height="10" fill="#0a1826"/>
      
      {/* Reflection in Nile — subtle */}
      <rect x="0" y="376" width="900" height="4" fill="#c8a84b" opacity="0.04"/>
    </svg>
  );
}

export function Anchored() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={{
      display: "flex", minHeight: "100vh",
      fontFamily: "'Inter', sans-serif",
      background: "#070f1c",
    }}>
      {/* LEFT — Brand canvas 60% */}
      <div style={{
        flex: "0 0 60%", position: "relative", overflow: "hidden",
        display: "flex", flexDirection: "column",
        background: "linear-gradient(160deg, #0e1e38 0%, #070f1c 60%)",
      }}>
        {/* Ambient gold glow — upper right area */}
        <div style={{
          position: "absolute", width: 600, height: 600,
          borderRadius: "50%", top: -100, right: -100,
          background: "radial-gradient(circle, rgba(200,168,75,0.06) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        {/* Top: Logo bar */}
        <div style={{ padding: "36px 52px", position: "relative", zIndex: 2 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              background: "linear-gradient(135deg, #c8a84b, #e8d070)",
              padding: "10px", borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(200,168,75,0.3)",
            }}>
              <Building2 style={{ width: 22, height: 22, color: "#070f1c", strokeWidth: 2.5 }} />
            </div>
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#E4EBF5", letterSpacing: "-0.3px" }}>
                TIL Real Estate Group
              </div>
              <div style={{ fontSize: "11px", color: "#2d4459", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                <MapPin style={{ width: 10, height: 10 }} /> Cairo, Egypt
              </div>
            </div>
          </div>
        </div>

        {/* Mid: Brand headline */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 52px 60px", position: "relative", zIndex: 2 }}>
          {/* Pill badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            background: "rgba(200,168,75,0.1)", border: "1px solid rgba(200,168,75,0.22)",
            borderRadius: "20px", padding: "5px 14px", width: "fit-content",
            marginBottom: "24px",
          }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#c8a84b" }} />
            <span style={{ fontSize: "11px", color: "#c8a84b", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Premium CRM Platform
            </span>
          </div>

          <h1 style={{
            fontSize: "64px", fontWeight: 800, lineHeight: 1.05,
            letterSpacing: "-2.5px", color: "#E4EBF5", margin: "0 0 24px",
            maxWidth: "560px",
          }}>
            Egypt's Premier<br />
            Real Estate<br />
            <span style={{ color: "#c8a84b" }}>Intelligence</span>.
          </h1>

          <p style={{
            fontSize: "16px", lineHeight: 1.7, color: "#3D5878",
            maxWidth: "460px", marginBottom: "48px",
          }}>
            Built for Egypt's fastest-growing market — manage every lead, listing, and deal from a single powerful platform.
          </p>

          {/* Horizontal stats row */}
          <div style={{ display: "flex", gap: "40px" }}>
            {[
              { num: "1,200+", label: "Active agents" },
              { num: "EGP 2.4B+", label: "Sales managed" },
              { num: "38%", label: "Conversion lift" },
            ].map(({ num, label }) => (
              <div key={label} style={{ borderLeft: "2px solid rgba(200,168,75,0.3)", paddingLeft: "16px" }}>
                <div style={{ fontSize: "24px", fontWeight: 700, color: "#c8a84b", lineHeight: 1 }}>{num}</div>
                <div style={{ fontSize: "12px", color: "#2d4459", marginTop: "5px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Skyline illustration at bottom */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "280px", zIndex: 1 }}>
          <CairoSkyline />
        </div>

        {/* Bottom fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "80px", zIndex: 1,
          background: "linear-gradient(to top, #070f1c, transparent)",
        }} />
      </div>

      {/* Vertical gold divider */}
      <div style={{
        width: "1px", flexShrink: 0,
        background: "linear-gradient(180deg, transparent 5%, rgba(200,168,75,0.2) 20%, rgba(200,168,75,0.2) 80%, transparent 95%)",
      }} />

      {/* RIGHT — Form panel 40% */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "60px 56px",
        background: "#08111e",
      }}>
        <div style={{ maxWidth: "360px" }}>
          <div style={{ marginBottom: "36px" }}>
            <h2 style={{
              fontSize: "28px", fontWeight: 700, color: "#E4EBF5",
              letterSpacing: "-0.8px", marginBottom: "8px",
            }}>
              Welcome back
            </h2>
            <p style={{ fontSize: "14px", color: "#3D5878" }}>
              Sign in to access your CRM dashboard
            </p>
          </div>

          {/* Email */}
          <div style={{ marginBottom: "18px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#5a7a96", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>
              Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px", padding: "11px 14px",
                color: "#C8D8E8", fontSize: "14px", outline: "none",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#5a7a96", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Password
              </label>
              <a href="#" style={{ fontSize: "12px", color: "#c8a84b", textDecoration: "none" }}>Forgot?</a>
            </div>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px", padding: "11px 40px 11px 14px",
                  color: "#C8D8E8", fontSize: "14px", outline: "none",
                }}
              />
              <button onClick={() => setShowPassword(p => !p)} style={{
                position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "#3D5878",
                display: "flex", alignItems: "center", padding: 0,
              }}>
                {showPassword ? <EyeOff style={{ width: 15, height: 15 }} /> : <Eye style={{ width: 15, height: 15 }} />}
              </button>
            </div>
          </div>

          {/* Sign in button */}
          <button style={{
            width: "100%",
            background: "linear-gradient(135deg, #c8a84b 0%, #dbbe5a 50%, #b8922e 100%)",
            border: "none", borderRadius: "8px",
            padding: "13px",
            fontSize: "14px", fontWeight: 700, color: "#070f1c",
            cursor: "pointer", letterSpacing: "0.03em",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
            marginBottom: "20px",
            boxShadow: "0 4px 20px rgba(200,168,75,0.3)",
          }}>
            Sign in <ArrowRight style={{ width: 15, height: 15, strokeWidth: 2.5 }} />
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", margin: "20px 0 18px", gap: "10px" }}>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
            <span style={{ fontSize: "11px", color: "#1e3048", textTransform: "uppercase", letterSpacing: "0.08em" }}>Or</span>
            <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "28px" }}>
            {[
              { label: "Google", icon: <svg width="15" height="15" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> },
              { label: "Facebook", icon: <svg width="15" height="15" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
            ].map(({ label, icon }) => (
              <button key={label} style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "8px", padding: "10px",
                fontSize: "13px", fontWeight: 500, color: "#5a7a96", cursor: "pointer",
              }}>
                {icon} {label}
              </button>
            ))}
          </div>

          <p style={{ fontSize: "13px", color: "#1e3048", textAlign: "center" }}>
            No account?{" "}
            <a href="#" style={{ color: "#c8a84b", textDecoration: "none", fontWeight: 500 }}>Request access</a>
          </p>
        </div>
      </div>
    </div>
  );
}
