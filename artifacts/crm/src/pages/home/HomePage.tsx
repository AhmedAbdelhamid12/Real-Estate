import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/contexts/i18nContext";
import { useListLeads, useListPlannerTasks } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { format } from "date-fns";
import {
  TrendingUp, Target, Users, Calendar,
  CheckCircle2, Clock, AlertCircle, Flame,
  Home, BarChart2, User, ArrowRight, Zap,
  Trophy, Star, Bell,
} from "lucide-react";
import { Link, useLocation } from "wouter";

function getGreeting(t: (key: string) => string): string {
  const h = new Date().getHours();
  if (h < 12) return t("home.greeting_morning");
  if (h < 17) return t("home.greeting_afternoon");
  return t("home.greeting_evening");
}

function useCountUp(target: number, duration = 700): number {
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

function StatRing({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const r = 20, cx = 24, cy = 24, circ = 2 * Math.PI * r;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" strokeWidth="3" className="text-white/10" />
      <circle
        cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={circ}
        strokeDashoffset={circ * (1 - pct)}
        strokeLinecap="round"
        transform="rotate(-90 24 24)"
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22,1,0.36,1)" }}
      />
    </svg>
  );
}

function NavCard({ icon: Icon, label, description, href, colors, stats, delay }: {
  icon: React.ElementType; label: string; description: string; href: string;
  colors: { from: string; to: string; ring: string; accent: string };
  stats?: { label: string; value: number }[];
  delay: number;
}) {
  const [hovered, setHovered] = useState(false);
  const [, navigate] = useLocation();
  const total = stats?.reduce((s, x) => s + x.value, 0) ?? 0;
  const primary = stats?.[0]?.value ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(href)}
      className="relative cursor-pointer"
    >
      <motion.div
        animate={{ y: hovered ? -6 : 0, scale: hovered ? 1.02 : 1 }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        style={{
          background: `linear-gradient(135deg, ${colors.from}, ${colors.to})`,
          borderRadius: 20,
          padding: "24px",
          minHeight: 180,
          position: "relative",
          overflow: "hidden",
          boxShadow: hovered
            ? `0 20px 40px -8px ${colors.from}60, 0 0 0 1px ${colors.from}30`
            : `0 8px 24px -4px ${colors.from}40`,
          transition: "box-shadow 0.3s",
        }}
      >
        {/* Background decoration */}
        <div style={{
          position: "absolute", top: -30, right: -30,
          width: 120, height: 120, borderRadius: "50%",
          background: "rgba(255,255,255,0.08)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -20, left: 10,
          width: 80, height: 80, borderRadius: "50%",
          background: "rgba(255,255,255,0.04)", pointerEvents: "none",
        }} />

        {/* Top row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: "rgba(255,255,255,0.18)",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}>
            <Icon style={{ width: 22, height: 22, color: "white" }} />
          </div>
          {stats && stats.length > 0 && (
            <div style={{ position: "relative" }}>
              <StatRing value={primary} max={Math.max(total, 1)} color={colors.accent} />
              <div style={{
                position: "absolute", inset: 0, display: "flex",
                alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 700, color: "white",
              }}>
                {primary}
              </div>
            </div>
          )}
        </div>

        {/* Label */}
        <div style={{ marginBottom: 4 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "white", lineHeight: 1.2 }}>{label}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", marginTop: 2 }}>{description}</div>
        </div>

        {/* Stats row */}
        {stats && stats.length > 0 && (
          <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
            {stats.slice(0, 3).map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "white", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Arrow */}
        <motion.div
          animate={{ x: hovered ? 4 : 0, opacity: hovered ? 1 : 0.6 }}
          style={{
            position: "absolute", bottom: 20, right: 20,
            width: 28, height: 28, borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <ArrowRight style={{ width: 14, height: 14, color: "white" }} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export function HomePage() {
  const { currentUser } = useAuth();
  const { t } = useI18n();
  const { data: leads = [], isLoading: leadsLoading } = useListLeads();
  const { data: tasks = [], isLoading: tasksLoading } = useListPlannerTasks();

  if (!currentUser) return null;

  const myLeads = (leads as any[]).filter((l) => l.primarySalesId === currentUser.id);
  const activeLeads = myLeads.filter((l) => !["won", "lost"].includes(l.status));
  const wonLeads = myLeads.filter((l) => l.status === "won");
  const lostLeads = myLeads.filter((l) => l.status === "lost");
  const todayTasks = (tasks as any[]).filter((task) => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate).toDateString() === new Date().toDateString();
  });
  const pendingTasks = todayTasks.filter((t) => t.status !== "done");
  const doneTasks = todayTasks.filter((t) => t.status === "done");
  const overdueTasks = myLeads.filter((l) => {
    if (!l.deadline) return false;
    return new Date(l.deadline) < new Date() && !["won", "lost"].includes(l.status);
  });

  const activeCount = useCountUp(activeLeads.length);
  const wonCount = useCountUp(wonLeads.length);
  const overdueCount = useCountUp(overdueTasks.length);
  const pendingCount = useCountUp(pendingTasks.length);

  const winRate = myLeads.length > 0 ? Math.round((wonLeads.length / myLeads.length) * 100) : 0;

  const navCards = [
    {
      icon: Users, label: "My Leads", description: "Manage & track your leads",
      href: "/leads",
      colors: { from: "#1d4ed8", to: "#1e3a8a", ring: "#3b82f6", accent: "#60a5fa" },
      stats: [
        { label: "Active", value: activeLeads.length },
        { label: "Won", value: wonLeads.length },
        { label: "Lost", value: lostLeads.length },
      ],
      delay: 0.1,
    },
    {
      icon: Home, label: "Resale Units", description: "Secondary market",
      href: "/resale",
      colors: { from: "#b45309", to: "#78350f", ring: "#f59e0b", accent: "#fbbf24" },
      stats: [],
      delay: 0.18,
    },
    {
      icon: Calendar, label: "Daily Planner", description: "Today's tasks & schedule",
      href: "/planner",
      colors: { from: "#6d28d9", to: "#3b0764", ring: "#a78bfa", accent: "#c4b5fd" },
      stats: [
        { label: "Today", value: todayTasks.length },
        { label: "Pending", value: pendingTasks.length },
        { label: "Done", value: doneTasks.length },
      ],
      delay: 0.26,
    },
    {
      icon: User, label: "My Profile", description: "Account & settings",
      href: "/profile",
      colors: { from: "#047857", to: "#064e3b", ring: "#34d399", accent: "#6ee7b7" },
      stats: [],
      delay: 0.34,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>

      {/* ── HERO BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        style={{
          borderRadius: 24,
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
          padding: "32px 36px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 24px 48px -12px rgba(0,0,0,0.4)",
        }}
      >
        {/* Gold shimmer strip */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, transparent, #c8a84b 30%, #e8d070 60%, transparent)",
          opacity: 0.8,
        }} />
        {/* Decorative glow */}
        <div style={{
          position: "absolute", top: -60, right: -40,
          width: 280, height: 280, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(200,168,75,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -80, left: 100,
          width: 200, height: 200, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 24, position: "relative", zIndex: 1 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <div style={{ width: 28, height: 1, background: "#c8a84b", opacity: 0.8 }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: "#c8a84b", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: "white", margin: 0, lineHeight: 1.15, letterSpacing: "-0.02em" }}>
              {getGreeting(t)},{" "}
              <span style={{ color: "#e8d070" }}>{currentUser.name.split(" ")[0]}</span> 👋
            </h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
              You have <span style={{ color: "white", fontWeight: 600 }}>{pendingTasks.length}</span> tasks pending &amp; <span style={{ color: overdueTasks.length > 0 ? "#f87171" : "white", fontWeight: 600 }}>{overdueTasks.length}</span> overdue leads today
            </p>
          </div>

          {/* Win-rate badge */}
          <div style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(200,168,75,0.25)",
            borderRadius: 16, padding: "16px 24px",
            backdropFilter: "blur(12px)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Win Rate</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: winRate >= 50 ? "#4ade80" : "#fbbf24", lineHeight: 1 }}>{winRate}<span style={{ fontSize: 18 }}>%</span></div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>{wonLeads.length} / {myLeads.length} leads</div>
          </div>
        </div>

        {/* Bottom stats strip */}
        <div style={{
          display: "flex", gap: 0, marginTop: 28,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12, overflow: "hidden", position: "relative", zIndex: 1,
        }}>
          {[
            { label: "عملائي المحتملون", value: leadsLoading ? null : activeCount, color: "#60a5fa", icon: Users },
            { label: "تم الفوز", value: leadsLoading ? null : wonCount, color: "#4ade80", icon: Trophy },
            { label: "منتهي الصلاحية", value: leadsLoading ? null : overdueCount, color: overdueCount > 0 ? "#f87171" : "#94a3b8", icon: AlertCircle },
            { label: "مهام معلقة", value: tasksLoading ? null : pendingCount, color: "#a78bfa", icon: Target },
          ].map((s, i, arr) => (
            <div key={s.label} style={{
              flex: 1, padding: "14px 20px",
              borderRight: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.07)" : "none",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: `${s.color}18`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <s.icon style={{ width: 16, height: 16, color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, lineHeight: 1 }}>
                  {s.value === null ? <span style={{ width: 28, height: 20, background: "rgba(255,255,255,0.1)", borderRadius: 4, display: "inline-block" }} /> : s.value}
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginTop: 2, letterSpacing: "0.04em" }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── NAV CARDS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
        {navCards.map((card) => (
          <NavCard key={card.label} {...card} />
        ))}
      </div>

      {/* ── LEADS + TASKS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

        {/* Active Leads */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{
            borderRadius: 20,
            background: "var(--card)",
            border: "1px solid var(--border)",
            overflow: "hidden",
            height: "100%",
          }}>
            <div style={{
              padding: "18px 20px 14px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#1d4ed820", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Users style={{ width: 15, height: 15, color: "#3b82f6" }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>{t("home.my_leads")}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{activeLeads.length} active</div>
                </div>
              </div>
              <Link href="/leads">
                <div style={{
                  fontSize: 11, color: "#c8a84b", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "4px 10px", borderRadius: 6,
                  background: "rgba(200,168,75,0.08)",
                  border: "1px solid rgba(200,168,75,0.2)",
                }}>
                  View all <ArrowRight style={{ width: 11, height: 11 }} />
                </div>
              </Link>
            </div>
            <div style={{ padding: "8px 12px" }}>
              {leadsLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ height: 48, background: "var(--muted)", borderRadius: 8, marginBottom: 6, opacity: 0.5 }} />
                ))
                : activeLeads.length === 0
                  ? (
                    <div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted-foreground)", fontSize: 13 }}>
                      <Users style={{ width: 28, height: 28, margin: "0 auto 8px", opacity: 0.3 }} />
                      <p>{t("common.empty")}</p>
                    </div>
                  )
                  : activeLeads.slice(0, 6).map((lead: any, i: number) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: 0.5 + i * 0.05 }}
                    >
                      <Link href={`/leads/${lead.id}`}>
                        <div style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "10px 10px", borderRadius: 10, cursor: "pointer",
                          marginBottom: 2,
                          transition: "background 0.15s",
                        }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--muted)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <p style={{ fontWeight: 600, fontSize: 13, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--foreground)" }}>{lead.name}</p>
                            <p style={{ fontSize: 11, color: "var(--muted-foreground)", margin: 0 }}>{lead.projectName ?? "No project"}</p>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginInlineStart: 8 }}>
                            {lead.deadline && new Date(lead.deadline) < new Date() && (
                              <Flame style={{ width: 13, height: 13, color: "#ef4444" }} />
                            )}
                            <StatusBadge status={lead.status} />
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))
              }
            </div>
          </div>
        </motion.div>

        {/* Today's Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div style={{
            borderRadius: 20,
            background: "var(--card)",
            border: "1px solid var(--border)",
            overflow: "hidden",
            height: "100%",
          }}>
            <div style={{
              padding: "18px 20px 14px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              borderBottom: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: "#6d28d920", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Calendar style={{ width: 15, height: 15, color: "#8b5cf6" }} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--foreground)" }}>{t("home.todays_tasks")}</div>
                  <div style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{doneTasks.length}/{todayTasks.length} done</div>
                </div>
              </div>
              <Link href="/planner">
                <div style={{
                  fontSize: 11, color: "#c8a84b", cursor: "pointer",
                  display: "flex", alignItems: "center", gap: 4,
                  padding: "4px 10px", borderRadius: 6,
                  background: "rgba(200,168,75,0.08)",
                  border: "1px solid rgba(200,168,75,0.2)",
                }}>
                  View all <ArrowRight style={{ width: 11, height: 11 }} />
                </div>
              </Link>
            </div>

            {/* Progress bar */}
            {todayTasks.length > 0 && (
              <div style={{ padding: "10px 20px 0" }}>
                <div style={{ height: 4, background: "var(--muted)", borderRadius: 4, overflow: "hidden" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${todayTasks.length > 0 ? (doneTasks.length / todayTasks.length) * 100 : 0}%` }}
                    transition={{ duration: 1, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    style={{ height: "100%", background: "linear-gradient(90deg, #8b5cf6, #c084fc)", borderRadius: 4 }}
                  />
                </div>
              </div>
            )}

            <div style={{ padding: "8px 12px" }}>
              {tasksLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ height: 44, background: "var(--muted)", borderRadius: 8, marginBottom: 6, opacity: 0.5 }} />
                ))
                : todayTasks.length === 0
                  ? (
                    <div style={{ textAlign: "center", padding: "32px 0", color: "var(--muted-foreground)", fontSize: 13 }}>
                      <Calendar style={{ width: 28, height: 28, margin: "0 auto 8px", opacity: 0.3 }} />
                      <p>No tasks for today</p>
                    </div>
                  )
                  : todayTasks.slice(0, 6).map((task: any, i: number) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: 0.55 + i * 0.05 }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 10px", borderRadius: 10, marginBottom: 2,
                        opacity: task.status === "done" ? 0.55 : 1,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--muted)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                        border: `2px solid ${task.status === "done" ? "#22c55e" : "#a78bfa"}`,
                        background: task.status === "done" ? "#22c55e" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {task.status === "done" && <CheckCircle2 style={{ width: 10, height: 10, color: "white" }} />}
                      </div>
                      <span style={{
                        fontSize: 13, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        textDecoration: task.status === "done" ? "line-through" : "none",
                        color: "var(--foreground)",
                      }}>
                        {task.title}
                      </span>
                      <span style={{
                        fontSize: 9, padding: "2px 7px", borderRadius: 10, flexShrink: 0,
                        fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em",
                        background: task.priority === "high" ? "#ef444420" : task.priority === "medium" ? "#f59e0b20" : "#94a3b820",
                        color: task.priority === "high" ? "#f87171" : task.priority === "medium" ? "#fbbf24" : "#94a3b8",
                        border: `1px solid ${task.priority === "high" ? "#ef444440" : task.priority === "medium" ? "#f59e0b40" : "#94a3b840"}`,
                      }}>
                        {task.priority}
                      </span>
                    </motion.div>
                  ))
              }
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
