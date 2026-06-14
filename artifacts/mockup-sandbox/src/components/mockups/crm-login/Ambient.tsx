import { Building2, TrendingUp, Users, Home, ArrowUpRight, MapPin, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

function PropertyCard({ title, location, price, change, img }: { title: string; location: string; price: string; change: string; img: string }) {
  return (
    <div style={{
      background: "rgba(14,28,50,0.85)",
      border: "1px solid rgba(200,168,75,0.12)",
      borderRadius: "14px", overflow: "hidden",
      width: "220px", flexShrink: 0,
    }}>
      <div style={{
        height: "110px",
        background: img,
        position: "relative",
      }}>
        <div style={{
          position: "absolute", top: "8px", right: "8px",
          background: "rgba(200,168,75,0.9)", borderRadius: "20px",
          padding: "2px 8px", fontSize: "10px", fontWeight: 700, color: "#080f1c",
        }}>
          {change}
        </div>
      </div>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ fontSize: "12px", fontWeight: 600, color: "#C8D8E8", marginBottom: "3px" }}>{title}</div>
        <div style={{ fontSize: "10px", color: "#3D5878", display: "flex", alignItems: "center", gap: "3px", marginBottom: "6px" }}>
          <MapPin style={{ width: 8, height: 8 }} /> {location}
        </div>
        <div style={{ fontSize: "13px", fontWeight: 700, color: "#c8a84b" }}>{price}</div>
      </div>
    </div>
  );
}

function StatWidget({ icon, value, label, sub }: { icon: React.ReactNode; value: string; label: string; sub?: string }) {
  return (
    <div style={{
      background: "rgba(14,28,50,0.9)",
      border: "1px solid rgba(200,168,75,0.1)",
      borderRadius: "12px",
      padding: "14px 16px",
      display: "flex", flexDirection: "column", gap: "4px",
      minWidth: "140px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#5a7a96" }}>{icon}</div>
        {sub && <span style={{ fontSize: "10px", color: "#c8a84b", fontWeight: 600 }}>{sub}</span>}
      </div>
      <div style={{ fontSize: "22px", fontWeight: 800, color: "#E4EBF5", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: "11px", color: "#3D5878" }}>{label}</div>
    </div>
  );
}

function LeadRow({ name, stage, value }: { name: string; stage: string; value: string }) {
  const stageColors: Record<string, string> = {
    "Qualified": "#34A853", "Proposal": "#c8a84b", "Negotiating": "#4285F4", "New": "#888"
  };
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "linear-gradient(135deg, #1a3a5c, #0e2040)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "11px", fontWeight: 700, color: "#c8a84b",
        }}>
          {name[0]}
        </div>
        <div>
          <div style={{ fontSize: "12px", fontWeight: 500, color: "#A8C0D6" }}>{name}</div>
          <div style={{
            display: "inline-block", fontSize: "9px", fontWeight: 600,
            color: stageColors[stage] || "#888",
            background: `${stageColors[stage] || "#888"}22`,
            padding: "1px 6px", borderRadius: "10px", marginTop: "2px",
          }}>
            {stage}
          </div>
        </div>
      </div>
      <div style={{ fontSize: "12px", fontWeight: 600, color: "#c8a84b" }}>{value}</div>
    </div>
  );
}

