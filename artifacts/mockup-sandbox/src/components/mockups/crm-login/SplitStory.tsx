import React from "react";
import { User, Lock, ArrowRight, Building, Users, TrendingUp } from "lucide-react";
import "./_group.css";
import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

export function SplitStory() {
  return (
    <div
      className="min-h-screen w-full flex flex-col lg:flex-row font-sans relative overflow-hidden"
      style={{
        background: "linear-gradient(115deg, #060F1C 0%, #0F2D52 38%, #1A4A7A 62%, #2E6BA8 80%, #D6E4F5 100%)",
      }}
    >
      {/* Dot pattern overlay — spans full width */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(rgba(201,168,76,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Left content — brand story */}
      <div className="hidden lg:flex w-[58%] flex-col justify-between p-16 relative" style={{ zIndex: 1 }}>
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-sm flex items-center justify-center"
            style={{ backgroundColor: "#C9A84C" }}
          >
            <span className="font-bold text-xl tracking-tighter" style={{ color: "#0A1E38" }}>TIL</span>
          </div>
          <span className="text-xl font-semibold tracking-wide text-white">TIL Real Estate Group</span>
        </div>

        {/* Headline block */}
        <div className="max-w-xl my-16">
          <div className="flex gap-6">
            <div
              style={{
                width: 4,
                flexShrink: 0,
                background: "linear-gradient(to bottom, #C9A84C, rgba(201,168,76,0.1))",
                borderRadius: 4,
                alignSelf: "stretch",
              }}
            />
            <div>
              <h1 className="til-serif text-6xl xl:text-7xl font-bold leading-tight mb-6 text-white drop-shadow-lg">
                Elevating real estate excellence.
              </h1>
              <p className="text-xl font-light mb-12" style={{ color: "#E2C37A" }}>
                The premier command center for high-performing property professionals.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 border-t pt-8" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                {[
                  { icon: Building, value: "SAR 2.4B", label: "Properties Closed" },
                  { icon: Users,    value: "4,200+",  label: "Active Leads"      },
                  { icon: TrendingUp, value: "98%",   label: "Agent Adoption"    },
                ].map(({ icon: Icon, value, label }) => (
                  <div key={label}>
                    <Icon size={22} className="mb-2" style={{ color: "#C9A84C" }} />
                    <div className="text-3xl font-bold mb-1 text-white">{value}</div>
                    <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: "rgba(255,255,255,0.55)" }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Testimonial */}
        <div
          className="p-6 rounded-xl max-w-lg"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
          }}
        >
          <p className="til-serif text-lg italic mb-4" style={{ color: "rgba(255,255,255,0.88)" }}>
            "Since migrating to TIL CRM, our closing time dropped 30%. It's our competitive advantage in a fast-moving market."
          </p>
          <div className="flex items-center gap-4">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm"
              style={{ background: "rgba(201,168,76,0.18)", border: "1px solid #C9A84C", color: "#C9A84C" }}
            >
              FA
            </div>
            <div>
              <div className="font-semibold text-white text-sm">Fahad Al-Rashid</div>
              <div className="text-xs" style={{ color: "#E2C37A" }}>Senior Brokerage Director</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form floats over the mixed gradient */}
      <div className="w-full lg:w-[42%] flex items-center justify-center p-8 md:p-14 relative" style={{ zIndex: 1 }}>
        <div
          className="w-full max-w-md rounded-2xl p-10 shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.6)",
          }}
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-9 h-9 rounded-sm flex items-center justify-center" style={{ backgroundColor: "#0F2D52" }}>
              <span className="font-bold text-base tracking-tighter" style={{ color: "#C9A84C" }}>TIL</span>
            </div>
            <span className="text-lg font-semibold" style={{ color: "#0F2D52" }}>TIL Real Estate Group</span>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2" style={{ color: "#0A1E38" }}>Welcome back</h2>
            <p className="text-sm" style={{ color: "#64748B" }}>Sign in to your operating system.</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="font-semibold text-sm" style={{ color: "#0A1E38" }}>
                Corporate Email
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" style={{ color: "#94A3B8" }}>
                  <User size={16} />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@tilgroup.com"
                  className="pl-9 h-11 text-sm rounded-lg"
                  style={{ borderColor: "#CBD5E1", background: "#F8FAFC" }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="font-semibold text-sm" style={{ color: "#0A1E38" }}>
                  Password
                </Label>
                <a href="#" className="text-xs font-medium transition-colors" style={{ color: "#C9A84C" }}>
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none" style={{ color: "#94A3B8" }}>
                  <Lock size={16} />
                </div>
                <Input
                  id="password"
                  type="password"
                  defaultValue="••••••••"
                  className="pl-9 h-11 text-sm rounded-lg"
                  style={{ borderColor: "#CBD5E1", background: "#F8FAFC" }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 mt-2 transition-all"
              style={{ backgroundColor: "#0F2D52", color: "#F8F9FC" }}
            >
              Access Workspace
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Divider + secondary action */}
          <div className="mt-6 pt-6" style={{ borderTop: "1px solid #E2E8F0" }}>
            <p className="text-center text-xs" style={{ color: "#94A3B8" }}>
              © {new Date().getFullYear()} TIL Real Estate Group. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
