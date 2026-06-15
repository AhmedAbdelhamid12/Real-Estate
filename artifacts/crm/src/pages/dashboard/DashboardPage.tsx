import { useEffect, useState } from "react";
import { useGetDashboardStats, useGetPipelineBreakdown, useGetTopPerformers } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, UserPlus, CheckCircle2, XCircle, TrendingUp, Percent, ArrowUpRight } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from "recharts";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
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
  }, [target, duration]);
  return count;
}

const cardVariants = {
  hidden: { opacity: 0, y: 18, scale: 0.97 },
  show: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.38, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const sectionVariants = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.42, delay: 0.35 + i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const STATUS_COLORS: Record<string, string> = {
  new: "#6366f1",
  called: "#f59e0b",
  qualified: "#3b82f6",
  proposal: "#8b5cf6",
  negotiation: "#f97316",
  won: "#22c55e",
  lost: "#ef4444",
};

export function DashboardPage() {
  const { t } = useI18n();
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: pipeline, isLoading: pipelineLoading } = useGetPipelineBreakdown();
  const { data: performers, isLoading: performersLoading } = useGetTopPerformers();

  const conversionRate = stats && stats.totalLeads > 0
    ? Math.round((stats.wonLeads / stats.totalLeads) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <h2 className="text-3xl font-bold tracking-tight">{t("nav.dashboard")}</h2>
        <p className="text-muted-foreground">{t("leads.subtitle")}</p>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { title: t("leads.col.name") !== "leads.col.name" ? "إجمالي العملاء المحتملين" : "Total Leads", value: stats?.totalLeads, icon: Users, bg: "bg-indigo-500/10", iconColor: "text-indigo-500", border: "border-indigo-200 dark:border-indigo-800" },
          { title: "نشط", value: stats?.activeLeads, icon: TrendingUp, bg: "bg-blue-500/10", iconColor: "text-blue-500", border: "border-blue-200 dark:border-blue-800" },
          { title: "تم الفوز", value: stats?.wonLeads, icon: CheckCircle2, bg: "bg-emerald-500/10", iconColor: "text-emerald-500", border: "border-emerald-200 dark:border-emerald-800", valueClassName: "text-emerald-600 dark:text-emerald-400" },
          { title: "خسائر", value: stats?.lostLeads, icon: XCircle, bg: "bg-red-500/10", iconColor: "text-red-500", border: "border-red-200 dark:border-red-800", valueClassName: "text-red-600 dark:text-red-400" },
          { title: "إجمالي العملاء", value: stats?.totalClients, icon: UserPlus, bg: "bg-violet-500/10", iconColor: "text-violet-500", border: "border-violet-200 dark:border-violet-800" },
          { title: "نسبة التحويل", value: conversionRate, icon: Percent, bg: "bg-amber-500/10", iconColor: "text-amber-500", border: "border-amber-200 dark:border-amber-800", valueClassName: "text-amber-600 dark:text-amber-400", suffix: "%" },
        ].map((kpi, i) => (
          <motion.div key={kpi.title} custom={i} variants={cardVariants} initial="hidden" animate="show">
            <KpiCard {...kpi} loading={statsLoading} />
          </motion.div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Pipeline Chart */}
        <motion.div custom={0} variants={sectionVariants} initial="hidden" animate="show" className="col-span-4">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("reports.pipeline")}</CardTitle>
                  <CardDescription>توزيع العملاء المحتملين حسب المرحلة</CardDescription>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="h-[320px]">
              {pipelineLoading ? (
                <Skeleton className="h-full w-full" />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pipeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="status"
                      tickFormatter={(val) => {
                        const map: Record<string, string> = {
                          new: "جديد", called: "تم الاتصال", qualified: "مؤهل",
                          proposal: "عرض", negotiation: "تفاوض", won: "فاز", lost: "خسر"
                        };
                        return map[val] ?? val;
                      }}
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    />
                    <RechartsTooltip
                      cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--background))' }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]} isAnimationActive={true} animationDuration={800}>
                      {(pipeline || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] ?? "hsl(var(--primary))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Performers */}
        <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="show" className="col-span-3">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>أفضل المؤدين</CardTitle>
                  <CardDescription>أعلى معدلات التحويل</CardDescription>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <ArrowUpRight className="w-4 h-4 text-amber-500" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {performersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
                </div>
              ) : (
                <div className="space-y-5">
                  {performers?.map((performer, i) => (
                    <motion.div
                      key={performer.userId}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.5 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-center gap-3"
                    >
                      <div className="relative">
                        <UserAvatar name={performer.userName} avatarUrl={performer.avatarUrl} className="h-10 w-10" />
                        <span className="absolute -top-1 -start-1 bg-amber-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                          {i + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-semibold leading-none truncate">{performer.userName}</p>
                          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{Math.round(performer.conversionRate ?? 0)}%</span>
                        </div>
                        <Progress value={performer.conversionRate ?? 0} className="h-1.5" />
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-muted-foreground">{performer.wonLeads} فاز</span>
                          <span className="text-[10px] text-muted-foreground">{performer.totalLeads} إجمالي</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {(!performers || performers.length === 0) && (
                    <div className="text-center text-sm text-muted-foreground py-8">لا توجد بيانات أداء متاحة</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

function KpiCard({
  title, value, icon: Icon, loading, valueClassName, bg, iconColor, border, suffix
}: {
  title: string;
  value?: number;
  icon: any;
  loading: boolean;
  valueClassName?: string;
  bg?: string;
  iconColor?: string;
  border?: string;
  suffix?: string;
}) {
  const count = useCountUp(loading ? undefined : value);

  return (
    <Card className={`overflow-hidden border ${border ?? ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium text-muted-foreground leading-tight">{title}</p>
          <div className={`p-2 rounded-lg ${bg ?? "bg-primary/10"}`}>
            <Icon className={`h-3.5 w-3.5 ${iconColor ?? "text-primary"}`} />
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className={`text-2xl font-bold tabular-nums ${valueClassName || ''}`}>
            {count}{suffix ?? ""}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
