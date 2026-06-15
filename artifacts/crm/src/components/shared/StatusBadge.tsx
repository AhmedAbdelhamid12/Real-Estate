import { cn } from "@/lib/utils";
import type { LeadStatus } from "@workspace/api-client-react";

interface StatusBadgeProps {
  status: LeadStatus | string;
  className?: string;
}

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string; text: string; border: string }> = {
  new:         { label: "جديد",       dot: "#818cf8", bg: "rgba(99,102,241,0.12)",  text: "#a5b4fc", border: "rgba(99,102,241,0.25)" },
  called:      { label: "تم الاتصال", dot: "#fbbf24", bg: "rgba(245,158,11,0.12)", text: "#fcd34d", border: "rgba(245,158,11,0.25)" },
  qualified:   { label: "مؤهل",       dot: "#38bdf8", bg: "rgba(14,165,233,0.12)", text: "#7dd3fc", border: "rgba(14,165,233,0.25)" },
  proposal:    { label: "عرض",        dot: "#fb923c", bg: "rgba(249,115,22,0.12)", text: "#fdba74", border: "rgba(249,115,22,0.25)" },
  negotiation: { label: "تفاوض",      dot: "#c084fc", bg: "rgba(168,85,247,0.12)", text: "#d8b4fe", border: "rgba(168,85,247,0.25)" },
  won:         { label: "فاز",        dot: "#4ade80", bg: "rgba(34,197,94,0.12)",  text: "#86efac", border: "rgba(34,197,94,0.25)" },
  lost:        { label: "خسر",        dot: "#f87171", bg: "rgba(239,68,68,0.12)",  text: "#fca5a5", border: "rgba(239,68,68,0.25)" },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = STATUS_CONFIG[status?.toLowerCase()] ?? {
    label: status, dot: "#94a3b8", bg: "rgba(148,163,184,0.1)", text: "#cbd5e1", border: "rgba(148,163,184,0.2)",
  };

  return (
    <span
      className={cn(className)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 5,
        padding: "3px 10px", borderRadius: 20,
        background: cfg.bg, color: cfg.text,
        border: `1px solid ${cfg.border}`,
        fontSize: 11, fontWeight: 600, letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{
        width: 6, height: 6, borderRadius: "50%",
        background: cfg.dot,
        boxShadow: `0 0 6px ${cfg.dot}`,
        flexShrink: 0,
      }} />
      {cfg.label}
    </span>
  );
}
