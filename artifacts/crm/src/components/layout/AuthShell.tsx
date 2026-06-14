import { ReactNode } from "react";
import { Link } from "wouter";
import { Building2 } from "lucide-react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

interface AuthShellProps {
  children: ReactNode;
  maxWidth?: number;
}

export function AuthShell({ children, maxWidth = 440 }: AuthShellProps) {
  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      background: "#080f1c",
      fontFamily: "'Inter', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Architectural line pattern */}
      <svg
        aria-hidden
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.03, pointerEvents: "none" }}
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
            <Building2 style={{ width: 16, height: 16, color: "#080f1c", strokeWidth: 2.5 }} />
          </div>
          <span style={{ fontSize: "13px", fontWeight: 600, color: "#8BAFC7", letterSpacing: "0.02em" }}>
            TIL Real Estate Group
          </span>
        </Link>
        <span style={{ fontSize: "10px", color: "#2d4459", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Premium CRM
        </span>
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
            background: "rgba(13,26,46,0.7)",
            border: "1px solid rgba(200,168,75,0.12)",
            borderRadius: "12px",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            padding: "40px",
            boxShadow: "0 0 0 1px rgba(200,168,75,0.06), 0 20px 60px rgba(0,0,0,0.5)",
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
