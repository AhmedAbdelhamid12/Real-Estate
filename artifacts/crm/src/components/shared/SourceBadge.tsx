import { cn } from "@/lib/utils";
import type { LeadSource } from "@workspace/api-client-react";

interface SourceBadgeProps {
  source: LeadSource | string;
  className?: string;
}

const SOURCE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  manual:   { label: "يدوي",             icon: "✏️", color: "rgba(148,163,184,0.15)" },
  import:   { label: "استيراد",           icon: "📥", color: "rgba(148,163,184,0.15)" },
  campaign: { label: "حملة",             icon: "📢", color: "rgba(251,191,36,0.12)"  },
  referral: { label: "إحالة",            icon: "🤝", color: "rgba(52,211,153,0.12)"  },
  website:  { label: "موقع إلكتروني",    icon: "🌐", color: "rgba(56,189,248,0.12)"  },
  social:   { label: "تواصل اجتماعي",   icon: "📱", color: "rgba(192,132,252,0.12)" },
};

export function SourceBadge({ source, className }: SourceBadgeProps) {
  const cfg = SOURCE_CONFIG[source?.toLowerCase()] ?? { label: source, icon: "•", color: "rgba(148,163,184,0.1)" };

  return (
    <span
      className={cn(className)}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "2px 8px", borderRadius: 8,
        background: cfg.color,
        border: "1px solid rgba(255,255,255,0.06)",
        fontSize: 10, fontWeight: 500,
        color: "var(--muted-foreground)",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: 9 }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}
