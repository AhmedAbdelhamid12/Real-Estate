import { useEffect, useState } from "react";
import { useGetDashboardStats, useGetPipelineBreakdown, useGetTopPerformers } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Users, UserPlus, CheckCircle2, XCircle, TrendingUp, Percent, Medal, Crown, Flame } from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  RadialBarChart, RadialBar,
} from "recharts";
import { motion } from "framer-motion";
import { useI18n } from "@/contexts/i18nContext";

function useCountUp(target: number | undefined, duration = 900): number {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) { setCount(0); return; }
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return count;
}

const STATUS_COLORS: Record<string, string> = {
  new: "#818cf8",
  called: "#fbbf24",
  qualified: "#38bdf8",
  proposal: "#c084fc",
  negotiation: "#fb923c",
  won: "#4ade80",
  lost: "#f87171",
};

const STATUS_LABELS: Record<string, string> = {
  new: "جديد", called: "تم الاتصال", qualified: "مؤهل",
  proposal: "عرض", negotiation: "تفاوض", won: "فاز", lost: "خسر",
};

const RANK_COLORS = ["#f59e0b", "#94a3b8", "#cd7f32"];
const RANK_ICONS = [Crown, Medal, Medal];

export function DashboardPage() {
  const { t } = useI18n();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: pipeline, isLoading: pipelineLoading } = useGetPipelineBreakdown();
  const { data: performers, isLoading: performersLoading } = useGetTopPerformers();

  const conversionRate = stats && stats.totalLeads > 0
    ? Math.round((stats.wonLeads / stats.totalLeads) * 100)
    : 0;

  const totalLeadsCount = useCountUp(statsLoading ? undefined : stats?.totalLeads);
  const activeCount = useCountUp(statsLoading ? undefined : stats?.activeLeads);
  const wonCount = useCountUp(statsLoading ? undefined : stats?.wonLeads);
  const lostCount = useCountUp(statsLoading ? undefined : stats?.lostLeads);
  const clientsCount = useCountUp(statsLoading ? undefined : stats?.totalClients);
  const conversionCount = useCountUp(statsLoading ? undefined : conversionRate);

  const kpis = [
    {
      title: "إجمالي العملاء", value: totalLeadsCount, icon: Users,
      gradient: "linear-gradient(145deg, #10b981 0%, #065f46 100%)",
      glow: "#10b981", suffix: "",
    },
    {
      title: "نشط", value: activeCount, icon: TrendingUp,
      gradient: "linear-gradient(145deg, #34d399 0%, #059669 100%)",
      glow: "#34d399", suffix: "",
    },
    {
      title: "تم الفوز", value: wonCount, icon: CheckCircle2,
      gradient: "linear-gradient(145deg, #047857 0%, #022c22 100%)",
      glow: "#10b981", suffix: "",
    },
    {
      title: "خسائر", value: lostCount, icon: XCircle,
      gradient: "linear-gradient(145deg, #065f46 0%, #064e3b 100%)",
      glow: "#6ee7b7", suffix: "",
    },
    {
      title: "عدد العملاء", value: clientsCount, icon: UserPlus,
      gradient: "linear-gradient(145deg, #059669 0%, #047857 100%)",
      glow: "#059669", suffix: "",
    },
    {
      title: "نسبة التحويل", value: conversionCount, icon: Percent,
      gradient: "linear-gradient(145deg, #064e3b 0%, #022c22 100%)",
      glow: "#34d399", suffix: "%",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 24, height: 2, background: "#c8a84b", borderRadius: 2 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: "#c8a84b", letterSpacing: "0.16em", textTransform: "uppercase" }}>
              Analytics Overview
            </span>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.02em", color: "var(--foreground)" }}>
            {t("nav.dashboard")}
          </h2>
          <p style={{ fontSize: 13, color: "var(--muted-foreground)", margin: 0 }}>
            {t("leads.subtitle")}
          </p>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 14px", borderRadius: 10,
          background: "rgba(200,168,75,0.08)",
          border: "1px solid rgba(200,168,75,0.2)",
        }}>
          <Flame style={{ width: 14, height: 14, color: "#c8a84b" }} />
          <span style={{ fontSize: 12, color: "#c8a84b", fontWeight: 600 }}>
            {conversionRate}% معدل التحويل
          </span>
        </div>
      </motion.div>

      {/* ── KPI CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 14 }}>
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            <div style={{
              background: kpi.gradient, borderRadius: 16,
              padding: "18px 16px", position: "relative", overflow: "hidden",
              boxShadow: `0 8px 24px -4px ${kpi.glow}40`,
              cursor: "default",
            }}>
              <div style={{
                position: "absolute", top: -20, right: -20,
                width: 80, height: 80, borderRadius: "50%",
                background: "rgba(255,255,255,0.07)", pointerEvents: "none",
              }} />
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {kpi.title}
                </span>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <kpi.icon style={{ width: 14, height: 14, color: "white" }} />
                </div>
              </div>
              {statsLoading ? (
                <div style={{ height: 32, width: 48, background: "rgba(255,255,255,0.15)", borderRadius: 6 }} />
              ) : (
                <div style={{ fontSize: 28, fontWeight: 800, color: "white", lineHeight: 1, letterSpacing: "-0.02em" }}>
                  {kpi.value}{kpi.suffix}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── PIPELINE + LEADERBOARD ── */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: 20 }}>

        {/* Pipeline Chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.38, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{
            borderRadius: 20, background: "var(--card)",
            border: "1px solid var(--border)", overflow: "hidden", height: "100%",
          }}>
            <div style={{
              padding: "20px 24px 16px",
              borderBottom: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--foreground)" }}>{t("reports.pipeline")}</div>
                <div style={{ fontSize: 11, color: "var(--muted-foreground)", marginTop: 2 }}>توزيع العملاء المحتملين حسب المرحلة</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["won", "lost"].map((s) => (
                  <div key={s} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: STATUS_COLORS[s] }} />
                    <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{STATUS_LABELS[s]}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: "16px 20px 20px", height: 320 }}>
              {pipelineLoading ? (
                <div style={{ height: "100%", background: "var(--muted)", borderRadius: 10, opacity: 0.4 }} />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipeline} margin={{ top: 8, right: 8, left: -24, bottom: 0 }} barCategoryGap="32%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="status"
                      tickFormatter={(val) => STATUS_LABELS[val] ?? val}
                      tickLine={false} axisLine={false}
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11, fontWeight: 500 }}
                    />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <RechartsTooltip
                      cursor={{ fill: "hsl(var(--muted))", borderRadius: 4 }}
                      contentStyle={{
                        borderRadius: 10, border: "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))", boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                        fontSize: 12,
                      }}
                      formatter={(val, name) => [val, "عدد العملاء"]}
                      labelFormatter={(label) => STATUS_LABELS[label] ?? label}
                    />
                    <Bar dataKey="count" radius={[8, 8, 0, 0]} isAnimationActive animationDuration={900}>
                      {(pipeline || []).map((entry, i) => (
                        <Cell key={`cell-${i}`} fill={STATUS_COLORS[entry.status] ?? "#6366f1"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Legend row */}
            {!pipelineLoading && pipeline && pipeline.length > 0 && (
              <div style={{
                padding: "12px 24px", borderTop: "1px solid var(--border)",
                display: "flex", gap: 12, flexWrap: "wrap",
              }}>
                {pipeline.map((entry) => (
                  <div key={entry.status} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: STATUS_COLORS[entry.status] ?? "#6366f1" }} />
                    <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{STATUS_LABELS[entry.status]} ({entry.count})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.46, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{
            borderRadius: 20, overflow: "hidden", height: "100%",
            background: "var(--card)", border: "1px solid var(--border)",
          }}>
            {/* Header with gradient */}
            <div style={{
              background: "linear-gradient(135deg, #022c22, #065f46)",
              padding: "20px 24px",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: 2,
                background: "linear-gradient(90deg, transparent, #34d399 40%, transparent)",
              }} />
              <div style={{
                position: "absolute", top: -30, right: -20,
                width: 100, height: 100, borderRadius: "50%",
                background: "radial-gradient(circle, rgba(52,211,153,0.15) 0%, transparent 70%)",
              }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(52,211,153,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Crown style={{ width: 17, height: 17, color: "#34d399" }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>أفضل المؤدين</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>أعلى معدلات التحويل</div>
                </div>
              </div>
            </div>

            <div style={{ padding: "16px" }}>
              {performersLoading ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ height: 64, background: "var(--muted)", borderRadius: 12, opacity: 0.5 }} />
                  ))}
                </div>
              ) : !performers || performers.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "var(--muted-foreground)", fontSize: 13 }}>
                  لا توجد بيانات أداء متاحة
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {performers.map((p, i) => {
                    const RankIcon = RANK_ICONS[i] ?? Medal;
                    const rankColor = RANK_COLORS[i] ?? "#6366f1";
                    const rate = Math.round(p.conversionRate ?? 0);
                    return (
                      <motion.div
                        key={p.userId}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: 0.55 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                        style={{
                          borderRadius: 14,
                          background: i === 0 ? "linear-gradient(135deg, rgba(245,158,11,0.08), rgba(245,158,11,0.03))" : "var(--muted)/40",
                          border: i === 0 ? "1px solid rgba(245,158,11,0.2)" : "1px solid var(--border)",
                          padding: "12px 14px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {/* Rank */}
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                            background: `${rankColor}20`,
                            border: `1.5px solid ${rankColor}50`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                          }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: rankColor }}>{i + 1}</span>
                          </div>

                          {/* Avatar */}
                          <UserAvatar name={p.userName} avatarUrl={p.avatarUrl} className="h-9 w-9 shrink-0" />

                          {/* Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--foreground)" }}>
                                {p.userName}
                              </span>
                              <span style={{
                                fontSize: 13, fontWeight: 800,
                                color: rate >= 50 ? "#4ade80" : rate >= 25 ? "#fbbf24" : "#f87171",
                                flexShrink: 0, marginInlineStart: 8,
                              }}>
                                {rate}%
                              </span>
                            </div>
                            {/* Progress bar */}
                            <div style={{ height: 5, background: "var(--border)", borderRadius: 10, overflow: "hidden" }}>
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${rate}%` }}
                                transition={{ duration: 1, delay: 0.7 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                                style={{
                                  height: "100%", borderRadius: 10,
                                  background: `linear-gradient(90deg, ${rankColor}, ${rankColor}aa)`,
                                }}
                              />
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                              <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{p.wonLeads} فاز</span>
                              <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>{p.totalLeads} إجمالي</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
