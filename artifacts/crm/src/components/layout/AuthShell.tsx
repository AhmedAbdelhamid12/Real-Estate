import { ReactNode } from "react";
import { Link } from "wouter";
import { useTheme } from "next-themes";
import { Building2, Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

interface AuthShellProps {
  children: ReactNode;
  maxWidth?: number;
}

function usePalette() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== "light";
  return {
    dark,
    bg:          dark ? "#080f1c"               : "#EEF2F8",
    card:        dark ? "rgba(13,26,46,0.7)"    : "rgba(255,255,255,0.85)",
    cardBorder:  dark ? "rgba(200,168,75,0.12)" : "rgba(200,168,75,0.25)",
    cardShadow:  dark ? "0 0 0 1px rgba(200,168,75,0.06), 0 20px 60px rgba(0,0,0,0.5)" : "0 0 0 1px rgba(200,168,75,0.12), 0 20px 60px rgba(0,0,0,0.1)",
    brandText:   dark ? "#8BAFC7"               : "#4A6785",
    premiumText: dark ? "#2d4459"               : "#8BAFC7",
    iconBg:      dark ? "#080f1c"               : "#EEF2F8",
    toggleBg:    dark ? "rgba(200,168,75,0.08)" : "rgba(200,168,75,0.12)",
    toggleBorder:dark ? "rgba(200,168,75,0.2)"  : "rgba(200,168,75,0.3)",
    gridOpacity: dark ? 0.03                    : 0.055,
  };
}

export function AuthShell({ children, maxWidth = 440 }: AuthShellProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const p = usePalette();

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <div dir="ltr" style={{
      minHeight: "100vh",
      width: "100%",
      background: p.bg,
      fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
      transition: "background 0.3s ease",
      direction: "ltr",
    }}>
      {/* Architectural line pattern */}
      <svg
        aria-hidden
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: p.gridOpacity, pointerEvents: "none" }}
        viewBox="0 0 1920 1080"
        preserveAspectRatio="none"
      >
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
        style={{
          height: "1px",
          background: "linear-gradient(90deg, transparent, #c8a84b 20%, #e8d070 50%, #c8a84b 80%, transparent)",
          opacity: 0.6,
          flexShrink: 0,
          transformOrigin: "left",
        }}
      />

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 40px",
          position: "relative",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <Link href="/login" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            background: "linear-gradient(135deg, #c8a84b, #e8d070)",
            padding: "8px",
            borderRadius: "10px",
            boxShadow: "0 4px 16px rgba(200,168,75,0.3)",
          }}>
            <Building2 style={{ width: 16, height: 16, color: p.iconBg, strokeWidth: 2.5 }} />
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: p.brandText, letterSpacing: "0.02em", transition: "color 0.3s" }}>
            TIL Real Estate Group
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 32, height: 32, borderRadius: "8px",
              background: p.toggleBg,
              border: `1px solid ${p.toggleBorder}`,
              cursor: "pointer", color: "#c8a84b",
              transition: "background 0.2s, border-color 0.2s",
            }}
          >
            {p.dark
              ? <Sun style={{ width: 14, height: 14 }} />
              : <Moon style={{ width: 14, height: 14 }} />
            }
          </button>
          <span style={{ fontSize: "10px", color: p.premiumText, letterSpacing: "0.12em", textTransform: "uppercase", transition: "color 0.3s" }}>
            Premium CRM
          </span>
        </div>
      </motion.div>

      {/* Content area */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 20px 48px",
        position: "relative",
        zIndex: 10,
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.2, ease }}
          style={{
            width: "100%",
            maxWidth,
            background: p.card,
            border: `1px solid ${p.cardBorder}`,
            borderRadius: "12px",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            padding: "40px",
            boxShadow: p.cardShadow,
            transition: "background 0.3s, border-color 0.3s, box-shadow 0.3s",
          }}
        >
          {children}
        </motion.div>
      </div>

      {/* Gold bottom rule */}
      <div style={{
        height: "1px",
        background: "linear-gradient(90deg, transparent, #c8a84b 40%, transparent)",
        opacity: 0.25,
        flexShrink: 0,
      }} />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