export function Ambient() {
  const [showPassword, setShowPassword] = useState(false);

  const gradients = [
    "linear-gradient(135deg, #1a3a5c 0%, #0d2040 100%)",
    "linear-gradient(135deg, #2d4a2a 0%, #1a3018 100%)",
    "linear-gradient(135deg, #3a2a1a 0%, #2a1a0a 100%)",
    "linear-gradient(135deg, #1a2a4a 0%, #0d1a30 100%)",
  ];

  return (
    <div style={{
      minHeight: "100vh", position: "relative", overflow: "hidden",
      background: "#060d19",
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* ============= BACKGROUND: Ghosted app content ============= */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        filter: "blur(1.5px)",
        opacity: 0.35,
      }}>
        {/* Simulated sidebar */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: "220px",
          background: "rgba(10,22,42,0.9)", borderRight: "1px solid rgba(200,168,75,0.08)",
          padding: "24px 0",
        }}>
          <div style={{ padding: "0 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: 30, height: 30, borderRadius: "8px", background: "#c8a84b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Building2 style={{ width: 14, height: 14, color: "#060d19" }} />
              </div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#C8D8E8" }}>TIL CRM</div>
            </div>
          </div>
          {["Dashboard", "Leads", "Properties", "Deals", "Reports", "Calendar"].map((item, i) => (
            <div key={item} style={{
              padding: "10px 20px", fontSize: "13px",
              color: i === 0 ? "#c8a84b" : "#3D5878",
              background: i === 0 ? "rgba(200,168,75,0.08)" : "transparent",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <div style={{ width: 8, height: 8, borderRadius: "2px", background: i === 0 ? "#c8a84b" : "#1e3048" }} />
              {item}
            </div>
          ))}
        </div>

        {/* Main content area */}
        <div style={{ marginLeft: "220px", padding: "28px 32px" }}>
          {/* Topbar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
            <div>
              <div style={{ fontSize: "20px", fontWeight: 700, color: "#C8D8E8" }}>Good morning, Ahmed</div>
              <div style={{ fontSize: "12px", color: "#2d4459" }}>Cairo, Egypt · {new Date().toLocaleDateString('en-EG', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1a3a5c", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "12px", color: "#c8a84b", fontWeight: 700 }}>AH</span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: "14px", marginBottom: "28px", flexWrap: "wrap" }}>
            <StatWidget icon={<TrendingUp style={{ width: 14, height: 14 }} />} value="142" label="Active leads" sub="+12%" />
            <StatWidget icon={<Home style={{ width: 14, height: 14 }} />} value="38" label="Listed properties" sub="+5" />
            <StatWidget icon={<Users style={{ width: 14, height: 14 }} />} value="EGP 14.2M" label="Pipeline value" sub="Q4" />
            <StatWidget icon={<ArrowUpRight style={{ width: 14, height: 14 }} />} value="7" label="Closings this week" sub="↑3" />
          </div>

          {/* Property listings row */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#3D5878", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "12px" }}>
              Featured Properties
            </div>
            <div style={{ display: "flex", gap: "14px" }}>
              <PropertyCard title="New Cairo Villa" location="Fifth Settlement" price="EGP 4.2M" change="Hot" img={gradients[0]} />
              <PropertyCard title="Maadi Duplex" location="Maadi Corniche" price="EGP 2.8M" change="+8%" img={gradients[1]} />
              <PropertyCard title="6th Oct Apartment" location="Zayed City" price="EGP 1.6M" change="New" img={gradients[2]} />
              <PropertyCard title="Heliopolis Office" location="Roxy Square" price="EGP 5.1M" change="↑12%" img={gradients[3]} />
            </div>
          </div>

          {/* Leads table */}
          <div style={{
            background: "rgba(10,22,42,0.8)", borderRadius: "12px",
            border: "1px solid rgba(200,168,75,0.08)", padding: "16px 20px",
            maxWidth: "480px",
          }}>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "#3D5878", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
              Recent Leads
            </div>
            <LeadRow name="Omar Hassan" stage="Qualified" value="EGP 3.2M" />
            <LeadRow name="Sara Mostafa" stage="Proposal" value="EGP 1.8M" />
            <LeadRow name="Khalid Farouk" stage="Negotiating" value="EGP 5.5M" />
            <LeadRow name="Nour Abdel" stage="New" value="EGP 900K" />
          </div>
        </div>
      </div>

      {/* Dark vignette overlay */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 1,
        background: "radial-gradient(ellipse 70% 70% at 50% 50%, rgba(6,13,25,0.55) 0%, rgba(6,13,25,0.82) 100%)",
        backdropFilter: "blur(0.5px)",
      }} />

      {/* ============= FOREGROUND: Login card ============= */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 10,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px",
      }}>
        <div style={{
          width: "100%", maxWidth: "420px",
          background: "rgba(8,15,28,0.88)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(200,168,75,0.22)",
          borderRadius: "22px", overflow: "hidden",
          boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset, 0 32px 80px rgba(0,0,0,0.7), 0 0 60px rgba(200,168,75,0.06)",
        }}>
          {/* Gold top strip */}
          <div style={{
            height: "2px",
            background: "linear-gradient(90deg, transparent, #c8a84b 25%, #e8d070 50%, #c8a84b 75%, transparent)",
          }} />

          <div style={{ padding: "32px 32px 16px" }}>
            {/* Brand */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "28px" }}>
              <div style={{
                background: "linear-gradient(135deg, #c8a84b, #e8d070)",
                padding: "11px", borderRadius: "14px", marginBottom: "14px",
                boxShadow: "0 0 24px rgba(200,168,75,0.3)",
              }}>
                <Building2 style={{ width: 24, height: 24, color: "#060d19", strokeWidth: 2.5 }} />
              </div>
              <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#E4EBF5", marginBottom: "3px", letterSpacing: "-0.3px" }}>
                Sign in to TIL CRM
              </h2>
              <p style={{ fontSize: "12.5px", color: "#3D5878" }}>Your dashboard is ready</p>
            </div>

            {/* Email */}
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 500, color: "#5a7a96", marginBottom: "7px" }}>
                Email address
              </label>
              <input type="email" placeholder="name@example.com" style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: "10px", padding: "10px 13px",
                color: "#C8D8E8", fontSize: "13.5px", outline: "none",
              }} />
            </div>

            {/* Password */}
            <div style={{ marginBottom: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                <label style={{ fontSize: "12px", fontWeight: 500, color: "#5a7a96" }}>Password</label>
                <a href="#" style={{ fontSize: "11.5px", color: "#c8a84b", textDecoration: "none" }}>Forgot?</a>
              </div>
              <div style={{ position: "relative" }}>
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: "10px", padding: "10px 38px 10px 13px",
                  color: "#C8D8E8", fontSize: "13.5px", outline: "none",
                }} />
                <button onClick={() => setShowPassword(p => !p)} style={{
                  position: "absolute", right: "11px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#3D5878",
                  display: "flex", alignItems: "center", padding: 0,
                }}>
                  {showPassword ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                </button>
              </div>
            </div>

            <button style={{
              width: "100%",
              background: "linear-gradient(135deg, #c8a84b, #dbbe5a 50%, #b8922e)",
              border: "none", borderRadius: "10px", padding: "11.5px",
              fontSize: "14px", fontWeight: 700, color: "#060d19",
              cursor: "pointer",
              boxShadow: "0 4px 22px rgba(200,168,75,0.35)",
              marginBottom: "16px",
            }}>
              Enter the platform
            </button>

            {/* OAuth */}
            <div style={{ display: "flex", alignItems: "center", margin: "0 0 14px", gap: "10px" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
              <span style={{ fontSize: "11px", color: "#1e3048", textTransform: "uppercase", letterSpacing: "0.06em" }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.06)" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {[
                { label: "Google", icon: <svg width="14" height="14" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> },
                { label: "Facebook", icon: <svg width="14" height="14" fill="#1877F2" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg> },
              ].map(({ label, icon }) => (
                <button key={label} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "9px", padding: "9px",
                  fontSize: "13px", fontWeight: 500, color: "#4e6b82", cursor: "pointer",
                }}>
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            padding: "14px 32px 20px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            textAlign: "center",
            background: "rgba(0,0,0,0.12)",
          }}>
            <p style={{ fontSize: "12.5px", color: "#1e3048" }}>
              No account?{" "}
              <a href="#" style={{ color: "#c8a84b", textDecoration: "none", fontWeight: 500 }}>Request access</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
